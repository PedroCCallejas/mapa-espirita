import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { DetailsScreen } from '../screens/DetailsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const BACK_ICON = '\u2039';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    border: theme.colors.border,
    card: theme.colors.surface,
    notification: theme.colors.accent,
    primary: theme.colors.primary,
    text: theme.colors.text,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          cardStyle: { backgroundColor: theme.colors.background },
          headerBackTitleVisible: false,
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Pressable
                accessibilityLabel="Voltar"
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>{BACK_ICON}</Text>
                <Text style={styles.backLabel}>Voltar</Text>
              </Pressable>
            ) : undefined,
          headerStyle: {
            backgroundColor: theme.colors.primaryDark,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.colors.white,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: theme.colors.white,
            fontSize: 18,
            fontWeight: '700',
          },
          headerLeftContainerStyle: styles.backButtonContainer,
          headerRight: () => <View style={styles.headerSpacer} />,
        })}
      >
        <Stack.Screen
          component={HomeScreen}
          name="Home"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={DetailsScreen}
          name="Details"
          options={{ title: 'Detalhes do centro' }}
        />
        <Stack.Screen
          component={MapScreen}
          name="Map"
          options={{ title: 'Mapa dos centros' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  backButtonContainer: {
    paddingLeft: 8,
  },
  backIcon: {
    color: theme.colors.white,
    fontSize: 28,
    lineHeight: 28,
    marginTop: -2,
  },
  backLabel: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 52,
  },
});
