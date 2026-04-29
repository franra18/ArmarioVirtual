import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const search_input_placeholder_color = palette.text_muted;

export const outfits_screen_styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  list_content: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  header_stack: {
    gap: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  screen_title: {
    textAlign: 'center',
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 41,
    lineHeight: 46,
  },
  controls_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  search_box: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 8,
  },
  search_input: {
    flex: 1,
    color: palette.walnut,
    fontFamily: typography.body,
    fontSize: 15,
  },
  icon_action_button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon_action_button_active: {
    backgroundColor: palette.walnut,
  },
  add_button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 15,
  },
  ia_card: {
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    boxShadow: '0 10px 16px rgba(74, 51, 30, 0.2)',
  },
  ia_card_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  ia_icon_chip: {
    backgroundColor: palette.sky,
    borderRadius: 12,
    borderCurve: 'continuous',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ia_copy: {
    flex: 1,
  },
  ia_title: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 15,
  },
  ia_subtitle: {
    color: palette.cream_deep,
    fontFamily: typography.body,
    fontSize: 12,
  },
  ia_button: {
    backgroundColor: palette.sky,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  ia_button_text: {
    color: palette.walnut,
    fontFamily: typography.body_medium,
    fontSize: 13,
    fontWeight: '500',
  },
  results_caption: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 13,
  },
  list_column: {
    gap: 12,
    marginBottom: 14,
  },
  card_wrapper: {
    flex: 1,
    minWidth: 0,
  },
  card_wrapper_single_last: {
    flex: 0,
    width: '49%',
  },
  loading_state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loading_text: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 15,
  },
  empty_state: {
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    paddingVertical: 18,
    paddingHorizontal: 14,
    gap: 8,
    marginTop: 6,
  },
  empty_title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 30,
  },
  empty_subtitle: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 14,
  },
  retry_button: {
    alignSelf: 'flex-start',
    marginTop: 2,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retry_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 13,
  },
});
