import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { outfit_edit_screen_styles } from './outfit-edit-screen.styles';

export function OutfitEditScreen() {
  const router = useRouter();

  return (
    <View style={outfit_edit_screen_styles.screen}>
      <Text selectable style={outfit_edit_screen_styles.title}>
        Edición de conjunto
      </Text>
      <Text selectable style={outfit_edit_screen_styles.subtitle}>
        Esta pantalla estará disponible pronto.
      </Text>
      <Pressable onPress={() => router.back()} style={outfit_edit_screen_styles.back_button}>
        <Text selectable style={outfit_edit_screen_styles.back_button_text}>
          Volver
        </Text>
      </Pressable>
    </View>
  );
}
