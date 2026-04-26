import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PrendaCreateManualScreen } from '../../../src/features/prendas/screens/prenda-create-manual-screen';
import { select_auth_user_id } from '../../../src/features/auth/selectors';
import { fetch_prendas_for_user } from '../../../src/features/prendas/state/prendas-slice';
import { select_prendas_items, select_prendas_status } from '../../../src/features/prendas/selectors/prendas-selectors';
import { use_app_dispatch, use_app_selector } from '../../../src/store/hooks';
import { palette } from '../../../src/shared/theme/palette';

export default function PrendaEditRoute() {
  const { prenda_id } = useLocalSearchParams();
  const dispatch = use_app_dispatch();
  const auth_user_id = use_app_selector(select_auth_user_id);
  const prendas = use_app_selector(select_prendas_items);
  const prendas_status = use_app_selector(select_prendas_status);

  const prenda = useMemo(
    () => prendas.find((item) => String(item?.id) === String(prenda_id ?? '')),
    [prendas, prenda_id]
  );

  useEffect(() => {
    if (prenda || !auth_user_id || prendas_status === 'loading') {
      return;
    }

    dispatch(fetch_prendas_for_user(auth_user_id));
  }, [auth_user_id, dispatch, prendas_status, prenda]);

  if (!prenda) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.cream,
          paddingHorizontal: 24,
        }}
      >
        <ActivityIndicator size="small" color={palette.walnut} />
        <Text
          selectable
          style={{
            marginTop: 12,
            color: palette.text_muted,
            textAlign: 'center',
          }}
        >
          Cargando prenda...
        </Text>
      </View>
    );
  }

  return <PrendaCreateManualScreen prenda_to_edit={prenda} />;
}