import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../themes';

/**
 * StatsBanner — horizontal stats row with dividers
 * Props: items = [{ label, value, color? }]
 */
export function StatsBanner({ items, style }) {
  return (
    <View style={[s.row, style]}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <View style={s.divider} />}
          <View style={s.item}>
            <Text style={[s.val, item.color && { color: item.color }]}>
              {item.value}
            </Text>
            <Text style={s.label}>{item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', padding: spacing.md,
    ...elevation.level1,
  },
  item: { flex: 1, alignItems: 'center' },
  val: { ...typography.headlineSmall, color: colors.primary },
  label: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.divider },
});
