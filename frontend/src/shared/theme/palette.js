import { Platform } from 'react-native';

export const palette = {
  cream: '#FAF5EE',
  cream_deep: '#F3EADB',
  sky: '#CFE3EE',
  sky_deep: '#A8CAD9',
  sky_ink: '#4A7E97',
  walnut_soft: '#A07B52',
  walnut: '#6B4A2B',
  walnut_deep: '#4A331E',
  text_primary: '#513A27',
  text_muted: '#8E7964',
  white: '#FFFFFF',
};

export const typography = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'sans-serif' }),
  body_medium: Platform.select({
    ios: 'Avenir Next Demi Bold',
    android: 'sans-serif-medium',
    default: 'sans-serif-medium',
  }),
};
