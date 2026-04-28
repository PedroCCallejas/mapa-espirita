import type { Center, CenterPhoto, Coordinates } from '../types/center';
import { calculateDistanceKm } from '../utils/distance';

const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1';
const GOOGLE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const SEARCH_TERMS = [
  'centro espirita',
  'espiritismo',
  'casa espirita',
  'centro espiritualista',
];
const BLOCKED_NAME_TERMS = ['umbanda', 'terreiro', 'casa de umbanda'];

const SEARCH_FIELD_MASK = [
  'places.id',
  'places.name',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.photos',
  'places.currentOpeningHours',
  'places.regularOpeningHours',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
].join(',');

const DETAILS_FIELD_MASK = [
  'id',
  'name',
  'displayName',
  'formattedAddress',
  'location',
  'photos',
  'currentOpeningHours',
  'regularOpeningHours',
  'rating',
  'userRatingCount',
  'websiteUri',
  'internationalPhoneNumber',
  'businessStatus',
].join(',');

type GooglePlaceResponse = {
  businessStatus?: string;
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  id?: string;
  internationalPhoneNumber?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  name?: string;
  photos?: Array<{
    authorAttributions?: Array<{
      displayName?: string;
      photoUri?: string;
      uri?: string;
    }>;
    heightPx?: number;
    name?: string;
    widthPx?: number;
  }>;
  rating?: number;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  userRatingCount?: number;
  websiteUri?: string;
};

type SearchPlacesResponse = {
  places?: GooglePlaceResponse[];
};

type GooglePhoto = NonNullable<GooglePlaceResponse['photos']>[number];

type GeocodeResponse = {
  results?: Array<{
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  status?: string;
};

function getApiKey() {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Defina EXPO_PUBLIC_GOOGLE_MAPS_API_KEY no arquivo .env para usar a busca do Google.',
    );
  }

  return apiKey;
}

function createPlacesHeaders(fieldMask: string) {
  return {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': getApiKey(),
    'X-Goog-FieldMask': fieldMask,
  };
}

function buildPhoto(photo?: GooglePhoto): CenterPhoto | null {
  if (!photo?.name) {
    return null;
  }

  return {
    authorAttributions: photo.authorAttributions ?? [],
    heightPx: photo.heightPx,
    name: photo.name,
    url: `${GOOGLE_PLACES_BASE_URL}/${photo.name}/media?maxWidthPx=1200&key=${getApiKey()}`,
    widthPx: photo.widthPx,
  };
}

function getCoordinates(location?: GooglePlaceResponse['location']) {
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return { latitude, longitude };
}

