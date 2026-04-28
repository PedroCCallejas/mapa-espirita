import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Center } from '../types/center';
import { formatDistanceKm } from '../utils/distance';
import { getTodayHours } from '../utils/hours';

type CenterCardProps = {
  center: Center;
  onPressDetails: () => void;
  onPressRoute: () => void;
};

const statusAppearance = {
  OPEN: {
    backgroundColor: theme.colors.successSoft,
    color: theme.colors.success,
    label: 'Aberto agora',
  },
  CLOSED: {
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    label: 'Fechado',
  },
  UNKNOWN: {
    backgroundColor: theme.colors.warningSoft,
    color: theme.colors.warning,
    label: 'Sem horário',
  },
};

function formatRating(center: Center) {
  if (typeof center.rating !== 'number') {
    return 'Sem avaliacao';
  }

  const total = center.userRatingCount ? ` (${center.userRatingCount})` : '';
  return `${center.rating.toFixed(1)}${total}`;
}

function getPhotoCredit(center: Center) {
  const attribution = center.photo?.authorAttributions?.[0];
  return attribution?.displayName ? `Foto: ${attribution.displayName}` : null;
}

export function CenterCard({
  center,
  onPressDetails,
  onPressRoute,
}: CenterCardProps) {
  const status = statusAppearance[center.status];
  const todayHours = getTodayHours(center.weekdayDescriptions);
  const photoCredit = getPhotoCredit(center);

  return (
    <View style={styles.card}>
      {center.photo?.url ? (
        <Image source={{ uri: center.photo.url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>Sem foto</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topMetaRow}>
          <View style={[styles.statusChip, { backgroundColor: status.backgroundColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={styles.distanceChip}>
            <Text style={styles.distance}>{formatDistanceKm(center.distanceKm)}</Text>
          </View>
        </View>

        <Text style={styles.name}>{center.name}</Text>

        <View style={styles.addressBlock}>
          <Text style={styles.addressLabel}>Endereco</Text>
          <Text style={styles.address}>{center.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.rating}>Avaliacao: {formatRating(center)}</Text>
          <Text style={styles.hours}>
            {todayHours ? `Hoje: ${todayHours}` : 'Hoje: sem horario informado'}
          </Text>
        </View>

        {photoCredit ? <Text style={styles.credit}>{photoCredit}</Text> : null}

        <View style={styles.actionsRow}>
          <Pressable onPress={onPressDetails} style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Ver detalhes</Text>
          </Pressable>

          <Pressable onPress={onPressRoute} style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Como chegar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  address: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  addressBlock: {
    gap: 4,
  },
  addressLabel: {
    color: theme.colors.info,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  button: {
    ...theme.shadows.soft,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  card: {
    ...theme.shadows.card,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    gap: 12,
    padding: 18,
  },
  credit: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  distance: {
    color: theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  distanceChip: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hours: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  image: {
    height: 184,
    width: '100%',
  },
  infoRow: {
    gap: 8,
  },
  name: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  placeholderImage: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.colors.info,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  rating: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  statusChip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  topMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
