import { StyleSheet } from 'react-native';
import { palette, typography } from '../../../shared/theme/palette';

export const outfit_edit_screen_styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cream,
    paddingHorizontal: 24,
    gap: 10,
  },
  title: {
    color: palette.walnut_deep,
    fontFamily: typography.display,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    color: palette.text_muted,
    fontFamily: typography.body,
    fontSize: 14,
    textAlign: 'center',
  },
  back_button: {
    marginTop: 8,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: palette.walnut,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  back_button_text: {
    color: palette.white,
    fontFamily: typography.body_medium,
    fontSize: 14,
  },
});
