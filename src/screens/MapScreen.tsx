import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useMemo, useState } from 'react';
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
    longitude: coordinates.longitude,
    latitudeDelta: 0.08,
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

  const validCenters = useMemo(
    () => centers.filter((center) => isValidCoordinate(center.location)),
    [centers],
  );

  const hasValidOrigin = isValidCoordinate(origin);
  const runtimeMapsApiKeyConfigured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);
  const invalidCenterCount = centers.length - validCenters.length;

  const mapRegion = hasValidOrigin
    ? buildRegion(origin)
    : validCenters[0]
      ? buildRegion(validCenters[0].location)
      : null;

  const [selectedCenter, setSelectedCenter] = useState<Center | null>(validCenters[0] ?? null);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadTimeout, setMapLoadTimeout] = useState(false);

  useEffect(() => {
    console.info('[MapScreen] Tela renderizada.', {
      hasValidOrigin,
      mapRegion,
      runtimeMapsApiKeyConfigured,
      validCentersCount: validCenters.length,
    });
  }, [hasValidOrigin, mapRegion, runtimeMapsApiKeyConfigured, validCenters.length]);

  useEffect(() => {
    console.info('[MapScreen] Diagnostico inicial do mapa:', {
      centersRecebidos: centers.map((center) => ({
        id: center.id,
        latitude: center.location?.latitude,
        longitude: center.location?.longitude,
        name: center.name,
      })),
      chaveGoogleMapsConfiguradaEmRuntime: runtimeMapsApiKeyConfigured,
      initialRegion: mapRegion,
      originLabel,
      userLocation: hasValidOrigin ? origin : null,
      validCentersCount: validCenters.length,
    });
  }, [
    centers,
    hasValidOrigin,
    mapRegion,
    origin,
    originLabel,
    runtimeMapsApiKeyConfigured,
    validCenters.length,
  ]);

  useEffect(() => {
    if (invalidCenterCount > 0) {
      console.warn(
        `[MapScreen] ${invalidCenterCount} centro(s) foram ignorados porque vieram sem coordenadas validas para o mapa.`,
      );
    }
  }, [invalidCenterCount]);

  useEffect(() => {
    if (!hasValidOrigin) {
      console.warn(
        '[MapScreen] Origem da busca indisponivel ou invalida. O mapa sera aberto com base no primeiro centro valido.',
      );
    }
  }, [hasValidOrigin]);

  useEffect(() => {
    if (!runtimeMapsApiKeyConfigured) {
      console.warn(
        '[MapScreen] EXPO_PUBLIC_GOOGLE_MAPS_API_KEY nao foi encontrada em runtime. Gere uma nova build nativa apos configurar app.config.ts e o Google Cloud.',
      );
    }
  }, [runtimeMapsApiKeyConfigured]);

  useEffect(() => {
    if (!selectedCenter || validCenters.some((center) => center.id === selectedCenter.id)) {
      return;
    }

    setSelectedCenter(validCenters[0] ?? null);
  }, [selectedCenter, validCenters]);

  useEffect(() => {
    if (!mapRegion || mapReady) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setMapLoadTimeout(true);
      console.warn(
        '[MapScreen] MapView ainda nao disparou onMapReady. Se o mapa estiver branco, verifique build nativa, AndroidManifest e Google Maps API Key.',
      );
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [mapReady, mapRegion]);

  const handleOpenRoute = () => {
    if (!selectedCenter) {
      return;
    }

    void openRouteInGoogleMaps(origin, selectedCenter.location, selectedCenter.address);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          {mapRegion ? (
            <MapView
              initialRegion={mapRegion}
              onMapLoaded={() => {
                console.info('[MapScreen] MapView carregado via onMapLoaded.');
              }}
              onMapReady={() => {
                setMapReady(true);
                setMapLoadTimeout(false);

                console.info('[MapScreen] MapView pronto para renderizar.', {
                  initialRegion: mapRegion,
                  provider: Platform.OS === 'android' ? 'google' : 'default',
                });
              }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              showsUserLocation={hasValidOrigin}
              style={StyleSheet.absoluteFillObject}
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
              <Text style={styles.mapFallbackTitle}>Mapa indisponivel no momento</Text>
              <Text style={styles.mapFallbackText}>
                Nenhuma coordenada valida foi recebida para montar a visualizacao com seguranca.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.diagnosticBadge}>
          <Text style={styles.diagnosticText}>
            MapScreen renderizada • {validCenters.length} marcador(es)
          </Text>
        </View>

        <View style={styles.mapHeader}>
          <Text style={styles.mapHeaderTitle}>Mapa dos centros proximos</Text>
          <Text style={styles.mapHeaderText}>
            {originLabel ?? 'Baseado na sua localizacao de busca atual'}
          </Text>
        </View>

        {selectedCenter ? (
          <SelectionCard center={selectedCenter} onOpenRoute={handleOpenRoute} />
        ) : (
          <View style={styles.selectionCard}>
            <Text style={styles.selectionName}>Nenhum centro pronto para o mapa</Text>
            <Text style={styles.selectionAddress}>
              Os detalhes continuam acessiveis na lista, mas esta tela nao recebeu coordenadas
              suficientes para exibir marcadores.
            </Text>
          </View>
        )}

        {!runtimeMapsApiKeyConfigured ? (
          <View style={styles.mapNotice}>
            <Text style={styles.mapNoticeTitle}>Chave do Google Maps nao detectada</Text>
            <Text style={styles.mapNoticeText}>
              Se esta for uma build antiga, gere e instale uma nova versao nativa apos atualizar o
              app.config.ts e confirmar que o Maps SDK for Android esta ativo no Google Cloud.
            </Text>
          </View>
        ) : null}

        {mapLoadTimeout && runtimeMapsApiKeyConfigured ? (
          <View style={styles.mapNotice}>
            <Text style={styles.mapNoticeTitle}>Mapa demorando para carregar</Text>
            <Text style={styles.mapNoticeText}>
              Se a tela continuar em branco, gere uma nova build nativa e reinstale o app. A chave
              do Maps precisa estar dentro do AndroidManifest.
            </Text>
          </View>
        ) : null}
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
  diagnosticBadge: {
    backgroundColor: 'rgba(255, 253, 248, 0.96)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 16,
    top: 92,
  },
  diagnosticText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
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
  mapNotice: {
    backgroundColor: 'rgba(255, 249, 242, 0.98)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    bottom: 164,
    left: 16,
    padding: 14,
    position: 'absolute',
    right: 16,
  },
  mapNoticeText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  mapNoticeTitle: {
    color: theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  routeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    marginTop: 12,
    paddingVertical: 12,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  selectionAddress: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  selectionDistance: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  selectionName: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
});