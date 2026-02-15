export type ThemeMode = 'light' | 'dark';

export interface ColorScheme {
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceHover: string;
  
  primary: string;
  primaryDim: string;
  primaryLight: string;
  
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  white: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  
  success: string;
  warning: string;
  error: string;
  info: string;
  
  overlay: string;
  shimmer: string;
  border: string;
}

const darkColors: ColorScheme = {
  background: '#000000',
  surface: '#0A0A0A',
  surfaceVariant: '#1A1A1A',
  surfaceHover: '#252525',
  
  primary: '#A3A3A3',
  primaryDim: '#737373',
  primaryLight: '#D4D4D4',
  
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textTertiary: '#737373',
  
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  overlay: 'rgba(0, 0, 0, 0.8)',
  shimmer: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(163, 163, 163, 0.2)',
};

const lightColors: ColorScheme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#E5E5E5',
  surfaceHover: '#D4D4D4',
  
  primary: '#525252',
  primaryDim: '#737373',
  primaryLight: '#404040',
  
  text: '#000000',
  textSecondary: '#525252',
  textTertiary: '#737373',
  
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: 'rgba(0, 0, 0, 0.05)',
  border: 'rgba(82, 82, 82, 0.2)',
};

export const COLORS = darkColors;

export const getColors = (mode: ThemeMode): ColorScheme => {
  return mode === 'dark' ? darkColors : lightColors;
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'monospace',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height:0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

export interface Theme {
  colors: ColorScheme;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  animation: typeof ANIMATION;
}

export const createTheme = (mode: ThemeMode): Theme => ({
  colors: getColors(mode),
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  animation: ANIMATION,
});
