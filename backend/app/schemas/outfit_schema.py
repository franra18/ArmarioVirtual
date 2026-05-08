from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OutfitCreate(BaseModel):
	usuario_id: int
	nombre_outfit: str | None = None
	ocasion: str | None = None
	creado_por_ia: bool | None = False
	prenda_ids: list[int] = Field(min_length=1)


class OutfitGenerateFromIARequest(BaseModel):
	usuario_id: int = Field(ge=1)
	prompt: str = Field(min_length=1, max_length=250)
	lat: float | None = None
	lon: float | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"example": {
				"usuario_id": 3,
				"prompt": "Quiero un conjunto para una cena informal.",
				"lat": 40.42,
				"lon": -3.7,
			}
		},
	)


class OutfitIAData(BaseModel):
	nombre_outfit: str = Field(min_length=1)
	ocasion: str = Field(min_length=1)
	prenda_ids: list[int] = Field(min_length=1)

	model_config = ConfigDict(
		extra="forbid",
		json_schema_extra={
			"example": {
				"nombre_outfit": "Cena casual de primavera",
				"ocasion": "Cena informal",
				"prenda_ids": [10, 21, 37],
			}
		},
	)


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
    prenda_ids: list[int] = Field(default_factory=list)
    fecha_creacion: datetime | None = None

    model_config = ConfigDict(from_attributes=True)