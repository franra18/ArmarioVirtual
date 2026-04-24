import { get_json } from '../../../shared/api/http-client';

export async function fetch_current_weather_from_backend(lat, lon) {
  const normalized_lat = Number(lat);
  const normalized_lon = Number(lon);

  if (Number.isNaN(normalized_lat) || Number.isNaN(normalized_lon)) {
    throw new Error('Las coordenadas de clima no son validas');
  }

  const query = new URLSearchParams({
    lat: String(normalized_lat),
    lon: String(normalized_lon),
  });

  return get_json(`/api/clima/actual?${query.toString()}`);
}
