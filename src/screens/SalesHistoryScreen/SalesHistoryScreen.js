import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar,
  Modal, FlatList,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, StatusChip, Divider, SearchBar, Dropdown } from '../../components';
import { salesHistory } from '../../data/mockData';

// ─────────────────────────────────────────────────────────
// Product Detail Modal — opens on row click
// ─────────────────────────────────────────────────────────
function ProductDetailModal({ visible, order, onClose }) {
  if (!order) return null;

  const subtotal = order.items.reduce((a, i) => a + i.total, 0);
  const grandTotal = order.totalAmount;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={md.overlay}>
        <View style={md.sheet}>
          <View style={md.handle} />

          {/* Order Header */}
          <View style={md.orderHeader}>
            <View>
              <Text style={md.billNo}>{order.billNo}</Text>
              <Text style={md.buyerName}>{order.buyerName}</Text>
              <Text style={md.buyerMeta}>{order.buyerType} · {order.date}</Text>
            </View>
            <View style={md.statusCol}>
              <StatusChip status={order.paymentStatus} />
              <View style={{ marginTop: 4 }}>
                <StatusChip status={order.orderStatus} />
              </View>
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {/* Product Table Header */}
          <View style={md.tableHeaderRow}>
            <Text style={[md.th, { width: 28 }]}>S.No</Text>
            <Text style={[md.th, { width: 70 }]}>Prod ID</Text>
            <Text style={[md.th, { flex: 1 }]}>Name</Text>
            <Text style={[md.th, { width: 32, textAlign: 'center' }]}>Qty</Text>
            <Text style={[md.th, { width: 54, textAlign: 'right' }]}>Price</Text>
            <Text style={[md.th, { width: 38, textAlign: 'right' }]}>GST</Text>
            <Text style={[md.th, { width: 58, textAlign: 'right' }]}>Total</Text>
          </View>

          {/* Product Rows */}
          <ScrollView style={md.tableScroll} showsVerticalScrollIndicator={false}>
            {order.items.map((item, index) => (
              <View key={index}>
                <View style={md.tableRow}>
                  <Text style={[md.td, { width: 28, color: colors.onSurfaceMuted }]}>
                    {index + 1}
                  </Text>
                  <Text style={[md.td, { width: 70, color: colors.primaryLight, fontSize: 10 }]}>
                    {item.productId}
                  </Text>
                  <Text style={[md.tdName, { flex: 1 }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[md.td, { width: 32, textAlign: 'center' }]}>
                    {item.qty}
                  </Text>
                  <Text style={[md.td, { width: 54, textAlign: 'right' }]}>
                    ₹{item.price.toLocaleString()}
                  </Text>
                  <Text style={[md.td, { width: 38, textAlign: 'right', color: colors.onSurfaceMuted }]}>
                    {item.gst}%
                  </Text>
                  <Text style={[md.tdAmt, { width: 58, textAlign: 'right' }]}>
                    ₹{item.total.toLocaleString()}
                  </Text>
                </View>
                {index < order.items.length - 1 && <Divider />}
              </View>
            ))}
          </ScrollView>

          {/* Bill Summary */}
          <View style={md.summaryBox}>
            <View style={md.summaryRow}>
              <Text style={md.summaryLabel}>Subtotal</Text>
              <Text style={md.summaryVal}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={md.summaryRow}>
              <Text style={md.summaryLabel}>GST Amount</Text>
              <Text style={md.summaryVal}>₹{(grandTotal - subtotal).toLocaleString()}</Text>
            </View>
            <Divider style={{ marginVertical: 6 }} />
            <View style={md.summaryRow}>
              <Text style={md.summaryTotalLabel}>Grand Total</Text>
              <Text style={md.summaryTotalVal}>₹{grandTotal.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity style={md.closeBtn} onPress={onClose}>
            <Text style={md.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const md = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.xl, paddingBottom: 40,
    maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 18,
  },

  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  billNo: { ...typography.headlineSmall, color: colors.primary },
  buyerName: { ...typography.titleSmall, color: colors.onSurface, marginTop: 2 },
  buyerMeta: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  statusCol: { alignItems: 'flex-end' },

  // Table
  tableHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 7,
    marginBottom: 2,
  },
  th: { ...typography.labelSmall, color: colors.primaryDark },
  tableScroll: { maxHeight: 200 },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: 9,
  },
  td: { ...typography.bodySmall, color: colors.onSurface },
  tdName: { ...typography.bodySmall, color: colors.onSurface, lineHeight: 15 },
  tdAmt: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },

  summaryBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md, padding: spacing.md, marginTop: 10, marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3,
  },
  summaryLabel: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  summaryVal: { ...typography.bodyMedium, color: colors.onSurface },
  summaryTotalLabel: { ...typography.titleMedium, color: colors.onSurface },
  summaryTotalVal: { ...typography.titleLarge, color: colors.primary },

  closeBtn: {
    height: 50, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.outline,
  },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

