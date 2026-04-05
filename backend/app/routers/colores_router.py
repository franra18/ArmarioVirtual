from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.color_crud import ColorCRUD
from app.database.database import get_db
from app.schemas.color_schema import ColorCreate, ColorResponse, ColorUpdate

router = APIRouter()


# Endpoint para obtener todos los colores.
@router.get(
	"/",
	response_model=list[ColorResponse],
	summary="Obtener colores",
	description="Devuelve la lista completa de colores registrados.",
	responses={200: {"description": "Colores obtenidos correctamente"}},
)
def get_colores(db: Session = Depends(get_db)):
	return ColorCRUD.get_all(db)


# Endpoint para obtener un color por su ID.
@router.get(
	"/{color_id}",
	response_model=ColorResponse,
	summary="Obtener color por ID",
	description="Devuelve los datos de un color especifico usando su identificador.",
	responses={
		200: {"description": "Color encontrado correctamente"},
		404: {"description": "Color no encontrado"},
	},
)
def get_color_by_id(color_id: int, db: Session = Depends(get_db)):
	color = ColorCRUD.get_by_id(db, color_id)
	if color is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Color no encontrado")
	return color


# Endpoint para crear un nuevo color.
@router.post(
	"/",
	response_model=ColorResponse,
	status_code=status.HTTP_201_CREATED,
	summary="Crear color",
	description="Crea un nuevo color con los datos enviados en el body.",
	responses={201: {"description": "Color creado correctamente"}},
)
def create_color(data: ColorCreate, db: Session = Depends(get_db)):
	return ColorCRUD.create(db, data)


# Endpoint para actualizar un color existente por ID.
@router.put(
	"/{color_id}",
	response_model=ColorResponse,
	summary="Actualizar color",
	description="Actualiza los datos de un color existente por su identificador.",
	responses={
		200: {"description": "Color actualizado correctamente"},
		404: {"description": "Color no encontrado"},
	},
)
def update_color(color_id: int, data: ColorUpdate, db: Session = Depends(get_db)):
	color = ColorCRUD.update(db, color_id, data)
	if color is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Color no encontrado")
	return color


# Endpoint para eliminar un color por ID.
@router.delete(
	"/{color_id}",
	summary="Eliminar color",
	description="Elimina un color existente utilizando su identificador.",
	responses={
		200: {"description": "Color eliminado correctamente"},
		404: {"description": "Color no encontrado"},
	},
)
def delete_color(color_id: int, db: Session = Depends(get_db)):
	eliminado = ColorCRUD.delete(db, color_id)
	if not eliminado:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Color no encontrado")
	return {"message": "Color eliminado correctamente"}
