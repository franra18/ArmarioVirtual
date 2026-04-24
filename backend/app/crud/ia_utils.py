import logging
from typing import Any, TypeVar

from google import genai
from pydantic import BaseModel, ValidationError

from app.core.config import settings

logger = logging.getLogger(__name__)
TModel = TypeVar("TModel", bound=BaseModel)

CRITERIOS_ABRIGO_ELEGANCIA = (
	"Criterios de referencia para decidir niveles de abrigo y elegancia:\n"
	"1) Escala de Nivel de Abrigo (capacidad termica segun temperatura exterior):\n"
	"- Nivel 1 (Muy Ligero): para calor extremo > 30 C. Prendas muy transpirables y minima cobertura (ropa de bano, tops de tirantes, calzado abierto).\n"
	"- Nivel 2 (Ligero): para clima calido 20 C a 25 C. Una capa fina (camisetas manga corta, camisas de lino, faldas ligeras).\n"
	"- Nivel 3 (Intermedio): para entretiempo 15 C a 20 C. Proteccion ante brisa suave o interiores frescos (sudaderas finas, vaqueros estandar, cardigans, calzado cerrado deportivo).\n"
	"- Nivel 4 (Calido): para frio moderado 5 C a 15 C. Materiales que retienen calor (jerseis de lana, gabardinas, chaquetas de cuero, botas).\n"
	"- Nivel 5 (Proteccion Total): para frio intenso < 5 C. Ropa aislante de invierno (abrigos de plumas, parkas, bufandas y guantes termicos).\n"
	"2) Escala de Nivel de Elegancia (formalidad segun contexto social del prompt):\n"
	"- Nivel 1 (Deportivo/Casa): prioridad total en comodidad o rendimiento fisico (gimnasio, chandal, mallas, casa).\n"
	"- Nivel 2 (Informal/Casual): uso diario sin protocolo (camisetas con graficos, vaqueros desgastados, zapatillas casuales).\n"
	"- Nivel 3 (Casual Elegante): equilibrio para trabajo relajado o social informal (polos, chinos, blusas sencillas, mocasines).\n"
	"- Nivel 4 (Semi-formal): negocios, cenas importantes o celebraciones (blazers, pantalon de vestir, vestido de coctel, zapatos de piel).\n"
	"- Nivel 5 (Formal/Gala): maxima formalidad para etiqueta o ceremonia (esmoquin, traje de tres piezas, vestido largo de gala, accesorios de lujo).\n"
)


# Crear un cliente de Gemini usando la clave definida en el entorno.
def create_ia_client() -> genai.Client:
	if not settings.GEMINI_API_KEY:
		raise ValueError("No se encontro GEMINI_API_KEY en el entorno")
	return genai.Client(api_key=settings.GEMINI_API_KEY)


# Exponer texto base de criterios para reutilizarlo en prompts de IA.
def get_criterios_abrigo_elegancia() -> str:
	return CRITERIOS_ABRIGO_ELEGANCIA


# Ejecutar una llamada al modelo configurado y devolver solo el texto de respuesta.
def generate_ia_text(client: genai.Client, contents: list[Any], config: dict[str, Any] | None = None) -> str:
	try:
		response = client.models.generate_content(
			model=settings.GEMINI_MODEL,
			contents=contents,
			config=config,
		)
	except Exception as exc:
		logger.exception(
			"Fallo al consultar el agente de IA. model=%s error_type=%s error=%s",
			settings.GEMINI_MODEL,
			type(exc).__name__,
			str(exc),
		)
		raise RuntimeError(f"Error al consultar el agente de IA: {type(exc).__name__}: {exc}") from exc

	return getattr(response, "text", "") or ""


# Ejecutar una llamada al modelo configurando JSON Schema y devolver un BaseModel validado.
def generate_ia_structured(client: genai.Client, contents: list[Any], schema: type[TModel]) -> TModel:
	response_text = generate_ia_text(
		client,
		contents,
		config={
			"response_mime_type": "application/json",
			"response_json_schema": schema.model_json_schema(),
		},
	)

	if not (response_text or "").strip():
		logger.warning("La IA devolvio contenido vacio para salida estructurada")
		raise ValueError("La IA no devolvio contenido")

	try:
		return schema.model_validate_json(response_text)
	except ValidationError as exc:
		logger.warning("La IA devolvio JSON invalido para el schema %s: %s", schema.__name__, str(exc))
		raise ValueError("La IA devolvio un JSON que no cumple el esquema esperado") from exc
