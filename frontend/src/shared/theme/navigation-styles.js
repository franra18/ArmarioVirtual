import { palette, typography } from './palette';

export const root_stack_screen_options = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 120,
};

export const tabs_screen_options = {
  headerShown: false,
  animation: 'fade',
  tabBarActiveTintColor: palette.walnut,
  tabBarInactiveTintColor: palette.text_muted,
  tabBarStyle: {
    height: 74,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: palette.cream,
    borderTopColor: palette.cream_deep,
  },
  tabBarLabelStyle: {
    fontFamily: typography.body_medium,
    fontSize: 12,
  },
};