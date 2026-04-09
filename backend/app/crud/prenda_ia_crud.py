import requests
from google.genai import types
from sqlalchemy.orm import Session

from app.crud.color_crud import ColorCRUD
from app.crud.ia_utils import create_ia_client, generate_ia_text, parse_ia_json
from app.crud.prenda_crud import PrendaCRUD
from app.models.prenda_model import Prenda
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

	# Procesar una imagen con IA, validar el JSON y crear la prenda en BD.
	@staticmethod
	def create_from_image_url(db: Session, data: PrendaCreateFromImageIARequest) -> Prenda:
		colores_disponibles = [(color.id, color.nombre) for color in ColorCRUD.get_all(db)]
		if not colores_disponibles:
			raise ValueError("No hay colores cargados en la base de datos")

		image_bytes, mime_type = PrendaIACRUD._descargar_imagen(str(data.image_url))
		prompt = PrendaIACRUD._build_prompt(colores_disponibles)
		client = create_ia_client()
		image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
		response_text = generate_ia_text(client, [prompt, image_part])
		json_payload = parse_ia_json(response_text)
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
