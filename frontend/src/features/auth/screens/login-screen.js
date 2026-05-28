import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { reset_password_with_email, sign_in_with_email, sign_up_with_email } from '../state/auth-slice';
import {
  select_auth_error,
  select_auth_reset_error,
  select_auth_reset_status,
  select_auth_status,
} from '../selectors/auth-selectors';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { login_input_placeholder_color, login_screen_styles } from './login-screen.styles';

export function LoginScreen() {
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [is_registering, set_is_registering] = useState(false);
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const auth_status = use_app_selector(select_auth_status);
  const auth_error = use_app_selector(select_auth_error);
  const reset_status = use_app_selector(select_auth_reset_status);
  const reset_error = use_app_selector(select_auth_reset_error);
  const is_loading = auth_status === 'loading';
  const is_reset_loading = reset_status === 'loading';
  const can_submit = email.trim().length > 0 && password.trim().length > 0 && !is_loading;
  const can_reset_password = email.trim().length > 0 && !is_loading && !is_reset_loading;

  const handle_submit = async () => {
    const normalized_email = email.trim().toLowerCase();
    const normalized_password = password.trim();

    if (!normalized_email || !normalized_password) {
      return;
    }

    try {
      const action = is_registering ? sign_up_with_email : sign_in_with_email;
      await dispatch(action({ email: normalized_email, password: normalized_password })).unwrap();
      router.replace('/(tabs)/home');
    } catch {
      // El mensaje ya queda gestionado en el estado global de auth.
    }
  };

  // Solicita a Firebase el correo de restablecimiento usando el email escrito.
  const handle_password_reset = async () => {
    const normalized_email = email.trim().toLowerCase();
    if (!normalized_email) {
      Alert.alert('Correo requerido', 'Escribe tu correo para enviarte el enlace de restablecimiento.');
      return;
    }

    try {
      await dispatch(reset_password_with_email({ email: normalized_email })).unwrap();
      Alert.alert(
        'Revisa tu correo',
        'Si la cuenta existe, Firebase enviará un enlace para restablecer la contraseña.'
      );
    } catch (error) {
      Alert.alert('No se pudo restablecer', String(error ?? 'No se pudo enviar el correo de restablecimiento.'));
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={login_screen_styles.screen}
      contentContainerStyle={login_screen_styles.screen_content}
    >
      <View style={login_screen_styles.container}>
        <View style={login_screen_styles.heading_group}>
          <Text selectable style={login_screen_styles.title}>
            Armario Virtual
          </Text>
          <Text selectable style={login_screen_styles.subtitle}>
            Inicia sesión con tu correo y contraseña.
          </Text>
        </View>

        <View style={login_screen_styles.field_group}>
          <Text selectable style={login_screen_styles.label}>
            Correo
          </Text>
          <TextInput
            value={email}
            onChangeText={set_email}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={login_input_placeholder_color}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            style={login_screen_styles.input}
          />
        </View>

        <View style={login_screen_styles.field_group}>
          <Text selectable style={login_screen_styles.label}>
            Contraseña
          </Text>
          <TextInput
            value={password}
            onChangeText={set_password}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={login_input_placeholder_color}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handle_submit}
            style={login_screen_styles.input}
          />
        </View>

        {Boolean(auth_error) && (
          <Text selectable style={login_screen_styles.error_text}>
            {auth_error}
          </Text>
        )}
        {Boolean(reset_error) && !auth_error && (
          <Text selectable style={login_screen_styles.error_text}>
            {reset_error}
          </Text>
        )}

        <Pressable
          onPress={handle_submit}
          disabled={!can_submit}
          style={[
            login_screen_styles.submit_button,
            can_submit
              ? login_screen_styles.submit_button_enabled
              : login_screen_styles.submit_button_disabled,
          ]}
        >
          <Text selectable style={login_screen_styles.submit_button_text}>
            {is_loading
              ? (is_registering ? 'Creando cuenta...' : 'Entrando...')
              : (is_registering ? 'Crear cuenta' : 'Entrar')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => set_is_registering((current) => !current)}
          style={login_screen_styles.toggle_button}
        >
          <Text selectable style={login_screen_styles.toggle_text}>
            {is_registering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Crear cuenta'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handle_password_reset}
          disabled={!can_reset_password}
          style={[
            login_screen_styles.reset_button,
            can_reset_password
              ? login_screen_styles.reset_button_enabled
              : login_screen_styles.reset_button_disabled,
          ]}
        >
          <Text selectable style={login_screen_styles.reset_button_text}>
            {is_reset_loading ? 'Enviando enlace...' : 'Olvidé mi contraseña'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