// ─────────────────────────────────────────────────────────
// Orders Table Row
// ─────────────────────────────────────────────────────────
function OrderTableRow({ item, index, onPress }) {
  const isEven = index % 2 === 0;
  return (
    <TouchableOpacity
      style={[tr.row, isEven && tr.rowEven]}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Buyer Type */}
      <View style={tr.cellBuyerType}>
        <View style={[
          tr.typeTag,
          { backgroundColor: item.buyerType === 'Distributor' ? colors.primaryContainer : colors.surfaceVariant },
        ]}>
          <Text style={[
            tr.typeTagText,
            { color: item.buyerType === 'Distributor' ? colors.primary : colors.onSurfaceVariant },
          ]}>
            {item.buyerType === 'Distributor' ? '🤝 Dist.' : '👤 Cust.'}
          </Text>
        </View>
      </View>

      {/* Distributor/Name */}
      <Text style={[tr.cell, tr.cellName]} numberOfLines={2}>{item.buyerName}</Text>

      {/* Bill No */}
      <Text style={[tr.cell, tr.cellBill]} numberOfLines={1}>{item.billNo}</Text>

      {/* Total Amount */}
      <Text style={[tr.cell, tr.cellAmt]}>₹{item.totalAmount.toLocaleString()}</Text>

      {/* Status / Remark */}
      <View style={tr.cellStatus}>
        <StatusChip status={item.paymentStatus} />
        <Text style={tr.arrowHint}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const tr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  rowEven: { backgroundColor: colors.background },
  cellBuyerType: { width: 68 },
  typeTag: {
    borderRadius: radius.sm, paddingHorizontal: 5, paddingVertical: 3, alignSelf: 'flex-start',
  },
  typeTagText: { ...typography.labelSmall, fontSize: 10 },
  cell: { ...typography.bodySmall, color: colors.onSurface },
  cellName: { flex: 1, marginLeft: 6 },
  cellBill: { width: 70, color: colors.primary, textAlign: 'center' },
  cellAmt: { width: 64, textAlign: 'right', fontWeight: '700', color: colors.onSurface },
  cellStatus: { width: 72, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 2 },
  arrowHint: { fontSize: 16, color: colors.outline, fontWeight: '300' },
});

// ─────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────
export default function SalesHistoryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const statusFilters = ['All', 'Paid', 'Pending'];
  const typeFilters = ['All', 'Customer', 'Distributor'];

  const filtered = salesHistory.filter(s => {
    const searchOk =
      s.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      s.billNo.toLowerCase().includes(search.toLowerCase());
    const statusOk = filterStatus === 'All' || s.paymentStatus === filterStatus;
    const typeOk = filterType === 'All' || s.buyerType === filterType;
    return searchOk && statusOk && typeOk;
  });

  const totalAmt = salesHistory.reduce((a, s) => a + s.totalAmount, 0);

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="Orders"
        subtitle={`${salesHistory.length} total orders`}
        rightIcon="➕"
        onRightPress={() => navigation.navigate('CreateSale')}
      />

      <View style={s.body}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statVal}>{salesHistory.length}</Text>
            <Text style={s.statLabel}>Total Orders</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statVal}>₹{(totalAmt / 1000).toFixed(1)}K</Text>
            <Text style={s.statLabel}>Total Amount</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: colors.success }]}>
              {salesHistory.filter(s => s.paymentStatus === 'Paid').length}
            </Text>
            <Text style={s.statLabel}>Paid</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={[s.statVal, { color: colors.pending }]}>
              {salesHistory.filter(s => s.paymentStatus === 'Pending').length}
            </Text>
            <Text style={s.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or bill no..."
          style={s.searchBox}
        />

        {/* Filters — Two Dropdowns */}
        <View style={s.filterRow}>
          <Dropdown
            label="Buyer:"
            value={filterType}
            options={typeFilters}
            onSelect={setFilterType}
          />
          <View style={{ width: 10 }} />
          <Dropdown
            label="Status:"
            value={filterStatus}
            options={statusFilters}
            onSelect={setFilterStatus}
          />
        </View>

        {/* Table */}
        <View style={s.tableCard}>
          {/* Table Header */}
          <View style={s.tableHeaderRow}>
            <Text style={[s.th, { width: 68 }]}>Buyer Type</Text>
            <Text style={[s.th, { flex: 1, marginLeft: 6 }]}>Dist./Name</Text>
            <Text style={[s.th, { width: 70, textAlign: 'center' }]}>Bill No</Text>
            <Text style={[s.th, { width: 64, textAlign: 'right' }]}>Amount</Text>
            <Text style={[s.th, { width: 72, textAlign: 'right' }]}>Status</Text>
          </View>

          {/* Rows */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.length > 0 ? (
              filtered.map((order, index) => (
                <OrderTableRow
                  key={order.id}
                  item={order}
                  index={index}
                  onPress={() => { setSelectedOrder(order); setShowDetail(true); }}
                />
              ))
            ) : (
              <View style={s.emptyRow}>
                <Text style={s.emptyIcon}>🧾</Text>
                <Text style={s.emptyText}>No orders found</Text>
              </View>
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </View>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showDetail}
        order={selectedOrder}
        onClose={() => setShowDetail(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg, paddingBottom: 0, zIndex: 1 },

  statsRow: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', padding: spacing.md,
    marginBottom: 10, ...elevation.level1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { ...typography.titleLarge, color: colors.primary },
  statLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 1 },
  statDiv: { width: 1, backgroundColor: colors.divider },

  searchBox: { marginBottom: 8 },  // override spacing for SearchBar component

  filterRow: {
    flexDirection: 'row', marginBottom: 10, zIndex: 10,
  },

  tableCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    overflow: 'hidden', flex: 1, ...elevation.level1,
  },
  tableHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md, paddingVertical: 9,
  },
  th: { ...typography.labelSmall, color: colors.primaryDark, fontWeight: '700' },

  emptyRow: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});
