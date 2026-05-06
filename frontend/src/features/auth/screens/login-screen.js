import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { sign_in_with_email, sign_up_with_email } from '../auth-slice';
import { select_auth_error, select_auth_status } from '../selectors';
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
  const is_loading = auth_status === 'loading';
  const can_submit = email.trim().length > 0 && password.trim().length > 0 && !is_loading;

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
            Armario
          </Text>
          <Text selectable style={login_screen_styles.subtitle}>
            Inicia sesion con tu correo y contrasena.
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
            Contrasena
          </Text>
          <TextInput
            value={password}
            onChangeText={set_password}
            placeholder="Minimo 6 caracteres"
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
              ? 'Ya tienes cuenta? Inicia sesion'
              : 'No tienes cuenta? Crear cuenta'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
