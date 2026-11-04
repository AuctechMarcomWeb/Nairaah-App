import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Modal, FlatList, ActivityIndicator,
  RefreshControl, Alert, TextInput, Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, StatusChip, Divider, SearchBar } from '../../components';
import {
  getMyOrders, cancelOrder, getOrderById, getOrderLogs,
} from '../../api/orders';

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'myReferral', label: 'Referral',  icon: '⭐' },
  { key: 'myCreated',  label: 'Created',   icon: '📋' },
  { key: 'myOrders',   label: 'My Orders', icon: '🛒' },
];

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'PartialCancel', 'Approved'];
const PAY_STATUSES   = ['All', 'Pending', 'Partial', 'Paid', 'Failed', 'Refunded'];
const BUYER_TYPES    = ['All', 'Customer', 'Distributor'];

const ORDER_STATUS_COLOR = {
  Pending:      { bg: '#FEF0D4', text: '#E37400' },
  Approved:     { bg: '#E6F4EA', text: '#1E8E3E' },
  Processing:   { bg: '#FEF7E0', text: '#F9AB00' },
  Shipped:      { bg: '#D3E3FD', text: '#1A73E8' },
  Delivered:    { bg: '#E6F4EA', text: '#1E8E3E' },
  Cancelled:    { bg: '#FCE8E6', text: '#D93025' },
  PartialCancel:{ bg: '#FFF3CD', text: '#856404' },
  Declined:     { bg: '#FCE8E6', text: '#D93025' },
};
const PAY_STATUS_COLOR = {
  Pending:  { bg: '#FEF0D4', text: '#E37400' },
  Partial:  { bg: '#FEF7E0', text: '#F9AB00' },
  Paid:     { bg: '#E6F4EA', text: '#1E8E3E' },
  Failed:   { bg: '#FCE8E6', text: '#D93025' },
  Refunded: { bg: '#F3E8FF', text: '#7C3AED' },
};

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—';
const fmtMoney = (v) => `₹${(Number(v) || 0).toLocaleString('en-IN')}`;

const isWithin48h = (order) => {
  const placed = order?.orderDate || order?.createdAt;
  if (!placed) return false;
  return Date.now() - new Date(placed).getTime() <= 48 * 60 * 60 * 1000;
};

// ─── Small StatusPill ──────────────────────────────────────────────────────────
function StatusPill({ status, colorMap }) {
  const c = colorMap[status] || { bg: colors.surfaceVariant, text: colors.onSurfaceMuted };
  return (
    <View style={[pill.wrap, { backgroundColor: c.bg }]}>
      <Text style={[pill.txt, { color: c.text }]}>{status}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  wrap: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  txt:  { fontSize: 11, fontWeight: '700' },
});

