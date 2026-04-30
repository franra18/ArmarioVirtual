import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { FontAwesome6 } from '@expo/vector-icons';
import { palette } from '../../../shared/theme/palette';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { PrendaCard } from '../components/prenda-card';
import { fetch_prendas_for_user, toggle_prenda_favorite } from '../state/prendas-slice';
import {
  get_prenda_added_sort_value,
  get_prenda_category_label,
  normalize_prenda_text,
} from '../utils/prenda-utils';
import {
  select_prendas_error,
  select_prendas_favorite_ids,
  select_prendas_items,
  select_prendas_loaded_user_id,
  select_prendas_status,
} from '../selectors/prendas-selectors';
import { prendas_screen_styles, search_input_placeholder_color } from './prendas-screen.styles';

const elegance_level_options = [
  { value: null, label: 'Todos' },
  { value: 1, label: '1 · Deportivo/Casa' },
  { value: 2, label: '2 · Informal/Casual' },
  { value: 3, label: '3 · Casual Elegante' },
  { value: 4, label: '4 · Semi-formal' },
  { value: 5, label: '5 · Formal/Gala' },
];

const warmth_level_options = [
  { value: null, label: 'Todos' },
  { value: 1, label: '1 · Muy Ligero' },
  { value: 2, label: '2 · Ligero' },
  { value: 3, label: '3 · Intermedio' },
  { value: 4, label: '4 · Cálido' },
  { value: 5, label: '5 · Protección Total' },
];

function get_selected_option_label(options, selected_value) {
  const matched_option = options.find((option) => option.value === selected_value);
  return matched_option?.label ?? 'Todos';
}

