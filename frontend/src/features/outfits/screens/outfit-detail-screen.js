import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    BackIcon,
    CalendarIcon,
    ChevronRightIcon,
    HeartIcon,
    ShirtIcon,
    TrashIcon,
    SparklesIcon,
} from '../../../shared/icons/app-icons';
import { palette } from '../../../shared/theme/palette';
import { resolve_prenda_image_url } from '../../../shared/utils/cloudinary';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { select_auth_user_id } from '../../auth/selectors';
import { fetch_prendas_for_user } from '../../prendas/state/prendas-slice';
import {
    select_prendas_items,
    select_prendas_loaded_user_id,
    select_prendas_status,
} from '../../prendas/selectors/prendas-selectors';
import { delete_outfit_by_id, fetch_outfits_for_user, toggle_outfit_favorite } from '../state/outfits-slice';
import {
    select_outfits_delete_status,
    select_outfits_favorite_ids,
    select_outfits_items,
    select_outfits_loaded_user_id,
    select_outfits_status,
} from '../selectors/outfits-selectors';
import { outfit_detail_screen_styles } from './outfit-detail-screen.styles';

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
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
    ];
    const day = parsed_date.getDate();
    const month = months[parsed_date.getMonth()];
    const year = parsed_date.getFullYear();

    return `${day} ${month} ${year}`;
}

function build_prenda_meta(prenda) {
    const color_names = Array.isArray(prenda?.color_nombres) ? prenda.color_nombres : [];
    const color_label = color_names.length ? color_names[0] : 'Sin color';
    const warmth_label = warmth_level_labels[Number(prenda?.nivel_abrigo)] ?? 'Sin abrigo';
    const elegance_label = elegance_level_labels[Number(prenda?.nivel_elegancia)] ?? 'Sin elegancia';
    return `${color_label} · ${warmth_label} · ${elegance_label}`;
}

