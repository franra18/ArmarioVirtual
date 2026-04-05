from pydantic import BaseModel, ConfigDict, Field


class PrendaCreate(BaseModel):
	usuario_id: int
	nombre: str
	categoria: str
	nivel_abrigo: int | None = None
	nivel_elegancia: int | None = None
	foto_url: str | None = None
	color_ids: list[int] = Field(min_length=1)


class PrendaUpdate(BaseModel):
	usuario_id: int | None = None
	nombre: str | None = None
	categoria: str | None = None
	nivel_abrigo: int | None = None
	nivel_elegancia: int | None = None
	foto_url: str | None = None
	color_ids: list[int] | None = Field(default=None, min_length=1)


class PrendaResponse(BaseModel):
	id: int
	usuario_id: int
	nombre: str
	categoria: str
	nivel_abrigo: int | None = None
	nivel_elegancia: int | None = None
	foto_url: str | None = None

	model_config = ConfigDict(from_attributes=True)
