import requests
from google.genai import types
from sqlalchemy.orm import Session

from app.crud.color_crud import ColorCRUD
from app.crud.ia_utils import create_ia_client, generate_ia_structured, get_criterios_abrigo_elegancia
from app.crud.prenda_crud import PrendaCRUD
from app.models.prenda_model import Prenda
from app.schemas.color_schema import ColorCreate
from app.schemas.prenda_schema import PrendaCreate, PrendaCreateFromImageIARequest, PrendaIAData


class PrendaIACRUD:
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
		if not colores_texto:
			colores_texto = "- (sin colores cargados actualmente en base de datos)"
		criterios_texto = get_criterios_abrigo_elegancia()
		return (
			"Analiza la prenda de ropa de la imagen y devuelve UNICAMENTE un objeto JSON valido.\n"
			"No agregues texto extra, no uses markdown, no uses bloques ```json y no envuelvas el JSON entre comillas.\n"
			"Aplica estrictamente los criterios de abrigo y elegancia definidos abajo para asignar nivel_abrigo y nivel_elegancia.\n"
			"Debes usar EXACTAMENTE este formato:\n"
			"{\n"
			'  "nombre": "string",\n'
			'  "tipo_prenda": "string",\n'
			'  "nivel_abrigo": 1,\n'
			'  "nivel_elegancia": 1,\n'
			'  "color_ids": [0],\n'
			'  "color_nombres": ["string"]\n'
			"}\n"
			"tipo_prenda debe describir la prenda detectada (ej.: camisa, pantalon, vestido, chaqueta, zapatillas).\n"
			"color_ids y color_nombres pueden coexistir.\n"
			"Si el color ya existe en el catalogo, usa su ID en color_ids.\n"
			"Si el color no existe, devuelvelo en color_nombres para que el sistema lo cree.\n"
			f"{criterios_texto}"
			"Catalogo actual de colores (IDs y nombres):\n"
			f"{colores_texto}\n"
		)

	# Normalizar nombre de color para comparar por igualdad.
	@staticmethod
	def _normalizar_nombre_color(nombre_color: str) -> str:
		return " ".join((nombre_color or "").strip().lower().split())

	# Resolver IDs de color: reutilizar existentes por nombre exacto normalizado y crear faltantes.
	@staticmethod
	def _resolver_color_ids(db: Session, ia_data: PrendaIAData) -> list[int]:
		color_ids_resueltos: list[int] = []
		colores_existentes = ColorCRUD.get_all(db)
		ids_existentes = {color.id for color in colores_existentes}
		id_por_nombre = {
			PrendaIACRUD._normalizar_nombre_color(color.nombre): color.id
			for color in colores_existentes
			if (color.nombre or "").strip()
		}

		for color_id in ia_data.color_ids or []:
			if color_id in ids_existentes and color_id not in color_ids_resueltos:
				color_ids_resueltos.append(color_id)

		nombres_nuevos: list[str] = []
		nombres_nuevos_normalizados: set[str] = set()
		for nombre_color in ia_data.color_nombres or []:
			nombre_limpio = (nombre_color or "").strip()
			if not nombre_limpio:
				continue

			nombre_normalizado = PrendaIACRUD._normalizar_nombre_color(nombre_limpio)
			if not nombre_normalizado:
				continue

			color_existente_id = id_por_nombre.get(nombre_normalizado)
			if color_existente_id is not None:
				if color_existente_id not in color_ids_resueltos:
					color_ids_resueltos.append(color_existente_id)
				continue

			if nombre_normalizado in nombres_nuevos_normalizados:
				continue

			nombres_nuevos_normalizados.add(nombre_normalizado)
			nombres_nuevos.append(nombre_limpio)

		for nombre_nuevo in nombres_nuevos:
			nuevo_color = ColorCRUD.create(db, ColorCreate(nombre=nombre_nuevo))
			if nuevo_color.id not in color_ids_resueltos:
				color_ids_resueltos.append(nuevo_color.id)

		if not color_ids_resueltos:
			raise ValueError("La IA no devolvio colores validos para asociar a la prenda")

		return color_ids_resueltos

	# Procesar una imagen con IA, validar el JSON y crear la prenda en BD.
	@staticmethod
	def create_from_image_url(db: Session, data: PrendaCreateFromImageIARequest) -> Prenda:
		colores_disponibles = [(color.id, color.nombre) for color in ColorCRUD.get_all(db)]

		image_bytes, mime_type = PrendaIACRUD._descargar_imagen(str(data.image_url))
		prompt = PrendaIACRUD._build_prompt(colores_disponibles)
		client = create_ia_client()
		image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
		ia_data = generate_ia_structured(client, [prompt, image_part], PrendaIAData)
		color_ids_resueltos = PrendaIACRUD._resolver_color_ids(db, ia_data)

		payload = PrendaCreate(
			usuario_id=data.usuario_id,
			nombre=ia_data.nombre,
			tipo_prenda=ia_data.tipo_prenda,
			nivel_abrigo=ia_data.nivel_abrigo,
			nivel_elegancia=ia_data.nivel_elegancia,
			foto_url=str(data.image_url),
			color_ids=color_ids_resueltos,
		)
		return PrendaCRUD.create(db, payload)
