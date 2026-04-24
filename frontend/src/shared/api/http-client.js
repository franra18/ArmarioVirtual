import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const default_backend_port = 8000;
const request_timeout_ms = 7000;

function build_base_url_from_host(host) {
  if (!host) {
    return null;
  }

  return `http://${host}:${default_backend_port}`;
}

function extract_host_from_host_uri(host_uri) {
  if (!host_uri) {
    return null;
  }

  return host_uri.split(':')[0];
}

function extract_host_from_script_url(script_url) {
  if (!script_url) {
    return null;
  }

  const host_match = script_url.match(/^https?:\/\/([^/:]+)/i);
  return host_match?.[1] ?? null;
}

function normalize_base_url(url) {
  return String(url ?? '').trim().replace(/\/$/, '');
}

function get_backend_base_url_candidates() {
  const configured_backend_url = normalize_base_url(process.env.EXPO_PUBLIC_BACKEND_URL);
  if (configured_backend_url) {
    return [configured_backend_url];
  }

  const candidates = [];
  const push_candidate = (base_url) => {
    if (!base_url) {
      return;
    }

    if (!candidates.includes(base_url)) {
      candidates.push(base_url);
    }
  };

  const expo_host_uri = Constants.expoConfig?.hostUri;
  push_candidate(build_base_url_from_host(extract_host_from_host_uri(expo_host_uri)));

  const script_url = NativeModules?.SourceCode?.scriptURL;
  push_candidate(build_base_url_from_host(extract_host_from_script_url(script_url)));

  if (Platform.OS === 'android') {
    push_candidate(build_base_url_from_host('10.0.2.2'));
    push_candidate(build_base_url_from_host('10.0.3.2'));
  }

  push_candidate(build_base_url_from_host('127.0.0.1'));
  push_candidate(build_base_url_from_host('localhost'));

  return candidates;
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

async function request_json(method, path) {
  const base_url_candidates = get_backend_base_url_candidates();
  let last_network_error = null;

  for (const base_url of base_url_candidates) {
    try {
      const response = await fetch_with_timeout(`${base_url}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
        },
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
        last_network_error = error;
        continue;
      }

      throw error;
    }
  }

  if (last_network_error) {
    throw new Error(
      'No se pudo conectar con el backend. Si usas dispositivo fisico, configura EXPO_PUBLIC_BACKEND_URL con la IP de tu PC (ej: http://192.168.1.20:8000).'
    );
  }

  throw new Error('No se pudo resolver una URL valida para el backend');
}

export async function get_json(path) {
  return request_json('GET', path);
}

export async function delete_json(path) {
  return request_json('DELETE', path);
}