import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const login_input_placeholder_color = palette.text_muted;

export const login_screen_styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  screen_content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  heading_group: {
    gap: 8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 42,
    color: palette.walnut_deep,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 17,
    color: palette.text_muted,
    lineHeight: 24,
  },
  field_group: {
    gap: 10,
  },
  label: {
    fontFamily: typography.body_medium,
    color: palette.walnut,
    fontSize: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.cream_deep,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: palette.walnut_deep,
    fontFamily: typography.body,
    backgroundColor: palette.white,
  },
  error_text: {
    color: '#A4482B',
    fontFamily: typography.body,
    fontSize: 14,
  },
  submit_button: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submit_button_enabled: {
    backgroundColor: palette.walnut,
  },
  submit_button_disabled: {
    backgroundColor: palette.walnut_soft,
  },
  submit_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 16,
  },
});