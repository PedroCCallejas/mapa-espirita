import { useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from 'react-native-google-mobile-ads';

type AdMobBannerProps = {
  size?: (typeof BannerAdSize)[keyof typeof BannerAdSize];
};

const realUnitId = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
});

export function AdMobBanner({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}: AdMobBannerProps) {
  const bannerRef = useRef<BannerAd>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useForeground(() => {
    if (Platform.OS === 'ios' && !hasLoadFailed) {
      bannerRef.current?.load();
    }
  });

  const unitId = realUnitId || TestIds.ADAPTIVE_BANNER;

  if (!unitId || hasLoadFailed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        ref={bannerRef}
        unitId={unitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          setHasLoadFailed(true);

          if (__DEV__) {
            console.warn('Falha ao carregar banner AdMob:', error.message);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12,
    minHeight: 56,
  },
});
