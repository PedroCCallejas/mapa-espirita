import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Center } from '../types/center';

const FAVORITES_STORAGE_KEY = '@mapaespirita/favorites/v1';

function isValidCoordinates(value: unknown): value is Center['location'] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const coordinates = value as Record<string, unknown>;
  return (
    typeof coordinates.latitude === 'number' &&
    typeof coordinates.longitude === 'number'
  );
}

function isValidCenter(value: unknown): value is Center {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const center = value as Record<string, unknown>;

  return (
    typeof center.id === 'string' &&
    typeof center.name === 'string' &&
    typeof center.address === 'string' &&
    typeof center.distanceKm === 'number' &&
    isValidCoordinates(center.location) &&
    typeof center.status === 'string' &&
    Array.isArray(center.weekdayDescriptions)
  );
}

function sanitizeFavoriteCenters(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isValidCenter);
}

async function persistFavoriteCenters(favoriteCenters: Center[]) {
  await AsyncStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(favoriteCenters),
  );
}

export async function loadFavoriteCenters() {
  const storedValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    return sanitizeFavoriteCenters(JSON.parse(storedValue));
  } catch {
    return [];
  }
}

export async function saveFavoriteCenter(center: Center) {
  const favoriteCenters = await loadFavoriteCenters();
  const nextFavoriteCenters = [
    center,
    ...favoriteCenters.filter((favoriteCenter) => favoriteCenter.id !== center.id),
  ];

  await persistFavoriteCenters(nextFavoriteCenters);
  return nextFavoriteCenters;
}

export async function removeFavoriteCenter(centerId: string) {
  const favoriteCenters = await loadFavoriteCenters();
  const nextFavoriteCenters = favoriteCenters.filter(
    (favoriteCenter) => favoriteCenter.id !== centerId,
  );

  await persistFavoriteCenters(nextFavoriteCenters);
  return nextFavoriteCenters;
}

export async function toggleFavoriteCenter(center: Center) {
  const favoriteCenters = await loadFavoriteCenters();
  const isFavorite = favoriteCenters.some(
    (favoriteCenter) => favoriteCenter.id === center.id,
  );

  if (isFavorite) {
    const nextFavoriteCenters = favoriteCenters.filter(
      (favoriteCenter) => favoriteCenter.id !== center.id,
    );

    await persistFavoriteCenters(nextFavoriteCenters);

    return {
      favoriteCenters: nextFavoriteCenters,
      isFavorite: false,
    };
  }

  const nextFavoriteCenters = [
    center,
    ...favoriteCenters.filter((favoriteCenter) => favoriteCenter.id !== center.id),
  ];

  await persistFavoriteCenters(nextFavoriteCenters);

  return {
    favoriteCenters: nextFavoriteCenters,
    isFavorite: true,
  };
}
