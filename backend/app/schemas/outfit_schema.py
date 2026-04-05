from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OutfitCreate(BaseModel):
	usuario_id: int
	nombre_outfit: str | None = None
	ocasion: str | None = None
	creado_por_ia: bool | None = False
	prenda_ids: list[int] = Field(min_length=1)


class OutfitUpdate(BaseModel):
	usuario_id: int | None = None
	nombre_outfit: str | None = None
	ocasion: str | None = None
	creado_por_ia: bool | None = None
	prenda_ids: list[int] | None = Field(default=None, min_length=1)


class OutfitResponse(BaseModel):
	id: int
	usuario_id: int
	nombre_outfit: str | None = None
	ocasion: str | None = None
	creado_por_ia: bool | None = None
	fecha_creacion: datetime | None = None

	model_config = ConfigDict(from_attributes=True)
