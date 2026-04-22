import { get_json } from '../../shared/api/http-client';

export async function fetch_user_profile_from_backend(user_id) {
  const normalized_user_id = Number.parseInt(String(user_id ?? '').trim(), 10);
  if (Number.isNaN(normalized_user_id) || normalized_user_id < 1) {
    throw new Error('El id de usuario debe ser un numero entero positivo');
  }

  const [usuario, prendas, outfits] = await Promise.all([
    get_json(`/api/usuarios/${normalized_user_id}`),
    get_json(`/api/usuarios/${normalized_user_id}/prendas`),
    get_json(`/api/usuarios/${normalized_user_id}/outfits`),
  ]);

  const recientes = (Array.isArray(prendas) ? prendas : [])
    .slice(0, 4)
    .map((prenda) => prenda?.nombre)
    .filter(Boolean);

  return {
    id: String(usuario.id),
    nombre: usuario.nombre,
    prendas_total: Array.isArray(prendas) ? prendas.length : 0,
    outfits_total: Array.isArray(outfits) ? outfits.length : 0,
    recientes: recientes.length > 0 ? recientes : ['Sin prendas todavia'],
  };
}