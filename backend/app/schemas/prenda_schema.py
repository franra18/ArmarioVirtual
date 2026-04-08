from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class PrendaCreate(BaseModel):
	usuario_id: int
	nombre: str
	tipo_prenda: str
	nivel_abrigo: int | None = None
	nivel_elegancia: int | None = None
	foto_url: str | None = None
	color_ids: list[int] = Field(min_length=1)


class PrendaIAData(BaseModel):
	nombre: str = Field(min_length=1)
	tipo_prenda: str = Field(min_length=1)
	nivel_abrigo: int = Field(ge=1, le=5)
	nivel_elegancia: int = Field(ge=1, le=5)
	color_ids: list[int] = Field(min_length=1)

	model_config = ConfigDict(
		extra="forbid",
		json_schema_extra={
			"example": {
				"nombre": "Camisa Oxford Azul",
				"tipo_prenda": "camisa",
				"nivel_abrigo": 2,
				"nivel_elegancia": 4,
				"color_ids": [1, 3],
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
	nivel_abrigo: int | None = None
	nivel_elegancia: int | None = None
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

	model_config = ConfigDict(from_attributes=True)
