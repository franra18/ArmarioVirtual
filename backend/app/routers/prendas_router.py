from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.prenda_crud import PrendaCRUD
from app.database.database import get_db
from app.schemas.prenda_schema import PrendaCreate, PrendaResponse, PrendaUpdate

router = APIRouter()


# Endpoint para obtener todas las prendas.
@router.get(
	"/",
	response_model=list[PrendaResponse],
	summary="Obtener prendas",
	description="Devuelve la lista completa de prendas registradas.",
	responses={200: {"description": "Prendas obtenidas correctamente"}},
)
def get_prendas(db: Session = Depends(get_db)):
	return PrendaCRUD.get_all(db)


# Endpoint para obtener una prenda por su ID.
@router.get(
	"/{prenda_id}",
	response_model=PrendaResponse,
	summary="Obtener prenda por ID",
	description="Devuelve los datos de una prenda especifica usando su identificador.",
	responses={
		200: {"description": "Prenda encontrada correctamente"},
		404: {"description": "Prenda no encontrada"},
	},
)
def get_prenda_by_id(prenda_id: int, db: Session = Depends(get_db)):
	prenda = PrendaCRUD.get_by_id(db, prenda_id)
	if prenda is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prenda no encontrada")
	return prenda


# Endpoint para crear una nueva prenda.
@router.post(
	"/",
	response_model=PrendaResponse,
	status_code=status.HTTP_201_CREATED,
	summary="Crear prenda",
	description="Crea una nueva prenda con los datos enviados en el body.",
	responses={201: {"description": "Prenda creada correctamente"}},
)
def create_prenda(data: PrendaCreate, db: Session = Depends(get_db)):
	try:
		return PrendaCRUD.create(db, data)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Endpoint para actualizar una prenda existente por ID.
@router.put(
	"/{prenda_id}",
	response_model=PrendaResponse,
	summary="Actualizar prenda",
	description="Actualiza los datos de una prenda existente por su identificador.",
	responses={
		200: {"description": "Prenda actualizada correctamente"},
		404: {"description": "Prenda no encontrada"},
	},
)
def update_prenda(prenda_id: int, data: PrendaUpdate, db: Session = Depends(get_db)):
	try:
		prenda = PrendaCRUD.update(db, prenda_id, data)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	if prenda is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prenda no encontrada")
	return prenda


# Endpoint para eliminar una prenda por ID.
@router.delete(
	"/{prenda_id}",
	summary="Eliminar prenda",
	description="Elimina una prenda existente utilizando su identificador.",
	responses={
		200: {"description": "Prenda eliminada correctamente"},
		404: {"description": "Prenda no encontrada"},
	},
)
def delete_prenda(prenda_id: int, db: Session = Depends(get_db)):
	eliminada = PrendaCRUD.delete(db, prenda_id)
	if not eliminada:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prenda no encontrada")
	return {"message": "Prenda eliminada correctamente"}
