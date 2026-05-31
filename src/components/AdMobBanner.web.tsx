import { useEffect } from 'react';

type AdMobBannerProps = {
  onVisibilityChange?: (isVisible: boolean) => void;
};

export function AdMobBanner({ onVisibilityChange }: AdMobBannerProps) {
  useEffect(() => {
    onVisibilityChange?.(false);
  }, [onVisibilityChange]);

  return null;
}
