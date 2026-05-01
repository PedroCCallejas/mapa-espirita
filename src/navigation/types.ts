import type { Center, Coordinates } from '../types/center';

export type RootStackParamList = {
  Details: {
    center: Center;
    origin: Coordinates | null;
  };
  Home: undefined;
};
