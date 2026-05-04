import { delete_json, get_json, post_json, put_json } from '../../../shared/api/http-client';

function parse_positive_int(value) {
  const parsed_value = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed_value) && parsed_value > 0 ? parsed_value : null;
}

// Normaliza una coordenada a maximo dos decimales.
function normalize_coordinate(value) {
  const parsed_value = Number(value);
  if (Number.isNaN(parsed_value)) {
    return null;
  }

  return Number.parseFloat(parsed_value.toFixed(2));
}

function normalize_outfit_payload(payload) {
  const prenda_ids = Array.isArray(payload?.prenda_ids)
    ? payload.prenda_ids
      .map((prenda_id) => parse_positive_int(prenda_id))
      .filter(Boolean)
    : [];

  return {
    usuario_id: parse_positive_int(payload?.usuario_id),
    nombre_outfit: String(payload?.nombre_outfit ?? '').trim() || null,
    ocasion: String(payload?.ocasion ?? '').trim() || null,
    creado_por_ia: Boolean(payload?.creado_por_ia),
    prenda_ids,
  };
}

// Normaliza el payload de generacion de outfit con IA.
function normalize_outfit_ia_payload(payload) {
  const lat = normalize_coordinate(payload?.lat);
  const lon = normalize_coordinate(payload?.lon);
  const has_coords = lat != null && lon != null;

  return {
    usuario_id: parse_positive_int(payload?.usuario_id),
    prompt: String(payload?.prompt ?? '').trim(),
    ...(has_coords ? { lat, lon } : {}),
  };
}

function validate_outfit_payload(normalized_payload) {
  if (!normalized_payload.usuario_id) {
    throw new Error('El usuario no es valido');
  }

  if (!normalized_payload.prenda_ids.length) {
    throw new Error('Debes seleccionar al menos una prenda');
  }
}

// Valida el payload de generacion de outfit con IA.
function validate_outfit_ia_payload(normalized_payload) {
  if (!normalized_payload.usuario_id) {
    throw new Error('El usuario no es valido');
  }

  if (!normalized_payload.prompt) {
    throw new Error('Debes escribir un prompt');
  }

  if (normalized_payload.prompt.length > 250) {
    throw new Error('El prompt supera el maximo de 250 caracteres');
  }

  const has_lat = normalized_payload.lat != null;
  const has_lon = normalized_payload.lon != null;
  if (has_lat !== has_lon) {
    throw new Error('Para usar clima debes enviar lat y lon juntos');
  }
}

export async function fetch_outfits_from_backend(user_id) {
  const normalized_user_id = parse_positive_int(user_id);
  if (!normalized_user_id) {
    throw new Error('El id de usuario debe ser un numero entero positivo');
  }

  const outfits = await get_json(`/api/usuarios/${normalized_user_id}/outfits`);
  return Array.isArray(outfits) ? outfits : [];
}

export async function create_outfit_in_backend(payload) {
  const normalized_payload = normalize_outfit_payload(payload);
  validate_outfit_payload(normalized_payload);

  return post_json('/api/outfits/', normalized_payload);
}

// Genera un outfit con IA usando el backend.
export async function create_outfit_from_ia_in_backend(payload) {
  const normalized_payload = normalize_outfit_ia_payload(payload);
  validate_outfit_ia_payload(normalized_payload);

  return post_json('/api/outfits/generar-desde-ia', normalized_payload);
}

export async function delete_outfit_from_backend(outfit_id) {
  const normalized_outfit_id = parse_positive_int(outfit_id);
  if (!normalized_outfit_id) {
    throw new Error('El id de outfit debe ser un numero entero positivo');
  }

  await delete_json(`/api/outfits/${normalized_outfit_id}`);
}

export async function update_outfit_in_backend(outfit_id, payload) {
  const normalized_outfit_id = parse_positive_int(outfit_id);
  if (!normalized_outfit_id) {
    throw new Error('El id de outfit debe ser un numero entero positivo');
  }

  const normalized_payload = normalize_outfit_payload(payload);
  validate_outfit_payload(normalized_payload);

  return put_json(`/api/outfits/${normalized_outfit_id}`, normalized_payload);
}