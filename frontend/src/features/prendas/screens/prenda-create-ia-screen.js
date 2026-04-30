import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { palette } from '../../../shared/theme/palette';
import { upload_local_image_to_cloudinary } from '../../../shared/utils/cloudinary';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { create_prenda_from_image_ia, fetch_prendas_for_user } from '../state/prendas-slice';
import { FontAwesome6 } from '@expo/vector-icons';
import { prenda_create_manual_screen_styles as prenda_create_ia_screen_styles } from './prenda-create-manual-screen.styles';

export function PrendaCreateIaScreen() {
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const auth_user_id = use_app_selector(select_auth_user_id);
  const is_ios = process.env.EXPO_OS === 'ios';

  const [foto_asset, set_foto_asset] = useState(null);
  const [photo_aspect_ratio, set_photo_aspect_ratio] = useState(1);
  const [local_error, set_local_error] = useState('');
  const [is_processing_submission, set_is_processing_submission] = useState(false);

  const pick_image_from_result = (result) => {
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selected_asset = result.assets[0];
    const normalized_uri = String(selected_asset?.uri ?? '').trim();
    if (!normalized_uri) {
      return;
    }

    set_local_error('');
    set_foto_asset({
      uri: normalized_uri,
      file_name: String(selected_asset?.fileName ?? ''),
      mime_type: String(selected_asset?.mimeType ?? ''),
    });

    const resolved_width = Number(selected_asset?.width ?? 0);
    const resolved_height = Number(selected_asset?.height ?? 0);
    if (resolved_width > 0 && resolved_height > 0) {
      set_photo_aspect_ratio(resolved_width / resolved_height);
    } else {
      set_photo_aspect_ratio(1);
    }
  };

  const pick_image_from_gallery = async () => {
    const permission_result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission_result.status !== 'granted') {
      set_local_error('Necesitas permitir acceso a la galería para seleccionar una foto');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    pick_image_from_result(result);
  };

  const pick_image_from_camera = async () => {
    const permission_result = await ImagePicker.requestCameraPermissionsAsync();
    if (permission_result.status !== 'granted') {
      set_local_error('Necesitas permitir acceso a la cámara para tomar una foto');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    pick_image_from_result(result);
  };

  const clear_selected_image = () => {
    set_foto_asset(null);
    set_photo_aspect_ratio(1);
  };

  const handle_submit = async () => {
    set_local_error('');
    set_is_processing_submission(true);

    if (!auth_user_id) {
      set_local_error('No hay usuario autenticado para crear la prenda');
      set_is_processing_submission(false);
      return;
    }

    if (!foto_asset?.uri) {
      set_local_error('Debes seleccionar una imagen para analizar');
      set_is_processing_submission(false);
      return;
    }

    try {
      const uploaded_photo_url = await upload_local_image_to_cloudinary({
        local_uri: foto_asset.uri,
        file_name: foto_asset.file_name,
        mime_type: foto_asset.mime_type,
      });

      const created_prenda = await dispatch(create_prenda_from_image_ia({
        usuario_id: auth_user_id,
        image_url: uploaded_photo_url,
      })).unwrap();

      await dispatch(fetch_prendas_for_user(auth_user_id)).unwrap();
      router.replace(`/prendas/${created_prenda.id}`);
    } catch (error) {
      set_local_error(error?.message ?? 'No se pudo crear la prenda con IA');
    } finally {
      set_is_processing_submission(false);
    }
  };

  const is_submitting = is_processing_submission;
  const visible_error = local_error;

  return (
    <KeyboardAvoidingView
      style={prenda_create_ia_screen_styles.screen}
      behavior={is_ios ? 'padding' : 'height'}
      keyboardVerticalOffset={8}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={prenda_create_ia_screen_styles.screen}
        contentContainerStyle={prenda_create_ia_screen_styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={is_ios ? 'interactive' : 'on-drag'}
      >
        <View style={prenda_create_ia_screen_styles.header_row}>
          <Pressable onPress={() => router.back()} style={prenda_create_ia_screen_styles.header_action}>
            <Text selectable style={prenda_create_ia_screen_styles.header_action_text}>
              Cancelar
            </Text>
          </Pressable>
          <Text selectable style={prenda_create_ia_screen_styles.header_title}>
            Añadir con IA
          </Text>
          <View style={prenda_create_ia_screen_styles.header_action} />
        </View>

        <View style={prenda_create_ia_screen_styles.photo_card}>
          {foto_asset?.uri ? (
            <Image
              source={{ uri: foto_asset.uri }}
              style={[
                prenda_create_ia_screen_styles.photo_image,
                { aspectRatio: photo_aspect_ratio || 1 },
              ]}
              resizeMode="contain"
              onLoad={(event) => {
                const { width, height } = event.nativeEvent?.source ?? {};
                if (width && height) {
                  set_photo_aspect_ratio(width / height);
                }
              }}
            />
          ) : (
            <View style={prenda_create_ia_screen_styles.photo_placeholder}>
              <View style={prenda_create_ia_screen_styles.photo_icon_wrap}>
                <FontAwesome6 name="image" size={18} color={palette.walnut} />
              </View>
              <Text selectable style={prenda_create_ia_screen_styles.photo_placeholder_text}>
                Añadir foto de la prenda
              </Text>
            </View>
          )}

          <View style={prenda_create_ia_screen_styles.photo_actions_row}>
            <Pressable onPress={pick_image_from_camera} style={prenda_create_ia_screen_styles.photo_action_button}>
              <FontAwesome6 name="camera" size={13} color={palette.walnut} />
              <Text selectable style={prenda_create_ia_screen_styles.photo_action_button_text}>
                Cámara
              </Text>
            </Pressable>
            <Pressable onPress={pick_image_from_gallery} style={prenda_create_ia_screen_styles.photo_action_button}>
              <FontAwesome6 name="image" size={13} color={palette.walnut} />
              <Text selectable style={prenda_create_ia_screen_styles.photo_action_button_text}>
                Galería
              </Text>
            </Pressable>
          </View>

          {foto_asset?.uri ? (
            <Pressable onPress={clear_selected_image} style={prenda_create_ia_screen_styles.photo_clear_button}>
              <Text selectable style={prenda_create_ia_screen_styles.photo_clear_button_text}>
                Quitar foto
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={prenda_create_ia_screen_styles.card}>
          <View style={prenda_create_ia_screen_styles.helper_box}>
            <FontAwesome6 name="circle-info" size={14} color={palette.walnut} style={prenda_create_ia_screen_styles.helper_icon} />
            <Text selectable style={prenda_create_ia_screen_styles.helper_text}>
              La IA asignará automáticamente los atributos de la prenda y la registrará en tu armario. Luego podrás editar cualquier detalle.
            </Text>
          </View>
        </View>

        {Boolean(visible_error) && (
          <View style={prenda_create_ia_screen_styles.error_banner}>
            <Text selectable style={prenda_create_ia_screen_styles.error_text}>
              {visible_error}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handle_submit}
          disabled={is_submitting}
          style={[
            prenda_create_ia_screen_styles.submit_button,
            is_submitting ? prenda_create_ia_screen_styles.submit_button_disabled : null,
          ]}
        >
          {is_submitting ? (
            <ActivityIndicator size="small" color={palette.white} />
          ) : (
            <Text selectable style={prenda_create_ia_screen_styles.submit_button_text}>
              Analizar y crear prenda
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}