export function OutfitDetailScreen() {
    const router = useRouter();
    const { outfit_id } = useLocalSearchParams();
    const dispatch = use_app_dispatch();
    const auth_user_id = use_app_selector(select_auth_user_id);
    const outfits = use_app_selector(select_outfits_items);
    const outfits_status = use_app_selector(select_outfits_status);
    const outfits_loaded_user_id = use_app_selector(select_outfits_loaded_user_id);
    const favorite_ids = use_app_selector(select_outfits_favorite_ids);
    const delete_status = use_app_selector(select_outfits_delete_status);
    const prendas = use_app_selector(select_prendas_items);
    const prendas_status = use_app_selector(select_prendas_status);
    const prendas_loaded_user_id = use_app_selector(select_prendas_loaded_user_id);

    const outfit = useMemo(
        () => outfits.find((item) => String(item?.id) === String(outfit_id ?? '')),
        [outfits, outfit_id]
    );

    useEffect(() => {
        if (!auth_user_id || outfits_status === 'loading') {
            return;
        }

        const has_data_for_user = (
            String(outfits_loaded_user_id ?? '') === String(auth_user_id)
            && outfits_status === 'succeeded'
        );

        if (has_data_for_user) {
            return;
        }

        dispatch(fetch_outfits_for_user(auth_user_id));
    }, [auth_user_id, dispatch, outfits_loaded_user_id, outfits_status]);

    useEffect(() => {
        if (!auth_user_id || prendas_status === 'loading') {
            return;
        }

        const has_prendas_for_user = (
            String(prendas_loaded_user_id ?? '') === String(auth_user_id)
            && prendas_status === 'succeeded'
        );

        if (has_prendas_for_user) {
            return;
        }

        dispatch(fetch_prendas_for_user(auth_user_id));
    }, [auth_user_id, dispatch, prendas_loaded_user_id, prendas_status]);

    if (!auth_user_id) {
        return (
            <View style={outfit_detail_screen_styles.empty_wrap}>
                <Text selectable style={outfit_detail_screen_styles.empty_title}>
                    Inicia sesión
                </Text>
                <Text selectable style={outfit_detail_screen_styles.empty_subtitle}>
                    Necesitas iniciar sesión para ver este conjunto.
                </Text>
            </View>
        );
    }

    if (!outfit && outfits_status === 'loading') {
        return (
            <View style={outfit_detail_screen_styles.empty_wrap}>
                <ActivityIndicator size="small" color={palette.walnut} />
                <Text selectable style={outfit_detail_screen_styles.empty_subtitle}>
                    Cargando conjunto...
                </Text>
            </View>
        );
    }

    if (!outfit) {
        return (
            <View style={outfit_detail_screen_styles.empty_wrap}>
                <Text selectable style={outfit_detail_screen_styles.empty_title}>
                    Conjunto no encontrado
                </Text>
                <Text selectable style={outfit_detail_screen_styles.empty_subtitle}>
                    No hemos podido cargar el detalle de este conjunto.
                </Text>
                <Pressable onPress={() => router.back()} style={outfit_detail_screen_styles.empty_button}>
                    <Text selectable style={outfit_detail_screen_styles.empty_button_text}>
                        Volver
                    </Text>
                </Pressable>
            </View>
        );
    }

    const favorite_id_set = new Set(favorite_ids.map((id) => String(id)));
    const is_favorite = favorite_id_set.has(String(outfit?.id));
    const prenda_ids = Array.isArray(outfit?.prenda_ids) ? outfit.prenda_ids : [];
    const prendas_by_id = new Map(
        prendas.map((prenda) => [String(prenda?.id), prenda])
    );
    const prendas_in_outfit = prenda_ids
        .map((prenda_id) => prendas_by_id.get(String(prenda_id)))
        .filter(Boolean);
    const ia_chip_label = outfit?.creado_por_ia ? 'Generado con IA' : 'Creado manualmente';
    const is_deleting = delete_status === 'loading';

    const handle_toggle_favorite = () => {
        if (!outfit?.id) {
            return;
        }

        dispatch(toggle_outfit_favorite(outfit.id));
    };

    const execute_delete_outfit = async () => {
        if (!outfit?.id) {
            return;
        }

        try {
            await dispatch(delete_outfit_by_id(outfit.id)).unwrap();
            router.replace('/(tabs)/conjuntos');
        } catch (error) {
            Alert.alert('No se pudo eliminar', String(error ?? 'No se pudo eliminar el outfit.'));
        }
    };

    const handle_delete_press = () => {
        if (is_deleting) {
            return;
        }

        Alert.alert('Eliminar outfit', 'Esta acción no se puede deshacer. ¿Deseas continuar?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => { void execute_delete_outfit(); } },
        ]);
    };

    return (
        <View style={outfit_detail_screen_styles.screen}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={outfit_detail_screen_styles.screen}
                contentContainerStyle={outfit_detail_screen_styles.scroll_content}
                showsVerticalScrollIndicator={false}
            >
                <View style={outfit_detail_screen_styles.header_row}>
                    <Pressable onPress={() => router.back()} style={outfit_detail_screen_styles.control_button}>
                        <BackIcon size={16} color={palette.walnut} />
                    </Pressable>

                    <View style={outfit_detail_screen_styles.header_right_actions}>
                        <Pressable
                            onPress={handle_toggle_favorite}
                            style={outfit_detail_screen_styles.control_button}
                        >
                            <HeartIcon
                                size={16}
                                color={is_favorite ? palette.walnut : palette.text_muted}
                                solid={is_favorite}
                            />
                        </Pressable>
                        <Pressable
                            onPress={handle_delete_press}
                            style={outfit_detail_screen_styles.control_button}
                            disabled={is_deleting}
                        >
                            <TrashIcon size={14} color={palette.walnut} />
                        </Pressable>
                    </View>
                </View>

                <Text selectable style={outfit_detail_screen_styles.title}>
                    {outfit?.nombre_outfit ?? 'Conjunto'}
                </Text>

                <View style={outfit_detail_screen_styles.chip_row}>
                    <View style={[outfit_detail_screen_styles.chip, outfit_detail_screen_styles.chip_sky]}>
                        <Text selectable style={[outfit_detail_screen_styles.chip_text, outfit_detail_screen_styles.chip_text_walnut]}>
                            Ocasión · {outfit?.ocasion || 'Sin dato'}
                        </Text>
                    </View>
                    <View style={[outfit_detail_screen_styles.chip, outfit_detail_screen_styles.chip_walnut]}>
                        {outfit?.creado_por_ia && <SparklesIcon size={12} color={palette.white} />}
                        <Text selectable style={[outfit_detail_screen_styles.chip_text, outfit_detail_screen_styles.chip_text_white]}>
                            {ia_chip_label}
                        </Text>
                    </View>
                </View>

                <View style={outfit_detail_screen_styles.meta_row}>
                    <CalendarIcon size={13} color={palette.text_muted} />
                    <Text selectable style={outfit_detail_screen_styles.meta_text}>
                        Creado el {format_date(outfit?.fecha_creacion)}
                    </Text>
                </View>

                <View style={outfit_detail_screen_styles.section_header}>
                    <Text selectable style={outfit_detail_screen_styles.section_title}>
                        Capas
                    </Text>
                    <Text selectable style={outfit_detail_screen_styles.section_count}>
                        {prenda_ids.length} prendas
                    </Text>
                </View>

                <View style={outfit_detail_screen_styles.prendas_list}>
                    {prendas_in_outfit.map((prenda, index) => {
                        const image_url = resolve_prenda_image_url(prenda?.foto_url);
                        const card_style = index % 2 === 1
                            ? outfit_detail_screen_styles.prenda_card_sky
                            : outfit_detail_screen_styles.prenda_card_cream;

                        return (
                            <Pressable
                                key={String(prenda?.id ?? index)}
                                onPress={() => router.push(`/prendas/${prenda?.id}`)}
                                style={[outfit_detail_screen_styles.prenda_card, card_style]}
                            >
                                <View style={outfit_detail_screen_styles.prenda_image_wrap}>
                                    {image_url ? (
                                        <Image
                                            source={{ uri: image_url }}
                                            style={outfit_detail_screen_styles.prenda_image}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <ShirtIcon size={26} color={palette.walnut} />
                                    )}
                                </View>
                                <View style={outfit_detail_screen_styles.prenda_info}>
                                    <Text selectable style={outfit_detail_screen_styles.prenda_name}>
                                        {prenda?.nombre ?? 'Prenda'}
                                    </Text>
                                    <Text selectable style={outfit_detail_screen_styles.prenda_meta}>
                                        {build_prenda_meta(prenda)}
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color={palette.walnut_soft} />
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            <Pressable
                onPress={() => router.push(`/conjuntos/${outfit?.id}/editar`)}
                style={outfit_detail_screen_styles.edit_button}
            >
                <Text selectable style={outfit_detail_screen_styles.edit_button_text}>
                    Editar
                </Text>
            </Pressable>
        </View>
    );
}
