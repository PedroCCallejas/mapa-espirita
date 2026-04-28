import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { theme } from '../constants/theme';

function SkeletonLine({
  width,
}: {
  width: `${number}%` | number;
}) {
  return <View style={[styles.line, { width }]} />;
}

export function SkeletonCenterCard() {
  const opacity = useRef(new Animated.Value(0.58)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 900,
          toValue: 0.58,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <SkeletonLine width="64%" />
          <View style={styles.distancePill} />
        </View>

        <SkeletonLine width="86%" />
        <SkeletonLine width="58%" />

        <View style={styles.metaRow}>
          <View style={styles.badge} />
          <View style={styles.ratingLine} />
        </View>

        <SkeletonLine width="72%" />

        <View style={styles.actionsRow}>
          <View style={styles.secondaryButton} />
          <View style={styles.primaryButton} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  badge: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    height: 30,
    width: 112,
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
  distancePill: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.pill,
    height: 34,
    width: 88,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    backgroundColor: theme.colors.surfaceMuted,
    height: 184,
    width: '100%',
  },
  line: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    height: 14,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    flex: 1,
    height: 48,
  },
  ratingLine: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    height: 14,
    width: 92,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    flex: 1,
    height: 48,
  },
});
