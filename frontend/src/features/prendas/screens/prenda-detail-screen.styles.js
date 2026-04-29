import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const prenda_detail_screen_styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scroll_content: {
    paddingBottom: 120,
  },
  header_image_container: {
    backgroundColor: palette.sky,
    position: 'relative',
    height: 360,
  },
  header_controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 14,
    left: 18,
    right: 18,
    zIndex: 2,
  },
  header_right_actions: {
    flexDirection: 'row',
    gap: 8,
  },
  control_button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderCurve: 'continuous',
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image_card: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    backgroundColor: palette.sky_deep,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image_pressable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 16,
  },
  prenda_type_label: {
    color: palette.text_muted,
    fontFamily: typography.body_medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 32,
  },
  tags_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tag_text: {
    color: palette.walnut,
    fontFamily: typography.body,
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  section_label: {
    color: palette.text_muted,
    fontFamily: typography.body_medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  characteristics_stack: {
    gap: 0,
  },
  characteristic_section: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.cream_deep,
  },
  characteristic_section_last: {
    borderBottomWidth: 0,
    paddingBottom: 10,
  },
  characteristic_item: {
    gap: 6,
  },
  characteristic_header_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  characteristic_name: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  level_segments_row: {
    flexDirection: 'row',
    gap: 6,
  },
  level_segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  level_segment_empty: {
    backgroundColor: palette.cream_deep,
  },
  level_segment_filled_elegance: {
    backgroundColor: palette.walnut,
  },
  level_segment_filled_warmth: {
    backgroundColor: palette.sky_deep,
  },
  level_value: {
    color: palette.walnut_deep,
    fontFamily: typography.body_medium,
    fontSize: 12,
  },
  colors_container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  color_item: {
    alignItems: 'center',
    gap: 6,
  },
  color_circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: palette.cream_deep,
  },
  color_name: {
    color: palette.walnut,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
  info_row: {
    flexDirection: 'row',
    gap: 16,
  },
  info_item: {
    flex: 1,
    gap: 4,
  },
  info_label: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  info_value: {
    color: palette.walnut_deep,
    fontFamily: typography.body_medium,
    fontSize: 14,
  },
  edit_button: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    right: 18,
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
  fullscreen_wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreen_backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  fullscreen_image: {
    width: '100%',
    height: '100%',
  },
  fullscreen_close_button: {
    position: 'absolute',
    top: 52,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 30,
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
