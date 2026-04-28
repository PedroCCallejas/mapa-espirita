import * as Location from 'expo-location';

import type { Coordinates } from '../types/center';

export class LocationPermissionDeniedError extends Error {
  constructor() {
    super('Permissao de localizacao negada pelo usuario.');
    this.name = 'LocationPermissionDeniedError';
  }
}

export async function getCurrentUserLocation(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new LocationPermissionDeniedError();
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
