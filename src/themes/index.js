import colors from './colors';
import typography from './typography';

// Export spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Export border radius constants
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 100,
};

// Export elevation/shadow constants
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

export { colors, typography };

export default {
  colors,
  typography,
  spacing,
  radius,
  elevation,
};