function mapStatus(openNow?: boolean): Center['status'] {
  if (openNow === true) {
    return 'OPEN';
  }

  if (openNow === false) {
    return 'CLOSED';
  }

  return 'UNKNOWN';
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function shouldExcludePlace(name: string) {
  const normalizedName = normalizeText(name);
  return BLOCKED_NAME_TERMS.some((term) => normalizedName.includes(term));
}

function mergeCenter(existing: Center, incoming: Center): Center {
  return {
    ...existing,
    ...incoming,
    address: incoming.address || existing.address,
    businessStatus: incoming.businessStatus ?? existing.businessStatus,
    name: incoming.name || existing.name,
    phone: incoming.phone ?? existing.phone,
    photo: incoming.photo ?? existing.photo,
    rating: incoming.rating ?? existing.rating,
    status: incoming.status !== 'UNKNOWN' ? incoming.status : existing.status,
    userRatingCount: incoming.userRatingCount ?? existing.userRatingCount,
    website: incoming.website ?? existing.website,
    weekdayDescriptions: incoming.weekdayDescriptions.length
      ? incoming.weekdayDescriptions
      : existing.weekdayDescriptions,
  };
}

function mapPlaceToCenter(place: GooglePlaceResponse, origin: Coordinates): Center | null {
  if (!place.id || !place.displayName?.text || !place.formattedAddress) {
    return null;
  }

  const coordinates = getCoordinates(place.location);

  if (!coordinates) {
    return null;
  }

  return {
    address: place.formattedAddress,
    businessStatus: place.businessStatus ?? null,
    distanceKm: calculateDistanceKm(origin, coordinates),
    id: place.id,
    location: coordinates,
    name: place.displayName.text,
    phone: place.internationalPhoneNumber ?? null,
    photo: buildPhoto(place.photos?.[0]),
    rating: typeof place.rating === 'number' ? place.rating : null,
    resourceName: place.name ?? null,
    status: mapStatus(place.currentOpeningHours?.openNow),
    userRatingCount:
      typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
    website: place.websiteUri ?? null,
    weekdayDescriptions:
      place.regularOpeningHours?.weekdayDescriptions ??
      place.currentOpeningHours?.weekdayDescriptions ??
      [],
  };
}

async function readErrorMessage(response: Response) {
  try {
    const json = (await response.json()) as { error?: { message?: string } };
    return json.error?.message ?? `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}

async function searchText(query: string, origin: Coordinates) {
  const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places:searchText`, {
    body: JSON.stringify({
      languageCode: 'pt-BR',
      locationBias: {
        circle: {
          center: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
          radius: 15000,
        },
      },
      pageSize: 20,
      regionCode: 'BR',
      textQuery: query,
    }),
    headers: createPlacesHeaders(SEARCH_FIELD_MASK),
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = (await response.json()) as SearchPlacesResponse;
  return data.places ?? [];
}

export async function searchNearbyCenters(origin: Coordinates, areaLabel?: string) {
  const searches = await Promise.all(
    SEARCH_TERMS.map((term) => {
      const query = areaLabel ? `${term} em ${areaLabel}` : term;
      return searchText(query, origin);
    }),
  );

  const deduplicatedCenters = new Map<string, Center>();

  searches.flat().forEach((place) => {
    const mapped = mapPlaceToCenter(place, origin);

    if (!mapped) {
      return;
    }

    if (shouldExcludePlace(mapped.name)) {
      console.info(`[googlePlaces] Resultado ignorado pelo filtro de nome: ${mapped.name}`);
      return;
    }

    const existing = deduplicatedCenters.get(mapped.id);
    deduplicatedCenters.set(mapped.id, existing ? mergeCenter(existing, mapped) : mapped);
  });

  return [...deduplicatedCenters.values()]
    .sort((first, second) => first.distanceKm - second.distanceKm)
    .slice(0, 30);
}

export async function getCenterDetails(
  placeId: string,
  options: {
    fallback?: Center;
    origin: Coordinates;
  },
) {
  const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places/${placeId}`, {
    headers: createPlacesHeaders(DETAILS_FIELD_MASK),
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = (await response.json()) as GooglePlaceResponse;
  const mapped = mapPlaceToCenter(data, options.origin);

  if (!mapped) {
    if (options.fallback) {
      return options.fallback;
    }

    throw new Error('Nao foi possivel montar os detalhes desse centro.');
  }

  return options.fallback ? mergeCenter(options.fallback, mapped) : mapped;
}

export async function geocodeAddressQuery(query: string) {
  const apiKey = getApiKey();
  const url = `${GOOGLE_GEOCODING_URL}?address=${encodeURIComponent(
    query,
  )}&key=${apiKey}&language=pt-BR&region=br`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao consultar o Geocoding API (${response.status}).`);
  }

  const data = (await response.json()) as GeocodeResponse;

  if (data.status === 'ZERO_RESULTS' || !data.results?.length) {
    throw new Error('Nenhuma cidade ou bairro foi encontrado com esse termo.');
  }

  if (data.status && data.status !== 'OK') {
    throw new Error(`Geocoding API respondeu com status ${data.status}.`);
  }

  const firstResult = data.results[0];

  if (!firstResult) {
    throw new Error('Nenhuma cidade ou bairro foi encontrado com esse termo.');
  }

  const latitude = firstResult.geometry?.location?.lat;
  const longitude = firstResult.geometry?.location?.lng;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Nao foi possivel localizar as coordenadas dessa busca manual.');
  }

  return {
    coordinates: {
      latitude,
      longitude,
    },
    label: firstResult.formatted_address ?? query,
  };
}
