import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fetch_user_session } from '../auth-slice';
import { select_auth_error, select_auth_status } from '../selectors';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { palette, typography } from '../../../shared/theme/palette';

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
      style={{ flex: 1, backgroundColor: palette.cream }}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 36 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Text
            selectable
            style={{ fontFamily: typography.display, fontSize: 42, color: palette.walnut_deep }}
          >
            Armario
          </Text>
          <Text
            selectable
            style={{ fontFamily: typography.body, fontSize: 17, color: palette.text_muted, lineHeight: 24 }}
          >
            Introduce el id de usuario para entrar de forma simbolica.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text
            selectable
            style={{
              fontFamily: typography.body_medium,
              color: palette.walnut,
              fontSize: 14,
              letterSpacing: 1.1,
              textTransform: 'uppercase',
            }}
          >
            ID de usuario
          </Text>
          <TextInput
            value={user_id}
            onChangeText={set_user_id}
            placeholder="Ejemplo: 1"
            placeholderTextColor={palette.text_muted}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handle_submit}
            style={{
              borderWidth: 1,
              borderColor: palette.cream_deep,
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 18,
              color: palette.walnut_deep,
              fontFamily: typography.body,
              backgroundColor: palette.white,
            }}
          />
        </View>

        {Boolean(auth_error) && (
          <Text selectable style={{ color: '#A4482B', fontFamily: typography.body, fontSize: 14 }}>
            {auth_error}
          </Text>
        )}

        <Pressable
          onPress={handle_submit}
          disabled={!can_submit}
          style={{
            backgroundColor: can_submit ? palette.walnut : palette.walnut_soft,
            borderRadius: 18,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text
            selectable
            style={{ color: palette.white, fontFamily: typography.body_medium, fontSize: 16 }}
          >
            {is_loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
