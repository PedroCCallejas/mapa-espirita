import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';

export function MapScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mapa interno desativado no MVP</Text>
        <Text style={styles.text}>
          Use o botao "Como chegar" para abrir a rota diretamente no Google Maps.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.primaryDark,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
