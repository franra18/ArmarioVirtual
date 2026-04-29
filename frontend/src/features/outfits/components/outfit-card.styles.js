import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const outfit_card_styles = StyleSheet.create({
  card_container: {
    flex: 1,
    minWidth: 0,
    marginBottom: 65,
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
    overflow: 'hidden',
    backgroundColor: palette.cream_deep,
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
    zIndex: 2,
  },
  collage_root: {
    width: '100%',
    height: '100%',
    padding: 6,
    gap: 6,
  },
  collage_row: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  collage_column: {
    flex: 1,
    gap: 6,
  },
  collage_cell: {
    flex: 1,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collage_image: {
    width: '100%',
    height: '100%',
  },
  title_text: {
    marginTop: 8,
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
