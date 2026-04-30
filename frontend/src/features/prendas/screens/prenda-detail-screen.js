import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import tinycolor from 'tinycolor2';
import { palette } from '../../../shared/theme/palette';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { delete_prenda_by_id, fetch_prendas_for_user, toggle_prenda_favorite } from '../state/prendas-slice';
import { resolve_prenda_icon_name, to_prenda_title_case } from '../utils/prenda-utils';
import {
  select_prendas_delete_status,
  select_prendas_favorite_ids,
  select_prendas_items,
  select_prendas_status,
} from '../selectors/prendas-selectors';
import { prenda_detail_screen_styles } from './prenda-detail-screen.styles';

function normalize_color_text(color_name) {
  return String(color_name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const spanish_color_phrase_aliases = [
  ['azul marino', 'navy'],
  ['azul cielo', 'skyblue'],
  ['azul claro', 'lightskyblue'],
  ['verde oliva', 'olive'],
  ['verde agua', 'mediumaquamarine'],
  ['gris oscuro', 'dimgray'],
  ['gris claro', 'lightgray'],
  ['marron oscuro', 'saddlebrown'],
  ['marron claro', 'peru'],
  ['cafe oscuro', 'saddlebrown'],
  ['cafe claro', 'tan'],
  ['blanco roto', 'ivory'],
  ['rojo vino', 'maroon'],
];

const spanish_color_token_aliases = {
  blanco: 'white',
  negro: 'black',
  gris: 'gray',
  plata: 'silver',
  plateado: 'silver',
  rojo: 'red',
  granate: 'maroon',
  bordo: 'maroon',
  vino: 'maroon',
  azul: 'blue',
  marino: 'navy',
  celeste: 'skyblue',
  cielo: 'skyblue',
  turquesa: 'turquoise',
  verde: 'green',
  oliva: 'olive',
  lima: 'lime',
  amarillo: 'yellow',
  dorado: 'gold',
  oro: 'gold',
  naranja: 'orange',
  coral: 'coral',
  rosa: 'pink',
  fucsia: 'fuchsia',
  morado: 'purple',
  violeta: 'violet',
  lila: 'plum',
  marron: 'saddlebrown',
  cafe: 'saddlebrown',
  castano: 'saddlebrown',
  beige: 'beige',
  crema: 'ivory',
  crudo: 'beige',
  hueso: 'beige',
  camel: 'tan',
  caqui: 'khaki',
};

function resolve_spanish_color_alias(normalized_color_name, tokens) {
  for (const [phrase, css_color] of spanish_color_phrase_aliases) {
    if (normalized_color_name.includes(phrase)) {
      return css_color;
    }
  }

  for (const token of tokens) {
    if (spanish_color_token_aliases[token]) {
      return spanish_color_token_aliases[token];
    }
  }

  return null;
}

function build_deterministic_color(color_name) {
  const normalized = normalize_color_text(color_name);
  if (!normalized) {
    return palette.cream_deep;
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(index);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  return tinycolor({ h: hue, s: 50, l: 48 }).toHexString();
}

function get_color_hex(color_name) {
  const normalized = normalize_color_text(color_name);
  if (!normalized) {
    return palette.cream_deep;
  }

  const direct_match = tinycolor(normalized);
  if (direct_match.isValid()) {
    return direct_match.toHexString();
  }

  const token_matches = normalized.split(/[\s/-]+/).filter(Boolean);

  const spanish_alias = resolve_spanish_color_alias(normalized, token_matches);
  if (spanish_alias) {
    return tinycolor(spanish_alias).toHexString();
  }

  for (const token of token_matches) {
    const token_match = tinycolor(token);
    if (token_match.isValid()) {
      return token_match.toHexString();
    }
  }

  return build_deterministic_color(normalized);
}

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
  4: 'Cálido',
  5: 'Protección Total',
};

function format_date(date_string) {
  const parsed_date = new Date(String(date_string ?? ''));
  if (Number.isNaN(parsed_date.getTime())) {
    return 'Sin dato';
  }

  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const day = parsed_date.getDate();
  const month = months[parsed_date.getMonth()];
  const year = parsed_date.getFullYear();

  return `${day} de ${month}, ${year}`;
}

function relative_time_since(date_string) {
  const parsed = new Date(String(date_string ?? ''));
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now - parsed;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) return 'Hace unos segundos';
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  if (days < 30) {
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  const years = Math.floor(months / 12);
  return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

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
              <FontAwesome6 name="chevron-left" size={16} color={palette.walnut} />
            </Pressable>

            <View style={prenda_detail_screen_styles.header_right_actions}>
              <Pressable
                onPress={handle_toggle_favorite}
                style={prenda_detail_screen_styles.control_button}
              >
                <FontAwesome6
                  name="heart"
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
                <FontAwesome6 name="trash" size={14} color={palette.walnut} />
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
              <FontAwesome6
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
                        { backgroundColor: get_color_hex(color_name) }
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
                  <FontAwesome6 name="calendar-days" size={18} color={palette.walnut} />
                </View>

                <View>
                  <Text selectable style={prenda_detail_screen_styles.info_value}>
                    {format_date(prenda?.fecha_creacion)}
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
            <FontAwesome6 name="xmark" size={18} color={palette.white} />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
