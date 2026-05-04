import { StyleSheet } from 'react-native';
import { palette, typography } from '../theme/palette';

export const weather_card_styles = StyleSheet.create({
  card: {
    backgroundColor: palette.sky_deep,
    borderRadius: 22,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'column',
    gap: 12,
    boxShadow: '0 8px 18px rgba(74, 126, 151, 0.25)',
  },
  top_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temp_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hint_container: {
    alignItems: 'flex-end',
    flexShrink: 1,
    paddingLeft: 10,
    flexDirection: 'row',
    gap: 15,
  },
  temp_text: {
    fontFamily: typography.display,
    color: palette.walnut_deep,
    fontSize: 36,
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
  },
  hint_label: {
    fontFamily: typography.body_medium,
    color: palette.walnut,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hint_text: {
    fontFamily: typography.body_medium,
    color: palette.walnut_deep,
    fontSize: 16,
  },
  desc_text: {
    fontFamily: typography.body,
    color: palette.walnut,
    fontSize: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 10,
  },
});
