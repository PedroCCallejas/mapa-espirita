export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CenterStatus = 'OPEN' | 'CLOSED' | 'UNKNOWN';

export type CenterPhoto = {
  authorAttributions: Array<{
    displayName?: string;
    photoUri?: string;
    uri?: string;
  }>;
  heightPx?: number;
  name: string;
  url: string;
  widthPx?: number;
};

export type Center = {
  address: string;
  businessStatus?: string | null;
  distanceKm: number;
  id: string;
  location: Coordinates;
  name: string;
  phone?: string | null;
  photo?: CenterPhoto | null;
  rating?: number | null;
  resourceName?: string | null;
  status: CenterStatus;
  userRatingCount?: number | null;
  website?: string | null;
  weekdayDescriptions: string[];
};
