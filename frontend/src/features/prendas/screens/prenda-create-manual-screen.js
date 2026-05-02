import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome6 } from '@expo/vector-icons';
import { palette } from '../../../shared/theme/palette';
import { resolve_prenda_image_url, upload_local_image_to_cloudinary } from '../../../shared/utils/cloudinary';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { create_color_in_backend, fetch_colores_from_backend } from '../api/prendas-api';
import { select_prendas_create_error, select_prendas_create_status } from '../selectors/prendas-selectors';
import { create_prenda_manual, fetch_prendas_for_user, update_prenda_manual } from '../state/prendas-slice';
import { prenda_create_manual_screen_styles } from './prenda-create-manual-screen.styles';

const tipo_prenda_options = [
  { value: 'camiseta', label: 'Camiseta', icon: 'shirt' },
  { value: 'chaqueta', label: 'Chaqueta', icon: 'user-tie' },
  { value: 'pantalon', label: 'Pantalon', icon: 'person-walking' },
  { value: 'accesorio', label: 'Accesorio', icon: 'hat-cowboy-side' },
  { value: 'calzado', label: 'Calzado', icon: 'shoe-prints' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
];

const elegance_level_labels = ['Deportivo/Casa', 'Casual', 'Casual Elegante', 'Semi-formal', 'Formal'];
const warmth_level_labels = ['Muy ligero', 'Ligero', 'Intermedio', 'Abrigado', 'Muy abrigado'];

const common_color_options = [
  { name: 'Azul', swatch: '#1a5fad' },
  { name: 'Blanco', swatch: '#ffffff' },
  { name: 'Beige', swatch: '#EFE5D5' },
  { name: 'Marrón', swatch: '#7B4E2F' },
  { name: 'Negro', swatch: '#000000' },
  { name: 'Rojo', swatch: '#ff2600' },
  { name: 'Verde', swatch: '#108b00' },
  { name: 'Amarillo', swatch: '#FFD700' },
];

function normalize_text(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function PrendaCreateManualScreen({ prenda_to_edit = null }) {
  const router = useRouter();
  const dispatch = use_app_dispatch();

  const auth_user_id = use_app_selector(select_auth_user_id);
  const create_status = use_app_selector(select_prendas_create_status);
  const create_error = use_app_selector(select_prendas_create_error);
  const is_editing = Boolean(prenda_to_edit?.id);

  const [nombre, set_nombre] = useState('');
  const [tipo_prenda, set_tipo_prenda] = useState('');
  const [selected_tipo_option, set_selected_tipo_option] = useState('');
  const [custom_tipo_prenda, set_custom_tipo_prenda] = useState('');
  const [foto_asset, set_foto_asset] = useState(null);
  const [existing_foto_url, set_existing_foto_url] = useState('');
  const [photo_aspect_ratio, set_photo_aspect_ratio] = useState(1);
  const [nivel_abrigo, set_nivel_abrigo] = useState(null);
  const [nivel_elegancia, set_nivel_elegancia] = useState(null);
  const [color_query, set_color_query] = useState('');
  const [selected_colors, set_selected_colors] = useState([]);
  const [is_custom_color_open, set_is_custom_color_open] = useState(false);
  const [has_prefilled_initial_prenda, set_has_prefilled_initial_prenda] = useState(false);

  const [colores, set_colores] = useState([]);
  const [colores_status, set_colores_status] = useState('idle');
  const [colores_error, set_colores_error] = useState('');
  const [local_error, set_local_error] = useState('');
  const [is_processing_submission, set_is_processing_submission] = useState(false);

  const is_submitting = create_status === 'loading' || is_processing_submission;

  useEffect(() => {
    let is_cancelled = false;

    const load_colores = async () => {
      set_colores_status('loading');
      set_colores_error('');

      try {
        const colores_response = await fetch_colores_from_backend();
        if (is_cancelled) {
          return;
        }

        set_colores(colores_response);
        set_colores_status('succeeded');
      } catch (error) {
        if (is_cancelled) {
          return;
        }

        set_colores([]);
        set_colores_status('failed');
        set_colores_error(error?.message ?? 'No se pudieron cargar los colores');
      }
    };

    void load_colores();

    return () => {
      is_cancelled = true;
    };
  }, []);

  useEffect(() => {
    set_has_prefilled_initial_prenda(false);
  }, [prenda_to_edit?.id]);

  useEffect(() => {
    if (!is_editing || has_prefilled_initial_prenda || colores_status !== 'succeeded' || !prenda_to_edit) {
      return;
    }

    const initial_color_nombres = Array.isArray(prenda_to_edit.color_nombres) ? prenda_to_edit.color_nombres : [];
    const selected_color_items = initial_color_nombres
      .map((color_name) => {
        const normalized_name = normalize_text(color_name);
        if (!normalized_name) {
          return null;
        }

        const matching_color = colores.find((color_item) => normalize_text(color_item?.nombre) === normalized_name);
        return {
          id: matching_color?.id == null ? null : Number.parseInt(String(matching_color.id), 10),
          name: String(matching_color?.nombre ?? color_name).trim(),
          normalized_name,
        };
      })
      .filter(Boolean);

    const tipo_value = String(prenda_to_edit.tipo_prenda ?? '').trim();
    const normalized_tipo = normalize_text(tipo_value);
    const matched_option = tipo_prenda_options.find((option) => (
      option.value !== 'otro' && normalize_text(option.label) === normalized_tipo
    ));

    set_nombre(String(prenda_to_edit.nombre ?? ''));
    set_tipo_prenda(tipo_value);
    if (tipo_value && matched_option) {
      set_selected_tipo_option(matched_option.value);
      set_custom_tipo_prenda('');
    } else if (tipo_value) {
      set_selected_tipo_option('otro');
      set_custom_tipo_prenda(tipo_value);
    } else {
      set_selected_tipo_option('');
      set_custom_tipo_prenda('');
    }
    set_existing_foto_url(String(prenda_to_edit.foto_url ?? ''));
    set_foto_asset(null);
    set_nivel_abrigo(prenda_to_edit.nivel_abrigo == null ? null : Number(prenda_to_edit.nivel_abrigo));
    set_nivel_elegancia(prenda_to_edit.nivel_elegancia == null ? null : Number(prenda_to_edit.nivel_elegancia));
    set_selected_colors(selected_color_items);
    set_color_query('');
    set_is_custom_color_open(false);
    set_has_prefilled_initial_prenda(true);
  }, [colores, colores_status, has_prefilled_initial_prenda, is_editing, prenda_to_edit]);

  const selected_color_name_set = useMemo(
    () => new Set(selected_colors.map((color_item) => color_item.normalized_name)),
    [selected_colors]
  );

  const common_color_name_set = useMemo(
    () => new Set(common_color_options.map((color_item) => normalize_text(color_item.name))),
    []
  );

  const extra_selected_colors = useMemo(
    () => selected_colors.filter((color_item) => !common_color_name_set.has(color_item.normalized_name)),
    [common_color_name_set, selected_colors]
  );

  const add_color_chip_from_name = (color_name, explicit_color_id = null) => {
    const normalized_name = normalize_text(color_name);
    if (!normalized_name) {
      return;
    }

    if (selected_color_name_set.has(normalized_name)) {
      set_color_query('');
      return;
    }

    const existing_color = colores.find((color_item) => normalize_text(color_item?.nombre) === normalized_name);
    const resolved_name = String(existing_color?.nombre ?? color_name).trim();
    const resolved_id = existing_color?.id ?? explicit_color_id;

    set_selected_colors((current_colors) => [
      ...current_colors,
      {
        id: resolved_id == null ? null : Number.parseInt(String(resolved_id), 10),
        name: resolved_name,
        normalized_name,
      },
    ]);
    set_color_query('');
  };

  const remove_selected_color = (normalized_name_to_remove) => {
    set_selected_colors((current_colors) => (
      current_colors.filter((color_item) => color_item.normalized_name !== normalized_name_to_remove)
    ));
  };

  const handle_select_tipo = (option) => {
    set_selected_tipo_option(option.value);
    if (option.value === 'otro') {
      set_tipo_prenda(custom_tipo_prenda);
      return;
    }

    set_custom_tipo_prenda('');
    set_tipo_prenda(option.label);
  };

  const handle_custom_tipo_change = (value) => {
    set_custom_tipo_prenda(value);
    set_tipo_prenda(value);
  };

  const toggle_common_color = (color_name) => {
    const normalized_name = normalize_text(color_name);
    if (!normalized_name) {
      return;
    }

    if (selected_color_name_set.has(normalized_name)) {
      remove_selected_color(normalized_name);
      return;
    }

    const matching_color = colores.find((color_item) => normalize_text(color_item?.nombre) === normalized_name);
    add_color_chip_from_name(color_name, matching_color?.id ?? null);
  };

  const add_color_from_input = () => {
    const typed_color = String(color_query ?? '').trim();
    if (!typed_color) {
      return;
    }

    add_color_chip_from_name(typed_color);
    set_is_custom_color_open(false);
  };

  const resolve_color_ids_for_submit = async () => {
    const color_id_set = new Set();
    const created_colors = [];

    for (const selected_color of selected_colors) {
      const normalized_name = selected_color.normalized_name;
      if (!normalized_name) {
        continue;
      }

      const parsed_selected_id = Number.parseInt(String(selected_color.id ?? ''), 10);
      if (Number.isInteger(parsed_selected_id) && parsed_selected_id > 0) {
        color_id_set.add(parsed_selected_id);
        continue;
      }

      const existing_color = colores.find((color_item) => normalize_text(color_item?.nombre) === normalized_name);
      const existing_color_id = Number.parseInt(String(existing_color?.id ?? ''), 10);
      if (Number.isInteger(existing_color_id) && existing_color_id > 0) {
        color_id_set.add(existing_color_id);
        continue;
      }

      const created_color = await create_color_in_backend(selected_color.name);
      const created_color_id = Number.parseInt(String(created_color?.id ?? ''), 10);
      if (Number.isInteger(created_color_id) && created_color_id > 0) {
        color_id_set.add(created_color_id);
        created_colors.push(created_color);
      }
    }

    if (created_colors.length > 0) {
      set_colores((current_colores) => ([...current_colores, ...created_colors]));
    }

    return Array.from(color_id_set);
  };

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
    if (is_editing) {
      set_existing_foto_url('');
    }
  };

  const handle_submit = async () => {
    set_local_error('');
    set_is_processing_submission(true);

    if (!auth_user_id) {
      set_local_error(is_editing ? 'No hay usuario autenticado para editar la prenda' : 'No hay usuario autenticado para crear la prenda');
      set_is_processing_submission(false);
      return;
    }

    const normalized_nombre = String(nombre).trim();
    const normalized_tipo_prenda = String(tipo_prenda).trim();

    if (!normalized_nombre) {
      set_local_error('El nombre es obligatorio');
      set_is_processing_submission(false);
      return;
    }

    if (!normalized_tipo_prenda) {
      set_local_error('El tipo de prenda es obligatorio');
      set_is_processing_submission(false);
      return;
    }

    if (!selected_colors.length) {
      set_local_error('Debes seleccionar al menos un color');
      set_is_processing_submission(false);
      return;
    }

    try {
      const uploaded_photo_url = foto_asset
        ? await upload_local_image_to_cloudinary({
          local_uri: foto_asset.uri,
          file_name: foto_asset.file_name,
          mime_type: foto_asset.mime_type,
        })
        : null;
      const final_photo_url = uploaded_photo_url ?? existing_foto_url ?? null;

      const color_ids = await resolve_color_ids_for_submit();
      if (!color_ids.length) {
        set_local_error('No se pudo resolver ningun color valido para guardar la prenda');
        set_is_processing_submission(false);
        return;
      }

      const save_payload = {
        usuario_id: auth_user_id,
        nombre: normalized_nombre,
        tipo_prenda: normalized_tipo_prenda,
        nivel_abrigo,
        nivel_elegancia,
        foto_url: final_photo_url,
        color_ids,
      };

      if (is_editing) {
        await dispatch(update_prenda_manual({
          prenda_id: prenda_to_edit.id,
          ...save_payload,
        })).unwrap();
      } else {
        await dispatch(create_prenda_manual(save_payload)).unwrap();
      }

      await dispatch(fetch_prendas_for_user(auth_user_id)).unwrap();
      if (is_editing) {
        router.replace(`/prendas/${prenda_to_edit.id}`);
      } else {
        router.back();
      }
    } catch (error) {
      set_local_error(error?.message ?? (is_editing ? 'No se pudo actualizar la prenda' : 'No se pudo guardar la prenda'));
    } finally {
      set_is_processing_submission(false);
    }
  };

  const visible_error = local_error || create_error || colores_error;
  const screen_title = is_editing ? 'Editar prenda' : 'Nueva prenda';
  const submit_button_text = is_editing ? 'Guardar cambios' : 'Añadir al armario';
  const selected_color_count_label = selected_colors.length
    ? `${selected_colors.length} seleccionados`
    : 'Sin seleccionar';
  const elegance_label = nivel_elegancia ? elegance_level_labels[nivel_elegancia - 1] : 'Sin nivel';
  const warmth_label = nivel_abrigo ? warmth_level_labels[nivel_abrigo - 1] : 'Sin nivel';
  const visual_image_uri = foto_asset?.uri || resolve_prenda_image_url(existing_foto_url);

  return (
    <KeyboardAvoidingView
      style={prenda_create_manual_screen_styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={8}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={prenda_create_manual_screen_styles.screen}
        contentContainerStyle={prenda_create_manual_screen_styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View style={prenda_create_manual_screen_styles.header_row}>
          <Pressable onPress={() => router.back()} style={prenda_create_manual_screen_styles.header_action}>
            <Text selectable style={prenda_create_manual_screen_styles.header_action_text}>
              Cancelar
            </Text>
          </Pressable>
          <Text selectable style={prenda_create_manual_screen_styles.header_title}>
            {screen_title}
          </Text>
          <View style={prenda_create_manual_screen_styles.header_action} />
        </View>

        <View style={prenda_create_manual_screen_styles.photo_card}>
          {visual_image_uri ? (
            <Image
              source={{ uri: visual_image_uri }}
              style={[
                prenda_create_manual_screen_styles.photo_image,
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
            <View style={prenda_create_manual_screen_styles.photo_placeholder}>
              <View style={prenda_create_manual_screen_styles.photo_icon_wrap}>
                <FontAwesome6 name="image" size={18} color={palette.walnut} />
              </View>
              <Text selectable style={prenda_create_manual_screen_styles.photo_placeholder_text}>
                Añadir foto de la prenda
              </Text>
            </View>
          )}

          <View style={prenda_create_manual_screen_styles.photo_actions_row}>
            <Pressable
              onPress={pick_image_from_camera}
              style={prenda_create_manual_screen_styles.photo_action_button}
            >
              <Text selectable style={prenda_create_manual_screen_styles.photo_action_button_text}>
                Cámara
              </Text>
            </Pressable>
            <Pressable
              onPress={pick_image_from_gallery}
              style={prenda_create_manual_screen_styles.photo_action_button}
            >
              <FontAwesome6 name="image" size={13} color={palette.walnut} />
              <Text selectable style={prenda_create_manual_screen_styles.photo_action_button_text}>
                Galería
              </Text>
            </Pressable>
          </View>

          {visual_image_uri ? (
            <Pressable
              onPress={clear_selected_image}
              style={prenda_create_manual_screen_styles.photo_clear_button}
            >
              <Text selectable style={prenda_create_manual_screen_styles.photo_clear_button_text}>
                Quitar foto
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={prenda_create_manual_screen_styles.section}>
          <Text selectable style={prenda_create_manual_screen_styles.section_label}>
            NOMBRE
          </Text>
          <View style={prenda_create_manual_screen_styles.input_card}>
            <TextInput
              value={nombre}
              onChangeText={set_nombre}
              placeholder="Ej: Camisa Oxford"
              placeholderTextColor={palette.text_muted}
              style={prenda_create_manual_screen_styles.input}
            />
          </View>
        </View>

        <View style={prenda_create_manual_screen_styles.section}>
          <Text selectable style={prenda_create_manual_screen_styles.section_label}>
            TIPO DE PRENDA
          </Text>
          <View style={prenda_create_manual_screen_styles.type_grid}>
            {tipo_prenda_options.map((option) => {
              const is_active = option.value === selected_tipo_option;
              return (
                <Pressable
                  key={`tipo-${option.value}`}
                  onPress={() => handle_select_tipo(option)}
                  style={[
                    prenda_create_manual_screen_styles.type_card,
                    is_active ? prenda_create_manual_screen_styles.type_card_active : null,
                  ]}
                >
                  <FontAwesome6
                    name={option.icon}
                    size={18}
                    color={is_active ? palette.white : palette.walnut}
                    style={prenda_create_manual_screen_styles.type_icon}
                  />
                  <Text
                    selectable
                    style={[
                      prenda_create_manual_screen_styles.type_label,
                      is_active ? prenda_create_manual_screen_styles.type_label_active : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selected_tipo_option === 'otro' && (
            <View style={prenda_create_manual_screen_styles.custom_type_input_wrap}>
              <TextInput
                value={custom_tipo_prenda}
                onChangeText={handle_custom_tipo_change}
                placeholder="Escribe el tipo"
                placeholderTextColor={palette.text_muted}
                style={prenda_create_manual_screen_styles.input}
              />
            </View>
          )}
        </View>

        <View style={prenda_create_manual_screen_styles.section}>
          <View style={prenda_create_manual_screen_styles.section_header_row}>
            <Text selectable style={prenda_create_manual_screen_styles.section_label}>
              ELEGANCIA
            </Text>
            <Text selectable style={prenda_create_manual_screen_styles.section_hint}>
              {elegance_label}
            </Text>
          </View>
          <View style={prenda_create_manual_screen_styles.level_row}>
            {[1, 2, 3, 4, 5].map((level_value) => {
              const is_active = nivel_elegancia != null && level_value <= nivel_elegancia;
              return (
                <Pressable
                  key={`elegance-${level_value}`}
                  onPress={() => set_nivel_elegancia(level_value === nivel_elegancia ? null : level_value)}
                  style={[
                    prenda_create_manual_screen_styles.level_pill,
                    is_active ? prenda_create_manual_screen_styles.level_pill_active : null,
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={prenda_create_manual_screen_styles.section}>
          <View style={prenda_create_manual_screen_styles.section_header_row}>
            <Text selectable style={prenda_create_manual_screen_styles.section_label}>
              ABRIGO
            </Text>
            <Text selectable style={prenda_create_manual_screen_styles.section_hint}>
              {warmth_label}
            </Text>
          </View>
          <View style={prenda_create_manual_screen_styles.level_row}>
            {[1, 2, 3, 4, 5].map((level_value) => {
              const is_active = nivel_abrigo != null && level_value <= nivel_abrigo;
              return (
                <Pressable
                  key={`warmth-${level_value}`}
                  onPress={() => set_nivel_abrigo(level_value === nivel_abrigo ? null : level_value)}
                  style={[
                    prenda_create_manual_screen_styles.level_pill,
                    is_active ? prenda_create_manual_screen_styles.level_pill_active_warmth : null,
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={prenda_create_manual_screen_styles.section}>
          <View style={prenda_create_manual_screen_styles.section_header_row}>
            <Text selectable style={prenda_create_manual_screen_styles.section_label}>
              COLORES
            </Text>
            <Text selectable style={prenda_create_manual_screen_styles.section_hint}>
              {selected_color_count_label}
            </Text>
          </View>
          <View style={prenda_create_manual_screen_styles.colors_card}>
            {colores_status === 'loading' && (
              <View style={prenda_create_manual_screen_styles.loading_state}>
                <ActivityIndicator size="small" color={palette.walnut} />
                <Text selectable style={prenda_create_manual_screen_styles.loading_text}>
                  Cargando colores...
                </Text>
              </View>
            )}

            <View style={prenda_create_manual_screen_styles.colors_grid}>
              {common_color_options.map((color_item) => {
                const normalized_name = normalize_text(color_item.name);
                const is_selected = selected_color_name_set.has(normalized_name);
                return (
                  <Pressable
                    key={`color-${color_item.name}`}
                    onPress={() => toggle_common_color(color_item.name)}
                    style={prenda_create_manual_screen_styles.color_item}
                  >
                    <View
                      style={[
                        prenda_create_manual_screen_styles.color_swatch,
                        { backgroundColor: color_item.swatch },
                        is_selected ? prenda_create_manual_screen_styles.color_swatch_selected : null,
                      ]}
                    >
                      {is_selected ? (
                        <FontAwesome6 name="check" size={12} color={palette.white} />
                      ) : null}
                    </View>
                    <Text selectable style={prenda_create_manual_screen_styles.color_label}>
                      {color_item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => set_is_custom_color_open((is_open) => !is_open)}
              style={prenda_create_manual_screen_styles.custom_color_button}
            >
              <FontAwesome6 name="plus" size={12} color={palette.sky_ink} />
              <Text selectable style={prenda_create_manual_screen_styles.custom_color_button_text}>
                Color personalizado
              </Text>
            </Pressable>

            {is_custom_color_open && (
              <View style={prenda_create_manual_screen_styles.color_input_row}>
                <View style={prenda_create_manual_screen_styles.color_input_wrap}>
                  <TextInput
                    value={color_query}
                    onChangeText={set_color_query}
                    placeholder="Escribe un color"
                    placeholderTextColor={palette.text_muted}
                    style={prenda_create_manual_screen_styles.color_input}
                    onSubmitEditing={add_color_from_input}
                    returnKeyType="done"
                  />
                </View>
                <Pressable onPress={add_color_from_input} style={prenda_create_manual_screen_styles.color_add_button}>
                  <Text selectable style={prenda_create_manual_screen_styles.color_add_button_text}>
                    Añadir
                  </Text>
                </Pressable>
              </View>
            )}

            {extra_selected_colors.length > 0 && (
              <View style={prenda_create_manual_screen_styles.chips_wrap}>
                {extra_selected_colors.map((color_item) => (
                  <View
                    key={`selected-color-${color_item.normalized_name}`}
                    style={prenda_create_manual_screen_styles.selected_color_chip}
                  >
                    <Text selectable style={prenda_create_manual_screen_styles.selected_color_chip_text}>
                      {color_item.name}
                    </Text>
                    <Pressable
                      onPress={() => remove_selected_color(color_item.normalized_name)}
                      style={prenda_create_manual_screen_styles.selected_color_chip_remove_button}
                    >
                      <FontAwesome6 name="xmark" size={10} color={palette.white} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {Boolean(visible_error) && (
          <View style={prenda_create_manual_screen_styles.error_banner}>
            <Text selectable style={prenda_create_manual_screen_styles.error_text}>
              {visible_error}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handle_submit}
          disabled={is_submitting}
          style={[
            prenda_create_manual_screen_styles.submit_button,
            is_submitting ? prenda_create_manual_screen_styles.submit_button_disabled : null,
          ]}
        >
          <Text selectable style={prenda_create_manual_screen_styles.submit_button_text}>
            {is_submitting ? 'Guardando...' : submit_button_text}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
