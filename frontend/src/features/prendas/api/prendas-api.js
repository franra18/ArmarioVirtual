import { delete_json, get_json, post_json, put_json } from '../../../shared/api/http-client';

function parse_positive_int(value) {
  const parsed_value = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed_value) && parsed_value > 0 ? parsed_value : null;
}

function normalize_manual_prenda_payload(payload) {
  return {
    usuario_id: parse_positive_int(payload?.usuario_id),
    nombre: String(payload?.nombre ?? '').trim(),
    tipo_prenda: String(payload?.tipo_prenda ?? '').trim(),
    nivel_abrigo: payload?.nivel_abrigo == null ? null : Number(payload.nivel_abrigo),
    nivel_elegancia: payload?.nivel_elegancia == null ? null : Number(payload.nivel_elegancia),
    foto_url: String(payload?.foto_url ?? '').trim() || null,
    color_ids: Array.isArray(payload?.color_ids)
      ? payload.color_ids
        .map((color_id) => parse_positive_int(color_id))
        .filter(Boolean)
      : [],
  };
}

function validate_manual_prenda_payload(normalized_payload) {
  if (!normalized_payload.usuario_id) {
    throw new Error('El usuario no es valido');
  }

  if (!normalized_payload.nombre) {
    throw new Error('El nombre es obligatorio');
  }

  if (!normalized_payload.tipo_prenda) {
    throw new Error('El tipo de prenda es obligatorio');
  }

  if (!normalized_payload.color_ids.length) {
    throw new Error('Debes seleccionar al menos un color');
  }

  if (
    normalized_payload.nivel_abrigo != null
    && (normalized_payload.nivel_abrigo < 1 || normalized_payload.nivel_abrigo > 5)
  ) {
    throw new Error('El nivel de abrigo debe estar entre 1 y 5');
  }

  if (
    normalized_payload.nivel_elegancia != null
    && (normalized_payload.nivel_elegancia < 1 || normalized_payload.nivel_elegancia > 5)
  ) {
    throw new Error('El nivel de elegancia debe estar entre 1 y 5');
  }
}

export async function fetch_prendas_for_user_from_backend(user_id) {
  const normalized_user_id = parse_positive_int(user_id);
  if (!normalized_user_id) {
    throw new Error('El id de usuario debe ser un numero entero positivo');
  }

  const prendas = await get_json(`/api/usuarios/${normalized_user_id}/prendas`);
  return Array.isArray(prendas) ? prendas : [];
}

export async function delete_prenda_from_backend(prenda_id) {
  const normalized_prenda_id = parse_positive_int(prenda_id);
  if (!normalized_prenda_id) {
    throw new Error('El id de prenda debe ser un numero entero positivo');
  }

  await delete_json(`/api/prendas/${normalized_prenda_id}`);
}

export async function fetch_colores_from_backend() {
  const colores = await get_json('/api/colores/');
  return Array.isArray(colores) ? colores : [];
}

export async function create_color_in_backend(nombre_color) {
  const normalized_nombre_color = String(nombre_color ?? '').trim();
  if (!normalized_nombre_color) {
    throw new Error('El nombre del color es obligatorio');
  }

  return post_json('/api/colores/', {
    nombre: normalized_nombre_color,
  });
}

export async function create_prenda_manual_in_backend(payload) {
  const normalized_payload = normalize_manual_prenda_payload(payload);
  validate_manual_prenda_payload(normalized_payload);

  return post_json('/api/prendas/', normalized_payload);
}

export async function update_prenda_manual_in_backend(prenda_id, payload) {
  const normalized_prenda_id = parse_positive_int(prenda_id);
  if (!normalized_prenda_id) {
    throw new Error('El id de prenda debe ser un numero entero positivo');
  }

  const normalized_payload = normalize_manual_prenda_payload(payload);
  validate_manual_prenda_payload(normalized_payload);

  return put_json(`/api/prendas/${normalized_prenda_id}`, normalized_payload);
}

export async function create_prenda_from_image_ia_in_backend(payload) {
  const normalized_image_url = String(payload?.image_url ?? '').trim();
  const normalized_usuario_id = parse_positive_int(payload?.usuario_id);

  if (!normalized_image_url) {
    throw new Error('La imagen es obligatoria');
  }

  if (!normalized_usuario_id) {
    throw new Error('El usuario no es valido');
  }

  return post_json('/api/prendas/desde-imagen-ia', {
    image_url: normalized_image_url,
    usuario_id: normalized_usuario_id,
  });
}
