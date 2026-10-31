import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Modal,
} from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../theme';
import { AppHeader, StatusChip, Divider } from '../components';
import Icon, { Icons } from '../components/Icon';
import { commissionHistory } from '../data/mockData';
import { UPLINE_LEVEL_COLORS } from '../constants/levels';

// ── Commission Card ───────────────────────────────────────
function CommCard({ item, onPress }) {
  const uplineLevelColor = UPLINE_LEVEL_COLORS;
  const lvlColor = uplineLevelColor[item.levelLabel] || colors.primary;
  return (
    <TouchableOpacity style={cc.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[cc.leftBar, { backgroundColor: lvlColor }]} />
      <View style={cc.iconBox}>
        <Icon name={Icons.commission} size={20} color={colors.success} />
      </View>
      <View style={cc.info}>
        <Text style={cc.from}>{item.fromName}</Text>
        <Text style={cc.meta}>{item.orderId} · {item.date}</Text>
        <View style={cc.levelRow}>
          <View style={[cc.levelChip, { backgroundColor: lvlColor + '20', borderColor: lvlColor }]}>
            <Text style={[cc.levelChipText, { color: lvlColor }]}>{item.level}</Text>
          </View>
          <Text style={cc.pct}>{item.percentage}% of ₹{item.saleAmount.toLocaleString()}</Text>
        </View>
      </View>
      <View style={cc.right}>
        <Text style={cc.amount}>+₹{item.amount.toLocaleString()}</Text>
        <StatusChip status={item.status} />
      </View>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, marginBottom: 8, ...elevation.level1, overflow: 'hidden',
  },
  leftBar: { width: 4, alignSelf: 'stretch', borderRadius: 4, marginRight: 10 },
  iconBox: {
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: colors.successContainer,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  info: { flex: 1 },
  from: { ...typography.titleSmall, color: colors.onSurface },
  meta: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  levelChip: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  levelChipText: { ...typography.labelSmall },
  pct: { ...typography.bodySmall, color: colors.onSurfaceMuted },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { ...typography.titleSmall, color: colors.success },
});

// ── Detail Modal icon map ─────────────────────────────────
const DETAIL_ROWS = (item) => [
  { icon: Icons.idCard,      label: 'Commission ID',       value: item.id },
  { icon: Icons.joinDate,    label: 'Date',                value: item.date },
  { icon: Icons.orders,      label: 'Order / Trans. ID',   value: item.orderId },
  { icon: Icons.cycle,       label: 'Payout Cycle',        value: item.payoutCycleId || '—' },
  { icon: Icons.customer,    label: 'Seller',              value: `${item.sellerName || item.fromName} (${item.sellerId || item.fromId})` },
  { icon: Icons.sale,        label: 'Buyer',               value: `${item.buyerName || '—'} (${item.buyerId || '—'})` },
  { icon: Icons.level,       label: 'Upline Level',        value: item.level },
  { icon: Icons.eligible,    label: 'Commission %',        value: `${item.percentage}%` },
  { icon: Icons.commission,  label: 'Sale Amount (Base)',  value: `₹${(item.commissionBase || item.saleAmount)?.toLocaleString()}` },
  { icon: Icons.paid,        label: 'Commission Amount',   value: `₹${item.amount.toLocaleString()}` },
];

function DetailModal({ visible, item, onClose }) {
  if (!item) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />
          <Text style={dm.title}>Commission Details</Text>
          <Divider style={{ marginVertical: 12 }} />
          {DETAIL_ROWS(item).map(({ icon, label, value }) => (
            <View key={label} style={dm.row}>
              <Icon name={icon} size={16} color={colors.primary} style={dm.rowIcon} />
              <Text style={dm.rowLabel}>{label}</Text>
              <Text style={dm.rowVal}>{value}</Text>
            </View>
          ))}
          <View style={dm.row}>
            <Icon name={Icons.filter} size={16} color={colors.primary} style={dm.rowIcon} />
            <Text style={dm.rowLabel}>Status</Text>
            <StatusChip status={item.status} />
          </View>
          {item.remarks ? (
            <View style={dm.remarksBox}>
              <Text style={dm.remarksLabel}>Remarks</Text>
              <Text style={dm.remarksText}>{item.remarks}</Text>
            </View>
          ) : null}
          <Divider style={{ marginVertical: 12 }} />
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
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.xl, paddingBottom: 40,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16 },
  title: { ...typography.headlineMedium, color: colors.onSurface },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowIcon: { marginRight: 10 },
  rowLabel: { ...typography.labelLarge, color: colors.onSurfaceMuted, flex: 1 },
  rowVal: { ...typography.bodyMedium, color: colors.onSurface },
  closeBtn: { height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
  remarksBox: { backgroundColor: colors.surfaceVariant, borderRadius: radius.md, padding: spacing.md, marginTop: 4 },
  remarksLabel: { ...typography.labelMedium, color: colors.onSurfaceMuted, marginBottom: 4 },
  remarksText: { ...typography.bodyMedium, color: colors.onSurface },
});

