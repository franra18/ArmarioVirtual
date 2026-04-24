import { Redirect, Tabs } from 'expo-router';
import { AccountIcon, ConjuntosIcon, HomeIcon, ItemsIcon } from '../../src/shared/icons/app-icons';
import { tabs_screen_options } from '../../src/shared/theme/navigation-styles';
import { select_is_authenticated } from '../../src/features/auth/selectors';
import { use_app_selector } from '../../src/store/hooks';

function block_navigation(event) {
  event.preventDefault();
}

export default function TabsLayout() {
  const is_authenticated = use_app_selector(select_is_authenticated);

  if (!is_authenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={tabs_screen_options}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'Prendas',
          tabBarIcon: ({ color, size }) => <ItemsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="conjuntos"
        listeners={{ tabPress: block_navigation }}
        options={{
          title: 'Conjuntos',
          tabBarIcon: ({ color, size }) => <ConjuntosIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        listeners={{ tabPress: block_navigation }}
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => <AccountIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
