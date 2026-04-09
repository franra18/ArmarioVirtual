import json
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud.ia_utils import create_ia_client, generate_ia_text, get_criterios_abrigo_elegancia, parse_ia_json
from app.crud.outfit_crud import OutfitCRUD
from app.models.color_model import Color
from app.models.outfit_model import Outfit
from app.models.prenda_color_model import PrendaColor
from app.models.prenda_model import Prenda
from app.schemas.outfit_schema import OutfitCreate, OutfitGenerateFromIARequest, OutfitIAData


class OutfitIACRUD:
	# Obtener clima actual de OpenWeather cuando el usuario lo solicite.
	@staticmethod
	def _obtener_clima_actual(lat: float, lon: float) -> dict[str, Any]:
		if not settings.OPENWEATHER_API_KEY:
			raise RuntimeError("No se encontro OPENWEATHER_API_KEY en el entorno")

		url = "https://api.openweathermap.org/data/2.5/weather"
		params = {
			"lat": lat,
			"lon": lon,
			"appid": settings.OPENWEATHER_API_KEY,
			"units": "metric",
		}
		try:
			response = requests.get(url, params=params, timeout=20)
			response.raise_for_status()
			raw = response.json()
		except Exception as exc:
			raise RuntimeError("No se pudo obtener el clima actual desde OpenWeather") from exc

		weather_list = raw.get("weather") or []
		descripcion = weather_list[0].get("description") if weather_list and isinstance(weather_list[0], dict) else None
		main = raw.get("main") or {}
		wind = raw.get("wind") or {}

		return {
			"temperatura_c": main.get("temp"),
			"sensacion_termica_c": main.get("feels_like"),
			"humedad": main.get("humidity"),
			"descripcion": descripcion,
			"viento_m_s": wind.get("speed"),
		}

	# Obtener prendas del usuario con sus colores para alimentar el prompt.
	@staticmethod
	def _obtener_prendas_usuario(db: Session, usuario_id: int) -> tuple[list[dict[str, Any]], dict[int, str]]:
		prendas = db.query(Prenda).filter(Prenda.usuario_id == usuario_id).all()
		if not prendas:
			raise ValueError("El usuario no tiene prendas registradas")

		prenda_ids = [prenda.id for prenda in prendas]
		relaciones_color = (
			db.query(PrendaColor)
			.filter(PrendaColor.prenda_id.in_(prenda_ids))
			.all()
		)

		colores_por_prenda: dict[int, list[int]] = {prenda_id: [] for prenda_id in prenda_ids}
		for relacion in relaciones_color:
			colores_por_prenda.setdefault(relacion.prenda_id, []).append(relacion.color_id)

		prendas_data: list[dict[str, Any]] = []
		tipo_por_prenda: dict[int, str] = {}
		for prenda in prendas:
			color_ids = colores_por_prenda.get(prenda.id, [])
			if not color_ids:
				continue
			prendas_data.append(
				{
					"id": prenda.id,
					"nombre": prenda.nombre,
					"tipo_prenda": prenda.tipo_prenda,
					"nivel_abrigo": prenda.nivel_abrigo,
					"nivel_elegancia": prenda.nivel_elegancia,
					"color_ids": color_ids,
				}
			)
			tipo_por_prenda[prenda.id] = (prenda.tipo_prenda or "").strip().lower()

		if not prendas_data:
			raise ValueError("No hay prendas con colores asociados para generar un outfit")

		return prendas_data, tipo_por_prenda

	# Obtener lista de colores disponibles para el prompt de IA.
	@staticmethod
	def _obtener_colores(db: Session) -> list[dict[str, Any]]:
		colores = db.query(Color).all()
		return [{"id": color.id, "nombre": color.nombre} for color in colores]

	# Construir el prompt final incluyendo contexto del usuario, clima y catálogo.
	@staticmethod
	def _build_prompt(
		prompt_usuario: str,
		prendas_usuario: list[dict[str, Any]],
		colores_disponibles: list[dict[str, Any]],
		clima_actual: dict[str, Any] | None,
	) -> str:
		clima_texto = json.dumps(clima_actual, ensure_ascii=False) if clima_actual is not None else "null"
		prendas_texto = json.dumps(prendas_usuario, ensure_ascii=False)
		colores_texto = json.dumps(colores_disponibles, ensure_ascii=False)
		criterios_texto = get_criterios_abrigo_elegancia()
		return (
			"Genera UN SOLO outfit usando exclusivamente las prendas disponibles del usuario.\n"
			"Devuelve UNICAMENTE un JSON valido sin markdown ni texto adicional.\n"
			"El prompt del usuario tiene prioridad sobre el clima cuando exista conflicto.\n"
			"Usa los criterios detallados de abrigo y elegancia para decidir la seleccion.\n"
			"Si llega clima actual, usa principalmente temperatura_c para el nivel de abrigo y ajusta por sensacion_termica_c.\n"
			"Si no llega clima, infiere abrigo desde el contexto del prompt del usuario.\n"
			"Reglas de combinacion:\n"
			"- El outfit debe tener al menos 1 prenda.\n"
			"- No repitas tipo_prenda dentro del mismo outfit.\n"
			"- Selecciona IDs solo del catalogo recibido.\n"
			f"{criterios_texto}"
			"JSON de salida EXACTO:\n"
			"{\n"
			'  "nombre_outfit": "string",\n'
			'  "ocasion": "string",\n'
			'  "prenda_ids": [0]\n'
			"}\n"
			f"Prompt del usuario: {prompt_usuario}\n"
			f"Clima actual (si es null, ignorar clima): {clima_texto}\n"
			f"Prendas del usuario: {prendas_texto}\n"
			f"Colores disponibles: {colores_texto}\n"
		)

	# Validar que las prendas elegidas existan, pertenezcan al usuario y no repitan tipo.
	@staticmethod
	def _validar_prenda_ids_outfit(prenda_ids: list[int], prenda_ids_validos: set[int], tipo_por_prenda: dict[int, str]) -> list[int]:
		ids_limpios: list[int] = []
		for prenda_id in prenda_ids:
			if not isinstance(prenda_id, int):
				raise ValueError("La IA devolvio un prenda_id no numerico")
			if prenda_id in ids_limpios:
				continue
			ids_limpios.append(prenda_id)

		if not ids_limpios:
			raise ValueError("La IA no devolvio prendas para el outfit")

		if any(prenda_id not in prenda_ids_validos for prenda_id in ids_limpios):
			raise ValueError("La IA devolvio prendas que no pertenecen al usuario")

		tipos_usados: set[str] = set()
		for prenda_id in ids_limpios:
			tipo = tipo_por_prenda.get(prenda_id, "")
			if tipo and tipo in tipos_usados:
				raise ValueError("La IA devolvio prendas repetidas del mismo tipo")
			tipos_usados.add(tipo)

		return ids_limpios

	# Generar outfit con IA y guardarlo automáticamente en base de datos.
	@staticmethod
	def create_from_user_context(db: Session, data: OutfitGenerateFromIARequest) -> Outfit:
		if (data.lat is None) != (data.lon is None):
			raise ValueError("Para usar clima debes enviar lat y lon juntos")

		prendas_usuario, tipo_por_prenda = OutfitIACRUD._obtener_prendas_usuario(db, data.usuario_id)
		colores_disponibles = OutfitIACRUD._obtener_colores(db)
		clima_actual = None
		if data.lat is not None and data.lon is not None:
			clima_actual = OutfitIACRUD._obtener_clima_actual(data.lat, data.lon)

		prompt = OutfitIACRUD._build_prompt(data.prompt, prendas_usuario, colores_disponibles, clima_actual)
		client = create_ia_client()
		response_text = generate_ia_text(client, [prompt])
		json_payload = parse_ia_json(response_text)
		ia_data = OutfitIAData.model_validate(json_payload)

		prenda_ids_validos = {prenda["id"] for prenda in prendas_usuario}
		prenda_ids_validados = OutfitIACRUD._validar_prenda_ids_outfit(
			ia_data.prenda_ids,
			prenda_ids_validos,
			tipo_por_prenda,
		)

		payload = OutfitCreate(
			usuario_id=data.usuario_id,
			nombre_outfit=ia_data.nombre_outfit,
			ocasion=ia_data.ocasion,
			creado_por_ia=True,
			prenda_ids=prenda_ids_validados,
		)
		return OutfitCRUD.create(db, payload)
