import { initializeApp, getApps } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebase_config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missing_keys = Object.entries(firebase_config)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing_keys.length > 0) {
  console.warn(
    `Faltan variables de entorno para Firebase: ${missing_keys.join(', ')}. `
      + 'Revisa tu .env o usa el prefijo EXPO_PUBLIC_.'
  );
}

const firebase_app = getApps().length > 0 ? getApps()[0] : initializeApp(firebase_config);

let firebase_auth;

if (Platform.OS === 'web') {
  firebase_auth = getAuth(firebase_app);
} else {
  try {
    firebase_auth = initializeAuth(firebase_app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    firebase_auth = getAuth(firebase_app);
  }
}

export { firebase_auth };
