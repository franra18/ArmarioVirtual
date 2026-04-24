from typing import Any

import requests

from app.core.config import settings
from app.schemas.clima_schema import ClimaActualResponse


class ClimaCRUD:
	# Sugerir tipo de ropa segun temperatura en grados celsius.
	@staticmethod
	def _resolver_sugerencia_ropa(temperatura_c: float | None) -> str:
		if temperatura_c is None:
			return "Sin recomendacion"

		if temperatura_c >= 30:
			return "Ropa muy ligera"

		if temperatura_c >= 22:
			return "Ropa ligera"

		if temperatura_c >= 15:
			return "Entretiempo"

		if temperatura_c >= 7:
			return "Abrigo medio"

		return "Abrigo fuerte"

	# Consultar OpenWeather y devolver un contrato de clima para el frontend.
	@staticmethod
	def get_clima_actual(lat: float, lon: float) -> ClimaActualResponse:
		if not settings.OPENWEATHER_API_KEY:
			raise RuntimeError("No se encontro OPENWEATHER_API_KEY en el entorno")

		url = "https://api.openweathermap.org/data/2.5/weather"
		params = {
			"lat": lat,
			"lon": lon,
			"appid": settings.OPENWEATHER_API_KEY,
			"units": "metric",
			"lang": "es",
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
		sys = raw.get("sys") or {}

		temperatura = ClimaCRUD._to_float(main.get("temp"))

		return ClimaActualResponse(
			temperatura_c=temperatura,
			sensacion_termica_c=ClimaCRUD._to_float(main.get("feels_like")),
			humedad=ClimaCRUD._to_int(main.get("humidity")),
			descripcion=descripcion,
			viento_m_s=ClimaCRUD._to_float(wind.get("speed")),
			ciudad=ClimaCRUD._to_text(raw.get("name")),
			pais=ClimaCRUD._to_text(sys.get("country")),
			sugerencia_ropa=ClimaCRUD._resolver_sugerencia_ropa(temperatura),
		)

	# Convertir cualquier valor numerico compatible a float o None.
	@staticmethod
	def _to_float(value: Any) -> float | None:
		try:
			if value is None:
				return None
			return float(value)
		except (TypeError, ValueError):
			return None

	# Convertir cualquier valor numerico compatible a int o None.
	@staticmethod
	def _to_int(value: Any) -> int | None:
		try:
			if value is None:
				return None
			return int(value)
		except (TypeError, ValueError):
			return None

	# Convertir texto potencialmente vacio a string utilizable o None.
	@staticmethod
	def _to_text(value: Any) -> str | None:
		text = str(value or "").strip()
		return text or None
