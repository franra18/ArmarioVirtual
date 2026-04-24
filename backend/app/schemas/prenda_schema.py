from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator


class PrendaCreate(BaseModel):
	usuario_id: int
	nombre: str
	tipo_prenda: str
	nivel_abrigo: int | None = Field(default=None, ge=1, le=5)
	nivel_elegancia: int | None = Field(default=None, ge=1, le=5)
	foto_url: str | None = None
	color_ids: list[int] = Field(min_length=1)


class PrendaIAData(BaseModel):
	nombre: str = Field(min_length=1)
	tipo_prenda: str = Field(min_length=1)
	nivel_abrigo: int = Field(ge=1, le=5)
	nivel_elegancia: int = Field(ge=1, le=5)
	color_ids: list[int] | None = None
	color_nombres: list[str] | None = None

	# Validar que exista al menos un color combinando IDs y nombres detectados.
	@model_validator(mode="after")
	def validar_colores_requeridos(self):
		ids_validos = [color_id for color_id in (self.color_ids or []) if color_id is not None]
		nombres_validos = [nombre for nombre in (self.color_nombres or []) if (nombre or "").strip()]
		if not ids_validos and not nombres_validos:
			raise ValueError("La IA debe devolver color_ids, color_nombres o ambos")

		self.color_ids = ids_validos or None
		self.color_nombres = nombres_validos or None
		return self

	model_config = ConfigDict(
		extra="forbid",
		json_schema_extra={
			"example": {
				"nombre": "Camisa Oxford Azul",
				"tipo_prenda": "camisa",
				"nivel_abrigo": 2,
				"nivel_elegancia": 4,
				"color_ids": [1],
				"color_nombres": ["azul marino"],
			}
		},
	)


class PrendaCreateFromImageIARequest(BaseModel):
	image_url: HttpUrl
	usuario_id: int = Field(default=1, ge=1)

	model_config = ConfigDict(
		json_schema_extra={
			"example": {
				"image_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
				"usuario_id": 1,
			}
		},
	)


class PrendaUpdate(BaseModel):
	usuario_id: int | None = None
	nombre: str | None = None
	tipo_prenda: str | None = None
	nivel_abrigo: int | None = Field(default=None, ge=1, le=5)
	nivel_elegancia: int | None = Field(default=None, ge=1, le=5)
	foto_url: str | None = None
	color_ids: list[int] | None = Field(default=None, min_length=1)


class PrendaResponse(BaseModel):
	id: int
	usuario_id: int
	nombre: str
	tipo_prenda: str
	nivel_abrigo: int | None = None
	nivel_elegancia: int | None = None
	foto_url: str | None = None
	color_nombres: list[str] = Field(default_factory=list)
	fecha_creacion: datetime | None = None

	model_config = ConfigDict(from_attributes=True)
