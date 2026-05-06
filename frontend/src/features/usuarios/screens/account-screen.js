import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import {
  select_auth_firebase_email,
  select_auth_profile,
  select_auth_update_error,
  select_auth_update_status,
  select_auth_user_id,
} from '../../auth/selectors/auth-selectors';
import { sign_out_session, update_user_profile_name } from '../../auth/state/auth-slice';
import { account_input_placeholder_color, account_screen_styles } from './account-screen.styles';

export function AccountScreen() {
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const profile = use_app_selector(select_auth_profile);
  const auth_user_id = use_app_selector(select_auth_user_id);
  const firebase_email = use_app_selector(select_auth_firebase_email);
  const update_status = use_app_selector(select_auth_update_status);
  const update_error = use_app_selector(select_auth_update_error);

  const [nombre, set_nombre] = useState('');
  const [local_error, set_local_error] = useState('');
  const [is_signing_out, set_is_signing_out] = useState(false);

  useEffect(() => {
    set_nombre(String(profile?.nombre ?? ''));
  }, [profile?.nombre]);

  const is_saving = update_status === 'loading';
  const normalized_nombre = String(nombre ?? '').trim();
  const can_save = Boolean(auth_user_id)
    && normalized_nombre.length > 0
    && normalized_nombre !== String(profile?.nombre ?? '').trim()
    && !is_saving;

  const handle_save = async () => {
    set_local_error('');

    if (!auth_user_id) {
      set_local_error('No hay usuario autenticado');
      return;
    }

    if (!normalized_nombre) {
      set_local_error('El nombre es obligatorio');
      return;
    }

    try {
      await dispatch(update_user_profile_name({
        user_id: auth_user_id,
        nombre: normalized_nombre,
      })).unwrap();
    } catch {
      // El error ya queda en el estado global.
    }
  };

  const handle_confirm_sign_out = () => {
    Alert.alert(
      'Cerrar sesion',
      'Seguro que quieres cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesion', style: 'destructive', onPress: () => handle_sign_out() },
      ]
    );
  };

  const handle_sign_out = async () => {
    set_local_error('');
    set_is_signing_out(true);

    try {
      await dispatch(sign_out_session()).unwrap();
      router.replace('/');
    } catch (error) {
      set_local_error(error?.message ?? 'No se pudo cerrar la sesion');
    } finally {
      set_is_signing_out(false);
    }
  };

  const visible_error = local_error || update_error;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={account_screen_styles.screen}
      contentContainerStyle={account_screen_styles.screen_content}
    >
      <View style={account_screen_styles.header}>
        <Text selectable style={account_screen_styles.title}>
          Cuenta
        </Text>
        <Text selectable style={account_screen_styles.subtitle}>
          Ajusta los datos de tu perfil.
        </Text>
      </View>

      <View style={account_screen_styles.card}>
        <Text selectable style={account_screen_styles.label}>
          Nombre
        </Text>
        <TextInput
          value={nombre}
          onChangeText={set_nombre}
          placeholder="Tu nombre"
          placeholderTextColor={account_input_placeholder_color}
          style={account_screen_styles.input}
        />

        <Text selectable style={account_screen_styles.label}>
          Correo
        </Text>
        <View style={account_screen_styles.readonly_field}>
          <Text selectable style={account_screen_styles.readonly_text}>
            {firebase_email || 'Sin correo'}
          </Text>
        </View>

        {Boolean(visible_error) && (
          <Text selectable style={account_screen_styles.error_text}>
            {visible_error}
          </Text>
        )}

        <Pressable
          onPress={handle_save}
          disabled={!can_save}
          style={[
            account_screen_styles.primary_button,
            !can_save ? account_screen_styles.primary_button_disabled : null,
          ]}
        >
          <Text selectable style={account_screen_styles.primary_button_text}>
            {is_saving ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handle_confirm_sign_out}
        disabled={is_signing_out}
        style={[
          account_screen_styles.sign_out_button,
          is_signing_out ? account_screen_styles.sign_out_button_disabled : null,
        ]}
      >
        <Text selectable style={account_screen_styles.sign_out_text}>
          {is_signing_out ? 'Cerrando sesion...' : 'Cerrar sesion'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
