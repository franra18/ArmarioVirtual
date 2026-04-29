import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const outfit_detail_screen_styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scroll_content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 140,
    gap: 16,
  },
  header_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 10,
  },
  header_right_actions: {
    flexDirection: 'row',
    gap: 8,
  },
  control_button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chip_text: {
    fontFamily: typography.body,
    fontSize: 14,
  },
  chip_sky: {
    backgroundColor: palette.sky,
  },
  chip_walnut: {
    backgroundColor: palette.walnut,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  chip_text_walnut: {
    color: palette.walnut,
  },
  chip_text_white: {
    color: palette.white,
  },
  title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 35,
    lineHeight: 38,
  },
  meta_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta_text: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 13,
  },
  section_header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  section_title: {
    color: palette.text_muted,
    fontFamily: typography.body_medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  section_count: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  prendas_list: {
    gap: 12,
  },
  prenda_card: {
    borderRadius: 12,
    borderCurve: 'continuous',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 84,
  },
  prenda_card_cream: {
    backgroundColor: palette.cream_deep,
  },
  prenda_card_sky: {
    backgroundColor: palette.sky,
  },
  prenda_image_wrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  prenda_image: {
    width: '100%',
    height: '100%',
  },
  prenda_info: {
    flex: 1,
    gap: 4,
  },
  prenda_name: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 18,
  },
  prenda_meta: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  edit_button: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 20,
    height: 48,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edit_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 15,
  },
  empty_wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  empty_title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 28,
  },
  empty_subtitle: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 14,
    textAlign: 'center',
  },
  empty_button: {
    marginTop: 6,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  empty_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 13,
  },
});
