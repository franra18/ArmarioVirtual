import { Text, View } from 'react-native';
import {
  BoltIcon,
  CloudIcon,
  CloudRainIcon,
  CloudSunIcon,
  SnowflakeIcon,
  SunIcon,
} from '../icons/app-icons';
import { palette } from '../theme/palette';
import { weather_card_styles } from './weather-card.styles';

// Normaliza el texto para mostrarlo con mayuscula inicial.
function capitalize_text(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Elige el icono segun la descripcion del clima.
function WeatherIconSelector({ descripcion, color, size }) {
  const desc = String(descripcion ?? '').toLowerCase();

  if (desc.includes('tormenta') || desc.includes('trueno') || desc.includes('rayo')) {
    return <BoltIcon color={color} size={size} />;
  }
  if (desc.includes('lluvia') || desc.includes('llovizna') || desc.includes('aguacero') || desc.includes('chubasco')) {
    return <CloudRainIcon color={color} size={size} />;
  }
  if (desc.includes('nieve') || desc.includes('nevada')) {
    return <SnowflakeIcon color={color} size={size} />;
  }
  if (desc.includes('nublado') || desc.includes('nubes') || desc.includes('nuboso') || desc.includes('niebla')) {
    if (desc.includes('poco') || desc.includes('parcialmente') || desc.includes('dispersas')) {
      return <CloudSunIcon color={color} size={size} />;
    }
    return <CloudIcon color={color} size={size} />;
  }

  return <SunIcon color={color} size={size} />;
}

// Renderiza una tarjeta de clima reutilizable con datos del backend.
export function WeatherCard({ weather, status = 'idle' }) {
  const weather_temperature = Number(weather?.temperatura_c);
  const weather_temp_text = Number.isNaN(weather_temperature) ? '--' : `${Math.round(weather_temperature)}°`;
  const weather_location = [weather?.ciudad, weather?.pais].filter(Boolean).join(', ');
  const weather_description = capitalize_text(weather?.descripcion);
  const weather_desc_text = status === 'loading'
    ? 'Cargando clima real...'
    : weather
      ? `${weather_description || 'Sin descripcion'}${weather_location ? ` · ${weather_location}` : ''}`
      : 'Clima no disponible';
  const weather_hint_text = status === 'loading'
    ? 'Calculando...'
    : (weather?.sugerencia_ropa ?? 'Sin recomendacion');

  return (
    <View style={weather_card_styles.card}>
      <View style={weather_card_styles.top_row}>
        <View style={weather_card_styles.temp_container}>
          <WeatherIconSelector
            descripcion={weather?.descripcion}
            color={palette.walnut_soft}
            size={31}
          />
          <Text selectable style={weather_card_styles.temp_text}>
            {weather_temp_text}
          </Text>
        </View>

        <View style={weather_card_styles.hint_container}>
          <Text selectable style={weather_card_styles.hint_label}>
            Hoy:
          </Text>
          <Text selectable style={weather_card_styles.hint_text}>
            {weather_hint_text}
          </Text>
        </View>
      </View>

      <Text selectable style={weather_card_styles.desc_text}>
        {weather_desc_text}
      </Text>
    </View>
  );
}
