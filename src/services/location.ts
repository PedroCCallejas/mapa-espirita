import * as Location from 'expo-location';

import type { Coordinates } from '../types/center';

export class LocationPermissionDeniedError extends Error {
  constructor() {
    super('Permissão de localização negada pelo usuário.');
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