// ─── Filter Sheet (bottom modal) ──────────────────────────────────────────────
function FilterSheet({ visible, onClose, filters, onApply }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => { if (visible) setLocal(filters); }, [visible]);

  const chip = (field, value) => {
    const active = local[field] === value;
    return (
      <TouchableOpacity
        key={value}
        style={[fs.chip, active && fs.chipActive]}
        onPress={() => setLocal(p => ({ ...p, [field]: value }))}>
        <Text style={[fs.chipTxt, active && fs.chipTxtActive]}>{value}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={fs.overlay}>
        <View style={fs.sheet}>
          <View style={fs.handle} />
          <View style={fs.titleRow}>
            <Text style={fs.title}>Filters</Text>
            <TouchableOpacity onPress={() => setLocal({ orderStatus: 'All', payStatus: 'All', buyerType: 'All' })}>
              <Text style={fs.reset}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={fs.label}>Buyer Type</Text>
          <View style={fs.chips}>{BUYER_TYPES.map(v => chip('buyerType', v))}</View>

          <Text style={fs.label}>Order Status</Text>
          <View style={fs.chips}>{ORDER_STATUSES.map(v => chip('orderStatus', v))}</View>

          <Text style={fs.label}>Payment Status</Text>
          <View style={fs.chips}>{PAY_STATUSES.map(v => chip('payStatus', v))}</View>

          <TouchableOpacity
            style={fs.applyBtn}
            onPress={() => { onApply(local); onClose(); }}>
            <Text style={fs.applyTxt}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const fs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, paddingBottom: 32 },
  handle:  { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:   { ...typography.titleLarge, color: colors.onSurface },
  reset:   { ...typography.labelLarge, color: colors.primary },
  label:   { ...typography.labelMedium, color: colors.onSurfaceMuted, marginTop: 12, marginBottom: 6 },
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:    { borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outline },
  chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipTxt:    { ...typography.labelMedium, color: colors.onSurfaceVariant },
  chipTxtActive: { color: colors.primary, fontWeight: '700' },
  applyBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  applyTxt: { ...typography.titleMedium, color: colors.white },
});

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ visible, order, onClose, onCancel, onRefresh }) {
  const [loading, setLoading]   = useState(false);
  const [detail,  setDetail]    = useState(null);
  const [logs,    setLogs]      = useState([]);
  const [tab,     setTab]       = useState('detail');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!visible || !order?._id) return;
    setTab('detail');
    setDetail(null); setLogs([]);
    setLoading(true);
    getOrderById(order._id)
      .then(r => r.success && setDetail(r.data))
      .finally(() => setLoading(false));
  }, [visible, order?._id]);

  const loadLogs = () => {
    if (logs.length > 0) { setTab('logs'); return; }
    setLoading(true);
    getOrderLogs(order._id)
      .then(r => { if (r.success) setLogs(r.data?.logs || []); })
      .finally(() => setLoading(false));
    setTab('logs');
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          const res = await cancelOrder(order._id, { reason: 'Cancelled by distributor' });
          setCancelling(false);
          if (res.success) {
            Alert.alert('Done', 'Order cancelled successfully.');
            onClose();
            onRefresh();
          } else {
            Alert.alert('Error', res.message || 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const o = detail || order;
  const canCancel = o && !['Delivered', 'Cancelled', 'PartialCancel', 'Declined'].includes(o.orderStatus) && isWithin48h(o);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />

          {/* Header */}
          <View style={dm.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={dm.orderNo}>{o?.orderNumber || o?.billNo || o?._id?.slice(-8)}</Text>
              <Text style={dm.orderDate}>{fmtDate(o?.orderDate || o?.createdAt)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={dm.closeBtn}>
              <Text style={dm.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Status row */}
          <View style={dm.statusRow}>
            <StatusPill status={o?.orderStatus || 'Pending'} colorMap={ORDER_STATUS_COLOR} />
            <View style={{ width: 8 }} />
            <StatusPill status={o?.paymentStatus || 'Pending'} colorMap={PAY_STATUS_COLOR} />
            {o?.buyerType ? (
              <View style={[dm.buyerTag, { backgroundColor: o.buyerType === 'Distributor' ? '#EDE9FE' : '#DBEAFE' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: o.buyerType === 'Distributor' ? '#7C3AED' : '#1A73E8' }}>{o.buyerType}</Text>
              </View>
            ) : null}
          </View>

          {/* Tabs */}
          <View style={dm.tabRow}>
            {[['detail', '📄 Detail'], ['logs', '📜 Logs']].map(([key, lbl]) => (
              <TouchableOpacity
                key={key}
                style={[dm.tabBtn, tab === key && dm.tabBtnActive]}
                onPress={() => key === 'logs' ? loadLogs() : setTab('detail')}>
                <Text style={[dm.tabTxt, tab === key && dm.tabTxtActive]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color={colors.primary} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>

              {/* ── DETAIL TAB ── */}
              {tab === 'detail' && (
                <>
                  {/* Buyer */}
                  <View style={dm.section}>
                    <Text style={dm.sectionTitle}>Buyer</Text>
                    <Text style={dm.infoVal}>{o?.buyer?.name || o?.buyerName || '—'}</Text>
                    {o?.buyer?.phone ? <Text style={dm.infoSub}>{o.buyer.phone}</Text> : null}
                  </View>
                  <Divider />

                  {/* Items */}
                  <View style={dm.section}>
                    <Text style={dm.sectionTitle}>Items</Text>
                    <View style={dm.tableHead}>
                      <Text style={[dm.th, { flex: 2 }]}>Product</Text>
                      <Text style={[dm.th, { width: 40, textAlign: 'center' }]}>Qty</Text>
                      <Text style={[dm.th, { width: 70, textAlign: 'right' }]}>Price</Text>
                      <Text style={[dm.th, { width: 80, textAlign: 'right' }]}>Total</Text>
                    </View>
                    {(o?.items || []).map((item, i) => (
                      <View key={i} style={dm.tableRow}>
                        <Text style={[dm.td, { flex: 2 }]} numberOfLines={2}>{item.productName || item.name || 'Item'}</Text>
                        <Text style={[dm.td, { width: 40, textAlign: 'center' }]}>{item.quantity || item.qty || 1}</Text>
                        <Text style={[dm.td, { width: 70, textAlign: 'right' }]}>{fmtMoney(item.unitPrice || item.price || 0)}</Text>
                        <Text style={[dm.tdBold, { width: 80, textAlign: 'right' }]}>{fmtMoney(item.totalPrice || item.total || 0)}</Text>
                      </View>
                    ))}
                  </View>
                  <Divider />

                  {/* Amounts */}
                  <View style={dm.section}>
                    <Text style={dm.sectionTitle}>Amount</Text>
                    {[
                      ['Subtotal',    fmtMoney(o?.subtotal)],
                      ['Discount',    fmtMoney(o?.discount)],
                      ['Total',       fmtMoney(o?.totalAmount)],
                      ['Paid',        fmtMoney(o?.paidAmount)],
                      ['Due',         fmtMoney(o?.dueAmount)],
                    ].map(([lbl, val]) => (
                      o?.[lbl.toLowerCase().replace(' ', '')] !== undefined || lbl === 'Total' ? (
                        <View key={lbl} style={dm.amtRow}>
                          <Text style={[dm.amtLabel, lbl === 'Due' && { color: colors.error }, lbl === 'Total' && { fontWeight: '700', color: colors.onSurface }]}>{lbl}</Text>
                          <Text style={[dm.amtVal, lbl === 'Due' && { color: colors.error }, lbl === 'Total' && { fontWeight: '800', color: colors.primary }]}>{val}</Text>
                        </View>
                      ) : null
                    ))}
                  </View>

                  {/* Payment info */}
                  {(o?.paymentMethod || o?.transactionId) ? (
                    <>
                      <Divider />
                      <View style={dm.section}>
                        <Text style={dm.sectionTitle}>Payment</Text>
                        {o?.paymentMethod ? <View style={dm.amtRow}><Text style={dm.amtLabel}>Method</Text><Text style={dm.amtVal}>{o.paymentMethod}</Text></View> : null}
                        {o?.transactionId ? <View style={dm.amtRow}><Text style={dm.amtLabel}>Txn ID</Text><Text style={dm.amtVal}>{o.transactionId}</Text></View> : null}
                      </View>
                    </>
                  ) : null}

                  {/* Shipping */}
                  {o?.shippingAddress?.address ? (
                    <>
                      <Divider />
                      <View style={dm.section}>
                        <Text style={dm.sectionTitle}>Shipping Address</Text>
                        <Text style={dm.infoVal}>{o.shippingAddress.name}</Text>
                        <Text style={dm.infoSub}>{o.shippingAddress.phone}</Text>
                        <Text style={dm.infoSub}>{o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.pincode}</Text>
                        <Text style={dm.infoSub}>{o.shippingAddress.state}, {o.shippingAddress.country}</Text>
                      </View>
                    </>
                  ) : null}

                  {/* Notes */}
                  {o?.notes ? (
                    <>
                      <Divider />
                      <View style={dm.section}>
                        <Text style={dm.sectionTitle}>Notes</Text>
                        <Text style={dm.infoSub}>{o.notes}</Text>
                      </View>
                    </>
                  ) : null}
                </>
              )}

              {/* ── LOGS TAB ── */}
              {tab === 'logs' && (
                <View style={dm.section}>
                  {logs.length === 0 ? (
                    <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center', paddingVertical: 24 }}>No logs found</Text>
                  ) : logs.map((log, i) => (
                    <View key={i} style={dm.logItem}>
                      <View style={dm.logDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={dm.logAction}>{log.action?.replace(/_/g, ' ').toUpperCase()}</Text>
                        <Text style={dm.logMeta}>{fmtDate(log.createdAt)}{log.performedBy?.name ? `  ·  ${log.performedBy.name}` : ''}</Text>
                        {(log.previousStatus || log.newStatus) ? (
                          <Text style={dm.logStatus}>{log.previousStatus} → {log.newStatus}</Text>
                        ) : null}
                        {log.note ? <Text style={dm.logNote}>{log.note}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* Cancel button — only within 48h */}
          {canCancel && (
            <TouchableOpacity
              style={[dm.cancelBtn, cancelling && { opacity: 0.6 }]}
              onPress={handleCancel}
              disabled={cancelling}>
              {cancelling
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={dm.cancelTxt}>✕  Cancel Order</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: spacing.xl, paddingBottom: 32 },
  handle:    { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  orderNo:   { ...typography.titleLarge, color: colors.onSurface },
  orderDate: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  closeTxt:  { fontSize: 14, color: colors.onSurfaceMuted },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  buyerTag:  { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 },
  tabRow:    { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: radius.md, padding: 3, marginBottom: 12 },
  tabBtn:    { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: radius.sm - 2 },
  tabBtnActive: { backgroundColor: colors.surface, ...elevation.level1 },
  tabTxt:    { ...typography.labelMedium, color: colors.onSurfaceMuted },
  tabTxtActive: { color: colors.primary, fontWeight: '700' },
  section:   { paddingVertical: 12 },
  sectionTitle: { ...typography.labelMedium, color: colors.onSurfaceMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoVal:   { ...typography.titleSmall, color: colors.onSurface },
  infoSub:   { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  tableHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: 4 },
  th:        { ...typography.labelSmall, color: colors.onSurfaceMuted, fontWeight: '700' },
  tableRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  td:        { ...typography.bodySmall, color: colors.onSurface },
  tdBold:    { ...typography.bodySmall, fontWeight: '700', color: colors.onSurface },
  amtRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  amtLabel:  { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  amtVal:    { ...typography.bodyMedium, color: colors.onSurface },
  logItem:   { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  logDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5 },
  logAction: { ...typography.labelMedium, color: colors.onSurface, fontWeight: '700' },
  logMeta:   { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  logStatus: { ...typography.bodySmall, color: colors.primaryDark, marginTop: 2 },
  logNote:   { ...typography.bodySmall, color: colors.onSurfaceMuted, fontStyle: 'italic', marginTop: 2 },
  cancelBtn: { backgroundColor: colors.error, borderRadius: radius.lg, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  cancelTxt: { ...typography.titleSmall, color: colors.white, fontWeight: '700' },
});

// ─── Order Row ─────────────────────────────────────────────────────────────────
function OrderRow({ item, onPress }) {
  return (
    <TouchableOpacity style={row.wrap} onPress={onPress} activeOpacity={0.75}>
      <View style={row.left}>
        <View style={[row.typeBadge, { backgroundColor: item.buyerType === 'Distributor' ? '#EDE9FE' : '#DBEAFE' }]}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: item.buyerType === 'Distributor' ? '#7C3AED' : '#1A73E8' }}>
            {item.buyerType === 'Distributor' ? '🤝 Dist' : '👤 Cust'}
          </Text>
        </View>
        <Text style={row.buyerName} numberOfLines={1}>{item.buyerName}</Text>
        <Text style={row.meta}>{item.orderNumber || item.billNo || '—'}  ·  {fmtDate(item.orderDate || item.createdAt)}</Text>
      </View>
      <View style={row.right}>
        <Text style={row.amount}>{fmtMoney(item.totalAmount)}</Text>
        <View style={{ gap: 3, alignItems: 'flex-end', marginTop: 4 }}>
          <StatusPill status={item.orderStatus || 'Pending'}   colorMap={ORDER_STATUS_COLOR} />
          <StatusPill status={item.paymentStatus || 'Pending'} colorMap={PAY_STATUS_COLOR} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
const row = StyleSheet.create({
  wrap:      { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  left:      { flex: 1, marginRight: 8 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 4 },
  buyerName: { ...typography.titleSmall, color: colors.onSurface },
  meta:      { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  right:     { alignItems: 'flex-end', minWidth: 80 },
  amount:    { ...typography.titleSmall, color: colors.primary, fontWeight: '800' },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function SalesHistoryScreen({ navigation }) {
  const { user } = useSelector(state => state.user);

  const [activeTab, setActiveTab] = useState('myReferral');
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search,      setSearch]      = useState('');
  const [filters,     setFilters]     = useState({ orderStatus: 'All', payStatus: 'All', buyerType: 'All' });
  const [showFilter,  setShowFilter]  = useState(false);

  // Detail modal
  const [selected,    setSelected]    = useState(null);
  const [showDetail,  setShowDetail]  = useState(false);

  const PAGE_SIZE = 20;
  const searchTimer = useRef(null);

  // ── Normalize raw API order ────────────────────────────────────────────────
  const normalize = (o) => ({
    ...o,
    _id: o._id,
    orderNumber:   o.orderNumber   || o.billNo || o._id?.slice(-8),
    buyerName:     o.buyer?.name   || o.buyerName  || o.buyerId?.name  || 'Unknown',
    buyerType:     o.buyerType     || 'Customer',
    totalAmount:   o.totalAmount   || o.grandTotal  || 0,
    paidAmount:    o.paidAmount    || 0,
    dueAmount:     o.dueAmount     || 0,
    orderStatus:   o.orderStatus   || 'Pending',
    paymentStatus: o.paymentStatus || 'Pending',
    orderDate:     o.orderDate     || o.createdAt,
    items:         o.items         || [],
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (tab = activeTab, pg = 1, append = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    const params = new URLSearchParams({ type: tab, page: pg, limit: PAGE_SIZE });
    if (search.trim())                   params.set('search', search.trim());
    if (filters.buyerType  !== 'All')    params.set('buyerType',      filters.buyerType);
    if (filters.orderStatus !== 'All')   params.set('orderStatus',    filters.orderStatus);
    if (filters.payStatus  !== 'All')    params.set('paymentStatus',  filters.payStatus);

    const res = await getMyOrders(`?${params.toString()}`);
    if (res.success) {
      const list = (res.data?.orders || res.data || []).map(normalize);
      setOrders(prev => append ? [...prev, ...list] : list);
      setTotal(res.data?.totalOrders ?? list.length);
      setPage(pg);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [activeTab, search, filters]);

  // initial + on filter/search change
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchOrders(activeTab, 1, false), search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [activeTab, search, filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(activeTab, 1, false);
    setRefreshing(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearch('');
    setFilters({ orderStatus: 'All', payStatus: 'All', buyerType: 'All' });
    setOrders([]);
  };

  const loadMore = () => {
    if (loadingMore || orders.length >= total) return;
    fetchOrders(activeTab, page + 1, true);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalAmt     = orders.reduce((a, o) => a + o.totalAmount,   0);
  const paidCount    = orders.filter(o => o.paymentStatus === 'Paid').length;
  const pendingCount = orders.filter(o => o.paymentStatus === 'Pending').length;

  // Active filter count (for badge)
  const activeFilterCount = Object.values(filters).filter(v => v !== 'All').length + (search.trim() ? 1 : 0);

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="Orders"
        subtitle={`${total} orders`}
        rightIconName="plus"
        onRightPress={() => navigation.navigate('CreateSale')}
      />

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, activeTab === t.key && s.tabActive]}
            onPress={() => handleTabChange(t.key)}>
            <Text style={[s.tabTxt, activeTab === t.key && s.tabTxtActive]}>
              {t.icon} {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.body}>
        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: total,        label: 'Total',   color: colors.primary   },
            { val: fmtMoney(totalAmt), label: 'Amount', color: colors.onSurface },
            { val: paidCount,    label: 'Paid',    color: colors.success   },
            { val: pendingCount, label: 'Pending', color: colors.pending   },
          ].map((st, i) => (
            <React.Fragment key={st.label}>
              {i > 0 && <View style={s.statDiv} />}
              <View style={s.statItem}>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Search + Filter */}
        <View style={s.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search order / buyer..."
            />
          </View>
          <TouchableOpacity
            style={[s.filterBtn, activeFilterCount > 0 && s.filterBtnActive]}
            onPress={() => setShowFilter(true)}>
            <Text style={[s.filterTxt, activeFilterCount > 0 && { color: colors.primary }]}>
              ⚙️ {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filter'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} size="large" />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item, i) => item._id || String(i)}
            renderItem={({ item }) => (
              <OrderRow item={item} onPress={() => { setSelected(item); setShowDetail(true); }} />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={colors.primary} /> : <View style={{ height: 24 }} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>🧾</Text>
                <Text style={s.emptyTxt}>No orders found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Filter sheet */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={setFilters}
      />

      {/* Order detail */}
      <OrderDetailModal
        visible={showDetail}
        order={selected}
        onClose={() => setShowDetail(false)}
        onRefresh={() => fetchOrders(activeTab, 1, false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  tabBar:    { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tab:       { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabTxt:    { ...typography.labelMedium, color: colors.onSurfaceMuted },
  tabTxtActive: { color: colors.primary, fontWeight: '700' },

  body:      { flex: 1, paddingTop: spacing.md, paddingHorizontal: spacing.md },

  statsRow:  { backgroundColor: colors.surface, borderRadius: radius.lg, flexDirection: 'row', padding: spacing.md, marginBottom: 10, ...elevation.level1 },
  statItem:  { flex: 1, alignItems: 'center' },
  statVal:   { ...typography.titleMedium, fontWeight: '800' },
  statLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 1 },
  statDiv:   { width: 1, backgroundColor: colors.divider },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  filterBtn: { backgroundColor: colors.surfaceVariant, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.outline },
  filterBtnActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  filterTxt: { ...typography.labelMedium, color: colors.onSurfaceMuted },

  empty:     { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTxt:  { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});
