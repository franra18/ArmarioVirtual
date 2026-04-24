import { delete_json, get_json } from '../../../shared/api/http-client';

export async function fetch_prendas_for_user_from_backend(user_id) {
  const normalized_user_id = Number.parseInt(String(user_id ?? '').trim(), 10);
  if (Number.isNaN(normalized_user_id) || normalized_user_id < 1) {
    throw new Error('El id de usuario debe ser un numero entero positivo');
  }

  const prendas = await get_json(`/api/usuarios/${normalized_user_id}/prendas`);
  return Array.isArray(prendas) ? prendas : [];
}

export async function delete_prenda_from_backend(prenda_id) {
  const normalized_prenda_id = Number.parseInt(String(prenda_id ?? '').trim(), 10);
  if (Number.isNaN(normalized_prenda_id) || normalized_prenda_id < 1) {
    throw new Error('El id de prenda debe ser un numero entero positivo');
  }

  await delete_json(`/api/prendas/${normalized_prenda_id}`);
}
