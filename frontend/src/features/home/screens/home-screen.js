import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import { select_auth_profile, select_auth_user_id } from '../../auth/selectors';
import { fetch_current_weather_from_backend } from '../api/home-api';
import { fetch_prendas_for_user } from '../../prendas/state/prendas-slice';
import {
  select_prendas_items,
  select_prendas_loaded_user_id,
  select_prendas_status,
} from '../../prendas/selectors/prendas-selectors';
import {
  ChevronRightIcon,
  ShirtIcon,
  SparklesIcon,
  SunIcon,
  ConjuntosIcon,
} from '../../../shared/icons/app-icons';
import { palette } from '../../../shared/theme/palette';
import { home_screen_styles } from './home-screen.styles';

function get_prenda_created_sort_value(prenda) {
  const parsed_date = Date.parse(String(prenda?.fecha_creacion ?? ''));
  if (!Number.isNaN(parsed_date)) {
    return parsed_date;
  }

  const numeric_id = Number(prenda?.id);
  return Number.isNaN(numeric_id) ? 0 : numeric_id;
}

function capitalize_text(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function HomeScreen() {
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const profile = use_app_selector(select_auth_profile);
  const auth_user_id = use_app_selector(select_auth_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const prendas_status = use_app_selector(select_prendas_status);
  const prendas_loaded_user_id = use_app_selector(select_prendas_loaded_user_id);
  const [weather_data, set_weather_data] = useState(null);
  const [weather_status, set_weather_status] = useState('idle');
  const nombre = profile?.nombre ?? 'Usuario';
  const prendas_total = profile?.prendas_total ?? 0;
  const outfits_total = profile?.outfits_total ?? 0;

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

  useEffect(() => {
    let is_cancelled = false;

    const load_current_weather = async () => {
      set_weather_status('loading');

      try {
        const permission_response = await Location.requestForegroundPermissionsAsync();
        if (permission_response.status !== 'granted') {
          throw new Error('Permiso de ubicacion denegado');
        }

        const current_position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const clima_actual = await fetch_current_weather_from_backend(
          current_position.coords.latitude,
          current_position.coords.longitude
        );

        if (is_cancelled) {
          return;
        }

        set_weather_data(clima_actual);
        set_weather_status('succeeded');
      } catch {
        if (is_cancelled) {
          return;
        }

        set_weather_data(null);
        set_weather_status('failed');
      }
    };

    void load_current_weather();

    return () => {
      is_cancelled = true;
    };
  }, []);

  const recientes = useMemo(() => {
    const ordered_prendas = [...prendas].sort(
      (left_prenda, right_prenda) => get_prenda_created_sort_value(right_prenda) - get_prenda_created_sort_value(left_prenda)
    );

    return ordered_prendas.slice(0, 5);
  }, [prendas]);

  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const hoy = new Date();
  const hora_actual = hoy.getHours();
  const saludo = hora_actual < 6
    ? 'Buenas noches,'
    : hora_actual < 12
      ? 'Buenos días,'
      : hora_actual < 20
        ? 'Buenas tardes,'
        : 'Buenas noches,';
  const fecha_actual = `${dias[hoy.getDay()]} · ${hoy.getDate()} ${meses[hoy.getMonth()]}`;
  const weather_temperature = Number(weather_data?.temperatura_c);
  const weather_temp_text = Number.isNaN(weather_temperature) ? '--' : `${Math.round(weather_temperature)}°`;
  const weather_location = [weather_data?.ciudad, weather_data?.pais].filter(Boolean).join(', ');
  const weather_description = capitalize_text(weather_data?.descripcion);
  const weather_desc_text = weather_status === 'loading'
    ? 'Cargando clima real...'
    : weather_data
      ? `${weather_description || 'Sin descripcion'}${weather_location ? ` · ${weather_location}` : ''}`
      : 'Clima no disponible';
  const weather_hint_text = weather_status === 'loading'
    ? 'Calculando...'
    : (weather_data?.sugerencia_ropa ?? 'Sin recomendacion');

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={home_screen_styles.screen}
      contentContainerStyle={home_screen_styles.screen_content}
      showsVerticalScrollIndicator={false}
    >
      <View style={home_screen_styles.greeting_section}>
        <Text selectable style={home_screen_styles.date_text}>
          {fecha_actual}
        </Text>
        <Text selectable style={home_screen_styles.greeting_text}>
          {saludo}
        </Text>
        <Text selectable style={home_screen_styles.name_text}>
          {nombre}.
        </Text>
      </View>

      <View style={home_screen_styles.weather_card}>
        
        <View style={home_screen_styles.weather_top_row}>
          <View style={home_screen_styles.weather_temp_container}>
            <SunIcon color={palette.walnut_soft} size={31} />
            <Text selectable style={home_screen_styles.weather_temp_text}>
              {weather_temp_text}
            </Text>
          </View>
          
          <View style={home_screen_styles.weather_hint_container}>
            <Text selectable style={home_screen_styles.weather_day_text}>
              Hoy:
            </Text>
            <Text selectable style={home_screen_styles.weather_hint_text}>
              {weather_hint_text}
            </Text>
          </View>
        </View>

        <Text selectable style={home_screen_styles.weather_desc_text}>
          {weather_desc_text}
        </Text>

      </View>

      <View style={home_screen_styles.wardrobe_section}>
        <Text selectable style={home_screen_styles.section_title}>
          Mi Armario
        </Text>
        <View style={home_screen_styles.stats_row}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/items')}
            style={({ pressed }) => [
              home_screen_styles.stats_card,
              pressed ? home_screen_styles.stats_card_pressed : null,
            ]}
          >
            <View style={home_screen_styles.stats_card_header}>
              <Text selectable style={home_screen_styles.stats_card_title}>
                Prendas
              </Text>
              <ShirtIcon color={palette.walnut_soft} size={20} />
            </View>
            <Text selectable style={home_screen_styles.stats_card_value}>
              {prendas_total}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/conjuntos')}
            style={({ pressed }) => [
              home_screen_styles.stats_card,
              pressed ? home_screen_styles.stats_card_pressed : null,
            ]}
          >
            <View style={home_screen_styles.stats_card_header}>
              <Text selectable style={home_screen_styles.stats_card_title}>
                Outfits
              </Text>
              <ConjuntosIcon color={palette.walnut_soft} size={20} />
            </View>
            <Text selectable style={home_screen_styles.stats_card_value}>
              {outfits_total}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={home_screen_styles.ia_card}>
        <View style={home_screen_styles.ia_card_left}>
          <View style={home_screen_styles.ia_icon_chip}>
            <SparklesIcon color={palette.walnut} size={18} />
          </View>
          <View style={home_screen_styles.ia_copy}>
            <Text selectable style={home_screen_styles.ia_title}>
              Outfit con IA
            </Text>
            <Text selectable style={home_screen_styles.ia_subtitle}>
              Dime a dónde vas y compongo tu look.
            </Text>
          </View>
        </View>
        <ChevronRightIcon color={palette.white} size={16} />
      </View>

      <View style={home_screen_styles.recent_section}>
        <View style={home_screen_styles.recent_header}>
          <Text selectable style={home_screen_styles.recent_header_title}>
            Añadidos recientemente
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/items')} hitSlop={8}>
            <Text selectable style={home_screen_styles.recent_header_link}>
              Ver más
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={home_screen_styles.recent_list_content}
        >
          {recientes.map((prenda) => {
            const prenda_image_url = resolve_prenda_image_url(prenda?.foto_url);

            return (
              <Pressable
                key={String(prenda?.id)}
                onPress={() => router.push(`/prendas/${prenda?.id}`)}
                style={({ pressed }) => [
                  home_screen_styles.recent_item,
                  pressed ? home_screen_styles.recent_item_pressed : null,
                ]}
              >
                <View style={home_screen_styles.recent_item_image_container}>
                  {prenda_image_url ? (
                    <Image
                      source={{ uri: prenda_image_url }}
                      style={home_screen_styles.recent_item_image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={home_screen_styles.recent_item_image_fallback}>
                      <Text selectable style={home_screen_styles.recent_item_image_fallback_text}>
                        Sin foto
                      </Text>
                    </View>
                  )}
                </View>

                <Text selectable style={home_screen_styles.recent_item_name} numberOfLines={2}>
                  {prenda?.nombre ?? `Prenda ${prenda?.id ?? ''}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
