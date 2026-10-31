// Material Design 3 — Blue & White Theme
export const colors = {
  // Primary
  primary: '#1A73E8',
  primaryDark: '#1557B0',
  primaryLight: '#4A90D9',
  primaryContainer: '#D3E3FD',
  onPrimaryContainer: '#0A3880',

  // Surface
  background: '#F8FAFF',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF2FA',
  outline: '#C5CAE9',
  outlineVariant: '#E8EDF7',

  // Text
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#44474F',
  onSurfaceMuted: '#8A8FA8',

  // Status
  success: '#1E8E3E',
  successContainer: '#E6F4EA',
  warning: '#F9AB00',
  warningContainer: '#FEF7E0',
  error: '#D93025',
  errorContainer: '#FCE8E6',
  pending: '#E37400',
  pendingContainer: '#FEF0D4',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  divider: '#E8EDF7',
};

export const typography = {
  displaySmall: { fontSize: 24, fontWeight: '700', letterSpacing: 0 },
  headlineMedium: { fontSize: 20, fontWeight: '700', letterSpacing: 0 },
  headlineSmall: { fontSize: 18, fontWeight: '600', letterSpacing: 0 },
  titleLarge: { fontSize: 16, fontWeight: '600', letterSpacing: 0.15 },
  titleMedium: { fontSize: 14, fontWeight: '600', letterSpacing: 0.1 },
  titleSmall: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  bodyLarge: { fontSize: 15, fontWeight: '400', letterSpacing: 0.5 },
  bodyMedium: { fontSize: 13, fontWeight: '400', letterSpacing: 0.25 },
  bodySmall: { fontSize: 11, fontWeight: '400', letterSpacing: 0.4 },
  labelLarge: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  labelMedium: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  labelSmall: { fontSize: 10, fontWeight: '500', letterSpacing: 0.5 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 100,
};

export const elevation = {
  level1: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};