// ── Main Screen ───────────────────────────────────────────
export default function CommissionScreen() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const filters = ['All', 'Pending', 'Eligible', 'Hold', 'Payout Generated', 'Paid', 'Cancelled'];
  const filtered = commissionHistory.filter(c => filterStatus === 'All' || c.status === filterStatus);

  const pending  = commissionHistory.filter(c => c.status === 'Pending').reduce((a, c) => a + c.amount, 0);
  const eligible = commissionHistory.filter(c => c.status === 'Eligible').reduce((a, c) => a + c.amount, 0);
  const hold     = commissionHistory.filter(c => c.status === 'Hold').reduce((a, c) => a + c.amount, 0);
  const paid     = commissionHistory.filter(c => c.status === 'Paid').reduce((a, c) => a + c.amount, 0);

  const SUMMARY = [
    { iconName: Icons.pending,  color: colors.pending,      val: pending,  label: 'Pending'  },
    { iconName: Icons.eligible, color: colors.primaryLight, val: eligible, label: 'Eligible' },
    { iconName: Icons.hold,     color: colors.warning,      val: hold,     label: 'Hold'     },
    { iconName: Icons.paid,     color: colors.success,      val: paid,     label: 'Paid'     },
  ];

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Commission History" subtitle={`${commissionHistory.length} records`} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Summary */}
        <View style={s.summaryCard}>
          {SUMMARY.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={s.summaryDiv} />}
              <View style={s.summaryItem}>
                <Icon name={item.iconName} size={22} color={item.color} style={{ marginBottom: 4 }} />
                <Text style={[s.summaryVal, { color: item.color }]}>₹{item.val.toLocaleString()}</Text>
                <Text style={s.summaryLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Level Breakdown */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Commission by Upline Level</Text>
          {['Direct Parent (1st Upline)', '2nd Upline', '3rd Upline', '4th Upline'].map((level) => {
            const items = commissionHistory.filter(c => c.level === level);
            const total = items.reduce((a, c) => a + c.amount, 0);
            const maxAmt = commissionHistory.reduce((a, c) => a + c.amount, 0);
            const barWidth = maxAmt > 0 ? (total / maxAmt) * 100 : 0;
            return (
              <View key={level} style={s.levelRow}>
                <Text style={s.levelLabel} numberOfLines={2}>{level}</Text>
                <View style={s.levelBarBg}>
                  <View style={[s.levelBarFill, { width: `${barWidth}%` }]} />
                </View>
                <Text style={s.levelAmt}>₹{total.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        {/* Filter chips */}
        <View style={s.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filterStatus === f && s.filterChipActive]}
              onPress={() => setFilterStatus(f)}>
              <Text style={[s.filterText, filterStatus === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Commission list */}
        {filtered.map(item => (
          <CommCard
            key={item.id}
            item={item}
            onPress={() => { setSelected(item); setShowDetail(true); }}
          />
        ))}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Icon name={Icons.empty} size={48} color={colors.onSurfaceMuted} style={{ opacity: 0.4, marginBottom: 10 }} />
            <Text style={s.emptyText}>No commissions found</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <DetailModal visible={showDetail} item={selected} onClose={() => setShowDetail(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.lg },

  summaryCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', padding: spacing.lg, marginBottom: 12, ...elevation.level1,
  },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryVal:   { ...typography.titleLarge },
  summaryLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 2 },
  summaryDiv:   { width: 1, backgroundColor: colors.divider },

  card:      { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface, marginBottom: spacing.md },

  levelRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  levelLabel:  { ...typography.bodySmall, color: colors.onSurfaceVariant, width: 90 },
  levelBarBg:  { flex: 1, height: 8, backgroundColor: colors.surfaceVariant, borderRadius: radius.full, marginHorizontal: 8 },
  levelBarFill:{ height: 8, backgroundColor: colors.primary, borderRadius: radius.full },
  levelAmt:    { ...typography.titleSmall, color: colors.primary, width: 60, textAlign: 'right' },

  filterRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip:     { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surface },
  filterChipActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  filterText:     { ...typography.labelLarge, color: colors.onSurfaceMuted },
  filterTextActive:{ color: colors.white },

  empty:     { alignItems: 'center', paddingVertical: 48 },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});
