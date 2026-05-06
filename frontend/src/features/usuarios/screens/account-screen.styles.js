import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const account_input_placeholder_color = palette.text_muted;

export const account_screen_styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  screen_content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontFamily: typography.display,
    color: palette.walnut_deep,
    fontSize: 42,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body,
    color: palette.text_muted,
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: palette.cream_deep,
    padding: 16,
    gap: 12,
  },
  label: {
    fontFamily: typography.body_medium,
    color: palette.walnut,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.cream,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.walnut_deep,
    fontFamily: typography.body,
    backgroundColor: palette.white,
  },
  readonly_field: {
    borderRadius: 16,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.cream,
  },
  readonly_text: {
    fontFamily: typography.body,
    fontSize: 15,
    color: palette.walnut,
  },
  error_text: {
    color: '#A4482B',
    fontFamily: typography.body,
    fontSize: 13,
  },
  primary_button: {
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primary_button_disabled: {
    opacity: 0.6,
  },
  primary_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 15,
  },
  sign_out_button: {
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#A4482B',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sign_out_button_disabled: {
    opacity: 0.6,
  },
  sign_out_text: {
    color: 'white',
    fontFamily: typography.body_medium,
    fontSize: 15,
  },
});
