import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../themes';
import Icon from './Icon';

/**
 * SearchBar — reusable search input
 * Props: value, onChangeText, placeholder, focused, onFocus, onBlur
 */
export function SearchBar({ value, onChangeText, placeholder, focused, onFocus, onBlur, style }) {
  return (
    <View style={[s.box, focused && s.boxFocused, style]}>
      <Icon name="magnify" size={15} color={colors.onSurfaceMuted} style={{ marginRight: 8 }} />
      <TextInput
        style={s.input}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={colors.onSurfaceMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Icon name="close" size={15} color={colors.onSurfaceMuted} style={{ padding: 4 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.outline,
    paddingHorizontal: spacing.md, height: 48,
  },
  boxFocused: { borderColor: colors.primary },
  icon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, ...typography.bodyLarge, color: colors.onSurface },
  clear: { fontSize: 13, color: colors.onSurfaceMuted, padding: 4 },
});
