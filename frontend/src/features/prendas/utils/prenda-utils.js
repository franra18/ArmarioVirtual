import tinycolor from 'tinycolor2';
import { palette } from '../../../shared/theme/palette';

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

const spanish_color_phrase_aliases = [
  ['azul marino', 'navy'],
  ['azul cielo', 'skyblue'],
  ['azul claro', 'lightskyblue'],
  ['verde oliva', 'olive'],
  ['verde agua', 'mediumaquamarine'],
  ['gris oscuro', 'dimgray'],
  ['gris claro', 'lightgray'],
  ['marron oscuro', 'saddlebrown'],
  ['marron claro', 'peru'],
  ['cafe oscuro', 'saddlebrown'],
  ['cafe claro', 'tan'],
  ['blanco roto', 'ivory'],
  ['rojo vino', 'maroon'],
];

const spanish_color_token_aliases = {
  blanco: 'white',
  negro: 'black',
  gris: 'gray',
  plata: 'silver',
  plateado: 'silver',
  rojo: 'red',
  granate: 'maroon',
  bordo: 'maroon',
  vino: 'maroon',
  azul: 'blue',
  marino: 'navy',
  celeste: 'skyblue',
  cielo: 'skyblue',
  turquesa: 'turquoise',
  verde: 'green',
  oliva: 'olive',
  lima: 'lime',
  amarillo: 'yellow',
  dorado: 'gold',
  oro: 'gold',
  naranja: 'orange',
  coral: 'coral',
  rosa: 'pink',
  fucsia: 'fuchsia',
  morado: 'purple',
  violeta: 'violet',
  lila: 'plum',
  marron: 'saddlebrown',
  cafe: 'saddlebrown',
  castano: 'saddlebrown',
  beige: 'beige',
  crema: 'ivory',
  crudo: 'beige',
  hueso: 'beige',
  camel: 'tan',
  caqui: 'khaki',
};

function normalize_color_text(color_name) {
  return String(color_name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function resolve_spanish_color_alias(normalized_color_name, tokens) {
  for (const [phrase, css_color] of spanish_color_phrase_aliases) {
    if (normalized_color_name.includes(phrase)) {
      return css_color;
    }
  }

  for (const token of tokens) {
    if (spanish_color_token_aliases[token]) {
      return spanish_color_token_aliases[token];
    }
  }

  return null;
}

function build_deterministic_color(color_name) {
  const normalized = normalize_color_text(color_name);
  if (!normalized) {
    return palette.cream_deep;
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(index);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  return tinycolor({ h: hue, s: 50, l: 48 }).toHexString();
}

export function get_prenda_color_hex(color_name) {
  const normalized = normalize_color_text(color_name);
  if (!normalized) {
    return palette.cream_deep;
  }

  const direct_match = tinycolor(normalized);
  if (direct_match.isValid()) {
    return direct_match.toHexString();
  }

  const token_matches = normalized.split(/[\s/-]+/).filter(Boolean);

  const spanish_alias = resolve_spanish_color_alias(normalized, token_matches);
  if (spanish_alias) {
    return tinycolor(spanish_alias).toHexString();
  }

  for (const token of token_matches) {
    const token_match = tinycolor(token);
    if (token_match.isValid()) {
      return token_match.toHexString();
    }
  }

  return build_deterministic_color(normalized);
}