import { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { use_app_selector } from '../../../store/hooks';
import { select_outfits_items } from '../selectors/outfits-selectors';
import { OutfitCreateScreen } from './outfit-create-screen';

export function OutfitEditScreen() {
  const { outfit_id } = useLocalSearchParams();
  const outfits = use_app_selector(select_outfits_items);
  
  const outfit = useMemo(
    () => outfits.find((item) => String(item?.id) === String(outfit_id ?? '')),
    [outfits, outfit_id]
  );

  // Si no carga rápido, no renderizamos nada (o podrías poner un ActivityIndicator)
  if (!outfit) {
    return <View style={{ flex: 1 }} />;
  }

  return <OutfitCreateScreen outfit_to_edit={outfit} />;
}