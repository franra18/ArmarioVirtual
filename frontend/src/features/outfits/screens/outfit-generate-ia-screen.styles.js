import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const prompt_placeholder_color = palette.text_muted;

export const outfit_generate_ia_styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 18,
  },
  header_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header_action: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
  },
  header_action_text: {
    color: palette.text_muted,
    fontFamily: typography.body_medium,
    fontSize: 13,
  },
  header_title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  section_title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 30,
  },
  section_subtitle: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 14,
  },
  prompt_card: {
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  prompt_input: {
    minHeight: 110,
    color: palette.walnut,
    fontFamily: typography.body,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  prompt_footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  prompt_count: {
    color: palette.text_muted,
    fontFamily: typography.body_medium,
    fontSize: 12,
  },
  chips_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: palette.sky_deep,
    backgroundColor: palette.cream,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chip_active: {
    borderColor: palette.walnut,
    backgroundColor: palette.walnut,
  },
  chip_text: {
    color: palette.walnut,
    fontFamily: typography.body,
    fontSize: 13,
  },
  chip_text_active: {
    color: palette.white,
    fontFamily: typography.body_medium,
  },
  section_header_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section_label: {
    color: palette.walnut,
    fontFamily: typography.body_medium,
    fontSize: 14,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  section_hint: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  clima_header_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clima_left: {
    flex: 1,
    gap: 2,
  },
  clima_label: {
    color: palette.walnut,
    fontFamily: typography.body_medium,
    fontSize: 14,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  clima_hint: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 12,
  },
  weather_card_wrap: {
    borderRadius: 22,
    borderCurve: 'continuous',
  },
  weather_card_disabled: {
    opacity: 0.6,
  },
  input_card: {
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    height: 40,
    color: palette.walnut,
    fontFamily: typography.body,
    fontSize: 14,
  },
  error_banner: {
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut_deep,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error_text: {
    color: palette.white,
    fontFamily: typography.body,
    fontSize: 13,
  },
  submit_button: {
    minHeight: 50,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    boxShadow: '0 10px 18px rgba(74, 51, 30, 0.25)',
  },
  submit_button_disabled: {
    opacity: 0.6,
  },
  submit_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 15,
  },
});
