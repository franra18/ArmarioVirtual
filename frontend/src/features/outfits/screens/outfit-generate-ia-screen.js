import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { palette } from '../../../shared/theme/palette';
import { WeatherCard } from '../../../shared/components/weather-card';
import { fetch_current_weather_from_backend } from '../../../shared/api/clima-api';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { create_outfit_from_ia } from '../state/outfits-slice';
import { select_outfits_ia_error, select_outfits_ia_status } from '../selectors/outfits-selectors';
import {
  outfit_generate_ia_styles,
  prompt_placeholder_color,
} from './outfit-generate-ia-screen.styles';

const plan_options = ['Cena formal', 'Partido', 'Boda'];
const style_options = ['Relajado', 'Elegante', 'Deportivo', 'Sorprendeme'];

// Normaliza una coordenada a maximo dos decimales.
function normalize_coordinate(value) {
  const parsed_value = Number(value);
  if (Number.isNaN(parsed_value)) {
    return null;
  }

  return Number.parseFloat(parsed_value.toFixed(2));
}

// Construye el prompt final combinando texto, ocasion y estilo.
function build_prompt_text({ base_text, ocasion, estilo }) {
  const parts = [];
  const normalized_text = String(base_text ?? '').trim();

  if (normalized_text) {
    parts.push(normalized_text);
  }

  if (ocasion) {
    parts.push(`Ocasion: ${ocasion}.`);
  }

  if (estilo) {
    parts.push(`Estilo: ${estilo}.`);
  }

  return parts.join(' ').trim();
}

