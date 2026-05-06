import { elegance_level_labels, warmth_level_labels } from '../constants/prenda-constants';

export function build_prenda_meta(prenda) {
  const color_names = Array.isArray(prenda?.color_nombres) ? prenda.color_nombres : [];
  const color_label = color_names.length ? color_names[0] : 'Sin color';
  const warmth_label = warmth_level_labels[Number(prenda?.nivel_abrigo)] ?? 'Sin abrigo';
  const elegance_label = elegance_level_labels[Number(prenda?.nivel_elegancia)] ?? 'Sin elegancia';
  return `${color_label} · ${warmth_label} · ${elegance_label}`;
}
