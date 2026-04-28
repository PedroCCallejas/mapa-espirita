import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const admobAndroidAppId =
  process.env.ADMOB_ANDROID_APP_ID ?? 'ca-app-pub-3940256099942544~3347511713';

const admobIosAppId =
  process.env.ADMOB_IOS_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511';

const config: ExpoConfig = {
  name: 'Mapa Espírita',
  slug: 'centros-espiritas-proximos',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'MapaEspirita',
  jsEngine: 'hermes',

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
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
        iosGoogleMapsApiKey: googleMapsApiKey,
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
    bundleIdentifier: 'com.seuapp.mapaespirita',
    config: {
      googleMapsApiKey,
    },
  },

  android: {
    package: 'com.seuapp.mapaespirita',
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },

  extra: {
    admobAndroidAppId,
    admobIosAppId,

    eas: {
      projectId: 'a8c1cfe1-3998-4b31-8613-4c72ccd21bf8',
    },
  },
};

export default config;