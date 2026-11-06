/**
 * PayoutScreen — My Commission
 * Shows distributor's payout batches — mirrors Admin → /distributor/payouts
 * Data: GET /api/payout/my/:distributorId
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Modal, ActivityIndicator, RefreshControl, FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, Divider, StatusChip } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { getMyPayouts } from '../../api/payout';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rs  = (v) => `₹${(Number(v) || 0).toLocaleString('en-IN')}`;
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const BATCH_STATUS_COLOR = {
  Published: { bg: '#e0f2fe', text: '#0369a1' },
  Generated: { bg: '#eff6ff', text: '#1d4ed8' },
  Closed:    { bg: '#f0fdf4', text: '#15803d' },
};
const PAY_STATUS_COLOR = {
  Pending:  { bg: '#fef9c3', text: '#854d0e' },
  Paid:     { bg: '#dcfce7', text: '#15803d' },
  Rejected: { bg: '#fee2e2', text: '#b91c1c' },
};

function StatusBadge({ status, map }) {
  const s = map[status] || { bg: colors.surfaceVariant, text: colors.onSurfaceMuted };
  return (
    <View style={[sb.badge, { backgroundColor: s.bg }]}>
      <Text style={[sb.text, { color: s.text }]}>{status}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  badge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  text:  { fontSize: 11, fontWeight: '700' },
});

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ visible, item, onClose }) {
  if (!item) return null;
  const rows = [
    ['Payout No.',        item.batchNumber],
    ['Period',            item.periodKey],
    ['Start Date',        fmtDate(item.periodStart)],
    ['End Date',          fmtDate(item.periodEnd)],
    ['Published At',      item.publishedAt ? fmtDate(item.publishedAt) : '—'],
    ['Direct Commission', rs(item.directCommission)],
    ['Team Commission',   rs(item.teamCommission)],
    ['Total Commission',  rs(item.totalCommission)],
    ['Total Credit',      rs(item.totalCredit)],
    ['Total Reversal',    rs(item.totalReversal)],
    ['Unit Sales',        String(item.totalUnitSale ?? 0)],
    ['Business Amount',   rs(item.totalBusinessAmount)],
    ['Milestone Reward',  rs(item.milestoneReward)],
    ['Grand Total',       rs(item.grandTotal)],
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />

          {/* Header */}
          <View style={dm.header}>
            <View style={{ flex: 1 }}>
              <Text style={dm.title}>{item.batchNumber}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <StatusBadge status={item.batchStatus} map={BATCH_STATUS_COLOR} />
                <StatusBadge status={item.status}      map={PAY_STATUS_COLOR}   />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={dm.totalLabel}>Grand Total</Text>
              <Text style={dm.totalVal}>{rs(item.grandTotal)}</Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Period */}
            <Text style={dm.section}>Period Info</Text>
            {rows.slice(0, 5).map(([label, val]) => (
              <View key={label} style={dm.row}>
                <Text style={dm.rowLabel}>{label}</Text>
                <Text style={dm.rowVal}>{val}</Text>
              </View>
            ))}

            <Divider style={{ marginVertical: 10 }} />

            {/* Commission & Business */}
            <Text style={dm.section}>Commission & Business</Text>
            {rows.slice(5).map(([label, val]) => (
              <View key={label} style={dm.row}>
                <Text style={dm.rowLabel}>{label}</Text>
                <Text style={[dm.rowVal, label === 'Grand Total' && { color: colors.primary, fontWeight: '700', fontSize: 15 }]}>{val}</Text>
              </View>
            ))}
          </ScrollView>

          <Divider style={{ marginVertical: 12 }} />
          <TouchableOpacity style={dm.closeBtn} onPress={onClose}>
            <Text style={dm.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const dm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 32, maxHeight: '88%' },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16 },
  header:     { flexDirection: 'row', alignItems: 'flex-start' },
  title:      { ...typography.titleLarge, color: colors.primary, fontWeight: '700' },
  totalLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  totalVal:   { ...typography.headlineSmall, color: colors.primary, fontWeight: '800', marginTop: 2 },
  section:    { ...typography.labelLarge, color: colors.primary, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  rowLabel:   { ...typography.bodyMedium, color: colors.onSurfaceMuted, flex: 1 },
  rowVal:     { ...typography.bodyMedium, color: colors.onSurface, textAlign: 'right', flex: 1 },
  closeBtn:   { height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  closeTxt:   { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

// ─── Payout Card ──────────────────────────────────────────────────────────────
function PayoutCard({ item, onPress }) {
  return (
    <TouchableOpacity style={pc.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header */}
      <View style={pc.header}>
        <View style={{ flex: 1 }}>
          <Text style={pc.batchNo}>{item.batchNumber}</Text>
          <Text style={pc.period}>
            {fmtDate(item.periodStart)} – {fmtDate(item.periodEnd)}
          </Text>
          <Text style={pc.periodKey}>{item.periodKey}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <StatusBadge status={item.batchStatus} map={BATCH_STATUS_COLOR} />
          <StatusBadge status={item.status}      map={PAY_STATUS_COLOR}   />
        </View>
      </View>

      <Divider style={{ marginVertical: 10 }} />

      {/* Stats grid */}
      <View style={pc.grid}>
        <View style={pc.cell}>
          <Text style={pc.cellLabel}>Direct Comm.</Text>
          <Text style={pc.cellVal}>{rs(item.directCommission)}</Text>
        </View>
        <View style={pc.cell}>
          <Text style={pc.cellLabel}>Team Comm.</Text>
          <Text style={pc.cellVal}>{rs(item.teamCommission)}</Text>
        </View>
        <View style={pc.cell}>
          <Text style={pc.cellLabel}>Business Amt</Text>
          <Text style={[pc.cellVal, { color: colors.success }]}>{rs(item.totalBusinessAmount)}</Text>
        </View>
        <View style={pc.cell}>
          <Text style={pc.cellLabel}>Unit Sales</Text>
          <Text style={pc.cellVal}>{item.totalUnitSale ?? 0}</Text>
        </View>
      </View>

      {item.milestoneReward > 0 && (
        <View style={pc.milestoneRow}>
          <Icon name={Icons.trophy} size={14} color="#f59e0b" />
          <Text style={pc.milestoneTxt}>Milestone Reward: {rs(item.milestoneReward)}</Text>
        </View>
      )}

      {/* Grand Total */}
      <View style={pc.footer}>
        <Text style={pc.footerLabel}>Grand Total</Text>
        <Text style={pc.footerVal}>{rs(item.grandTotal)}</Text>
      </View>

      <Text style={pc.viewMore}>View Full Details ›</Text>
    </TouchableOpacity>
  );
}
const pc = StyleSheet.create({
  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  header:       { flexDirection: 'row', alignItems: 'flex-start' },
  batchNo:      { ...typography.titleMedium, color: colors.primary, fontWeight: '700' },
  period:       { ...typography.bodySmall, color: colors.onSurface, marginTop: 2 },
  periodKey:    { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 1 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  cell:         { width: '47%', backgroundColor: colors.background, borderRadius: radius.md, padding: 10 },
  cellLabel:    { ...typography.labelSmall, color: colors.onSurfaceMuted },
  cellVal:      { ...typography.titleSmall, color: colors.onSurface, fontWeight: '700', marginTop: 2 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  milestoneTxt: { ...typography.labelMedium, color: '#f59e0b', fontWeight: '600' },
  footer:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primaryContainer, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  footerLabel:  { ...typography.titleSmall, color: colors.primaryDark },
  footerVal:    { ...typography.titleLarge, color: colors.primary, fontWeight: '800' },
  viewMore:     { ...typography.labelLarge, color: colors.primary, textAlign: 'right', marginTop: 8 },
});

// ─── Summary Banner ───────────────────────────────────────────────────────────
function SummaryBanner({ summary, count }) {
  if (!summary) return null;
  return (
    <View style={sum.banner}>
      <View style={sum.item}>
        <Text style={sum.label}>Total Earned</Text>
        <Text style={sum.val}>{rs(summary.totalEarned)}</Text>
      </View>
      <View style={sum.divider} />
      <View style={sum.item}>
        <Text style={sum.label}>Total Paid</Text>
        <Text style={[sum.val, { color: '#6ee7b7' }]}>{rs(summary.totalPaid)}</Text>
      </View>
      <View style={sum.divider} />
      <View style={sum.item}>
        <Text style={sum.label}>Pending</Text>
        <Text style={[sum.val, { color: '#fcd34d' }]}>{rs(summary.totalPending)}</Text>
      </View>
    </View>
  );
}
const sum = StyleSheet.create({
  banner:  { backgroundColor: colors.primary, borderRadius: radius.lg, flexDirection: 'row', padding: spacing.lg, marginBottom: 12, ...elevation.level2 },
  item:    { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  label:   { ...typography.labelSmall, color: 'rgba(255,255,255,0.7)' },
  val:     { ...typography.titleMedium, color: colors.white, fontWeight: '800', marginTop: 4 },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function PayoutScreen() {
  const { user }     = useSelector(state => state.user);
  const [payouts,  setPayouts]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchPayouts = useCallback(async () => {
    const id = user?._id || user?.userId;
    if (!id) return;
    try {
      const res = await getMyPayouts(id);
      if (res.success) {
        const raw = res.data?.payouts || [];
        setSummary(res.data?.summary || null);
        setPayouts(raw.map(p => ({
          ...p,
          id: p._id || p.batchId,
        })));
      }
    } catch (e) {
      console.error('[PAYOUT SCREEN]', e);
    }
  }, [user]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchPayouts(); setLoading(false); })();
  }, [fetchPayouts]);

  const onRefresh = async () => { setRefreshing(true); await fetchPayouts(); setRefreshing(false); };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="My Commission" subtitle={`${payouts.length} payout cycles`} />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <SummaryBanner summary={summary} count={payouts.length} />

          {payouts.length === 0 ? (
            <View style={s.empty}>
              <Icon name="wallet-outline" size={52} color={colors.outline} style={{ marginBottom: 14 }} />
              <Text style={s.emptyTitle}>No Commission Records</Text>
              <Text style={s.emptySub}>Payout batches will appear here once admin publishes them.</Text>
            </View>
          ) : (
            payouts.map(item => (
              <PayoutCard
                key={item.id}
                item={item}
                onPress={() => setSelected(item)}
              />
            ))
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <DetailModal visible={!!selected} item={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.background },
  scroll:     { padding: spacing.lg },
  empty:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { ...typography.titleLarge, color: colors.onSurface, marginBottom: 8 },
  emptySub:   { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center' },
});
