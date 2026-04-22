import { Redirect } from 'expo-router';
import { LoginScreen } from '../src/features/auth/screens/login-screen';
import { select_is_authenticated } from '../src/features/auth/selectors';
import { use_app_selector } from '../src/store/hooks';

export default function LoginRoute() {
  const is_authenticated = use_app_selector(select_is_authenticated);

  if (is_authenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <LoginScreen />;
}
