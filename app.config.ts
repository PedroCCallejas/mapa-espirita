import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const admobAndroidAppId =
  process.env.ADMOB_ANDROID_APP_ID ??
  'ca-app-pub-3940256099942544~3347511713';

const admobIosAppId =
  process.env.ADMOB_IOS_APP_ID ??
  'ca-app-pub-3940256099942544~1458002511';

const config: ExpoConfig = {
  name: 'Mapa Espirita',
  slug: 'centros-espiritas-proximos',
  version: '2.0.1',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'mapaespirita',
  jsEngine: 'hermes',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F8F5F0',
  },
  plugins: [
    [
      'expo-dev-client',
      {
        launchMode: 'most-recent',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Permita o acesso a sua localizacao para encontrar centros espiritas proximos.',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: admobAndroidAppId,
        iosAppId: admobIosAppId,
      },
    ],
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.pedroccallejas.mapaespirita',
    buildNumber: '3',
  },
  android: {
    package: 'com.pedroccallejas.mapaespirita',
    versionCode: 3,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F8F5F0',
    },
  },
  extra: {
    admobAndroidAppId,
    admobIosAppId,
    googleMapsApiKey,
    eas: {
      projectId: 'a8c1cfe1-3998-4b31-8613-4c72ccd21bf8',
    },
  },
};

export default config;
