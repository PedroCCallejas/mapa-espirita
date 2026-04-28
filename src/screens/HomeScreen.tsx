import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdMobBanner } from '../components/AdMobBanner';
import { CenterCard } from '../components/CenterCard';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { geocodeAddressQuery, searchNearbyCenters } from '../services/googlePlaces';
import {
  LocationPermissionDeniedError,
  getCurrentUserLocation,
} from '../services/location';
import type { Center, Coordinates } from '../types/center';
import { openRouteInGoogleMaps } from '../utils/maps';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const FIXED_AD_FOOTER_BASE_HEIGHT = 96;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [centers, setCenters] = useState<Center[]>([]);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [originLabel, setOriginLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const [searchingManualArea, setSearchingManualArea] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadNearbyUsingCurrentLocation = async (showRefreshIndicator = false) => {
    try {
      setError(null);
      setPermissionDenied(false);

      if (showRefreshIndicator) {
        setRefreshingLocation(true);
      } else {
        setLoading(true);
      }

      const currentLocation = await getCurrentUserLocation();
      const nearbyCenters = await searchNearbyCenters(currentLocation);

      setOrigin(currentLocation);
      setOriginLabel('Usando sua localização atual');
      setCenters(nearbyCenters);
    } catch (loadError) {
      if (loadError instanceof LocationPermissionDeniedError) {
        setPermissionDenied(true);
        setOriginLabel('Localização negada. Use a busca manual.');

        if (!centers.length) {
          setError(
            'Sem permissão de localização, você ainda pode buscar por cidade ou bairro logo abaixo.',
          );
        }
      } else {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível buscar centros espíritas próximos.',
        );
      }
    } finally {
      setLoading(false);
      setRefreshingLocation(false);
    }
  };

  useEffect(() => {
    void loadNearbyUsingCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSearch = async () => {
    const trimmedQuery = manualQuery.trim();

    if (trimmedQuery.length < 2) {
      setError('Digite pelo menos uma cidade ou bairro para buscar manualmente.');
      return;
    }

    try {
      setSearchingManualArea(true);
      setError(null);

      const geocoded = await geocodeAddressQuery(trimmedQuery);
      const nearbyCenters = await searchNearbyCenters(geocoded.coordinates, geocoded.label);

      setOrigin(geocoded.coordinates);
      setOriginLabel(`Busca manual em ${geocoded.label}`);
      setCenters(nearbyCenters);
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'Não foi possível buscar essa cidade ou bairro.',
      );
    } finally {
      setSearchingManualArea(false);
      setLoading(false);
    }
  };

  const handleOpenRoute = async (center: Center) => {
    await openRouteInGoogleMaps(origin, center.location, center.address);
  };

  const shouldShowLoadingState = (loading || searchingManualArea) && !centers.length;
  const footerSpacerHeight = FIXED_AD_FOOTER_BASE_HEIGHT + insets.bottom;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: footerSpacerHeight + 24 },
            !centers.length ? styles.listContentEmpty : null,
          ]}
          data={centers}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !shouldShowLoadingState && !error ? (
              <ErrorState
                message="Ainda não encontramos centros nessa area. Tente atualizar sua localização ou fazer uma nova busca por cidade ou bairro."
                onRetry={() => void loadNearbyUsingCurrentLocation()}
                title="Nenhum centro encontrado por aqui"
                tone="empty"
              />
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <View style={styles.hero}>
                <View style={styles.heroOrbLarge} />
                <View style={styles.heroOrbSmall} />
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>Busca acolhedora e simples</Text>
                </View>

                <Text style={styles.title}>Centros Espíritas Próximos</Text>
                <Text style={styles.subtitle}>
                  Descubra centros espíritas perto de você, veja horários quando disponíveis,
                  confira detalhes e abra a rota no Google Maps.
                </Text>

                <View style={styles.heroActions}>
                  <Pressable
                    onPress={() => void loadNearbyUsingCurrentLocation(true)}
                    style={[styles.heroButton, styles.primaryHeroButton]}
                  >
                    <Text style={styles.primaryHeroButtonText}>
                      {permissionDenied ? 'Permitir localizacao' : 'Atualizar localizacao'}
                    </Text>
                  </Pressable>

                  {origin && centers.length ? (
                    <Pressable
                      onPress={() =>
                        navigation.navigate('Map', {
                          centers,
                          origin,
                          originLabel,
                        })
                      }
                      style={[styles.heroButton, styles.secondaryHeroButton]}
                    >
                      <Text style={styles.secondaryHeroButtonText}>Ver mapa</Text>
                    </Pressable>
                  ) : null}
                </View>

                {originLabel ? <Text style={styles.originLabel}>{originLabel}</Text> : null}
                {refreshingLocation ? (
                  <Text style={styles.refreshText}>Atualizando sua localização...</Text>
                ) : null}
              </View>

              <View style={styles.searchPanel}>
                <Text style={styles.searchTitle}>Buscar manualmente por cidade ou bairro</Text>
                <Text style={styles.searchText}>
                  Use esta opção quando preferir explorar outra região ou quando a permissão de
                  localização estiver desativada.
                </Text>

                <TextInput
                  autoCapitalize="words"
                  onChangeText={setManualQuery}
                  placeholder="Ex.: Centro, Cuiaba ou Barra do Garcas"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={manualQuery}
                />

                <Pressable
                  onPress={() => void handleManualSearch()}
                  style={[styles.heroButton, styles.primaryHeroButton]}
                >
                  <Text style={styles.primaryHeroButtonText}>
                    {searchingManualArea ? 'Buscando...' : 'Buscar nessa area'}
                  </Text>
                </Pressable>
              </View>

              {shouldShowLoadingState ? <LoadingState /> : null}
              {error ? (
                <ErrorState
                  message={error}
                  onRetry={() => void loadNearbyUsingCurrentLocation()}
                />
              ) : null}

              {!loading && centers.length ? (
                <View style={styles.resultsCard}>
                  <Text style={styles.resultsLabel}>
                    {centers.length} centro(s) encontrado(s) por proximidade
                  </Text>
                  <Text style={styles.resultsSubtext}>
                    Toque em um card para ver detalhes ou abrir a rota com facilidade.
                  </Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <CenterCard
              center={item}
              onPressDetails={() =>
                navigation.navigate('Details', {
                  center: item,
                  origin,
                })
              }
              onPressRoute={() => void handleOpenRoute(item)}
            />
          )}
        />

        <View
          style={[
            styles.fixedAdFooter,
            {
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}
        >
          <AdMobBanner />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fixedAdFooter: {
    alignItems: 'center',
    backgroundColor: '#F8F5F0',
    borderTopColor: '#E5DED2',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
  headerContent: {
    paddingBottom: 14,
  },
  hero: {
    ...theme.shadows.card,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 22,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBadgeText: {
    color: '#F8EBDC',
    fontSize: 12,
    fontWeight: '800',
  },
  heroButton: {
    ...theme.shadows.soft,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heroOrbLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    height: 180,
    position: 'absolute',
    right: -60,
    top: -40,
    width: 180,
  },
  heroOrbSmall: {
    backgroundColor: 'rgba(252, 233, 210, 0.14)',
    borderRadius: 999,
    height: 110,
    position: 'absolute',
    right: 24,
    top: 120,
    width: 110,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  listContentEmpty: {
    paddingBottom: 52,
  },
  originLabel: {
    color: '#D1FAE5',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  primaryHeroButton: {
    backgroundColor: theme.colors.accent,
  },
  primaryHeroButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  refreshText: {
    color: '#FDE68A',
    fontSize: 13,
    marginTop: 8,
  },
  resultsCard: {
    ...theme.shadows.soft,
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
    padding: 16,
  },
  resultsLabel: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  resultsSubtext: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  searchPanel: {
    ...theme.shadows.soft,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  searchText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  searchTitle: {
    color: theme.colors.primaryDark,
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryHeroButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1,
  },
  secondaryHeroButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    color: '#E5F9F4',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: '88%',
  },
  title: {
    color: theme.colors.white,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 36,
    maxWidth: '84%',
  },
});
