import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Alert, Modal,
} from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../theme';
import { AppHeader, StatusChip, Divider, PrimaryButton, SearchBar, StatsBanner } from '../components';
import { customers } from '../data/mockData';

function CustomerCard({ item, onPress }) {
  return (
    <TouchableOpacity style={cc.card} onPress={onPress} activeOpacity={0.8}>
      <View style={cc.avatarBox}>
        <Text style={cc.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={cc.info}>
        <View style={cc.nameRow}>
          <Text style={cc.name}>{item.name}</Text>
          <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
        </View>
        <Text style={cc.id}>{item.id}</Text>
        <Text style={cc.mobile}>{item.mobile}</Text>
        <View style={cc.statsRow}>
          <Text style={cc.stat}>Orders: {item.totalOrders}</Text>
          <Text style={cc.statSep}>·</Text>
          <Text style={cc.stat}>Spent: ₹{item.totalSpent.toLocaleString()}</Text>
        </View>
      </View>
      <Text style={cc.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, marginBottom: 8, ...elevation.level1,
  },
  avatarBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { ...typography.headlineSmall, color: colors.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...typography.titleSmall, color: colors.onSurface },
  id: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  mobile: { ...typography.bodySmall, color: colors.onSurfaceMuted },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stat: { ...typography.bodySmall, color: colors.primary },
  statSep: { color: colors.outline, marginHorizontal: 4 },
  arrow: { fontSize: 24, color: colors.outline, fontWeight: '300' },
});

function DetailModal({ visible, customer, onClose, onConvert }) {
  if (!customer) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />

          <View style={dm.header}>
            <View style={dm.avatarBig}>
              <Text style={dm.avatarBigText}>{customer.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={dm.name}>{customer.name}</Text>
              <Text style={dm.id}>{customer.id}</Text>
              <StatusChip status={customer.isActive ? 'Active' : 'Inactive'} />
            </View>
          </View>

          <Divider style={{ marginVertical: 14 }} />

          {[
            ['📱', 'Mobile', customer.mobile],
            ['📧', 'Email', customer.email],
            ['🏠', 'Address', customer.address],
            ['🏙️', 'City', customer.city],
            ['📅', 'Joined', customer.joinDate],
            ['🛒', 'Total Orders', customer.totalOrders],
            ['💰', 'Total Spent', `₹${customer.totalSpent.toLocaleString()}`],
          ].map(([icon, label, value]) => (
            <View key={label} style={dm.infoRow}>
              <Text style={dm.infoIcon}>{icon}</Text>
              <Text style={dm.infoLabel}>{label}</Text>
              <Text style={dm.infoValue}>{value}</Text>
            </View>
          ))}

          <Divider style={{ marginVertical: 14 }} />

          <PrimaryButton
            label="Convert to Distributor 🤝"
            onPress={() => onConvert(customer)}
            style={{ backgroundColor: colors.success }}
          />
          <TouchableOpacity style={dm.closeBtn} onPress={onClose}>
            <Text style={dm.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.xl, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarBig: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBigText: { ...typography.headlineMedium, color: colors.primary },
  name: { ...typography.headlineSmall, color: colors.onSurface },
  id: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2, marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  infoIcon: { fontSize: 16, width: 26, marginRight: 8 },
  infoLabel: { ...typography.labelLarge, color: colors.onSurfaceMuted, flex: 1 },
  infoValue: { ...typography.bodyMedium, color: colors.onSurface, textAlign: 'right', flex: 1 },
  closeBtn: {
    marginTop: 10, height: 48, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.outline,
  },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

export default function CustomersScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConvert = (customer) => {
    setShowDetail(false);
    Alert.alert(
      'Convert to Distributor',
      `${customer.name} will be converted from Customer to Distributor. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Convert', onPress: () => Alert.alert('Success', `${customer.name} is now a Distributor!`) },
      ],
    );
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="My Customers"
        subtitle={`${customers.length} customers`}
        rightIcon="➕"
        onRightPress={() => navigation.navigate('AddMember')}
      />

      <View style={s.body}>
        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search customers..."
          focused={searchFocused}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={s.searchBox}
        />

        {/* Stats row */}
        <StatsBanner
          style={s.statsRow}
          items={[
            { label: 'Total',       value: customers.length },
            { label: 'Active',      value: customers.filter(c => c.isActive).length, color: colors.success },
            { label: 'Total Spent', value: `₹${(customers.reduce((a, c) => a + c.totalSpent, 0) / 1000).toFixed(0)}K` },
          ]}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {filtered.map(c => (
            <CustomerCard
              key={c.id}
              item={c}
              onPress={() => { setSelected(c); setShowDetail(true); }}
            />
          ))}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>👤</Text>
              <Text style={s.emptyText}>No customers found</Text>
            </View>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      <DetailModal
        visible={showDetail}
        customer={selected}
        onClose={() => setShowDetail(false)}
        onConvert={handleConvert}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg },
  searchBox: { marginBottom: 12 },
  statsRow: { marginBottom: 12 },

  scroll: {},
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});
