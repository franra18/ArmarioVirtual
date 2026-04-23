import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fetch_user_session } from '../auth-slice';
import { select_auth_error, select_auth_status } from '../selectors';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { login_input_placeholder_color, login_screen_styles } from './login-screen.styles';

export function LoginScreen() {
  const [user_id, set_user_id] = useState('');
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const auth_status = use_app_selector(select_auth_status);
  const auth_error = use_app_selector(select_auth_error);
  const is_loading = auth_status === 'loading';
  const can_submit = user_id.trim().length > 0 && !is_loading;

  const handle_submit = async () => {
    const normalized_user_id = user_id.trim();

    if (!normalized_user_id) {
      return;
    }

    try {
      await dispatch(fetch_user_session(normalized_user_id)).unwrap();
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
            Introduce el id de usuario para entrar de forma simbolica.
          </Text>
        </View>

        <View style={login_screen_styles.field_group}>
          <Text selectable style={login_screen_styles.label}>
            ID de usuario
          </Text>
          <TextInput
            value={user_id}
            onChangeText={set_user_id}
            placeholder="Ejemplo: 1"
            placeholderTextColor={login_input_placeholder_color}
            keyboardType="number-pad"
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
            {is_loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
