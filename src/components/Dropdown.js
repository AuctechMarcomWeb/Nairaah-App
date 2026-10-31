import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

/**
 * Dropdown — inline dropdown with overlay menu
 * Props: label, value, options (string[]), onSelect
 */
export function Dropdown({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.wrapper}>
      <TouchableOpacity
        style={[s.trigger, open && s.triggerOpen]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}>
        <Text style={s.triggerLabel}>{label}</Text>
        <Text style={s.triggerValue} numberOfLines={1}>{value}</Text>
        <Text style={[s.arrow, open && s.arrowUp]}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={s.menu}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.menuItem, value === opt && s.menuItemActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}>
              {value === opt && <Text style={s.menuCheck}>✓ </Text>}
              <Text style={[s.menuItemText, value === opt && s.menuItemTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative', zIndex: 10 },
  trigger: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.outline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, height: 44,
  },
  triggerOpen: { borderColor: colors.primary },
  triggerLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginRight: 4 },
  triggerValue: { ...typography.titleSmall, color: colors.onSurface, flex: 1 },
  arrow: { fontSize: 13, color: colors.onSurfaceMuted, marginLeft: 4 },
  arrowUp: { transform: [{ rotate: '180deg' }], color: colors.primary },
  menu: {
    position: 'absolute', top: 48, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primary,
    zIndex: 100, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  menuItemActive: { backgroundColor: colors.primaryContainer },
  menuCheck: { ...typography.titleSmall, color: colors.primary, marginRight: 2 },
  menuItemText: { ...typography.bodyMedium, color: colors.onSurface },
  menuItemTextActive: { color: colors.primary, fontWeight: '700' },
});
