const request_timeout_ms = 7000;

function normalize_base_url(url) {
  return String(url ?? '').trim().replace(/\/$/, '');
}

function get_backend_base_url() {
  const configured_backend_url = normalize_base_url(process.env.EXPO_PUBLIC_BACKEND_URL);
  if (!configured_backend_url) {
    throw new Error('EXPO_PUBLIC_BACKEND_URL no esta configurada.');
  }

  return configured_backend_url;
}

function is_network_error(error) {
  const message = String(error?.message ?? '').toLowerCase();
  return (
    message.includes('network request failed')
    || message.includes('network request timed out')
    || message.includes('aborted')
    || message.includes('timeout')
    || message.includes('fetch failed')
  );
}

async function fetch_with_timeout(url, options = {}) {
  const controller = new AbortController();
  const timeout_id = setTimeout(() => controller.abort(), request_timeout_ms);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout_id);
  }
}

async function request_json(method, path, body) {
  const base_url = get_backend_base_url();

  try {
    const has_body = body !== undefined;
    const response = await fetch_with_timeout(`${base_url}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(has_body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(has_body ? { body: JSON.stringify(body) } : {}),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const detail = (
        typeof payload?.detail === 'string'
          ? payload.detail
          : 'Error al consultar el backend'
      );
      throw new Error(detail);
    }

    return payload;
  } catch (error) {
    if (is_network_error(error)) {
      throw new Error(
        'No se pudo conectar con el backend. Configura EXPO_PUBLIC_BACKEND_URL con la IP y el puerto correctos (ej: http://192.168.1.20:8000).'
      );
    }

    throw error;
  }
}

export async function get_json(path) {
  return request_json('GET', path);
}

export async function delete_json(path) {
  return request_json('DELETE', path);
}

export async function post_json(path, body) {
  return request_json('POST', path, body);
}

export async function put_json(path, body) {
  return request_json('PUT', path, body);
}