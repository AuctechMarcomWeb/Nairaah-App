import React, { useState } from 'react';
import {
  View, Text, Modal, FlatList, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../themes';
import { Divider } from './index';

/**
 * PickerModal — generic bottom-sheet picker with optional search + "Add New" button
 * Props:
 *   visible, title, items, onSelect, onClose
 *   renderItem(item, onSelectFn) — custom row renderer
 *   onAddNew — if passed, shows "+ Add New" button at top
 *   addNewLabel — label for the button (default: "+ Add New")
 *   searchable — show search bar (default: false)
 *   loading — show loading spinner
 */
export function PickerModal({
  visible, title, items, onSelect, onClose,
  renderItem, onAddNew, addNewLabel, searchable = false, loading = false,
}) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? items.filter(item => {
        const q = query.toLowerCase();
        return (
          (item.name     || '').toLowerCase().includes(q) ||
          (item.userId   || '').toLowerCase().includes(q) ||
          (item.phone    || '').toLowerCase().includes(q) ||
          (item.mobile   || '').toLowerCase().includes(q)
        );
      })
    : items;

  const handleClose = () => { setQuery(''); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />

          {/* Title */}
          <Text style={s.title}>{title}</Text>

          {/* Search bar */}
          {searchable && (
            <View style={s.searchRow}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                style={s.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search name, ID, phone..."
                placeholderTextColor={colors.onSurfaceMuted}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Text style={s.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Add New button */}
          {onAddNew && (
            <TouchableOpacity style={s.addNewBtn} onPress={() => { handleClose(); onAddNew(); }}>
              <Text style={s.addNewIcon}>+</Text>
              <Text style={s.addNewTxt}>{addNewLabel || 'Add New'}</Text>
            </TouchableOpacity>
          )}

          <Divider style={{ marginVertical: 10 }} />

          {/* List */}
          {loading ? (
            <ActivityIndicator style={{ paddingVertical: 32 }} color={colors.primary} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item, index) => item._id || item.id || String(index)}
              renderItem={({ item }) => renderItem(item, () => { setQuery(''); onSelect(item); })}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
                  <Text style={{ color: colors.onSurfaceMuted, fontSize: 14 }}>
                    {query.trim() ? 'No results found' : 'No items found'}
                  </Text>
                </View>
              }
            />
          )}

          <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.xl, paddingBottom: 40, maxHeight: '80%' },
  handle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 14 },
  title:   { ...typography.headlineSmall, color: colors.onSurface, marginBottom: 10 },

  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceVariant, borderRadius: radius.md, paddingHorizontal: 10, marginBottom: 10 },
  searchIcon: { fontSize: 15, marginRight: 6 },
  searchInput:{ flex: 1, height: 42, ...typography.bodyMedium, color: colors.onSurface },
  clearBtn:   { fontSize: 14, color: colors.onSurfaceMuted, paddingHorizontal: 6 },

  addNewBtn:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryContainer, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.md, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed' },
  addNewIcon: { fontSize: 20, fontWeight: '800', color: colors.primary },
  addNewTxt:  { ...typography.titleSmall, color: colors.primary, fontWeight: '700' },

  cancelBtn:  { marginTop: 12, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  cancelText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});
