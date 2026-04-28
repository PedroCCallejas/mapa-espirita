import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { SkeletonCenterCard } from './SkeletonCenterCard';

type LoadingStateProps = {
  message?: string;
  showSkeletons?: boolean;
};

export function LoadingState({
  message = 'Buscando centros próximos de você...',
  showSkeletons = true,
}: LoadingStateProps) {
  if (!showSkeletons) {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Text style={styles.inlineMessage}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>Carregando resultados</Text>
        </View>
        <Text style={styles.title}>{message}</Text>
        <Text style={styles.subtitle}>
          Estamos preparando uma lista acolhedora com os centros encontrados na sua região.
        </Text>
      </View>

      <View style={styles.skeletonList}>
        <SkeletonCenterCard />
        <SkeletonCenterCard />
        <SkeletonCenterCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginVertical: 12,
  },
  heroCard: {
    ...theme.shadows.soft,
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroPillText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  inlineContainer: {
    ...theme.shadows.soft,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inlineMessage: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    flex: 1,
  },
  skeletonList: {
    gap: 0,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    color: theme.colors.primaryDark,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
});
