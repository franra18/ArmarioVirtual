import { ScrollView, Text, View } from 'react-native';
import { use_app_selector } from '../../../store/hooks';
import { select_auth_profile } from '../../auth/selectors';
import {
  ChevronRightIcon,
  HangerIcon,
  LayeredShirtIcon,
  ShirtIcon,
  SparklesIcon,
  SunIcon,
} from '../../../shared/icons/app-icons';
import { palette, typography } from '../../../shared/theme/palette';

export function HomeScreen() {
  const profile = use_app_selector(select_auth_profile);
  const nombre = profile?.nombre ?? 'Usuario';
  const prendas_total = profile?.prendas_total ?? 0;
  const outfits_total = profile?.outfits_total ?? 0;
  const recientes = profile?.recientes ?? [];

  // Código para formatear la fecha actual en español
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const hoy = new Date();
  const fechaActual = `${dias[hoy.getDay()]} · ${hoy.getDate()} ${meses[hoy.getMonth()]}`;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: palette.cream }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 6 }}>
        <Text
          selectable
          style={{
            fontFamily: typography.body_medium,
            color: palette.walnut_soft,
            fontSize: 14,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {fechaActual}
        </Text>
        <Text
          selectable
          style={{ fontFamily: typography.display, color: palette.walnut_deep, fontSize: 44, lineHeight: 52 }}
        >
          Buenos días,
        </Text>
        <Text
          selectable
          style={{
            fontFamily: typography.display,
            fontStyle: 'italic',
            color: palette.sky_ink,
            fontSize: 44,
            lineHeight: 52,
          }}
        >
          {nombre}.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: palette.sky_deep,
          borderRadius: 22,
          borderCurve: 'continuous',
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 18px rgba(74, 126, 151, 0.25)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <SunIcon color={palette.walnut_soft} size={31} />
          <View>
            <Text
              selectable
              style={{
                fontFamily: typography.display,
                color: palette.walnut_deep,
                fontSize: 36,
                lineHeight: 38,
                fontVariant: ['tabular-nums'],
              }}
            >
              22°
            </Text>
            <Text selectable style={{ fontFamily: typography.body, color: palette.walnut, fontSize: 15 }}>
              Soleado · Mijas, Malaga
            </Text>
          </View>
        </View>
        <View>
          <Text
            selectable
            style={{
              fontFamily: typography.body_medium,
              color: palette.walnut,
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              textAlign: 'right',
            }}
          >
            Hoy
          </Text>
          <Text selectable style={{ fontFamily: typography.body_medium, color: palette.walnut_deep, fontSize: 17 }}>
            Ropa ligera
          </Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text
          selectable
          style={{
            fontFamily: typography.display,
            color: palette.walnut,
            fontSize: 24,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Mi Armario
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderCurve: 'continuous',
              backgroundColor: palette.cream_deep,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text selectable style={{ fontFamily: typography.display, color: palette.walnut, fontSize: 34 }}>
                Prendas
              </Text>
              <ShirtIcon color={palette.walnut_soft} size={20} />
            </View>
            <Text
              selectable
              style={{
                fontFamily: typography.display,
                color: palette.walnut_deep,
                fontSize: 44,
                lineHeight: 44,
                fontVariant: ['tabular-nums'],
              }}
            >
              {prendas_total}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderCurve: 'continuous',
              backgroundColor: palette.cream_deep,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text selectable style={{ fontFamily: typography.display, color: palette.walnut, fontSize: 34 }}>
                Outfits
              </Text>
              <LayeredShirtIcon color={palette.walnut_soft} size={20} />
            </View>
            <Text
              selectable
              style={{
                fontFamily: typography.display,
                color: palette.walnut_deep,
                fontSize: 44,
                lineHeight: 44,
                fontVariant: ['tabular-nums'],
              }}
            >
              {outfits_total}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          borderRadius: 24,
          borderCurve: 'continuous',
          backgroundColor: palette.walnut_deep,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 18px rgba(74, 51, 30, 0.25)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View
            style={{
              backgroundColor: palette.sky,
              borderRadius: 14,
              borderCurve: 'continuous',
              height: 44,
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SparklesIcon color={palette.walnut} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable style={{ color: palette.white, fontFamily: typography.display, fontSize: 32 }}>
              Outfit con IA
            </Text>
            <Text selectable style={{ color: palette.cream_deep, fontFamily: typography.body, fontSize: 14 }}>
              Dime a donde vas y compongo tu look.
            </Text>
          </View>
        </View>
        <ChevronRightIcon color={palette.white} size={16} />
      </View>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            selectable
            style={{
              fontFamily: typography.display,
              color: palette.walnut,
              fontSize: 20,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Añadidos recientemente
          </Text>
          <Text selectable style={{ color: palette.sky_ink, fontFamily: typography.body_medium, fontSize: 15 }}>
            Ver más
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 6 }}
        >
          {recientes.map((prenda, index) => (
            <View
              key={`${prenda}-${index}`}
              style={{
                width: 122,
                borderRadius: 16,
                borderCurve: 'continuous',
                backgroundColor: palette.cream_deep,
                padding: 12,
                gap: 8,
              }}
            >
              <View
                style={{
                  height: 58,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: palette.cream,
                }}
              >
                <HangerIcon color={palette.walnut_soft} size={18} />
              </View>
              <Text selectable style={{ color: palette.walnut_deep, fontFamily: typography.body_medium, fontSize: 14 }}>
                {prenda}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
