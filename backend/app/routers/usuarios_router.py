from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.outfit_crud import OutfitCRUD
from app.crud.prenda_crud import PrendaCRUD
from app.crud.usuario_crud import UsuarioCRUD
from app.database.database import get_db
from app.schemas.outfit_schema import OutfitResponse
from app.schemas.prenda_schema import PrendaResponse
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse, UsuarioUpdate

router = APIRouter()


# Endpoint para obtener todos los usuarios.
@router.get(
	"/",
	response_model=list[UsuarioResponse],
	summary="Obtener usuarios",
	description="Devuelve la lista completa de usuarios registrados.",
	responses={200: {"description": "Usuarios obtenidos correctamente"}},
)
def get_usuarios(db: Session = Depends(get_db)):
	return UsuarioCRUD.get_all(db)


# Endpoint para obtener un usuario por su ID.
@router.get(
	"/{usuario_id}",
	response_model=UsuarioResponse,
	summary="Obtener usuario por ID",
	description="Devuelve los datos de un usuario especifico usando su identificador.",
	responses={
		200: {"description": "Usuario encontrado correctamente"},
		404: {"description": "Usuario no encontrado"},
	},
)
def get_usuario_by_id(usuario_id: int, db: Session = Depends(get_db)):
	usuario = UsuarioCRUD.get_by_id(db, usuario_id)
	if usuario is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
	return usuario


# Endpoint para obtener todas las prendas de un usuario por su ID.
@router.get(
	"/{usuario_id}/prendas",
	response_model=list[PrendaResponse],
	summary="Obtener prendas de un usuario",
	description="Devuelve todas las prendas asociadas a un usuario especifico usando su identificador.",
	responses={
		200: {"description": "Prendas del usuario obtenidas correctamente"},
		404: {"description": "Usuario no encontrado"},
	},
)
def get_prendas_by_usuario(usuario_id: int, db: Session = Depends(get_db)):
	usuario = UsuarioCRUD.get_by_id(db, usuario_id)
	if usuario is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

	return PrendaCRUD.get_by_usuario_id(db, usuario_id)


# Endpoint para obtener todos los outfits de un usuario por su ID.
@router.get(
	"/{usuario_id}/outfits",
	response_model=list[OutfitResponse],
	summary="Obtener outfits de un usuario",
	description="Devuelve todos los outfits asociados a un usuario especifico usando su identificador.",
	responses={
		200: {"description": "Outfits del usuario obtenidos correctamente"},
		404: {"description": "Usuario no encontrado"},
	},
)
def get_outfits_by_usuario(usuario_id: int, db: Session = Depends(get_db)):
	usuario = UsuarioCRUD.get_by_id(db, usuario_id)
	if usuario is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

	return OutfitCRUD.get_by_usuario_id(db, usuario_id)


# Endpoint para crear un nuevo usuario.
@router.post(
	"/",
	response_model=UsuarioResponse,
	status_code=status.HTTP_201_CREATED,
	summary="Crear usuario",
	description="Crea un nuevo usuario con los datos enviados en el body.",
	responses={201: {"description": "Usuario creado correctamente"}},
)
def create_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
	return UsuarioCRUD.create(db, data)


# Endpoint para actualizar un usuario existente por ID.
@router.put(
	"/{usuario_id}",
	response_model=UsuarioResponse,
	summary="Actualizar usuario",
	description="Actualiza los datos de un usuario existente por su identificador.",
	responses={
		200: {"description": "Usuario actualizado correctamente"},
		404: {"description": "Usuario no encontrado"},
	},
)
def update_usuario(usuario_id: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
	usuario = UsuarioCRUD.update(db, usuario_id, data)
	if usuario is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
	return usuario


# Endpoint para eliminar un usuario por ID.
@router.delete(
	"/{usuario_id}",
	summary="Eliminar usuario",
	description="Elimina un usuario existente utilizando su identificador.",
	responses={
		200: {"description": "Usuario eliminado correctamente"},
		404: {"description": "Usuario no encontrado"},
	},
)
def delete_usuario(usuario_id: int, db: Session = Depends(get_db)):
	eliminado = UsuarioCRUD.delete(db, usuario_id)
	if not eliminado:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
	return {"message": "Usuario eliminado correctamente"}
