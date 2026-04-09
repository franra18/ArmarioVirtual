import json
import logging
import re
from typing import Any

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)


# Crear un cliente de Gemini usando la clave definida en el entorno.
def create_ia_client() -> genai.Client:
	if not settings.GEMINI_API_KEY:
		raise ValueError("No se encontro GEMINI_API_KEY en el entorno")
	return genai.Client(api_key=settings.GEMINI_API_KEY)


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
