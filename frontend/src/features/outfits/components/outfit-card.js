import { Image, Pressable, Text, View } from 'react-native';
import { palette } from '../../../shared/theme/palette';
import { HeartIcon, ShirtIcon } from '../../../shared/icons/app-icons';
import { outfit_card_styles } from './outfit-card.styles';

function render_collage_cell(image_url, key) {
  return (
    <View key={key} style={outfit_card_styles.collage_cell}>
      {image_url ? (
        <Image source={{ uri: image_url }} style={outfit_card_styles.collage_image} resizeMode="cover" />
      ) : (
        <ShirtIcon size={26} color={palette.walnut} />
      )}
    </View>
  );
}

function render_collage(image_urls = []) {
  const normalized_images = Array.isArray(image_urls) ? image_urls.filter(Boolean) : [];
  const collage_images = normalized_images.length > 0 ? normalized_images : [null];
  const count = collage_images.length;

  if (count <= 1) {
    return (
      <View style={outfit_card_styles.collage_root}>
        <View style={outfit_card_styles.collage_row}>
          {render_collage_cell(collage_images[0], 'single')}
        </View>
      </View>
    );
  }

  if (count === 2) {
    return (
      <View style={outfit_card_styles.collage_root}>
        <View style={outfit_card_styles.collage_row}>
          {render_collage_cell(collage_images[0], 'left')}
          {render_collage_cell(collage_images[1], 'right')}
        </View>
      </View>
    );
  }

  if (count === 3) {
    return (
      <View style={outfit_card_styles.collage_root}>
        <View style={outfit_card_styles.collage_row}>
          {render_collage_cell(collage_images[0], 'left')}
          <View style={outfit_card_styles.collage_column}>
            {render_collage_cell(collage_images[1], 'top')}
            {render_collage_cell(collage_images[2], 'bottom')}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={outfit_card_styles.collage_root}>
      <View style={outfit_card_styles.collage_row}>
        {render_collage_cell(collage_images[0], 'top-left')}
        {render_collage_cell(collage_images[1], 'top-right')}
      </View>
      <View style={outfit_card_styles.collage_row}>
        {render_collage_cell(collage_images[2], 'bottom-left')}
        {render_collage_cell(collage_images[3], 'bottom-right')}
      </View>
    </View>
  );
}

export function OutfitCard({ outfit, index, image_urls, is_favorite, on_toggle_favorite, on_open_detail }) {
  const title = outfit?.nombre_outfit ?? `Conjunto ${outfit?.id ?? ''}`;
  const subtitle = outfit?.ocasion ?? '';

  return (
    <Pressable
      onPress={() => on_open_detail?.(outfit)}
      style={({ pressed }) => [
        outfit_card_styles.card_container,
        outfit_card_styles.card_pressable,
        pressed ? outfit_card_styles.card_pressable_pressed : null,
      ]}
    >
      <View style={outfit_card_styles.visual_tile}>
        <Pressable
          onPress={(event) => {
            event?.stopPropagation?.();
            on_toggle_favorite?.(outfit?.id);
          }}
          style={outfit_card_styles.favorite_button}
          hitSlop={10}
        >
          <HeartIcon
            size={13}
            color={is_favorite ? palette.walnut : palette.text_muted}
            solid={is_favorite}
          />
        </Pressable>

        {render_collage(image_urls)}
      </View>

      <Text selectable style={outfit_card_styles.title_text} numberOfLines={1}>
        {title}
      </Text>
      <Text selectable style={outfit_card_styles.subtitle_text} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
