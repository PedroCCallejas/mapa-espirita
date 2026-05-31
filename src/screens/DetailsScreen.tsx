import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { loadFavoriteCenters, toggleFavoriteCenter } from '../services/favorites';
import { getCenterDetails } from '../services/googlePlaces';
import type { Center } from '../types/center';
import { formatDistanceKm } from '../utils/distance';
import { translateWeekdayDescriptions } from '../utils/hours';
import { openRouteInGoogleMaps } from '../utils/maps';

type DetailsScreenProps = StackScreenProps<RootStackParamList, 'Details'>;

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatusLabel({ center }: { center: Center }) {
  const labelMap = {
    CLOSED: 'Fechado',
    OPEN: 'Aberto agora',
    UNKNOWN: 'Horário indisponível',
  };

  return <Text style={styles.statusLabel}>{labelMap[center.status]}</Text>;
}

function formatBusinessStatus(businessStatus?: string | null) {
  if (!businessStatus) {
    return undefined;
  }

  const labelMap: Record<string, string> = {
    CLOSED_PERMANENTLY: 'Fechado permanentemente',
    CLOSED_TEMPORARILY: 'Fechado temporariamente',
    OPERATIONAL: 'Em operação',
  };

  return labelMap[businessStatus] ?? businessStatus;
}

export function DetailsScreen({ route }: DetailsScreenProps) {
  const { center: initialCenter, origin } = route.params;

  const [center, setCenter] = useState<Center>(initialCenter);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const details = await getCenterDetails(initialCenter.id, {
          fallback: initialCenter,
          origin: origin ?? initialCenter.location,
        });

        if (active) {
          setCenter(details);
        }
      } catch (detailsError) {
        if (active) {
          setError(
            detailsError instanceof Error
              ? detailsError.message
              : 'Não foi possível carregar os detalhes completos deste centro.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      active = false;
    };
  }, [initialCenter, origin]);

  useEffect(() => {
    let active = true;

    const loadFavoriteStatus = async () => {
      try {
        const favoriteCenters = await loadFavoriteCenters();

        if (active) {
          setIsFavorite(
            favoriteCenters.some((favoriteCenter) => favoriteCenter.id === center.id),
          );
        }
      } catch {
        if (active) {
          setError(
            (currentError) =>
              currentError ?? 'Não foi possível carregar seus favoritos salvos.',
          );
        }
      }
    };

    void loadFavoriteStatus();

    return () => {
      active = false;
    };
  }, [center.id]);

  const handleOpenWebsite = async () => {
    if (!center.website) {
      return;
    }

    await Linking.openURL(center.website);
  };

  const handleOpenRoute = async () => {
    await openRouteInGoogleMaps(origin, center.location, center.address);
  };

  const handleToggleFavorite = async () => {
    try {
      setUpdatingFavorite(true);
      const result = await toggleFavoriteCenter(center);
      setIsFavorite(result.isFavorite);
    } catch {
      setError('Não foi possível atualizar seus favoritos neste aparelho. Tente novamente.');
    } finally {
      setUpdatingFavorite(false);
    }
  };

  const photoCredit = center.photo?.authorAttributions?.[0]?.displayName;
  const translatedWeekdayDescriptions = translateWeekdayDescriptions(center.weekdayDescriptions);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {center.photo?.url ? (
          <Image source={{ uri: center.photo.url }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Text style={styles.heroFallbackText}>Sem foto disponível</Text>
          </View>
        )}

        <View style={styles.panel}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{center.name}</Text>
            <Text style={styles.distance}>{formatDistanceKm(center.distanceKm)}</Text>
          </View>

          <StatusLabel center={center} />
          <Text style={styles.address}>{center.address}</Text>

          {typeof center.rating === 'number' ? (
            <Text style={styles.rating}>
              Avaliação: {center.rating.toFixed(1)}
              {center.userRatingCount ? ` (${center.userRatingCount})` : ''}
            </Text>
          ) : null}

          {photoCredit ? <Text style={styles.credit}>Foto: {photoCredit}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <InfoRow label="Telefone" value={center.phone} />
          <InfoRow label="Site" value={center.website} />
          <InfoRow label="Endereço" value={center.address} />
          <InfoRow
            label="Status do estabelecimento"
            value={formatBusinessStatus(center.businessStatus)}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Horário de funcionamento</Text>
          {translatedWeekdayDescriptions.length ? (
            translatedWeekdayDescriptions.map((item) => (
              <Text key={item} style={styles.hoursLine}>
                {item}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhum horário informado pelo Google.</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleOpenRoute} style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Como chegar</Text>
          </Pressable>

          <Pressable
            disabled={updatingFavorite}
            onPress={() => void handleToggleFavorite()}
            style={[
              styles.button,
              isFavorite ? styles.favoriteButtonActive : styles.favoriteButton,
              updatingFavorite ? styles.buttonDisabled : null,
            ]}
          >
            <Text
              style={[
                styles.favoriteButtonText,
                isFavorite ? styles.favoriteButtonTextActive : null,
              ]}
            >
              {isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            </Text>
          </Pressable>

          {center.website ? (
            <Pressable
              onPress={handleOpenWebsite}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Abrir site</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <LoadingState
            message="Atualizando detalhes e horários..."
            showSkeletons={false}
          />
        ) : null}
        {error ? (
          <ErrorState
            message={error}
            title="Mostrando os dados já encontrados"
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 8,
  },
  address: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  credit: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  distance: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  favoriteButton: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  favoriteButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  favoriteButtonTextActive: {
    color: theme.colors.primaryDark,
  },
  heroFallback: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    justifyContent: 'center',
  },
  heroFallbackText: {
    color: theme.colors.info,
    fontSize: 16,
    fontWeight: '700',
  },
  heroImage: {
    borderRadius: theme.radius.lg,
    height: 240,
    marginBottom: 16,
    width: '100%',
  },
  hoursLine: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoRow: {
    gap: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
    padding: 18,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  rating: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  secondaryButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    color: theme.colors.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  statusLabel: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
});
