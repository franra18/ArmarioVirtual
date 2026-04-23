import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from '../src/store/store';
import { root_stack_screen_options } from '../src/shared/theme/navigation-styles';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <Stack screenOptions={root_stack_screen_options} />
    </Provider>
  );
}
