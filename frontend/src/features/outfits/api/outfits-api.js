import { delete_json, get_json } from '../../../shared/api/http-client';

function parse_positive_int(value) {
  const parsed_value = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed_value) && parsed_value > 0 ? parsed_value : null;
}

export async function fetch_outfits_from_backend(user_id) {
  const normalized_user_id = parse_positive_int(user_id);
  if (!normalized_user_id) {
    throw new Error('El id de usuario debe ser un numero entero positivo');
  }

  const outfits = await get_json(`/api/usuarios/${normalized_user_id}/outfits`);
  return Array.isArray(outfits) ? outfits : [];
}

export async function delete_outfit_from_backend(outfit_id) {
  const normalized_outfit_id = parse_positive_int(outfit_id);
  if (!normalized_outfit_id) {
    throw new Error('El id de outfit debe ser un numero entero positivo');
  }

  await delete_json(`/api/outfits/${normalized_outfit_id}`);
}
