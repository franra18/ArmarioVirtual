export function normalize_prenda_text(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function to_prenda_title_case(value) {
  return String(value ?? '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

export function resolve_prenda_icon_name(tipo_prenda) {
  const normalized_tipo = normalize_prenda_text(tipo_prenda);

  if (normalized_tipo.includes('calcetin') || normalized_tipo.includes('sock')) {
    return 'socks';
  }

  if (normalized_tipo.includes('zapa') || normalized_tipo.includes('shoe') || normalized_tipo.includes('bota')) {
    return 'shoe-prints';
  }

  if (normalized_tipo.includes('gorra') || normalized_tipo.includes('sombrero')) {
    return 'hat-cowboy-side';
  }

  if (normalized_tipo.includes('vestido')) {
    return 'person-dress';
  }

  return 'shirt';
}

export function get_prenda_category_label(tipo_prenda) {
  const normalized_tipo = normalize_prenda_text(tipo_prenda);

  if (normalized_tipo.includes('camisa')) {
    return 'Camisas';
  }

  if (normalized_tipo.includes('camiseta')) {
    return 'Camisetas';
  }

  if (normalized_tipo.includes('chaqueta') || normalized_tipo.includes('abrigo')) {
    return 'Chaquetas';
  }

  if (normalized_tipo.includes('pantalon') || normalized_tipo.includes('jean')) {
    return 'Pantalones';
  }

  if (normalized_tipo.includes('calcetin') || normalized_tipo.includes('sock')) {
    return 'Calcetines';
  }

  const pretty_label = to_prenda_title_case(normalized_tipo);
  if (pretty_label.endsWith('s')) {
    return pretty_label;
  }

  const last_letter = pretty_label.slice(-1).toLowerCase();
  const ends_with_vowel = ['a', 'e', 'i', 'o', 'u'].includes(last_letter);
  return `${pretty_label}${ends_with_vowel ? 's' : 'es'}`;
}

export function get_prenda_added_sort_value(prenda) {
  const parsed_date = Date.parse(String(prenda?.fecha_creacion ?? ''));
  if (!Number.isNaN(parsed_date)) {
    return parsed_date;
  }

  const numeric_id = Number(prenda?.id);
  return Number.isNaN(numeric_id) ? 0 : numeric_id;
}