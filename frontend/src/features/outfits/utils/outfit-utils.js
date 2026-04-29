import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';

export function normalize_outfit_text(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function get_outfit_added_sort_value(outfit) {
  const parsed_date = Date.parse(String(outfit?.fecha_creacion ?? ''));
  if (!Number.isNaN(parsed_date)) {
    return parsed_date;
  }

  const numeric_id = Number(outfit?.id);
  return Number.isNaN(numeric_id) ? 0 : numeric_id;
}

export function build_outfit_collage_images(outfit, prendas_by_id) {
  const prenda_ids = Array.isArray(outfit?.prenda_ids) ? outfit.prenda_ids : [];
  const images = [];

  for (const prenda_id of prenda_ids) {
    const prenda = prendas_by_id.get(String(prenda_id));
    const image_url = resolve_prenda_image_url(prenda?.foto_url);
    if (image_url) {
      images.push(image_url);
    }

    if (images.length >= 4) {
      break;
    }
  }

  return images;
}
