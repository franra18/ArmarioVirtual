import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { palette } from '../../../shared/theme/palette';
import { elegance_level_labels, warmth_level_labels } from '../../../shared/constants/prenda-constants';
import { format_date_long, relative_time_since } from '../../../shared/utils/date-utils';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import {
  AppIcon,
  BackIcon,
  CalendarDaysIcon,
  CloseIcon,
  HeartIcon,
  TrashIcon,
} from '../../../shared/icons/app-icons';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors/auth-selectors';
import { delete_prenda_by_id, fetch_prendas_for_user, toggle_prenda_favorite } from '../state/prendas-slice';
import { get_prenda_color_hex, resolve_prenda_icon_name, to_prenda_title_case } from '../utils/prenda-utils';
import {
  select_prendas_delete_status,
  select_prendas_favorite_ids,
  select_prendas_items,
  select_prendas_status,
} from '../selectors/prendas-selectors';
import { prenda_detail_screen_styles } from './prenda-detail-screen.styles';


function normalize_level(level_value) {
  const parsed_level = Number(level_value);
  if (Number.isNaN(parsed_level)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(parsed_level)));
}

export function PrendaDetailScreen() {
  const router = useRouter();
  const { prenda_id } = useLocalSearchParams();
  const dispatch = use_app_dispatch();
  const auth_user_id = use_app_selector(select_auth_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const favorite_ids = use_app_selector(select_prendas_favorite_ids);
  const prendas_status = use_app_selector(select_prendas_status);
  const delete_status = use_app_selector(select_prendas_delete_status);

  const [is_image_fullscreen_open, set_is_image_fullscreen_open] = useState(false);

  const prenda = useMemo(
    () => prendas.find((item) => String(item?.id) === String(prenda_id ?? '')),
    [prendas, prenda_id]
  );

  const prenda_image_url = useMemo(() => resolve_prenda_image_url(prenda?.foto_url), [prenda?.foto_url]);
  const favorite_id_set = useMemo(
    () => new Set(favorite_ids.map((id) => String(id))),
    [favorite_ids]
  );

  useEffect(() => {
    if (prenda || !auth_user_id || prendas_status === 'loading') {
      return;
    }

    dispatch(fetch_prendas_for_user(auth_user_id));
  }, [auth_user_id, dispatch, prenda, prendas_status]);

  const handle_edit_press = () => {
    if (!prenda?.id) {
      return;
    }

    router.push(`/prendas/${prenda.id}/editar`);
  };

  const handle_toggle_favorite = () => {
    if (!prenda?.id) {
      return;
    }

    dispatch(toggle_prenda_favorite(prenda.id));
  };

  const handle_open_fullscreen_image = () => {
    if (!prenda_image_url) {
      return;
    }

    set_is_image_fullscreen_open(true);
  };

  const handle_close_fullscreen_image = () => {
    set_is_image_fullscreen_open(false);
  };

  const is_deleting = delete_status === 'loading';

  const execute_delete_prenda = async () => {
    if (!prenda?.id) {
      return;
    }

    try {
      await dispatch(delete_prenda_by_id(prenda.id)).unwrap();
      router.replace('/(tabs)/items');
    } catch (error) {
      Alert.alert('No se pudo eliminar', String(error ?? 'No se pudo eliminar la prenda.'));
    }
  };

  const handle_delete_press = () => {
    if (is_deleting) {
      return;
    }

    Alert.alert('Eliminar prenda', 'Esta acción no se puede deshacer. ¿Deseas continuar?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void execute_delete_prenda();
        },
      },
    ]);
  };

  if (!prenda) {
    return (
      <View style={prenda_detail_screen_styles.empty_wrap}>
        <Text selectable style={prenda_detail_screen_styles.empty_title}>
          Prenda no encontrada
        </Text>
        <Text selectable style={prenda_detail_screen_styles.empty_subtitle}>
          No hemos podido cargar el detalle de esta prenda.
        </Text>
        <Pressable onPress={() => router.back()} style={prenda_detail_screen_styles.empty_button}>
          <Text selectable style={prenda_detail_screen_styles.empty_button_text}>
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  const elegance_level = Number(prenda?.nivel_elegancia);
  const warmth_level = Number(prenda?.nivel_abrigo);
  const elegance_segments = normalize_level(elegance_level);
  const warmth_segments = normalize_level(warmth_level);

  const color_names = Array.isArray(prenda?.color_nombres) ? prenda.color_nombres : [];
  const elegance_label = elegance_level_labels[elegance_level] || 'Sin dato';
  const warmth_label = warmth_level_labels[warmth_level] || 'Sin dato';
  const is_favorite = favorite_id_set.has(String(prenda?.id));

  return (
    <View style={prenda_detail_screen_styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={prenda_detail_screen_styles.screen}
        contentContainerStyle={prenda_detail_screen_styles.scroll_content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con imagen */}
        <View style={prenda_detail_screen_styles.header_image_container}>
          <View style={prenda_detail_screen_styles.header_controls}>
            <Pressable onPress={() => router.back()} style={prenda_detail_screen_styles.control_button}>
              <BackIcon size={16} color={palette.walnut} />
            </Pressable>

            <View style={prenda_detail_screen_styles.header_right_actions}>
              <Pressable
                onPress={handle_toggle_favorite}
                style={prenda_detail_screen_styles.control_button}
              >
                <HeartIcon
                  size={16}
                  color={is_favorite ? palette.walnut : palette.text_muted}
                  solid={is_favorite}
                />
              </Pressable>
              <Pressable
                onPress={handle_delete_press}
                style={prenda_detail_screen_styles.control_button}
                disabled={is_deleting}
              >
                <TrashIcon size={14} color={palette.walnut} />
              </Pressable>
            </View>
          </View>

          <View style={prenda_detail_screen_styles.image_card}>
            {prenda_image_url ? (
              <Pressable
                onPress={handle_open_fullscreen_image}
                style={prenda_detail_screen_styles.image_pressable}
              >
                <Image
                  source={{ uri: prenda_image_url }}
                  style={prenda_detail_screen_styles.image}
                  resizeMode="cover"
                />
              </Pressable>
            ) : (
              <AppIcon
                name={resolve_prenda_icon_name(prenda?.tipo_prenda)}
                size={80}
                color={palette.walnut}
              />
            )}
          </View>
        </View>

        {/* Contenido principal */}
        <View style={prenda_detail_screen_styles.content}>
          {/* Tipo de prenda */}
          <Text selectable style={prenda_detail_screen_styles.prenda_type_label}>
            {to_prenda_title_case(prenda?.tipo_prenda) || 'Tipo'}
          </Text>

          {/* Nombre */}
          <Text selectable style={prenda_detail_screen_styles.title}>
            {prenda?.nombre}
          </Text>

          {/* Características */}
          <View style={prenda_detail_screen_styles.section}>
            <Text selectable style={prenda_detail_screen_styles.section_label}>
              Características
            </Text>

            <View style={prenda_detail_screen_styles.characteristics_stack}>
              <View style={prenda_detail_screen_styles.characteristic_section}>
                <View style={prenda_detail_screen_styles.characteristic_item}>
                  <View style={prenda_detail_screen_styles.characteristic_header_row}>
                    <Text selectable style={prenda_detail_screen_styles.characteristic_name}>
                      Elegancia
                    </Text>
                    <Text selectable style={prenda_detail_screen_styles.level_value}>
                      {elegance_label}
                    </Text>
                  </View>
                  <View style={prenda_detail_screen_styles.level_segments_row}>
                    {Array.from({ length: 5 }).map((_, segment_index) => (
                      <View
                        key={`elegance-segment-${segment_index}`}
                        style={[
                          prenda_detail_screen_styles.level_segment,
                          segment_index < elegance_segments
                            ? prenda_detail_screen_styles.level_segment_filled_elegance
                            : prenda_detail_screen_styles.level_segment_empty,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <View
                style={[
                  prenda_detail_screen_styles.characteristic_section,
                  prenda_detail_screen_styles.characteristic_section_last,
                ]}
              >
                <View style={prenda_detail_screen_styles.characteristic_item}>
                  <View style={prenda_detail_screen_styles.characteristic_header_row}>
                    <Text selectable style={prenda_detail_screen_styles.characteristic_name}>
                      Abrigo
                    </Text>
                    <Text selectable style={prenda_detail_screen_styles.level_value}>
                      {warmth_label}
                    </Text>
                  </View>
                  <View style={prenda_detail_screen_styles.level_segments_row}>
                    {Array.from({ length: 5 }).map((_, segment_index) => (
                      <View
                        key={`warmth-segment-${segment_index}`}
                        style={[
                          prenda_detail_screen_styles.level_segment,
                          segment_index < warmth_segments
                            ? prenda_detail_screen_styles.level_segment_filled_warmth
                            : prenda_detail_screen_styles.level_segment_empty,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Colores */}
          {color_names.length > 0 && (
            <View style={prenda_detail_screen_styles.section}>
              <Text selectable style={prenda_detail_screen_styles.section_label}>
                Colores
              </Text>

              <View style={prenda_detail_screen_styles.colors_container}>
                {color_names.map((color_name, index) => (
                  <View key={`color-${index}`} style={prenda_detail_screen_styles.color_item}>
                    <View
                      style={[
                        prenda_detail_screen_styles.color_circle,
                        { backgroundColor: get_prenda_color_hex(color_name) }
                      ]}
                    />
                    <Text selectable style={prenda_detail_screen_styles.color_name}>
                      {color_name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Información adicional */}
          <View style={[prenda_detail_screen_styles.section, prenda_detail_screen_styles.section_last]}>
            <Text selectable style={prenda_detail_screen_styles.section_label}>
              AÑADIDA
            </Text>

            <View style={prenda_detail_screen_styles.added_card}>
              <View style={prenda_detail_screen_styles.added_left}>
                <View style={prenda_detail_screen_styles.added_icon_wrap}>
                  <CalendarDaysIcon size={18} color={palette.walnut} />
                </View>

                <View>
                  <Text selectable style={prenda_detail_screen_styles.info_value}>
                    {format_date_long(prenda?.fecha_creacion)}
                  </Text>
                </View>
              </View>

              <Text selectable style={prenda_detail_screen_styles.added_relative_text}>
                {relative_time_since(prenda?.fecha_creacion)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botones fijos */}
      <Pressable
        onPress={handle_edit_press}
        style={prenda_detail_screen_styles.edit_button}
      >
        <Text selectable style={prenda_detail_screen_styles.edit_button_text}>
          Editar
        </Text>
      </Pressable>

      {/* Modal fullscreen image */}
      <Modal
        visible={is_image_fullscreen_open}
        transparent
        animationType="fade"
        onRequestClose={handle_close_fullscreen_image}
      >
        <View style={prenda_detail_screen_styles.fullscreen_wrap}>
          <Pressable
            onPress={handle_close_fullscreen_image}
            style={prenda_detail_screen_styles.fullscreen_backdrop}
          />

          <Image
            source={{ uri: prenda_image_url }}
            style={prenda_detail_screen_styles.fullscreen_image}
            resizeMode="contain"
          />

          <Pressable
            onPress={handle_close_fullscreen_image}
            style={prenda_detail_screen_styles.fullscreen_close_button}
            hitSlop={10}
          >
            <CloseIcon size={18} color={palette.white} />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
