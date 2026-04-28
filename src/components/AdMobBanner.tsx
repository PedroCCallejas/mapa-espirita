import { Platform, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useState } from 'react';

const androidBannerId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;
const iosBannerId = process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID;

export function AdMobBanner() {
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const realUnitId = Platform.select({
    android: androidBannerId,
    ios: iosBannerId,
  });

  const unitId = realUnitId || TestIds.ADAPTIVE_BANNER;

  if (hasLoadFailed) {
    return null;
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error) => {
            const message = String(error?.message ?? '');
            const name = String(error?.name ?? '');
            const errorText = `${name} ${message}`.toLowerCase();

            if (errorText.includes('no-fill')) {
              console.info('[AdMob] Nenhum anúncio disponível no momento.');
              setHasLoadFailed(true);
              return;
            }

            console.warn('[AdMob] Falha ao carregar banner:', error);
            setHasLoadFailed(true);
          }}
        />
    </View>
  );
}

