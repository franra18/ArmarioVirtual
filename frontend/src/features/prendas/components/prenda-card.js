import { Image, Pressable, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { palette } from '../../../shared/theme/palette';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import { prenda_card_styles } from './prenda-card.styles';

function normalize_string(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function to_title_case(value) {
  return String(value ?? '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function resolve_icon_name(tipo_prenda) {
  const normalized_tipo = normalize_string(tipo_prenda);

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

function resolve_tile_variant(prenda_id, index) {
  const numeric_id = Number(prenda_id);
  const stable_value = Number.isNaN(numeric_id) ? index : numeric_id;
  return stable_value % 3 === 1 ? 'sky' : 'cream';
}

export function PrendaCard({ prenda, index, is_favorite, on_toggle_favorite, on_open_detail }) {
  const tipo_prenda = prenda?.tipo_prenda ?? 'prenda';
  const tile_variant = resolve_tile_variant(prenda?.id, index);
  const icon_name = resolve_icon_name(tipo_prenda);
  const image_url = resolve_prenda_image_url(prenda?.foto_url);

  return (
    <Pressable
      onPress={() => on_open_detail?.(prenda)}
      style={({ pressed }) => [
        prenda_card_styles.card_container,
        prenda_card_styles.card_pressable,
        pressed ? prenda_card_styles.card_pressable_pressed : null,
      ]}
    >
      <View
        style={[
          prenda_card_styles.visual_tile,
          tile_variant === 'sky' ? prenda_card_styles.visual_tile_sky : prenda_card_styles.visual_tile_cream,
        ]}
      >
        <Pressable
          onPress={(event) => {
            event?.stopPropagation?.();
            on_toggle_favorite(prenda?.id);
          }}
          style={prenda_card_styles.favorite_button}
          hitSlop={10}
        >
          <FontAwesome6
            name="heart"
            size={13}
            color={is_favorite ? palette.walnut : palette.text_muted}
            solid={is_favorite}
          />
        </Pressable>

        {image_url ? (
          <Image
            source={{ uri: image_url }}
            style={prenda_card_styles.prenda_image}
            resizeMode="cover"
          />
        ) : (
          <FontAwesome6 name={icon_name} size={47} color={palette.walnut} />
        )}
      </View>

      <Text selectable style={prenda_card_styles.title_text} numberOfLines={1}>
        {prenda?.nombre ?? `Prenda ${prenda?.id ?? ''}`}
      </Text>
      <Text selectable style={prenda_card_styles.subtitle_text} numberOfLines={1}>
        {to_title_case(tipo_prenda)}
      </Text>
    </Pressable>
  );
}
