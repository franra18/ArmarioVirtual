import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { palette } from '../../../shared/theme/palette';
import { FilterIcon, SearchIcon, SparklesIcon } from '../../../shared/icons/app-icons';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { fetch_prendas_for_user } from '../../prendas/state/prendas-slice';
import {
  select_prendas_items,
  select_prendas_loaded_user_id,
  select_prendas_status,
} from '../../prendas/selectors/prendas-selectors';
import { OutfitCard } from '../components/outfit-card';
import { fetch_outfits_for_user, toggle_outfit_favorite } from '../state/outfits-slice';
import {
  select_outfits_error,
  select_outfits_favorite_ids,
  select_outfits_items,
  select_outfits_loaded_user_id,
  select_outfits_status,
} from '../selectors/outfits-selectors';
import { build_outfit_collage_images, get_outfit_added_sort_value, normalize_outfit_text } from '../utils/outfit-utils';
import { outfits_screen_styles, search_input_placeholder_color } from './outfits-screen.styles';

function render_empty_state(has_error, outfits_error, on_retry, search_term) {
  if (has_error) {
    return (
      <View style={outfits_screen_styles.empty_state}>
        <Text selectable style={outfits_screen_styles.empty_title}>
          No se pudo cargar
        </Text>
        <Text selectable style={outfits_screen_styles.empty_subtitle}>
          {outfits_error}
        </Text>
        <Pressable onPress={on_retry} style={outfits_screen_styles.retry_button}>
          <Text selectable style={outfits_screen_styles.retry_button_text}>
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={outfits_screen_styles.empty_state}>
      <Text selectable style={outfits_screen_styles.empty_title}>
        {search_term.trim() ? 'Sin coincidencias' : 'Sin conjuntos todavía'}
      </Text>
      <Text selectable style={outfits_screen_styles.empty_subtitle}>
        {search_term.trim()
          ? 'Prueba con otro texto o cambia el filtro.'
          : 'Cuando crees outfits en tu armario aparecerán aquí.'}
      </Text>
    </View>
  );
}

export function OutfitsScreen() {
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const outfits_list_ref = useRef(null);

  useScrollToTop(outfits_list_ref);

  const auth_user_id = use_app_selector(select_auth_user_id);
  const outfits = use_app_selector(select_outfits_items);
  const favorite_ids = use_app_selector(select_outfits_favorite_ids);
  const outfits_status = use_app_selector(select_outfits_status);
  const outfits_error = use_app_selector(select_outfits_error);
  const outfits_loaded_user_id = use_app_selector(select_outfits_loaded_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const prendas_status = use_app_selector(select_prendas_status);
  const prendas_loaded_user_id = use_app_selector(select_prendas_loaded_user_id);

  const [search_term, set_search_term] = useState('');
  const [is_favorites_filter_active, set_is_favorites_filter_active] = useState(false);

  useEffect(() => {
    if (!auth_user_id || outfits_status === 'loading') {
      return;
    }

    const has_data_for_user = (
      String(outfits_loaded_user_id ?? '') === String(auth_user_id)
      && outfits_status === 'succeeded'
    );

    if (has_data_for_user) {
      return;
    }

    dispatch(fetch_outfits_for_user(auth_user_id));
  }, [auth_user_id, dispatch, outfits_loaded_user_id, outfits_status]);

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

  const favorite_id_set = useMemo(
    () => new Set(favorite_ids.map((id) => String(id))),
    [favorite_ids]
  );

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

  const filtered_outfits = useMemo(() => {
    const normalized_term = normalize_outfit_text(search_term);
    const normalized_user_id = String(auth_user_id ?? '').trim();

    const outfits_filtrados = outfits.filter((outfit) => {
      const matches_user = !normalized_user_id || String(outfit?.usuario_id) === normalized_user_id;
      const normalized_nombre = normalize_outfit_text(outfit?.nombre_outfit);
      const normalized_ocasion = normalize_outfit_text(outfit?.ocasion);
      const matches_search = (
        normalized_term.length === 0
        || normalized_nombre.includes(normalized_term)
        || normalized_ocasion.includes(normalized_term)
      );
      const matches_favorites = (
        !is_favorites_filter_active
        || favorite_id_set.has(String(outfit?.id))
      );

      return matches_user && matches_search && matches_favorites;
    });

    outfits_filtrados.sort((left_outfit, right_outfit) => {
      const left_value = get_outfit_added_sort_value(left_outfit);
      const right_value = get_outfit_added_sort_value(right_outfit);
      return right_value - left_value;
    });

    return outfits_filtrados;
  }, [auth_user_id, favorite_id_set, is_favorites_filter_active, outfits, search_term]);

  const is_loading_initial = outfits_status === 'loading' && outfits.length === 0;
  const has_error = Boolean(outfits_error);

  const handle_toggle_favorite = (outfit_id) => {
    if (outfit_id == null) {
      return;
    }

    dispatch(toggle_outfit_favorite(outfit_id));
  };

  const handle_retry = () => {
    if (!auth_user_id) {
      return;
    }

    dispatch(fetch_outfits_for_user(auth_user_id));
  };

  if (!auth_user_id) {
    return (
      <View style={outfits_screen_styles.loading_state}>
        <Text selectable style={outfits_screen_styles.loading_text}>
          Inicia sesion para ver tus outfits.
        </Text>
      </View>
    );
  }

  if (is_loading_initial) {
    return (
      <View style={outfits_screen_styles.loading_state}>
        <ActivityIndicator size="large" color={palette.walnut} />
        <Text selectable style={outfits_screen_styles.loading_text}>
          Cargando conjuntos...
        </Text>
      </View>
    );
  }

  const has_odd_filtered_count = filtered_outfits.length % 2 === 1;

  return (
    <View style={outfits_screen_styles.screen}>
      <FlatList
        ref={outfits_list_ref}
        data={filtered_outfits}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        renderItem={({ item, index }) => {
          const is_last_odd_item = has_odd_filtered_count && index === filtered_outfits.length - 1;
          const collage_images = build_outfit_collage_images(item, prendas_by_id);

          return (
            <View
              style={[
                outfits_screen_styles.card_wrapper,
                is_last_odd_item ? outfits_screen_styles.card_wrapper_single_last : null,
              ]}
            >
              <OutfitCard
                outfit={item}
                index={index}
                image_urls={collage_images}
                is_favorite={favorite_id_set.has(String(item.id))}
                on_toggle_favorite={handle_toggle_favorite}
              />
            </View>
          );
        }}
        ListHeaderComponent={(
          <View style={outfits_screen_styles.header_stack}>
            <Text selectable style={outfits_screen_styles.screen_title}>
              Conjuntos
            </Text>

            <View style={outfits_screen_styles.controls_row}>
              <View style={outfits_screen_styles.search_box}>
                <SearchIcon size={16} color={palette.text_muted} />
                <TextInput
                  value={search_term}
                  onChangeText={set_search_term}
                  style={outfits_screen_styles.search_input}
                  placeholder="Buscar conjunto"
                  placeholderTextColor={search_input_placeholder_color}
                  returnKeyType="search"
                />
              </View>

              <Pressable
                onPress={() => set_is_favorites_filter_active((is_active) => !is_active)}
                style={[
                  outfits_screen_styles.icon_action_button,
                  is_favorites_filter_active ? outfits_screen_styles.icon_action_button_active : null,
                ]}
              >
                <FilterIcon
                  size={14}
                  color={is_favorites_filter_active ? palette.white : palette.walnut}
                />
              </Pressable>

              <Pressable style={outfits_screen_styles.add_button}>
                <Text selectable style={outfits_screen_styles.add_button_text}>
                  + Añadir
                </Text>
              </Pressable>
            </View>

            <Pressable style={outfits_screen_styles.ia_card}>
              <View style={outfits_screen_styles.ia_card_left}>
                <View style={outfits_screen_styles.ia_icon_chip}>
                  <SparklesIcon size={16} color={palette.walnut} />
                </View>
                <View style={outfits_screen_styles.ia_copy}>
                  <Text selectable style={outfits_screen_styles.ia_title}>
                    Generar con IA
                  </Text>
                  <Text selectable style={outfits_screen_styles.ia_subtitle}>
                    Un conjunto a tu medida
                  </Text>
                </View>
              </View>
              <View style={outfits_screen_styles.ia_button}>
                <Text selectable style={outfits_screen_styles.ia_button_text}>
                  Probar
                </Text>
              </View>
            </Pressable>

            <Text selectable style={outfits_screen_styles.results_caption}>
              {filtered_outfits.length} disponibles
            </Text>
          </View>
        )}
        ListEmptyComponent={render_empty_state(has_error, outfits_error, handle_retry, search_term)}
        contentContainerStyle={outfits_screen_styles.list_content}
        columnWrapperStyle={outfits_screen_styles.list_column}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