// Renderiza la pantalla de generacion de outfit con IA.
export function OutfitGenerateIaScreen() {
  const router = useRouter();
  const dispatch = use_app_dispatch();
  const auth_user_id = use_app_selector(select_auth_user_id);
  const ia_status = use_app_selector(select_outfits_ia_status);
  const ia_error = use_app_selector(select_outfits_ia_error);
  const is_ios = process.env.EXPO_OS === 'ios';

  const [prompt_text, set_prompt_text] = useState('');
  const [selected_plan, set_selected_plan] = useState('');
  const [selected_style, set_selected_style] = useState('');
  const [is_custom_ocasion, set_is_custom_ocasion] = useState(false);
  const [custom_ocasion, set_custom_ocasion] = useState('');
  const [include_weather, set_include_weather] = useState(true);
  const [weather_data, set_weather_data] = useState(null);
  const [weather_status, set_weather_status] = useState('idle');
  const [weather_coords, set_weather_coords] = useState(null);
  const [local_error, set_local_error] = useState('');
  const [is_processing_submission, set_is_processing_submission] = useState(false);

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
        set_weather_coords({
          lat: normalize_coordinate(current_position.coords.latitude),
          lon: normalize_coordinate(current_position.coords.longitude),
        });
        set_weather_status('succeeded');
      } catch {
        if (is_cancelled) {
          return;
        }

        set_weather_data(null);
        set_weather_coords(null);
        set_weather_status('failed');
      }
    };

    void load_current_weather();

    return () => {
      is_cancelled = true;
    };
  }, []);

  const resolved_ocasion = is_custom_ocasion ? custom_ocasion : selected_plan;
  const prompt_preview = useMemo(
    () => build_prompt_text({ base_text: prompt_text, ocasion: resolved_ocasion, estilo: selected_style }),
    [custom_ocasion, is_custom_ocasion, prompt_text, selected_plan, selected_style]
  );
  const prompt_length = prompt_preview.length;
  const weather_location = useMemo(
    () => [weather_data?.ciudad, weather_data?.pais].filter(Boolean).join(', '),
    [weather_data]
  );

  const handle_submit = async () => {
    set_local_error('');

    if (!auth_user_id) {
      set_local_error('Necesitas iniciar sesion para generar un outfit');
      return;
    }

    if (!prompt_preview) {
      set_local_error('Escribe el plan o selecciona una ocasion');
      return;
    }

    if (prompt_preview.length > 250) {
      set_local_error('El prompt supera los 250 caracteres');
      return;
    }

    if (include_weather && (!weather_coords || weather_coords.lat == null || weather_coords.lon == null)) {
      set_local_error('No pudimos obtener tu ubicacion para el clima');
      return;
    }

    const payload = {
      usuario_id: auth_user_id,
      prompt: prompt_preview,
      ...(include_weather && weather_coords ? { lat: weather_coords.lat, lon: weather_coords.lon } : {}),
    };

    set_is_processing_submission(true);
    try {
      const created_outfit = await dispatch(create_outfit_from_ia(payload)).unwrap();
      router.replace(`/conjuntos/${created_outfit.id}`);
    } catch (error) {
      set_local_error(error?.message ?? 'No se pudo generar el outfit');
    } finally {
      set_is_processing_submission(false);
    }
  };

  const is_submitting = ia_status === 'loading' || is_processing_submission;
  const is_submit_disabled = is_submitting;
  const visible_error = local_error || ia_error;

  return (
    <KeyboardAvoidingView
      style={outfit_generate_ia_styles.screen}
      behavior={is_ios ? 'padding' : 'height'}
      keyboardVerticalOffset={8}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={outfit_generate_ia_styles.screen}
        contentContainerStyle={outfit_generate_ia_styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={outfit_generate_ia_styles.header_row}>
          <Pressable onPress={() => router.back()} style={outfit_generate_ia_styles.header_action}>
            <Text selectable style={outfit_generate_ia_styles.header_action_text}>
              Cancelar
            </Text>
          </Pressable>

          <Text selectable style={outfit_generate_ia_styles.header_title}>
            Generacion outfit (IA)
          </Text>

          <View style={outfit_generate_ia_styles.header_action} />
        </View>

        <View style={outfit_generate_ia_styles.section}>
          <Text selectable style={outfit_generate_ia_styles.section_title}>
            A donde vas?
          </Text>
          <Text selectable style={outfit_generate_ia_styles.section_subtitle}>
            Cuentame el plan y compongo un conjunto con tu ropa.
          </Text>

          <View style={outfit_generate_ia_styles.prompt_card}>
            <TextInput
              value={prompt_text}
              onChangeText={set_prompt_text}
              style={outfit_generate_ia_styles.prompt_input}
              placeholder="Describe tu plan"
              placeholderTextColor={prompt_placeholder_color}
              multiline
              maxLength={250}
              returnKeyType="done"
            />
            <View style={outfit_generate_ia_styles.prompt_footer}>
              <Text selectable style={outfit_generate_ia_styles.prompt_count}>
                {prompt_length}/250
              </Text>
            </View>
          </View>

          <View style={outfit_generate_ia_styles.chips_row}>
            {plan_options.map((option) => {
              const is_active = option === selected_plan && !is_custom_ocasion;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    set_is_custom_ocasion(false);
                    set_custom_ocasion('');
                    set_selected_plan(is_active ? '' : option);
                  }}
                  style={[
                    outfit_generate_ia_styles.chip,
                    is_active ? outfit_generate_ia_styles.chip_active : null,
                  ]}
                >
                  <Text
                    selectable
                    style={[
                      outfit_generate_ia_styles.chip_text,
                      is_active ? outfit_generate_ia_styles.chip_text_active : null,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={outfit_generate_ia_styles.section}>
          <View style={outfit_generate_ia_styles.clima_header_row}>
            <View style={outfit_generate_ia_styles.clima_left}>
              <Text selectable style={outfit_generate_ia_styles.clima_label}>
                CLIMA
              </Text>
              <Text selectable style={outfit_generate_ia_styles.clima_hint}>
                Incluir en el prompt
              </Text>
            </View>
            <Switch
              value={include_weather}
              onValueChange={set_include_weather}
              trackColor={{ false: palette.cream_deep, true: palette.walnut_soft }}
              thumbColor={include_weather ? palette.walnut : palette.cream}
              ios_backgroundColor={palette.cream_deep}
            />
          </View>

          <View
            style={[
              outfit_generate_ia_styles.weather_card_wrap,
              !include_weather ? outfit_generate_ia_styles.weather_card_disabled : null,
            ]}
          >
            <WeatherCard weather={weather_data} status={weather_status} />
          </View>
        </View>

        <View style={outfit_generate_ia_styles.section}>
          <View style={outfit_generate_ia_styles.section_header_row}>
            <Text selectable style={outfit_generate_ia_styles.section_label}>
              ESTILO
            </Text>
            <Text selectable style={outfit_generate_ia_styles.section_hint}>
              opcional
            </Text>
          </View>

          <View style={outfit_generate_ia_styles.chips_row}>
            {style_options.map((option) => {
              const is_active = option === selected_style;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    set_is_custom_ocasion(false);
                    set_custom_ocasion('');
                    set_selected_style(is_active ? '' : option);
                  }}
                  style={[
                    outfit_generate_ia_styles.chip,
                    is_active ? outfit_generate_ia_styles.chip_active : null,
                  ]}
                >
                  <Text
                    selectable
                    style={[
                      outfit_generate_ia_styles.chip_text,
                      is_active ? outfit_generate_ia_styles.chip_text_active : null,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                set_is_custom_ocasion((current) => !current);
                set_selected_plan('');
                set_selected_style('');
              }}
              style={[
                outfit_generate_ia_styles.chip,
                is_custom_ocasion ? outfit_generate_ia_styles.chip_active : null,
              ]}
            >
              <Text
                selectable
                style={[
                  outfit_generate_ia_styles.chip_text,
                  is_custom_ocasion ? outfit_generate_ia_styles.chip_text_active : null,
                ]}
              >
                + Otro
              </Text>
            </Pressable>
          </View>

          {is_custom_ocasion && (
            <View style={outfit_generate_ia_styles.input_card}>
              <TextInput
                value={custom_ocasion}
                onChangeText={set_custom_ocasion}
                style={outfit_generate_ia_styles.input}
                placeholder="Escribe la ocasion"
                placeholderTextColor={prompt_placeholder_color}
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        {Boolean(visible_error) && (
          <View style={outfit_generate_ia_styles.error_banner}>
            <Text selectable style={outfit_generate_ia_styles.error_text}>
              {visible_error}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handle_submit}
          disabled={is_submit_disabled}
          style={[
            outfit_generate_ia_styles.submit_button,
            is_submit_disabled ? outfit_generate_ia_styles.submit_button_disabled : null,
          ]}
        >
          {is_submitting ? (
            <ActivityIndicator size="small" color={palette.white} />
          ) : (
            <Text selectable style={outfit_generate_ia_styles.submit_button_text}>
              Generar outfit
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