function render_empty_state(has_error, prendas_error, on_retry, search_term) {
  if (has_error) {
    return (
      <View style={prendas_screen_styles.empty_state}>
        <Text selectable style={prendas_screen_styles.empty_title}>
          No se pudo cargar
        </Text>
        <Text selectable style={prendas_screen_styles.empty_subtitle}>
          {prendas_error}
        </Text>
        <Pressable onPress={on_retry} style={prendas_screen_styles.retry_button}>
          <Text selectable style={prendas_screen_styles.retry_button_text}>
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={prendas_screen_styles.empty_state}>
      <Text selectable style={prendas_screen_styles.empty_title}>
        {search_term.trim() ? 'Sin coincidencias' : 'Sin prendas todavía'}
      </Text>
      <Text selectable style={prendas_screen_styles.empty_subtitle}>
        {search_term.trim()
          ? 'Prueba con otro texto o cambia el filtro de categoria.'
          : 'Cuando añadas prendas en tu armario aparecerán aquí.'}
      </Text>
    </View>
  );
}

export function PrendasScreen() {
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const prendas_list_ref = useRef(null);

  useScrollToTop(prendas_list_ref);

  const auth_user_id = use_app_selector(select_auth_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const favorite_ids = use_app_selector(select_prendas_favorite_ids);
  const prendas_status = use_app_selector(select_prendas_status);
  const prendas_error = use_app_selector(select_prendas_error);
  const prendas_loaded_user_id = use_app_selector(select_prendas_loaded_user_id);

  const [search_term, set_search_term] = useState('');
  const [selected_category_id, set_selected_category_id] = useState(null);
  const [is_favorites_filter_active, set_is_favorites_filter_active] = useState(false);
  const [is_add_options_open, set_is_add_options_open] = useState(false);
  const [is_filter_card_open, set_is_filter_card_open] = useState(false);
  const [added_sort_order, set_added_sort_order] = useState('newest');
  const [selected_elegance_level, set_selected_elegance_level] = useState(null);
  const [selected_warmth_level, set_selected_warmth_level] = useState(null);
  const [is_elegance_select_open, set_is_elegance_select_open] = useState(false);
  const [is_warmth_select_open, set_is_warmth_select_open] = useState(false);

  useEffect(() => {
    if (!auth_user_id || prendas_status === 'loading') {
      return;
    }

    const has_data_for_user = (
      String(prendas_loaded_user_id ?? '') === String(auth_user_id)
      && prendas_status === 'succeeded'
    );

    if (has_data_for_user) {
      return;
    }

    dispatch(fetch_prendas_for_user(auth_user_id));
  }, [auth_user_id, dispatch, prendas_loaded_user_id, prendas_status]);

  const category_options = useMemo(() => {
    const categories = new Map();

    prendas.forEach((prenda) => {
      const normalized_tipo = normalize_prenda_text(prenda?.tipo_prenda);
      if (!normalized_tipo) {
        return;
      }

      if (!categories.has(normalized_tipo)) {
        categories.set(normalized_tipo, {
          id: normalized_tipo,
          label: get_prenda_category_label(prenda?.tipo_prenda),
        });
      }
    });

    return Array.from(categories.values());
  }, [prendas]);

  useEffect(() => {
    const is_current_filter_valid = category_options.some((category) => category.id === selected_category_id);
    if (!is_current_filter_valid) {
      set_selected_category_id(null);
    }
  }, [category_options, selected_category_id]);

  const favorite_id_set = useMemo(
    () => new Set(favorite_ids.map((id) => String(id))),
    [favorite_ids]
  );

  const filtered_prendas = useMemo(() => {
    const normalized_term = normalize_prenda_text(search_term);

    const prendas_filtradas = prendas.filter((prenda) => {
      const normalized_tipo = normalize_prenda_text(prenda?.tipo_prenda);
      const normalized_nombre = normalize_prenda_text(prenda?.nombre);
      const color_names = Array.isArray(prenda?.color_nombres) ? prenda.color_nombres : [];
      const matches_elegance = (
        selected_elegance_level == null
        || Number(prenda?.nivel_elegancia) === selected_elegance_level
      );
      const matches_warmth = (
        selected_warmth_level == null
        || Number(prenda?.nivel_abrigo) === selected_warmth_level
      );
      const matches_favorites = (
        !is_favorites_filter_active
        || favorite_id_set.has(String(prenda?.id))
      );

      const matches_category = selected_category_id == null || normalized_tipo === selected_category_id;
      const matches_search = (
        normalized_term.length === 0
        || normalized_nombre.includes(normalized_term)
        || normalized_tipo.includes(normalized_term)
        || color_names.some((color_name) => normalize_prenda_text(color_name).includes(normalized_term))
      );

      return (
        matches_category
        && matches_search
        && matches_elegance
        && matches_warmth
        && matches_favorites
      );
    });

    prendas_filtradas.sort((left_prenda, right_prenda) => {
      const left_value = get_prenda_added_sort_value(left_prenda);
      const right_value = get_prenda_added_sort_value(right_prenda);
      return added_sort_order === 'oldest' ? left_value - right_value : right_value - left_value;
    });

    return prendas_filtradas;
  }, [
    prendas,
    search_term,
    selected_category_id,
    selected_elegance_level,
    selected_warmth_level,
    added_sort_order,
    is_favorites_filter_active,
    favorite_id_set,
  ]);

  const is_loading_initial = prendas_status === 'loading' && prendas.length === 0;
  const has_error = Boolean(prendas_error);

  const handle_toggle_favorite = (prenda_id) => {
    if (prenda_id == null) {
      return;
    }

    dispatch(toggle_prenda_favorite(prenda_id));
  };

  const handle_open_prenda_detail = (prenda) => {
    if (!prenda?.id) {
      return;
    }

    router.push(`/prendas/${prenda.id}`);
  };

  const handle_retry = () => {
    if (!auth_user_id) {
      return;
    }

    dispatch(fetch_prendas_for_user(auth_user_id));
  };

  const has_advanced_filters = (
    selected_elegance_level != null
    || selected_warmth_level != null
    || added_sort_order !== 'newest'
  );

  const clear_filters = () => {
    set_search_term('');
    set_selected_category_id(null);
    set_is_favorites_filter_active(false);
    set_selected_elegance_level(null);
    set_selected_warmth_level(null);
    set_added_sort_order('newest');
  };

  const toggle_filter_card = () => {
    set_is_add_options_open(false);
    set_is_filter_card_open((is_open) => !is_open);
    set_is_elegance_select_open(false);
    set_is_warmth_select_open(false);
  };

  const open_add_options = () => {
    set_is_filter_card_open(false);
    set_is_elegance_select_open(false);
    set_is_warmth_select_open(false);
    set_is_add_options_open(true);
  };

  const close_add_options = () => {
    set_is_add_options_open(false);
  };

  const handle_select_manual_add = () => {
    set_is_add_options_open(false);
    router.push('/prendas/nueva-manual');
  };

  const handle_select_ia_add = () => {
    set_is_add_options_open(false);
    router.push('/prendas/nueva-ia');
  };

  const select_elegance_level = (level_value) => {
    set_selected_elegance_level(level_value);
    set_is_elegance_select_open(false);
  };

  const select_warmth_level = (level_value) => {
    set_selected_warmth_level(level_value);
    set_is_warmth_select_open(false);
  };

  if (!auth_user_id) {
    return (
      <View style={prendas_screen_styles.loading_state}>
        <Text selectable style={prendas_screen_styles.loading_text}>
          Inicia sesion para ver tus prendas.
        </Text>
      </View>
    );
  }

  if (is_loading_initial) {
    return (
      <View style={prendas_screen_styles.loading_state}>
        <ActivityIndicator size="large" color={palette.walnut} />
        <Text selectable style={prendas_screen_styles.loading_text}>
          Cargando prendas...
        </Text>
      </View>
    );
  }

  const has_odd_filtered_count = filtered_prendas.length % 2 === 1;

  return (
    <View style={prendas_screen_styles.screen}>
      <FlatList
        ref={prendas_list_ref}
        data={filtered_prendas}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        renderItem={({ item, index }) => {
          const is_last_odd_item = has_odd_filtered_count && index === filtered_prendas.length - 1;

          return (
          <View
            style={[
              prendas_screen_styles.card_wrapper,
              is_last_odd_item ? prendas_screen_styles.card_wrapper_single_last : null,
            ]}
          >
            <PrendaCard
              prenda={item}
              index={index}
              is_favorite={favorite_id_set.has(String(item.id))}
              on_toggle_favorite={handle_toggle_favorite}
              on_open_detail={handle_open_prenda_detail}
            />
          </View>
          );
        }}
        ListHeaderComponent={(
          <View style={prendas_screen_styles.header_stack}>
            <Text selectable style={prendas_screen_styles.screen_title}>
              Prendas
            </Text>

            <View style={prendas_screen_styles.controls_row}>
              <View style={prendas_screen_styles.search_box}>
                <FontAwesome6 name="magnifying-glass" size={16} color={palette.text_muted} />
                <TextInput
                  value={search_term}
                  onChangeText={set_search_term}
                  style={prendas_screen_styles.search_input}
                  placeholder="Buscar prenda"
                  placeholderTextColor={search_input_placeholder_color}
                  returnKeyType="search"
                />
              </View>

              <Pressable
                onPress={toggle_filter_card}
                style={[
                  prendas_screen_styles.icon_action_button,
                  is_filter_card_open || has_advanced_filters
                    ? prendas_screen_styles.icon_action_button_active
                    : null,
                ]}
              >
                <FontAwesome6
                  name="filter"
                  size={14}
                  color={(is_filter_card_open || has_advanced_filters) ? palette.white : palette.walnut}
                />
              </Pressable>

              <Pressable onPress={open_add_options} style={prendas_screen_styles.add_button}>
                <Text selectable style={prendas_screen_styles.add_button_text}>
                  + Añadir
                </Text>
              </Pressable>
            </View>

            {is_filter_card_open && (
              <View style={prendas_screen_styles.filter_card}>
                <View style={prendas_screen_styles.filter_section}>
                  <Text selectable style={prendas_screen_styles.filter_label}>
                    Añadido
                  </Text>
                  <View style={prendas_screen_styles.filter_choice_row}>
                    <Pressable
                      onPress={() => set_added_sort_order('newest')}
                      style={[
                        prendas_screen_styles.filter_choice_chip,
                        added_sort_order === 'newest' ? prendas_screen_styles.filter_choice_chip_active : null,
                      ]}
                    >
                      <Text
                        selectable
                        style={[
                          prendas_screen_styles.filter_choice_chip_text,
                          added_sort_order === 'newest'
                            ? prendas_screen_styles.filter_choice_chip_text_active
                            : null,
                        ]}
                      >
                        Más reciente
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => set_added_sort_order('oldest')}
                      style={[
                        prendas_screen_styles.filter_choice_chip,
                        added_sort_order === 'oldest' ? prendas_screen_styles.filter_choice_chip_active : null,
                      ]}
                    >
                      <Text
                        selectable
                        style={[
                          prendas_screen_styles.filter_choice_chip_text,
                          added_sort_order === 'oldest'
                            ? prendas_screen_styles.filter_choice_chip_text_active
                            : null,
                        ]}
                      >
                        Más antiguo
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={prendas_screen_styles.filter_section}>
                  <Text selectable style={prendas_screen_styles.filter_label}>
                    Nivel de elegancia
                  </Text>
                  <Pressable
                    onPress={() => {
                      set_is_elegance_select_open((is_open) => !is_open);
                      set_is_warmth_select_open(false);
                    }}
                    style={prendas_screen_styles.select_trigger}
                  >
                    <Text selectable style={prendas_screen_styles.select_trigger_text}>
                      {get_selected_option_label(elegance_level_options, selected_elegance_level)}
                    </Text>
                    <FontAwesome6
                      name={is_elegance_select_open ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      color={palette.walnut}
                    />
                  </Pressable>
                  {is_elegance_select_open && (
                    <View style={prendas_screen_styles.select_dropdown}>
                      {elegance_level_options.map((option) => {
                        const is_selected = option.value === selected_elegance_level;
                        return (
                          <Pressable
                            key={`elegance-option-${String(option.value)}`}
                            onPress={() => select_elegance_level(option.value)}
                            style={[
                              prendas_screen_styles.select_option,
                              is_selected ? prendas_screen_styles.select_option_active : null,
                            ]}
                          >
                            <Text
                              selectable
                              style={[
                                prendas_screen_styles.select_option_text,
                                is_selected ? prendas_screen_styles.select_option_text_active : null,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={prendas_screen_styles.filter_section}>
                  <Text selectable style={prendas_screen_styles.filter_label}>
                    Nivel de abrigo
                  </Text>
                  <Pressable
                    onPress={() => {
                      set_is_warmth_select_open((is_open) => !is_open);
                      set_is_elegance_select_open(false);
                    }}
                    style={prendas_screen_styles.select_trigger}
                  >
                    <Text selectable style={prendas_screen_styles.select_trigger_text}>
                      {get_selected_option_label(warmth_level_options, selected_warmth_level)}
                    </Text>
                    <FontAwesome6
                      name={is_warmth_select_open ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      color={palette.walnut}
                    />
                  </Pressable>
                  {is_warmth_select_open && (
                    <View style={prendas_screen_styles.select_dropdown}>
                      {warmth_level_options.map((option) => {
                        const is_selected = option.value === selected_warmth_level;
                        return (
                          <Pressable
                            key={`warmth-option-${String(option.value)}`}
                            onPress={() => select_warmth_level(option.value)}
                            style={[
                              prendas_screen_styles.select_option,
                              is_selected ? prendas_screen_styles.select_option_active : null,
                            ]}
                          >
                            <Text
                              selectable
                              style={[
                                prendas_screen_styles.select_option_text,
                                is_selected ? prendas_screen_styles.select_option_text_active : null,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={prendas_screen_styles.filter_actions_row}>
                  <Pressable onPress={clear_filters} style={prendas_screen_styles.filter_action_button_secondary}>
                    <Text selectable style={prendas_screen_styles.filter_action_button_secondary_text}>
                      Limpiar
                    </Text>
                  </Pressable>
                  <Pressable onPress={toggle_filter_card} style={prendas_screen_styles.filter_action_button_primary}>
                    <Text selectable style={prendas_screen_styles.filter_action_button_primary_text}>
                      Cerrar
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={prendas_screen_styles.filters_scroll_content}
            >
              <Pressable
                onPress={() => set_is_favorites_filter_active((is_active) => !is_active)}
                style={[
                  prendas_screen_styles.filter_chip,
                  is_favorites_filter_active ? prendas_screen_styles.filter_chip_active : null,
                ]}
              >
                <Text
                  selectable
                  style={[
                    prendas_screen_styles.filter_chip_text,
                    is_favorites_filter_active ? prendas_screen_styles.filter_chip_text_active : null,
                  ]}
                >
                  Favoritos
                </Text>
              </Pressable>

              {category_options.map((category) => {
                const is_active = category.id === selected_category_id;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      set_selected_category_id((current_category_id) => (
                        current_category_id === category.id ? null : category.id
                      ));
                    }}
                    style={[
                      prendas_screen_styles.filter_chip,
                      is_active ? prendas_screen_styles.filter_chip_active : null,
                    ]}
                  >
                    <Text
                      selectable
                      style={[
                        prendas_screen_styles.filter_chip_text,
                        is_active ? prendas_screen_styles.filter_chip_text_active : null,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text selectable style={prendas_screen_styles.results_caption}>
              {filtered_prendas.length} disponibles
            </Text>
          </View>
        )}
        ListEmptyComponent={render_empty_state(has_error, prendas_error, handle_retry, search_term)}
        contentInsetAdjustmentBehavior="automatic"
        style={prendas_screen_styles.screen}
        contentContainerStyle={prendas_screen_styles.list_content}
        columnWrapperStyle={prendas_screen_styles.list_column}
        showsVerticalScrollIndicator={false}
      />

      {has_error && prendas.length > 0 && (
        <View style={prendas_screen_styles.inline_error_banner}>
          <Text selectable style={prendas_screen_styles.inline_error_text}>
            {prendas_error}
          </Text>
        </View>
      )}

      {is_add_options_open && (
        <View style={prendas_screen_styles.add_options_overlay}>
          <Pressable onPress={close_add_options} style={prendas_screen_styles.add_options_backdrop} />
          <View style={prendas_screen_styles.add_options_card}>
            <Text selectable style={prendas_screen_styles.add_options_title}>
              ¿Cómo quieres añadir la prenda?
            </Text>

            <Pressable onPress={handle_select_manual_add} style={prendas_screen_styles.add_options_button_primary}>
              <Text selectable style={prendas_screen_styles.add_options_button_primary_text}>
                Manualmente
              </Text>
            </Pressable>

            <Pressable onPress={handle_select_ia_add} style={prendas_screen_styles.add_options_button_ia}>
              <Text selectable style={prendas_screen_styles.add_options_button_ia_text}>
                Desde foto con IA
              </Text>
            </Pressable>

            <Pressable onPress={close_add_options} style={prendas_screen_styles.add_options_button_secondary}>
              <Text selectable style={prendas_screen_styles.add_options_button_secondary_text}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
