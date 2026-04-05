from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.outfit_crud import OutfitCRUD
from app.database.database import get_db
from app.schemas.outfit_schema import OutfitCreate, OutfitResponse, OutfitUpdate

router = APIRouter()


# Endpoint para obtener todos los outfits.
@router.get(
	"/",
	response_model=list[OutfitResponse],
	summary="Obtener outfits",
	description="Devuelve la lista completa de outfits registrados.",
	responses={200: {"description": "Outfits obtenidos correctamente"}},
)
def get_outfits(db: Session = Depends(get_db)):
	return OutfitCRUD.get_all(db)


# Endpoint para obtener un outfit por su ID.
@router.get(
	"/{outfit_id}",
	response_model=OutfitResponse,
	summary="Obtener outfit por ID",
	description="Devuelve los datos de un outfit especifico usando su identificador.",
	responses={
		200: {"description": "Outfit encontrado correctamente"},
		404: {"description": "Outfit no encontrado"},
	},
)
def get_outfit_by_id(outfit_id: int, db: Session = Depends(get_db)):
	outfit = OutfitCRUD.get_by_id(db, outfit_id)
	if outfit is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit no encontrado")
	return outfit


# Endpoint para crear un nuevo outfit.
@router.post(
	"/",
	response_model=OutfitResponse,
	status_code=status.HTTP_201_CREATED,
	summary="Crear outfit",
	description="Crea un nuevo outfit con los datos enviados en el body.",
	responses={201: {"description": "Outfit creado correctamente"}},
)
def create_outfit(data: OutfitCreate, db: Session = Depends(get_db)):
	try:
		return OutfitCRUD.create(db, data)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Endpoint para actualizar un outfit existente por ID.
@router.put(
	"/{outfit_id}",
	response_model=OutfitResponse,
	summary="Actualizar outfit",
	description="Actualiza los datos de un outfit existente por su identificador.",
	responses={
		200: {"description": "Outfit actualizado correctamente"},
		404: {"description": "Outfit no encontrado"},
	},
)
def update_outfit(outfit_id: int, data: OutfitUpdate, db: Session = Depends(get_db)):
	try:
		outfit = OutfitCRUD.update(db, outfit_id, data)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	if outfit is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit no encontrado")
	return outfit


# Endpoint para eliminar un outfit por ID.
@router.delete(
	"/{outfit_id}",
	summary="Eliminar outfit",
	description="Elimina un outfit existente utilizando su identificador.",
	responses={
		200: {"description": "Outfit eliminado correctamente"},
		404: {"description": "Outfit no encontrado"},
	},
)
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
	eliminado = OutfitCRUD.delete(db, outfit_id)
	if not eliminado:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit no encontrado")
	return {"message": "Outfit eliminado correctamente"}
