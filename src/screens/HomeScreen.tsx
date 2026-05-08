import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
import { toggleFavoriteCenter, loadFavoriteCenters } from '../services/favorites';
import { geocodeAddressQuery, searchNearbyCenters } from '../services/googlePlaces';
import {
  LocationPermissionDeniedError,
  getCurrentUserLocation,
} from '../services/location';
import type { Center, Coordinates } from '../types/center';
import { openRouteInGoogleMaps } from '../utils/maps';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;
type LastSearch = { type: 'location' } | { query: string; type: 'manual' };

const FIXED_AD_FOOTER_BASE_HEIGHT = 96;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Center> | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [favoriteCenters, setFavoriteCenters] = useState<Center[]>([]);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [originLabel, setOriginLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const [searchingManualArea, setSearchingManualArea] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchPanelY, setSearchPanelY] = useState(0);
  const [footerHeight, setFooterHeight] = useState(
    FIXED_AD_FOOTER_BASE_HEIGHT + insets.bottom,
  );
  const [lastSearch, setLastSearch] = useState<LastSearch>({ type: 'location' });
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(null);

  const isBusy = loading || refreshingLocation || searchingManualArea;

  const hydrateFavorites = async () => {
    try {
      const storedFavoriteCenters = await loadFavoriteCenters();
      setFavoriteCenters(storedFavoriteCenters);
    } catch {
      setError((currentError) => currentError ?? 'Nao foi possivel carregar seus favoritos.');
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadNearbyUsingCurrentLocation = async (showRefreshIndicator = false) => {
    try {
      setError(null);
      setPermissionDenied(false);
      setLastSearch({ type: 'location' });

      if (showRefreshIndicator) {
        setRefreshingLocation(true);
      } else {
        setLoading(true);
      }

      const currentLocation = await getCurrentUserLocation();
      const nearbyCenters = await searchNearbyCenters(currentLocation);

      setOrigin(currentLocation);
      setOriginLabel('Usando sua localizacao atual');
      setCenters(nearbyCenters);
    } catch (loadError) {
      if (loadError instanceof LocationPermissionDeniedError) {
        setPermissionDenied(true);
        setOriginLabel('Localizacao negada. Use a busca manual.');
        setError(
          'Sem permissao de localizacao. Voce ainda pode buscar por cidade ou bairro logo abaixo.',
        );
      } else {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Nao foi possivel buscar centros espiritas proximos agora.',
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

  useEffect(() => {
    void hydrateFavorites();

    const unsubscribe = navigation.addListener('focus', () => {
      void hydrateFavorites();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToSearchPanel = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        animated: true,
        offset: Math.max(searchPanelY - 16, 0),
      });
    });
  };

  const handleManualSearch = async (queryOverride?: string) => {
    const trimmedQuery = (queryOverride ?? manualQuery).trim();

    if (trimmedQuery.length < 2) {
      setError('Digite pelo menos uma cidade ou bairro para buscar manualmente.');
      return;
    }

    try {
      Keyboard.dismiss();
      setSearchingManualArea(true);
      setError(null);
      setLastSearch({
        query: trimmedQuery,
        type: 'manual',
      });

      if (queryOverride) {
        setManualQuery(trimmedQuery);
      }

      const geocoded = await geocodeAddressQuery(trimmedQuery);
      const nearbyCenters = await searchNearbyCenters(geocoded.coordinates, geocoded.label);

      setOrigin(geocoded.coordinates);
      setOriginLabel(`Busca manual em ${geocoded.label}`);
      setCenters(nearbyCenters);
    } catch (searchError) {
      const defaultMessage =
        'Nao foi possivel buscar essa cidade ou bairro. Tente informar uma cidade com estado ou uma regiao mais ampla.';

      setError(
        searchError instanceof Error && searchError.message
          ? searchError.message
          : defaultMessage,
      );
    } finally {
      setSearchingManualArea(false);
      setLoading(false);
    }
  };

  const handleRetryLastSearch = () => {
    if (lastSearch.type === 'manual') {
      void handleManualSearch(lastSearch.query);
      return;
    }

    void loadNearbyUsingCurrentLocation(true);
  };

  const handleOpenRoute = async (center: Center) => {
    await openRouteInGoogleMaps(origin, center.location, center.address);
  };

  const handleToggleFavorite = async (center: Center) => {
    try {
      setUpdatingFavoriteId(center.id);
      const result = await toggleFavoriteCenter(center);
      setFavoriteCenters(result.favoriteCenters);
    } catch {
      setError('Nao foi possivel atualizar seus favoritos locais. Tente novamente.');
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  const shouldShowLoadingState = (loading || searchingManualArea) && !centers.length;
  const footerSpacerHeight = isKeyboardVisible ? 0 : footerHeight;
  const favoriteIds = new Set(
    favoriteCenters.map((favoriteCenter) => favoriteCenter.id),
  );
  const emptyState =
    lastSearch.type === 'manual'
      ? {
          actionLabel: 'Buscar novamente',
          message: `Nao encontramos centros para "${lastSearch.query}". Tente outra cidade, bairro ou uma regiao maior.`,
          title: 'Nenhum centro encontrado nessa busca',
        }
      : {
          actionLabel: 'Atualizar localizacao',
          message:
            'Ainda nao encontramos centros por perto. Tente atualizar sua localizacao ou fazer uma busca manual por cidade ou bairro.',
          title: 'Nenhum centro encontrado por aqui',
        };
  const errorRetryLabel =
    lastSearch.type === 'manual' ? 'Tentar essa busca novamente' : 'Tentar novamente';
  const locationButtonLabel =
    refreshingLocation || (loading && !centers.length && lastSearch.type === 'location')
      ? 'Buscando por perto...'
      : permissionDenied
        ? 'Tentar localizacao novamente'
        : 'Atualizar localizacao';
  const manualButtonLabel = searchingManualArea ? 'Buscando nessa area...' : 'Buscar nessa area';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.screen}
      >
        <FlatList
          ref={listRef}
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: footerSpacerHeight + 24 },
            !centers.length ? styles.listContentEmpty : null,
          ]}
          data={centers}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !shouldShowLoadingState && !error ? (
              <ErrorState
                actionLabel={emptyState.actionLabel}
                message={emptyState.message}
                onRetry={handleRetryLastSearch}
                title={emptyState.title}
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

                <Text style={styles.title}>Centros Espiritas Proximos</Text>
                <Text style={styles.subtitle}>
                  Descubra centros espiritas perto de voce, veja horarios quando
                  disponiveis, confira detalhes e abra a rota no Google Maps.
                </Text>

                <View style={styles.heroActions}>
                  <Pressable
                    disabled={isBusy}
                    onPress={() => void loadNearbyUsingCurrentLocation(true)}
                    style={[
                      styles.heroButton,
                      styles.primaryHeroButton,
                      isBusy ? styles.disabledButton : null,
                    ]}
                  >
                    <Text style={styles.primaryHeroButtonText}>{locationButtonLabel}</Text>
                  </Pressable>
                </View>

                {originLabel ? <Text style={styles.originLabel}>{originLabel}</Text> : null}
                {refreshingLocation ? (
                  <Text style={styles.refreshText}>Atualizando sua localizacao...</Text>
                ) : null}
              </View>

              <View
                onLayout={({ nativeEvent }) => {
                  setSearchPanelY(nativeEvent.layout.y);
                }}
                style={styles.searchPanel}
              >
                <Text style={styles.searchTitle}>Buscar manualmente por cidade ou bairro</Text>
                <Text style={styles.searchText}>
                  Use esta opcao quando preferir explorar outra regiao ou quando a
                  permissao de localizacao estiver desativada.
                </Text>

                <TextInput
                  autoCapitalize="words"
                  editable={!isBusy}
                  onChangeText={setManualQuery}
                  onFocus={scrollToSearchPanel}
                  onSubmitEditing={() => void handleManualSearch()}
                  placeholder="Ex.: Centro, Cuiaba ou Barra do Garcas"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                  style={[styles.input, isBusy ? styles.inputDisabled : null]}
                  value={manualQuery}
                />

                <Pressable
                  disabled={isBusy}
                  onPress={() => void handleManualSearch()}
                  style={[
                    styles.heroButton,
                    styles.primaryHeroButton,
                    isBusy ? styles.disabledButton : null,
                  ]}
                >
                  <Text style={styles.primaryHeroButtonText}>{manualButtonLabel}</Text>
                </Pressable>
              </View>

              <View style={styles.favoritesSection}>
                <Text style={styles.sectionEyebrow}>Favoritos</Text>
                <Text style={styles.sectionTitle}>Centros salvos neste aparelho</Text>
                <Text style={styles.sectionText}>
                  Use esta lista para voltar rapido aos centros que voce quer acessar com
                  mais frequencia.
                </Text>

                {loadingFavorites ? (
                  <View style={styles.infoPanel}>
                    <Text style={styles.infoPanelTitle}>Carregando favoritos salvos</Text>
                    <Text style={styles.infoPanelText}>
                      Assim que terminar, eles aparecem aqui no topo.
                    </Text>
                  </View>
                ) : favoriteCenters.length ? (
                  favoriteCenters.map((favoriteCenter) => (
                    <CenterCard
                      center={favoriteCenter}
                      favoriteDisabled={updatingFavoriteId === favoriteCenter.id}
                      isFavorite
                      key={`favorite-${favoriteCenter.id}`}
                      onPressDetails={() =>
                        navigation.navigate('Details', {
                          center: favoriteCenter,
                          origin,
                        })
                      }
                      onPressRoute={() => void handleOpenRoute(favoriteCenter)}
                      onToggleFavorite={() => void handleToggleFavorite(favoriteCenter)}
                    />
                  ))
                ) : (
                  <View style={styles.infoPanel}>
                    <Text style={styles.infoPanelTitle}>Voce ainda nao salvou favoritos</Text>
                    <Text style={styles.infoPanelText}>
                      Toque em "Salvar nos favoritos" em qualquer centro para manter uma
                      lista rapida neste aparelho.
                    </Text>
                  </View>
                )}
              </View>

              {shouldShowLoadingState ? <LoadingState /> : null}
              {error ? (
                <ErrorState
                  actionLabel={errorRetryLabel}
                  message={error}
                  onRetry={handleRetryLastSearch}
                />
              ) : null}

              {!loading && centers.length ? (
                <View style={styles.resultsCard}>
                  <Text style={styles.resultsLabel}>
                    {centers.length} centro(s) encontrado(s) por proximidade
                  </Text>
                  <Text style={styles.resultsSubtext}>
                    Toque em um card para ver detalhes, salvar nos favoritos ou abrir a
                    rota com facilidade.
                  </Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <CenterCard
              center={item}
              favoriteDisabled={updatingFavoriteId === item.id}
              isFavorite={favoriteIds.has(item.id)}
              onPressDetails={() =>
                navigation.navigate('Details', {
                  center: item,
                  origin,
                })
              }
              onPressRoute={() => void handleOpenRoute(item)}
              onToggleFavorite={() => void handleToggleFavorite(item)}
            />
          )}
        />

        {!isKeyboardVisible ? (
          <View
            onLayout={({ nativeEvent }) => {
              setFooterHeight(nativeEvent.layout.height);
            }}
            style={[
              styles.fixedAdFooter,
              {
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}
          >
            <AdMobBanner />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.6,
  },
  favoritesSection: {
    gap: 12,
    marginTop: 2,
  },
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
  infoPanel: {
    ...theme.shadows.soft,
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 6,
    marginBottom: 4,
    padding: 16,
  },
  infoPanelText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  infoPanelTitle: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
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
  inputDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
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
  sectionEyebrow: {
    color: theme.colors.info,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.primaryDark,
    fontSize: 19,
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
