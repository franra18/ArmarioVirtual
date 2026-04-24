import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { palette } from '../../../shared/theme/palette';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { delete_prenda_by_id, fetch_prendas_for_user } from '../state/prendas-slice';
import {
  select_prendas_delete_status,
  select_prendas_items,
  select_prendas_status,
} from '../selectors/prendas-selectors';
import { prenda_detail_screen_styles } from './prenda-detail-screen.styles';

const hidden_field_keys = new Set(['id', 'usuario_id', 'foto_url']);

const preferred_field_keys = [
  'nombre',
  'tipo_prenda',
  'nivel_elegancia',
  'nivel_abrigo',
  'color_nombres',
  'fecha_creacion',
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
  4: 'Calido',
  5: 'Proteccion Total',
};

function normalize_string(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function to_title_case(value) {
  return String(value ?? '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function resolve_icon_name(tipo_prenda) {
  const normalized_tipo = normalize_string(tipo_prenda);

  if (normalized_tipo.includes('calcetin') || normalized_tipo.includes('sock')) {
    return 'socks';
  }

  if (normalized_tipo.includes('zapa') || normalized_tipo.includes('shoe') || normalized_tipo.includes('bota')) {
    return 'shoe-prints';
  }

  if (normalized_tipo.includes('gorra') || normalized_tipo.includes('sombrero')) {
    return 'hat-cowboy-side';
  }

  if (normalized_tipo.includes('vestido')) {
    return 'person-dress';
  }

  return 'shirt';
}

function format_field_label(field_key) {
  const labels_by_key = {
    nombre: 'Nombre',
    tipo_prenda: 'Tipo de prenda',
    nivel_abrigo: 'Nivel de abrigo',
    nivel_elegancia: 'Nivel de elegancia',
    foto_url: 'Foto URL',
    color_nombres: 'Colores',
    fecha_creacion: 'Fecha de registro',
  };

  if (labels_by_key[field_key]) {
    return labels_by_key[field_key];
  }

  return to_title_case(field_key);
}

function format_level_value(level_value, labels_by_level) {
  const numeric_level = Number(level_value);
  if (Number.isNaN(numeric_level)) {
    return 'Sin dato';
  }

  const label = labels_by_level[numeric_level];
  return label ? `${numeric_level} · ${label}` : String(numeric_level);
}

function format_datetime_value(raw_value) {
  const parsed_date = new Date(String(raw_value ?? ''));
  if (Number.isNaN(parsed_date.getTime())) {
    return 'Sin dato';
  }

  return parsed_date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function format_field_value(field_key, field_value) {
  if (field_value == null) {
    return 'Sin dato';
  }

  if (field_key === 'nivel_elegancia') {
    return format_level_value(field_value, elegance_level_labels);
  }

  if (field_key === 'nivel_abrigo') {
    return format_level_value(field_value, warmth_level_labels);
  }

  if (field_key === 'fecha_creacion') {
    return format_datetime_value(field_value);
  }

  if (Array.isArray(field_value)) {
    return field_value.length > 0 ? field_value.join(', ') : 'Sin colores asociados';
  }

  const as_text = String(field_value).trim();
  if (!as_text) {
    return 'Sin dato';
  }

  return as_text;
}

export function PrendaDetailScreen() {
  const router = useRouter();
  const { prenda_id } = useLocalSearchParams();
  const dispatch = use_app_dispatch();
  const auth_user_id = use_app_selector(select_auth_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const prendas_status = use_app_selector(select_prendas_status);
  const delete_status = use_app_selector(select_prendas_delete_status);

  const prenda = useMemo(
    () => prendas.find((item) => String(item?.id) === String(prenda_id ?? '')),
    [prendas, prenda_id]
  );
  const prenda_image_url = useMemo(() => resolve_prenda_image_url(prenda?.foto_url), [prenda?.foto_url]);
  const [is_image_fullscreen_open, set_is_image_fullscreen_open] = useState(false);

  useEffect(() => {
    if (prenda || !auth_user_id || prendas_status === 'loading') {
      return;
    }

    dispatch(fetch_prendas_for_user(auth_user_id));
  }, [auth_user_id, dispatch, prenda, prendas_status]);

  const detail_fields = useMemo(() => {
    if (!prenda) {
      return [];
    }

    const entries = Object.entries(prenda).filter(([field_key]) => !hidden_field_keys.has(field_key));
    const values_by_key = new Map(entries);
    const ordered_keys = [
      ...preferred_field_keys,
      ...entries.map(([field_key]) => field_key),
    ];

    const unique_ordered_keys = ordered_keys.filter(
      (field_key, index) => ordered_keys.indexOf(field_key) === index && !hidden_field_keys.has(field_key)
    );

    return unique_ordered_keys.map((field_key) => ({
        key: field_key,
        label: format_field_label(field_key),
        value: format_field_value(field_key, values_by_key.get(field_key) ?? null),
      }));
  }, [prenda]);

  const handle_edit_press = () => {
    Alert.alert('Editar prenda', 'Accion disponible proximamente.');
  };

  const is_deleting = delete_status === 'loading';

  const execute_delete_prenda = async () => {
    if (!prenda?.id) {
      return;
    }

    try {
      await dispatch(delete_prenda_by_id(prenda.id)).unwrap();
      Alert.alert('Prenda eliminada', 'La prenda se elimino correctamente.', [
        {
          text: 'Aceptar',
          onPress: () => {
            router.replace('/(tabs)/items');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('No se pudo eliminar', String(error ?? 'No se pudo eliminar la prenda.'));
    }
  };

  const handle_delete_press = () => {
    if (is_deleting) {
      return;
    }

    Alert.alert('Eliminar prenda', 'Esta accion no se puede deshacer. Deseas continuar?', [
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

  const handle_open_fullscreen_image = () => {
    if (!prenda_image_url) {
      return;
    }

    set_is_image_fullscreen_open(true);
  };

  const handle_close_fullscreen_image = () => {
    set_is_image_fullscreen_open(false);
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

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={prenda_detail_screen_styles.screen}
      contentContainerStyle={prenda_detail_screen_styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={prenda_detail_screen_styles.top_bar}>
        <Pressable onPress={() => router.back()} style={prenda_detail_screen_styles.back_button}>
          <FontAwesome6 name="chevron-left" size={14} color={palette.walnut} />
        </Pressable>

        <View style={prenda_detail_screen_styles.right_actions}>
          <Pressable onPress={handle_edit_press} style={prenda_detail_screen_styles.action_button}>
            <FontAwesome6 name="pen" size={14} color={palette.walnut} />
          </Pressable>
          <Pressable
            onPress={handle_delete_press}
            style={prenda_detail_screen_styles.action_button}
            disabled={is_deleting}
          >
            <FontAwesome6 name="trash" size={14} color={palette.walnut} />
          </Pressable>
        </View>
      </View>

      <Text selectable style={prenda_detail_screen_styles.title}>
        {prenda?.nombre ?? 'Detalle de prenda'}
      </Text>

      <View style={prenda_detail_screen_styles.visual_card}>
        {prenda_image_url ? (
          <Pressable
            onPress={handle_open_fullscreen_image}
            style={prenda_detail_screen_styles.visual_image_pressable}
          >
            <Image
              source={{ uri: prenda_image_url }}
              style={prenda_detail_screen_styles.visual_image}
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <FontAwesome6
            name={resolve_icon_name(prenda?.tipo_prenda)}
            size={82}
            color={palette.walnut}
          />
        )}
      </View>

      <View style={prenda_detail_screen_styles.fields_card}>
        {detail_fields.map((field, index) => (
          <View
            key={field.key}
            style={[
              prenda_detail_screen_styles.field_row,
              index === detail_fields.length - 1 ? prenda_detail_screen_styles.field_row_last : null,
            ]}
          >
            <Text selectable style={prenda_detail_screen_styles.field_label}>
              {field.label}
            </Text>
            <Text selectable style={prenda_detail_screen_styles.field_value}>
              {field.value}
            </Text>
          </View>
        ))}
      </View>

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
    </ScrollView>
  );
}
