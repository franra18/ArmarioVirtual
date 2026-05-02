import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { palette } from '../../../shared/theme/palette';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import {
  select_prendas_error,
  select_prendas_items,
  select_prendas_loaded_user_id,
  select_prendas_status,
} from '../../prendas/selectors/prendas-selectors';
import { fetch_prendas_for_user } from '../../prendas/state/prendas-slice';
import {
  normalize_prenda_text,
  resolve_prenda_icon_name,
  to_prenda_title_case,
} from '../../prendas/utils/prenda-utils';
import {
  select_outfits_create_error,
  select_outfits_create_status,
} from '../selectors/outfits-selectors';
import { create_outfit_manual, update_outfit_manual } from '../state/outfits-slice';
import { ChevronRightIcon, TrashIcon } from '../../../shared/icons/app-icons';
import { outfit_create_screen_styles } from './outfit-create-screen.styles';

const occasion_options = [
  'Diario',
  'Oficina',
  'Cena',
  'Boda',
  'Deporte',
  'Viaje',
  'Playa',
];

const elegance_level_labels = {
  1: 'Deportivo/Casa',
  2: 'Informal/Casual',
  3: 'Casual Elegante',
  4: 'Semi-formal',
  5: 'Formal/Gala',
};

const warmth_level_labels = {
  1: 'Muy Ligero',
  2: 'Ligero',
  3: 'Intermedio',
  4: 'Abrigado',
  5: 'Muy abrigado',
};

function build_prenda_meta(prenda) {
  const color_names = Array.isArray(prenda?.color_nombres) ? prenda.color_nombres : [];
  const color_label = color_names.length ? color_names[0] : 'Sin color';
  const warmth_label = warmth_level_labels[Number(prenda?.nivel_abrigo)] ?? 'Sin abrigo';
  const elegance_label = elegance_level_labels[Number(prenda?.nivel_elegancia)] ?? 'Sin elegancia';
  return `${color_label} · ${warmth_label} · ${elegance_label}`;
}

