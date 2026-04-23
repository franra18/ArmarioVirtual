import { ScrollView, Text, View } from 'react-native';
import { use_app_selector } from '../../../store/hooks';
import { select_auth_profile } from '../../auth/selectors';
import {
  ChevronRightIcon,
  ShirtIcon,
  SparklesIcon,
  SunIcon,
} from '../../../shared/icons/app-icons';
import { palette } from '../../../shared/theme/palette';
import { home_screen_styles } from './home-screen.styles';

export function HomeScreen() {
  const profile = use_app_selector(select_auth_profile);
  const nombre = profile?.nombre ?? 'Usuario';
  const prendas_total = profile?.prendas_total ?? 0;
  const outfits_total = profile?.outfits_total ?? 0;
  const recientes = profile?.recientes ?? [];

  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const hoy = new Date();
  const fecha_actual = `${dias[hoy.getDay()]} · ${hoy.getDate()} ${meses[hoy.getMonth()]}`;

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
          Buenos días,
        </Text>
        <Text selectable style={home_screen_styles.name_text}>
          {nombre}.
        </Text>
      </View>

      <View style={home_screen_styles.weather_card}>
        <View style={home_screen_styles.weather_left}>
          <SunIcon color={palette.walnut_soft} size={31} />
          <View>
            <Text selectable style={home_screen_styles.weather_temp_text}>
              22°
            </Text>
            <Text selectable style={home_screen_styles.weather_desc_text}>
              Soleado · Mijas, Malaga
            </Text>
          </View>
        </View>
        <View style={home_screen_styles.weather_right}>
          <Text selectable style={home_screen_styles.weather_day_text}>
            Hoy
          </Text>
          <Text selectable style={home_screen_styles.weather_hint_text}>
            Ropa ligera
          </Text>
        </View>
      </View>

      <View style={home_screen_styles.wardrobe_section}>
        <Text selectable style={home_screen_styles.section_title}>
          Mi Armario
        </Text>
        <View style={home_screen_styles.stats_row}>
          <View style={home_screen_styles.stats_card}>
            <View style={home_screen_styles.stats_card_header}>
              <Text selectable style={home_screen_styles.stats_card_title}>
                Prendas
              </Text>
              <ShirtIcon color={palette.walnut_soft} size={20} />
            </View>
            <Text selectable style={home_screen_styles.stats_card_value}>
              {prendas_total}
            </Text>
          </View>

          <View style={home_screen_styles.stats_card}>
            <View style={home_screen_styles.stats_card_header}>
              <Text selectable style={home_screen_styles.stats_card_title}>
                Outfits
              </Text>
              <ShirtIcon color={palette.walnut_soft} size={20} />
            </View>
            <Text selectable style={home_screen_styles.stats_card_value}>
              {outfits_total}
            </Text>
          </View>
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
              Dime a donde vas y compongo tu look.
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
          <Text selectable style={home_screen_styles.recent_header_link}>
            Ver más
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={home_screen_styles.recent_list_content}
        >
          {recientes.map((prenda, index) => (
            <View key={`${prenda}-${index}`} style={home_screen_styles.recent_item}>
              <View style={home_screen_styles.recent_item_icon_container}>
                <ShirtIcon color={palette.walnut_soft} size={18} />
              </View>
              <Text selectable style={home_screen_styles.recent_item_name}>
                {prenda}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
