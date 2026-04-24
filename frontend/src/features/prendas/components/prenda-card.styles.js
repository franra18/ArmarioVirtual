import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const prenda_card_styles = StyleSheet.create({
  card_container: {
    flex: 1,
    minWidth: 0,
    marginBottom: 10,
  },
  card_pressable: {
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  card_pressable_pressed: {
    opacity: 0.85,
  },
  visual_tile: {
    borderRadius: 19,
    borderCurve: 'continuous',
    minHeight: 136,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  visual_tile_cream: {
    backgroundColor: palette.cream_deep,
  },
  visual_tile_sky: {
    backgroundColor: '#C8DDE8',
  },
  favorite_button: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title_text: {
    marginTop: 2,
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 31,
  },
  subtitle_text: {
    marginTop: 2,
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 13,
  },
});
