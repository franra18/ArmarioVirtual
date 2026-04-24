const cloudinary_cloud_name = String(process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '').trim();

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
