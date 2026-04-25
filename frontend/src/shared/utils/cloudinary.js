const cloudinary_cloud_name = String(process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '').trim();
const cloudinary_upload_preset = String(process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '').trim();
const cloudinary_upload_folder = String(process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_FOLDER ?? '').trim();

function is_absolute_url(value) {
  return /^https?:\/\//i.test(String(value ?? '').trim());
}

function encode_public_id(public_id) {
  return String(public_id)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function build_cloudinary_url(public_id) {
  const normalized_public_id = String(public_id ?? '').trim().replace(/^\/+/, '');
  if (!normalized_public_id || !cloudinary_cloud_name) {
    return null;
  }

  return `https://res.cloudinary.com/${cloudinary_cloud_name}/image/upload/${encode_public_id(normalized_public_id)}`;
}

export function resolve_prenda_image_url(foto_url) {
  const raw_value = String(foto_url ?? '').trim();
  if (!raw_value) {
    return null;
  }

  if (is_absolute_url(raw_value)) {
    return raw_value;
  }

  if (raw_value.startsWith('res.cloudinary.com/')) {
    return `https://${raw_value}`;
  }

  return build_cloudinary_url(raw_value);
}

function resolve_file_extension(file_name) {
  const extension_match = String(file_name ?? '').toLowerCase().match(/\.([a-z0-9]+)$/i);
  return extension_match?.[1] ?? 'jpg';
}

function resolve_mime_type(file_name, explicit_type) {
  const normalized_explicit_type = String(explicit_type ?? '').trim().toLowerCase();
  if (normalized_explicit_type.startsWith('image/')) {
    return normalized_explicit_type;
  }

  const extension = resolve_file_extension(file_name);
  const map_by_extension = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
  };

  return map_by_extension[extension] ?? 'image/jpeg';
}

export async function upload_local_image_to_cloudinary({ local_uri, file_name, mime_type }) {
  const normalized_local_uri = String(local_uri ?? '').trim();
  if (!normalized_local_uri) {
    throw new Error('No hay una imagen local para subir');
  }

  if (!cloudinary_cloud_name || !cloudinary_upload_preset) {
    throw new Error(
      'Falta configurar Cloudinary. Define EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  const normalized_file_name = String(file_name ?? '').trim() || `prenda.${resolve_file_extension(normalized_local_uri)}`;
  const normalized_mime_type = resolve_mime_type(normalized_file_name, mime_type);

  const form_data = new FormData();
  form_data.append('upload_preset', cloudinary_upload_preset);
  if (cloudinary_upload_folder) {
    form_data.append('folder', cloudinary_upload_folder);
  }

  form_data.append('file', {
    uri: normalized_local_uri,
    name: normalized_file_name,
    type: normalized_mime_type,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinary_cloud_name}/image/upload`,
    {
      method: 'POST',
      body: form_data,
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const cloudinary_message = String(payload?.error?.message ?? '').trim();
    throw new Error(cloudinary_message || 'No se pudo subir la imagen a Cloudinary');
  }

  const secure_url = String(payload?.secure_url ?? '').trim();
  if (!secure_url) {
    throw new Error('Cloudinary no devolvio secure_url para la imagen subida');
  }

  return secure_url;
}
