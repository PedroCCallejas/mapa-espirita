import { Platform } from 'react-native';

export const theme = {
  colors: {
    accent: '#C47A34',
    accentSoft: '#F6E5D1',
    background: '#F5EFE6',
    backgroundAlt: '#FBF8F2',
    border: '#E6D8C5',
    borderStrong: '#D5C3AA',
    danger: '#B42318',
    dangerSoft: '#FEE4E2',
    info: '#7C5A3C',
    primary: '#165A55',
    primaryDark: '#0E4641',
    primarySoft: '#DCEFEA',
    success: '#0F7B50',
    successSoft: '#DCFCE7',
    surface: '#FFFFFF',
    surfaceMuted: '#F7F1E8',
    text: '#1F2937',
    textMuted: '#667085',
    warning: '#B76E17',
    warningSoft: '#FEF3C7',
    white: '#FFFFFF',
  },
  radius: {
    lg: 24,
    md: 18,
    pill: 999,
    sm: 12,
  },
  shadows: {
    card: {
      elevation: Platform.OS === 'android' ? 4 : 0,
      shadowColor: '#5E4A35',
      shadowOffset: {
        height: 10,
        width: 0,
      },
      shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.18,
      shadowRadius: 18,
    },
    soft: {
      elevation: Platform.OS === 'android' ? 2 : 0,
      shadowColor: '#5E4A35',
      shadowOffset: {
        height: 6,
        width: 0,
      },
      shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0.12,
      shadowRadius: 12,
    },
  },
};
