from pydantic import BaseModel, ConfigDict, Field


class ClimaActualQuery(BaseModel):
	lat: float = Field(ge=-90, le=90)
	lon: float = Field(ge=-180, le=180)

	model_config = ConfigDict(
		json_schema_extra={
			"example": {
				"lat": 36.72,
				"lon": -4.42,
			}
		},
	)


class ClimaActualResponse(BaseModel):
	temperatura_c: float | None = None
	sensacion_termica_c: float | None = None
	humedad: int | None = None
	descripcion: str | None = None
	viento_m_s: float | None = None
	ciudad: str | None = None
	pais: str | None = None
	sugerencia_ropa: str | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"example": {
				"temperatura_c": 22.4,
				"sensacion_termica_c": 21.8,
				"humedad": 58,
				"descripcion": "clear sky",
				"viento_m_s": 2.8,
				"ciudad": "Mijas",
				"pais": "ES",
				"sugerencia_ropa": "Ropa ligera",
			}
		},
	)
