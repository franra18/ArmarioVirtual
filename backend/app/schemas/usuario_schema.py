from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UsuarioCreate(BaseModel):
	nombre: str
	email: str


class UsuarioUpdate(BaseModel):
	nombre: str | None = None
	email: str | None = None


class UsuarioResponse(BaseModel):
	id: int
	nombre: str
	email: str
	fecha_registro: datetime | None = None

	model_config = ConfigDict(from_attributes=True)