export function OutfitCreateScreen({ outfit_to_edit = null }) {
  const is_editing = Boolean(outfit_to_edit?.id);

  const router = useRouter();
  const dispatch = use_app_dispatch();
  const auth_user_id = use_app_selector(select_auth_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const prendas_status = use_app_selector(select_prendas_status);
  const prendas_error = use_app_selector(select_prendas_error);
  const prendas_loaded_user_id = use_app_selector(select_prendas_loaded_user_id);
  const create_status = use_app_selector(select_outfits_create_status);
  const create_error = use_app_selector(select_outfits_create_error);
  const is_ios = process.env.EXPO_OS === 'ios';

  const [nombre_outfit, set_nombre_outfit] = useState('');
  const [ocasion, set_ocasion] = useState('');

  const [is_custom_ocasion, set_is_custom_ocasion] = useState(false);
  const [custom_ocasion, set_custom_ocasion] = useState('');

  const [selected_prenda_ids, set_selected_prenda_ids] = useState([]);
  const [is_selector_open, set_is_selector_open] = useState(false);
  const [selector_search, set_selector_search] = useState('');
  const [local_error, set_local_error] = useState('');
  const [is_processing_submission, set_is_processing_submission] = useState(false);

  useEffect(() => {
    if (!auth_user_id || prendas_status === 'loading') {
      return;
    }

    const has_prendas_for_user = (
      String(prendas_loaded_user_id ?? '') === String(auth_user_id)
      && prendas_status === 'succeeded'
    );

    if (has_prendas_for_user) {
      return;
    }

    dispatch(fetch_prendas_for_user(auth_user_id));
  }, [auth_user_id, dispatch, prendas_loaded_user_id, prendas_status]);

  useEffect(() => {
    if (is_editing) {
      set_nombre_outfit(outfit_to_edit.nombre_outfit || '');
      set_selected_prenda_ids(outfit_to_edit.prenda_ids || []);

      const loaded_ocasion = outfit_to_edit.ocasion || '';
      set_ocasion(loaded_ocasion);

      // Detectamos si la ocasión es personalizada
      const is_predefined = occasion_options.some(opt =>
        normalize_prenda_text(opt) === normalize_prenda_text(loaded_ocasion)
      );

      if (!is_predefined && loaded_ocasion) {
        set_is_custom_ocasion(true);
        set_custom_ocasion(loaded_ocasion);
      }
    }
  }, [outfit_to_edit, is_editing]);

  const prendas_by_id = useMemo(() => {
    const map = new Map();
    prendas.forEach((prenda) => {
      if (prenda?.id == null) {
        return;
      }

      map.set(String(prenda.id), prenda);
    });
    return map;
  }, [prendas]);

  const selected_prendas = useMemo(
    () => selected_prenda_ids
      .map((prenda_id) => prendas_by_id.get(String(prenda_id)))
      .filter(Boolean),
    [prendas_by_id, selected_prenda_ids]
  );

  const selected_id_set = useMemo(
    () => new Set(selected_prenda_ids.map((prenda_id) => String(prenda_id))),
    [selected_prenda_ids]
  );

  const filtered_prendas = useMemo(() => {
    const normalized_query = normalize_prenda_text(selector_search);
    if (!normalized_query) {
      return prendas;
    }

    return prendas.filter((prenda) => {
      const normalized_nombre = normalize_prenda_text(prenda?.nombre);
      const normalized_tipo = normalize_prenda_text(prenda?.tipo_prenda);
      const color_names = Array.isArray(prenda?.color_nombres) ? prenda.color_nombres : [];
      const matches_color = color_names.some((color_name) => (
        normalize_prenda_text(color_name).includes(normalized_query)
      ));

      return (
        normalized_nombre.includes(normalized_query)
        || normalized_tipo.includes(normalized_query)
        || matches_color
      );
    });
  }, [prendas, selector_search]);

  const toggle_prenda_selection = (prenda_id) => {
    const normalized_id = Number(prenda_id);
    if (!Number.isInteger(normalized_id) || normalized_id <= 0) {
      return;
    }

    set_selected_prenda_ids((current_ids) => {
      const already_selected = current_ids.some((id) => Number(id) === normalized_id);
      if (already_selected) {
        return current_ids.filter((id) => Number(id) !== normalized_id);
      }

      return [...current_ids, normalized_id];
    });
  };

  const remove_selected_prenda = (prenda_id) => {
    const normalized_id = Number(prenda_id);
    if (!Number.isInteger(normalized_id) || normalized_id <= 0) {
      return;
    }

    set_selected_prenda_ids((current_ids) => (
      current_ids.filter((id) => Number(id) !== normalized_id)
    ));
  };

  const open_selector = () => {
    set_is_selector_open(true);
  };

  const close_selector = () => {
    set_is_selector_open(false);
    set_selector_search('');
  };

  const handle_save = async () => {
    set_local_error('');

    if (!auth_user_id) {
      set_local_error('Necesitas iniciar sesion para crear un conjunto');
      return;
    }

    if (!selected_prenda_ids.length) {
      set_local_error('Debes seleccionar al menos una prenda');
      return;
    }

    const payload = {
      usuario_id: auth_user_id,
      nombre_outfit: String(nombre_outfit ?? '').trim() || null,
      ocasion: String(ocasion ?? '').trim() || null,
      creado_por_ia: false,
      prenda_ids: selected_prenda_ids,
    };

    set_is_processing_submission(true);
    try {
      if (is_editing) {
        await dispatch(update_outfit_manual({
          outfit_id: outfit_to_edit.id,
          ...payload
        })).unwrap();
        router.replace(`/conjuntos/${outfit_to_edit.id}`);
      } else {
        const created_outfit = await dispatch(create_outfit_manual(payload)).unwrap();
        router.replace(`/conjuntos/${created_outfit.id}`);
      }
    } catch (error) {
      set_local_error(error?.message ?? (is_editing ? 'No se pudo actualizar el conjunto' : 'No se pudo crear el conjunto'));
    } finally {
      set_is_processing_submission(false);
    }
  };

  const is_submitting = create_status === 'loading' || is_processing_submission;
  const is_save_disabled = is_submitting || selected_prenda_ids.length === 0;
  const is_submit_disabled = is_save_disabled;
  const visible_error = local_error || create_error;
  // Mostrar loading si estamos cargando o si no tenemos prendas cargadas para este usuario aún
  const prendas_not_loaded_for_user = String(prendas_loaded_user_id ?? '') !== String(auth_user_id);
  const prendas_loading = prendas_status !== 'succeeded' && (prendas.length === 0 || prendas_not_loaded_for_user);

  return (
    <KeyboardAvoidingView
      style={outfit_create_screen_styles.screen}
      behavior={is_ios ? 'padding' : 'height'}
      keyboardVerticalOffset={8}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={outfit_create_screen_styles.screen}
        contentContainerStyle={outfit_create_screen_styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={outfit_create_screen_styles.header_row}>
          <Pressable onPress={() => router.back()} style={outfit_create_screen_styles.header_action}>
            <Text selectable style={outfit_create_screen_styles.header_action_text}>
              Cancelar
            </Text>
          </Pressable>

          <Text selectable style={outfit_create_screen_styles.header_title}>
            {is_editing ? 'Editar conjunto' : 'Nuevo conjunto'}
          </Text>

          <View style={outfit_create_screen_styles.header_action} />
        </View>

        <View style={outfit_create_screen_styles.section}>
          <Text selectable style={outfit_create_screen_styles.section_label}>
            NOMBRE DEL CONJUNTO
          </Text>
          <View style={outfit_create_screen_styles.input_card}>
            <TextInput
              value={nombre_outfit}
              onChangeText={set_nombre_outfit}
              style={outfit_create_screen_styles.input}
              placeholder="Nombre del conjunto"
              placeholderTextColor={palette.text_muted}
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={outfit_create_screen_styles.section}>
          <View style={outfit_create_screen_styles.section_header_row}>
            <Text selectable style={outfit_create_screen_styles.section_label}>
              OCASION
            </Text>
            {ocasion ? (
              <Text selectable style={outfit_create_screen_styles.section_hint}>
                {ocasion}
              </Text>
            ) : null}
          </View>

          <View style={outfit_create_screen_styles.chips_row}>
            {occasion_options.map((option) => {
              const is_active = !is_custom_ocasion && normalize_prenda_text(option) === normalize_prenda_text(ocasion);
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    set_is_custom_ocasion(false);
                    set_ocasion(is_active ? '' : option);
                  }}
                  style={[
                    outfit_create_screen_styles.chip,
                    is_active ? outfit_create_screen_styles.chip_active : null,
                  ]}
                >
                  <Text
                    selectable
                    style={[
                      outfit_create_screen_styles.chip_text,
                      is_active ? outfit_create_screen_styles.chip_text_active : null,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}

            {/* Nuevo chip para "+ Otro" */}
            <Pressable
              onPress={() => {
                set_is_custom_ocasion(true);
                set_ocasion(custom_ocasion); // Sincroniza con lo que haya escrito
              }}
              style={[
                outfit_create_screen_styles.chip,
                is_custom_ocasion ? outfit_create_screen_styles.chip_active : null,
              ]}
            >
              <Text
                selectable
                style={[
                  outfit_create_screen_styles.chip_text,
                  is_custom_ocasion ? outfit_create_screen_styles.chip_text_active : null,
                ]}
              >
                + Otro
              </Text>
            </Pressable>
          </View>

          {/* Input condicional para la ocasión personalizada usando tus estilos existentes */}
          {is_custom_ocasion && (
            <View style={[outfit_create_screen_styles.input_card, { marginTop: 8 }]}>
              <TextInput
                value={custom_ocasion}
                onChangeText={(val) => {
                  set_custom_ocasion(val);
                  set_ocasion(val); // Guarda directamente en el estado que se enviará al backend
                }}
                style={outfit_create_screen_styles.input}
                placeholder="Escribe la ocasión"
                placeholderTextColor={palette.text_muted}
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        <View style={outfit_create_screen_styles.section}>
          <View style={outfit_create_screen_styles.section_header_row}>
            <Text selectable style={outfit_create_screen_styles.section_label}>
              PRENDAS
            </Text>
            <Text selectable style={outfit_create_screen_styles.section_hint}>
              {selected_prenda_ids.length} seleccionadas
            </Text>
          </View>

          <View style={outfit_create_screen_styles.selected_list}>
            {selected_prendas.map((prenda) => {
              const image_url = resolve_prenda_image_url(prenda?.foto_url);
              const icon_name = resolve_prenda_icon_name(prenda?.tipo_prenda);
              const tipo_label = String(prenda?.tipo_prenda ?? '').trim();
              const meta_text = build_prenda_meta(prenda);

              return (
                <Pressable
                  key={String(prenda?.id)}
                  style={outfit_create_screen_styles.selected_card}
                  onPress={() => {
                    if (prenda?.id != null) {
                      router.push(`/prendas/${prenda.id}`);
                    }
                  }}
                >
                  <View style={outfit_create_screen_styles.selected_card_left}>
                    <View style={outfit_create_screen_styles.selected_image_wrap}>
                      {image_url ? (
                        <Image
                          source={{ uri: image_url }}
                          style={outfit_create_screen_styles.selected_image}
                          resizeMode="cover"
                        />
                      ) : (
                        <FontAwesome6 name={icon_name} size={22} color={palette.walnut} />
                      )}
                    </View>
                    <View style={outfit_create_screen_styles.selected_info}>
                      <Text selectable style={outfit_create_screen_styles.selected_label}>
                        {tipo_label ? to_prenda_title_case(tipo_label) : 'Prenda'}
                      </Text>
                      <Text selectable style={outfit_create_screen_styles.selected_title}>
                        {prenda?.nombre ?? `Prenda ${prenda?.id ?? ''}`}
                      </Text>
                      <Text selectable style={outfit_create_screen_styles.selected_meta}>
                        {meta_text}
                      </Text>
                    </View>
                  </View>
                  <View style={outfit_create_screen_styles.selected_actions}>
                    <ChevronRightIcon size={14} color={palette.text_muted} />
                    <Pressable
                      onPress={(event) => {
                        event?.stopPropagation?.();
                        remove_selected_prenda(prenda?.id);
                      }}
                      style={outfit_create_screen_styles.action_button}
                    >
                      <TrashIcon size={13} color={palette.walnut} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}

            <Pressable onPress={open_selector} style={outfit_create_screen_styles.add_card}>
              <View style={outfit_create_screen_styles.add_icon_wrap}>
                <FontAwesome6 name="plus" size={18} color={palette.walnut} />
              </View>
              <Text selectable style={outfit_create_screen_styles.add_text}>
                Añadir prenda
              </Text>
            </Pressable>
          </View>
        </View>

        {Boolean(visible_error) && (
          <View style={outfit_create_screen_styles.error_banner}>
            <Text selectable style={outfit_create_screen_styles.error_text}>
              {visible_error}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handle_save}
          disabled={is_submit_disabled}
          style={[
            outfit_create_screen_styles.submit_button,
            is_submit_disabled ? outfit_create_screen_styles.submit_button_disabled : null,
          ]}
        >
          {is_submitting ? (
            <ActivityIndicator size="small" color={palette.white} />
          ) : (
            <Text selectable style={outfit_create_screen_styles.submit_button_text}>
              {is_editing ? 'Guardar cambios' : 'Crear conjunto'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={is_selector_open}
        transparent
        animationType="fade"
        onRequestClose={close_selector}
      >
        <Pressable style={outfit_create_screen_styles.selector_overlay} onPress={close_selector}>
          <Pressable
            style={outfit_create_screen_styles.selector_sheet}
            onPress={(event) => event?.stopPropagation?.()}
          >
            <View style={outfit_create_screen_styles.selector_header_row}>
              <Text selectable style={outfit_create_screen_styles.selector_title}>
                Añadir prendas
              </Text>
              <Pressable onPress={close_selector}>
                <Text selectable style={outfit_create_screen_styles.selector_close}>
                  Listo
                </Text>
              </Pressable>
            </View>

            <View style={outfit_create_screen_styles.selector_search}>
              <TextInput
                value={selector_search}
                onChangeText={set_selector_search}
                style={outfit_create_screen_styles.selector_search_input}
                placeholder="Buscar prenda"
                placeholderTextColor={palette.text_muted}
                returnKeyType="search"
              />
            </View>

            <ScrollView
              style={outfit_create_screen_styles.selector_list}
              contentContainerStyle={outfit_create_screen_styles.selector_list_content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {prendas_loading && (
                <View style={outfit_create_screen_styles.selector_loading}>
                  <ActivityIndicator size="small" color={palette.walnut} />
                  <Text selectable style={outfit_create_screen_styles.selector_loading_text}>
                    Cargando prendas...
                  </Text>
                </View>
              )}

              {!prendas_loading && Boolean(prendas_error) && (
                <View style={outfit_create_screen_styles.selector_empty}>
                  <Text selectable style={outfit_create_screen_styles.selector_empty_text}>
                    Error: {String(prendas_error)}
                  </Text>
                </View>
              )}

              {!prendas_loading && !prendas_error && prendas.length === 0 && (
                <View style={outfit_create_screen_styles.selector_empty}>
                  <Text selectable style={outfit_create_screen_styles.selector_empty_text}>
                    No tienes prendas registradas todavía.
                  </Text>
                </View>
              )}

              {!prendas_loading && !prendas_error && prendas.length > 0 && filtered_prendas.length === 0 && (
                <View style={outfit_create_screen_styles.selector_empty}>
                  <Text selectable style={outfit_create_screen_styles.selector_empty_text}>
                    No hay prendas que coincidan.
                  </Text>
                </View>
              )}

              {!prendas_loading && !prendas_error && filtered_prendas.map((prenda) => {
                const is_selected = selected_id_set.has(String(prenda?.id));
                const image_url = resolve_prenda_image_url(prenda?.foto_url);
                const icon_name = resolve_prenda_icon_name(prenda?.tipo_prenda);
                const tipo_label = to_prenda_title_case(prenda?.tipo_prenda ?? '');

                return (
                  <Pressable
                    key={String(prenda?.id)}
                    onPress={() => toggle_prenda_selection(prenda?.id)}
                    style={[
                      outfit_create_screen_styles.selector_item,
                      is_selected ? outfit_create_screen_styles.selector_item_selected : null,
                    ]}
                  >
                    <View style={outfit_create_screen_styles.selector_item_left}
                    >
                      <View style={outfit_create_screen_styles.selector_item_image_wrap}>
                        {image_url ? (
                          <Image
                            source={{ uri: image_url }}
                            style={outfit_create_screen_styles.selector_item_image}
                            resizeMode="cover"
                          />
                        ) : (
                          <FontAwesome6 name={icon_name} size={18} color={palette.walnut} />
                        )}
                      </View>
                      <View style={outfit_create_screen_styles.selector_item_info}>
                        <Text selectable style={outfit_create_screen_styles.selector_item_title}>
                          {prenda?.nombre ?? `Prenda ${prenda?.id ?? ''}`}
                        </Text>
                        <Text selectable style={outfit_create_screen_styles.selector_item_subtitle}>
                          {tipo_label || 'Prenda'}
                        </Text>
                      </View>
                    </View>
                    {is_selected ? (
                      <View style={outfit_create_screen_styles.selector_check}>
                        <FontAwesome6 name="check" size={12} color={palette.white} />
                      </View>
                    ) : (
                      <View style={outfit_create_screen_styles.selector_check_placeholder} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
