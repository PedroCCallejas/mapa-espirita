import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import type { Center, Coordinates } from '../types/center';
import { formatDistanceKm } from '../utils/distance';
import { openRouteInGoogleMaps } from '../utils/maps';

type MapScreenProps = StackScreenProps<RootStackParamList, 'Map'>;

function isValidCoordinate(coordinates: Coordinates | null | undefined): coordinates is Coordinates {
  return Boolean(
    coordinates &&
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude) &&
      Math.abs(coordinates.latitude) <= 90 &&
      Math.abs(coordinates.longitude) <= 180,
  );
}

function buildRegion(coordinates: Coordinates) {
  return {
    latitude: coordinates.latitude,
    latitudeDelta: 0.08,
    longitude: coordinates.longitude,
    longitudeDelta: 0.08,
  };
}

function SelectionCard({
  center,
  onOpenRoute,
}: {
  center: Center;
  onOpenRoute: () => void;
}) {
  return (
    <View style={styles.selectionCard}>
      <Text style={styles.selectionName}>{center.name}</Text>
      <Text style={styles.selectionDistance}>{formatDistanceKm(center.distanceKm)}</Text>
      <Text style={styles.selectionAddress}>{center.address}</Text>

      <Pressable onPress={onOpenRoute} style={styles.routeButton}>
        <Text style={styles.routeButtonText}>Abrir rota</Text>
      </Pressable>
    </View>
  );
}

export function MapScreen({ route }: MapScreenProps) {
  const { centers, origin, originLabel } = route.params;
  const validCenters = centers.filter((center) => isValidCoordinate(center.location));
  const hasValidOrigin = isValidCoordinate(origin);
  const invalidCenterCount = centers.length - validCenters.length;
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(validCenters[0] ?? null);
  const mapRegion = hasValidOrigin
    ? buildRegion(origin)
    : validCenters[0]
      ? buildRegion(validCenters[0].location)
      : null;

  useEffect(() => {
    if (invalidCenterCount > 0) {
      console.warn(
        `[MapScreen] ${invalidCenterCount} centro(s) foram ignorados porque vieram sem coordenadas válidas para o mapa.`,
      );
    }
  }, [invalidCenterCount]);

  useEffect(() => {
    if (!hasValidOrigin) {
      console.warn(
        '[MapScreen] Origem da busca indisponível ou inválida. O mapa será aberto com base no primeiro centro válido.',
      );
    }
  }, [hasValidOrigin]);

  useEffect(() => {
    if (!selectedCenter || validCenters.some((center) => center.id === selectedCenter.id)) {
      return;
    }

    setSelectedCenter(validCenters[0] ?? null);
  }, [selectedCenter, validCenters]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          {mapRegion ? (
            <MapView
              initialRegion={mapRegion}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              showsUserLocation={hasValidOrigin}
              style={styles.map}
            >
              {hasValidOrigin ? (
                <Marker
                  coordinate={origin}
                  pinColor={theme.colors.primary}
                  title="Voce esta aqui"
                />
              ) : null}

              {validCenters.map((center) => (
                <Marker
                  coordinate={center.location}
                  key={center.id}
                  onPress={() => setSelectedCenter(center)}
                  pinColor={theme.colors.accent}
                  title={center.name}
                >
                  <Callout onPress={() => setSelectedCenter(center)}>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{center.name}</Text>
                      <Text style={styles.calloutText}>{formatDistanceKm(center.distanceKm)}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackTitle}>Mapa indisponível no momento</Text>
              <Text style={styles.mapFallbackText}>
                Nenhuma coordenada válida foi recebida para montar a visualização com segurança.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mapHeader}>
          <Text style={styles.mapHeaderTitle}>Mapa dos centros próximos</Text>
          <Text style={styles.mapHeaderText}>
            {originLabel ?? 'Baseado na sua localização de busca atual'}
          </Text>
        </View>

        {selectedCenter ? (
          <SelectionCard
            center={selectedCenter}
            onOpenRoute={() =>
              void openRouteInGoogleMaps(origin, selectedCenter.location, selectedCenter.address)
            }
          />
        ) : (
          <View style={styles.selectionCard}>
            <Text style={styles.selectionName}>Nenhum centro pronto para o mapa</Text>
            <Text style={styles.selectionAddress}>
              Os detalhes continuam acessíveis na lista, mas esta tela não recebeu coordenadas
              suficientes para exibir marcadores.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  callout: {
    maxWidth: 220,
    padding: 4,
  },
  calloutText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  calloutTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  mapFallback: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    margin: 16,
    padding: 24,
  },
  mapFallbackText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  mapFallbackTitle: {
    color: theme.colors.primaryDark,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  mapHeader: {
    backgroundColor: 'rgba(255, 253, 248, 0.96)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    left: 16,
    padding: 14,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  mapHeaderText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  mapHeaderTitle: {
    color: theme.colors.primaryDark,
    fontSize: 17,
    fontWeight: '800',
  },
  routeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  routeButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  selectionAddress: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 8,
  },
  selectionCard: {
    backgroundColor: 'rgba(255, 253, 248, 0.98)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    bottom: 20,
    left: 16,
    padding: 16,
    position: 'absolute',
    right: 16,
  },
  selectionDistance: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  selectionName: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
});
