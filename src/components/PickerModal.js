import React from 'react';
import {
  View, Text, Modal, FlatList,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../themes';
import { Divider } from './index';

/**
 * PickerModal — generic bottom-sheet picker (FlatList based)
 * Props:
 *   visible, title, items, onSelect, onClose
 *   renderItem(item, onSelectFn) — custom row renderer
 */
export function PickerModal({ visible, title, items, onSelect, onClose, renderItem }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <Divider style={{ marginVertical: 12 }} />
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={({ item }) => renderItem(item, () => onSelect(item))}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: spacing.xl,
    paddingBottom: 40, maxHeight: '70%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16,
  },
  title: { ...typography.headlineSmall, color: colors.onSurface },
  cancelBtn: {
    marginTop: 14, height: 48, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.outline,
  },
  cancelText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});
