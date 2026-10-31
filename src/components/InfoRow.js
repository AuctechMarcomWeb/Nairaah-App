import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, typography, spacing } from '../theme';

/**
 * InfoRow — icon + label + value row (used in Profile, modals)
 *
 * Props:
 *   icon  — MaterialCommunityIcons icon name (string)
 *   label — field label
 *   value — field value
 */
export function InfoRow({ icon, label, value, valueStyle }) {
  return (
    <View style={s.row}>
      <View style={s.iconWrap}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={s.body}>
        <Text style={s.label}>{label}</Text>
        <Text style={[s.value, valueStyle]}>{value || '—'}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  iconWrap:{ width: 24, marginRight: 14, marginTop: 2, alignItems: 'center' },
  body:    { flex: 1 },
  label:   { ...typography.labelMedium, color: colors.onSurfaceMuted },
  value:   { ...typography.bodyMedium,  color: colors.onSurface, marginTop: 2 },
});
