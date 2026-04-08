import json
import re
from typing import Any

import requests
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud.color_crud import ColorCRUD
from app.crud.prenda_crud import PrendaCRUD
from app.models.prenda_model import Prenda
from app.schemas.prenda_schema import PrendaCreate, PrendaCreateFromImageIARequest, PrendaIAData


class PrendaIACRUD:
	# Crear un cliente de Gemini usando credenciales seguras del entorno.
	@staticmethod
	def _crear_cliente_ia():
		if not settings.GEMINI_API_KEY:
			raise ValueError("No se encontro GEMINI_API_KEY en el entorno")
		return genai.Client(api_key=settings.GEMINI_API_KEY)

	# Descargar bytes de imagen desde un enlace remoto.
	@staticmethod
	def _descargar_imagen(image_url: str) -> tuple[bytes, str]:
		try:
			response = requests.get(image_url, timeout=20)
			response.raise_for_status()
		except Exception as exc:
			raise ValueError("No fue posible descargar la imagen desde la URL enviada") from exc

		mime_type = response.headers.get("Content-Type", "image/jpeg").split(";")[0].strip() or "image/jpeg"
		return response.content, mime_type

	# Construir un prompt estricto con la lista de colores disponibles en BD.
	@staticmethod
	def _build_prompt(colores: list[tuple[int, str]]) -> str:
		colores_texto = "\n".join([f"- id: {color_id}, nombre: {nombre}" for color_id, nombre in colores])
		return (
			"Analiza la prenda de ropa de la imagen y devuelve UNICAMENTE un objeto JSON valido.\n"
			"No agregues texto extra, no uses markdown, no uses bloques ```json y no envuelvas el JSON entre comillas.\n"
			"Debes usar EXACTAMENTE este formato:\n"
			"{\n"
			'  "nombre": "string",\n'
			'  "tipo_prenda": "string",\n'
			'  "nivel_abrigo": 1,\n'
			'  "nivel_elegancia": 1,\n'
			'  "color_ids": [0]\n'
			"}\n"
			"tipo_prenda debe describir la prenda detectada (ej.: camisa, pantalon, vestido, chaqueta, zapatillas).\n"
			"Escala para nivel_abrigo: 1 a 10 (1: muy fresco/verano, 10: clima artico/invierno pesado).\n"
			"Escala para nivel_elegancia: 1 a 10 (1: deportivo/pijama, 10: etiqueta/gala).\n"
			"Selecciona color_ids usando SOLO IDs existentes de la lista siguiente:\n"
			f"{colores_texto}\n"
		)

	# Normalizar respuestas de IA con ruido para recuperar un JSON utilizable.
	@staticmethod
	def _parse_json_robusto(raw_text: str) -> dict[str, Any]:
		texto = (raw_text or "").strip()
		if not texto:
			raise ValueError("La IA no devolvio contenido")

		fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", texto, flags=re.IGNORECASE | re.DOTALL)
		if fence_match:
			texto = fence_match.group(1).strip()

		for _ in range(3):
			try:
				parsed = json.loads(texto)
			except json.JSONDecodeError:
				break

			if isinstance(parsed, dict):
				return parsed
			if isinstance(parsed, str):
				texto = parsed.strip()
				continue
			raise ValueError("La respuesta de IA no corresponde a un objeto JSON")

		inicio = texto.find("{")
		fin = texto.rfind("}")
		if inicio != -1 and fin != -1 and fin > inicio:
			fragmento = texto[inicio : fin + 1]
			try:
				parsed = json.loads(fragmento)
				if isinstance(parsed, dict):
					return parsed
			except json.JSONDecodeError:
				pass

		texto_sin_comillas = texto
		if (texto.startswith('"') and texto.endswith('"')) or (texto.startswith("'") and texto.endswith("'")):
			texto_sin_comillas = texto[1:-1].strip()
			texto_sin_comillas = texto_sin_comillas.replace('\\"', '"')
			try:
				parsed = json.loads(texto_sin_comillas)
				if isinstance(parsed, dict):
					return parsed
			except json.JSONDecodeError:
				pass

		raise ValueError("No se pudo formatear la respuesta de IA a un JSON valido")

	# Procesar una imagen con IA, validar el JSON y crear la prenda en BD.
	@staticmethod
	def create_from_image_url(db: Session, data: PrendaCreateFromImageIARequest) -> Prenda:
		colores_disponibles = [(color.id, color.nombre) for color in ColorCRUD.get_all(db)]
		if not colores_disponibles:
			raise ValueError("No hay colores cargados en la base de datos")

		image_bytes, mime_type = PrendaIACRUD._descargar_imagen(str(data.image_url))
		prompt = PrendaIACRUD._build_prompt(colores_disponibles)
		client = PrendaIACRUD._crear_cliente_ia()
		image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

		try:
			response = client.models.generate_content(
				model=settings.GEMINI_MODEL,
				contents=[prompt, image_part],
			)
		except Exception as exc:
			raise RuntimeError("Error al consultar el agente de IA") from exc

		response_text = getattr(response, "text", "") or ""
		json_payload = PrendaIACRUD._parse_json_robusto(response_text)
		ia_data = PrendaIAData.model_validate(json_payload)

		payload = PrendaCreate(
			usuario_id=data.usuario_id,
			nombre=ia_data.nombre,
			tipo_prenda=ia_data.tipo_prenda,
			nivel_abrigo=ia_data.nivel_abrigo,
			nivel_elegancia=ia_data.nivel_elegancia,
			foto_url=str(data.image_url),
			color_ids=ia_data.color_ids,
		)
		return PrendaCRUD.create(db, payload)
