from fastapi import APIRouter, HTTPException, Query, status

from app.crud.clima_crud import ClimaCRUD
from app.schemas.clima_schema import ClimaActualResponse

router = APIRouter()


# Endpoint para obtener el clima actual usando coordenadas geograficas.
@router.get(
	"/actual",
	response_model=ClimaActualResponse,
	summary="Obtener clima actual",
	description="Consulta el clima actual desde OpenWeather usando latitud y longitud.",
	responses={
		200: {"description": "Clima obtenido correctamente"},
		400: {"description": "Coordenadas invalidas"},
		502: {"description": "No se pudo consultar OpenWeather"},
	},
)
def get_clima_actual(
	lat: float = Query(..., ge=-90, le=90, description="Latitud en grados decimales"),
	lon: float = Query(..., ge=-180, le=180, description="Longitud en grados decimales"),
):
	if lat is None or lon is None:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Debes enviar lat y lon")

	try:
		return ClimaCRUD.get_clima_actual(lat, lon)
	except RuntimeError as e:
		raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
