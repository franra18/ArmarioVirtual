from fastapi import APIRouter, Depends, HTTPException, status

from app.crud.clima_crud import ClimaCRUD
from app.schemas.clima_schema import ClimaActualQuery, ClimaActualResponse

router = APIRouter()


# Endpoint para obtener el clima actual usando coordenadas geograficas.
@router.get(
	"/actual",
	response_model=ClimaActualResponse,
	summary="Obtener clima actual",
	description="Consulta el clima actual desde OpenWeather usando latitud y longitud.",
	responses={
		200: {"description": "Clima obtenido correctamente"},
		422: {"description": "Coordenadas invalidas"},
		502: {"description": "No se pudo consultar OpenWeather"},
	},
)
def get_clima_actual(
	query: ClimaActualQuery = Depends(),
):
	try:
		return ClimaCRUD.get_clima_actual(query.lat, query.lon)
	except RuntimeError as e:
		raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
