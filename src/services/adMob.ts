import { Platform } from 'react-native';

let initializationPromise: Promise<unknown> | null = null;

export function initializeAdMob() {
  if (Platform.OS === 'web') {
    return Promise.resolve(null);
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const { default: mobileAds, MaxAdContentRating } = await import(
      'react-native-google-mobile-ads'
    );

    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
    });

    return mobileAds().initialize();
  })().catch((error: unknown) => {
    initializationPromise = null;

    if (__DEV__) {
      console.warn('Falha ao inicializar o Google Mobile Ads SDK:', error);
    }

    return null;
  });

  return initializationPromise;
}
