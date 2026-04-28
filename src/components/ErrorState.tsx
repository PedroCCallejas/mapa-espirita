import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type ErrorStateProps = {
  actionLabel?: string;
  message: string;
  onRetry?: () => void;
  tone?: 'empty' | 'error';
  title?: string;
};

export function ErrorState({
  actionLabel = 'Tentar novamente',
  message,
  onRetry,
  title = 'Não foi possível concluir a busca',
  tone = 'error',
}: ErrorStateProps) {
  const appearance =
    tone === 'empty'
      ? {
          badgeBackground: theme.colors.primarySoft,
          badgeLabel: 'Sem resultados',
          borderColor: theme.colors.border,
          containerBackground: theme.colors.backgroundAlt,
          titleColor: theme.colors.primaryDark,
        }
      : {
          badgeBackground: theme.colors.warningSoft,
          badgeLabel: 'Algo saiu do esperado',
          borderColor: '#F5C27A',
          containerBackground: '#FFF9F2',
          titleColor: '#9A3412',
        };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: appearance.containerBackground,
          borderColor: appearance.borderColor,
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: appearance.badgeBackground }]}>
        <Text style={styles.badgeText}>{appearance.badgeLabel}</Text>
      </View>
      <Text style={[styles.title, { color: appearance.titleColor }]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  button: {
    ...theme.shadows.soft,
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  container: {
    ...theme.shadows.soft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 12,
    marginVertical: 12,
    padding: 18,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
});
