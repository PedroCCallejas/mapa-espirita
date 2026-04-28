import { Linking } from 'react-native';

import type { Coordinates } from '../types/center';

function buildDestinationValue(destination: Coordinates | string) {
  if (typeof destination === 'string') {
    return destination;
  }

  return `${destination.latitude},${destination.longitude}`;
}

export function buildGoogleMapsDirectionsUrl(
  origin: Coordinates | null,
  destination: Coordinates | string,
) {
  const destinationValue = buildDestinationValue(destination);

  if (!origin) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destinationValue,
    )}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${origin.latitude},${origin.longitude}`,
  )}&destination=${encodeURIComponent(destinationValue)}&travelmode=driving`;
}

export async function openRouteInGoogleMaps(
  origin: Coordinates | null,
  destination: Coordinates | string,
  fallbackLabel?: string,
) {
  const url = buildGoogleMapsDirectionsUrl(origin, destination);
  const fallbackUrl = fallbackLabel
    ? buildGoogleMapsDirectionsUrl(origin, fallbackLabel)
    : null;

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
    return;
  }

  if (fallbackUrl) {
    await Linking.openURL(fallbackUrl);
    return;
  }

  throw new Error('Não foi possível abrir o Google Maps neste dispositivo.');
}
