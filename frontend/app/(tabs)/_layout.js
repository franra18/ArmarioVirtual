import { Redirect, Tabs } from 'expo-router';
import { AccountIcon, HomeIcon, ItemsIcon } from '../../src/shared/icons/app-icons';
import { palette, typography } from '../../src/shared/theme/palette';
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.walnut,
        tabBarInactiveTintColor: palette.text_muted,
        tabBarStyle: {
          height: 74,
          paddingTop: 6,
          paddingBottom: 10,
          backgroundColor: palette.cream,
          borderTopColor: palette.cream_deep,
        },
        tabBarLabelStyle: {
          fontFamily: typography.body_medium,
          fontSize: 12,
        },
      }}
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
        listeners={{ tabPress: block_navigation }}
        options={{
          title: 'Items',
          tabBarIcon: ({ color, size }) => <ItemsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        listeners={{ tabPress: block_navigation }}
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <AccountIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
