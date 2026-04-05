from pydantic import BaseModel, ConfigDict


class ColorCreate(BaseModel):
	nombre: str


class ColorUpdate(BaseModel):
	nombre: str | None = None


class ColorResponse(BaseModel):
	id: int
	nombre: str

	model_config = ConfigDict(from_attributes=True)
