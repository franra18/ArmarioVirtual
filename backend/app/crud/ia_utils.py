import json
import logging
import re
from typing import Any

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

CRITERIOS_ABRIGO_ELEGANCIA = (
	"Criterios de referencia para decidir niveles de abrigo y elegancia:\n"
	"1) Escala de Nivel de Abrigo (capacidad termica segun temperatura exterior):\n"
	"- Nivel 1-2 (Muy Ligero): para calor extremo > 30 C. Prendas muy transpirables y minima cobertura (ropa de bano, tops de tirantes, calzado abierto).\n"
	"- Nivel 3-4 (Ligero): para clima calido 20 C a 25 C. Una capa fina (camisetas manga corta, camisas de lino, faldas ligeras).\n"
	"- Nivel 5-6 (Intermedio): para entretiempo 15 C a 20 C. Proteccion ante brisa suave o interiores frescos (sudaderas finas, vaqueros estandar, cardigans, calzado cerrado deportivo).\n"
	"- Nivel 7-8 (Calido): para frio moderado 5 C a 15 C. Materiales que retienen calor (jerseis de lana, gabardinas, chaquetas de cuero, botas).\n"
	"- Nivel 9-10 (Proteccion Total): para frio intenso < 5 C. Ropa aislante de invierno (abrigos de plumas, parkas, bufandas y guantes termicos).\n"
	"2) Escala de Nivel de Elegancia (formalidad segun contexto social del prompt):\n"
	"- Nivel 1-2 (Deportivo/Casa): prioridad total en comodidad o rendimiento fisico (gimnasio, chandal, mallas, casa).\n"
	"- Nivel 3-4 (Informal/Casual): uso diario sin protocolo (camisetas con graficos, vaqueros desgastados, zapatillas casuales).\n"
	"- Nivel 5-6 (Casual Elegante): equilibrio para trabajo relajado o social informal (polos, chinos, blusas sencillas, mocasines).\n"
	"- Nivel 7-8 (Semi-formal): negocios, cenas importantes o celebraciones (blazers, pantalon de vestir, vestido de coctel, zapatos de piel).\n"
	"- Nivel 9-10 (Formal/Gala): maxima formalidad para etiqueta o ceremonia (esmoquin, traje de tres piezas, vestido largo de gala, accesorios de lujo).\n"
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
def generate_ia_text(client: genai.Client, contents: list[Any]) -> str:
	try:
		response = client.models.generate_content(
			model=settings.GEMINI_MODEL,
			contents=contents,
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


# Parsear de forma robusta respuestas de IA a un objeto JSON.
def parse_ia_json(raw_text: str) -> dict[str, Any]:
	texto = (raw_text or "").strip()
	if not texto:
		logger.warning("La IA devolvio contenido vacio")
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

	logger.warning("No se pudo parsear JSON de IA. Respuesta truncada: %s", texto[:500])
	raise ValueError("No se pudo formatear la respuesta de IA a un JSON valido")
