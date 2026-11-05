import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, StatusChip, Divider } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { getMyPayouts } from '../../api/payout';

function PayoutCard({ item, onPress }) {
  return (
    <TouchableOpacity style={pc.card} onPress={onPress} activeOpacity={0.8}>
      <View style={pc.header}>
        <View style={pc.cycleBox}>
          <Icon name={Icons.calendar} size={22} color={colors.primary} />
          <View>
            <Text style={pc.cycleTitle}>Payout Cycle</Text>
            <Text style={pc.cycleDates}>{item.cycleStart} – {item.cycleEnd}</Text>
          </View>
        </View>
        <StatusChip status={item.status} />
      </View>

      <Divider style={{ marginVertical: 10 }} />

      <View style={pc.statsRow}>
        <View style={pc.statItem}>
          <Text style={pc.statLabel}>Total Business</Text>
          <Text style={pc.statVal}>₹{item.totalBusiness.toLocaleString()}</Text>
        </View>
        <View style={pc.statDiv} />
        <View style={pc.statItem}>
          <Text style={pc.statLabel}>Commission</Text>
          <Text style={[pc.statVal, { color: colors.success }]}>₹{item.commissionEarned.toLocaleString()}</Text>
        </View>
        <View style={pc.statDiv} />
        <View style={pc.statItem}>
          <Text style={pc.statLabel}>Net Payout</Text>
          <Text style={[pc.statVal, { color: colors.primary }]}>
            {item.netAmount ? `₹${item.netAmount.toLocaleString()}` : 'Pending'}
          </Text>
        </View>
      </View>

      {item.referenceNo && (
        <View style={pc.refRow}>
          <Text style={pc.refLabel}>Ref: </Text>
          <Text style={pc.refVal}>{item.referenceNo}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const pc = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: 12, ...elevation.level1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cycleBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cycleTitle: { ...typography.labelMedium, color: colors.onSurfaceMuted },
  cycleDates: { ...typography.titleSmall, color: colors.onSurface, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  statVal: { ...typography.titleSmall, color: colors.onSurface, marginTop: 2 },
  statDiv: { width: 1, height: 30, backgroundColor: colors.divider },
  refRow: { flexDirection: 'row', marginTop: 8 },
  refLabel: { ...typography.bodySmall, color: colors.onSurfaceMuted },
  refVal: { ...typography.bodySmall, color: colors.primary, fontFamily: 'monospace' },
});

function DetailModal({ visible, item, onClose }) {
  if (!item) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />
          <View style={dm.titleRow}>
            <Text style={dm.title}>Payout Details</Text>
            <StatusChip status={item.status} />
          </View>
          <Text style={dm.cycleText}>{item.cycleStart} – {item.cycleEnd}</Text>

          <Divider style={{ marginVertical: 12 }} />

          {/* PO Summary */}
          <Text style={dm.sectionLabel}>PO Summary</Text>
          {[
            ['Period', item.periodKey || '—'],
            ['Total Business', `₹${(item.totalBusiness || 0).toLocaleString()}`],
            ['Direct Commission', `₹${(item.directCommission || 0).toLocaleString()}`],
            ['Team Commission', `₹${(item.teamCommission || 0).toLocaleString()}`],
            ['Commission Earned', `₹${(item.commissionEarned || 0).toLocaleString()}`],
            ['Milestone Reward', `₹${(item.milestoneReward || 0).toLocaleString()}`],
            ['TDS', item.tds ? `-₹${item.tds.toLocaleString()}` : 'N/A'],
            ['Net Payout', item.netAmount ? `₹${item.netAmount.toLocaleString()}` : 'Pending'],
            ['Payment Status', item.paymentStatus || item.status || '—'],
          ].map(([label, value]) => (
            <View key={label} style={dm.row}>
              <Text style={dm.rowLabel}>{label}</Text>
              <Text style={[dm.rowVal, label === 'Net Payout' && { color: colors.primary, fontWeight: '700' }]}>{value}</Text>
            </View>
          ))}

          <Divider style={{ marginVertical: 12 }} />

          {/* Level Breakup */}
          <Text style={dm.sectionLabel}>Level-wise Breakup</Text>
          <View style={dm.tableHeader}>
            <Text style={[dm.th, { flex: 2 }]}>Level</Text>
            <Text style={[dm.th, { flex: 1, textAlign: 'center' }]}>Count</Text>
            <Text style={[dm.th, { flex: 2, textAlign: 'right' }]}>Business</Text>
            <Text style={[dm.th, { flex: 2, textAlign: 'right' }]}>Commission</Text>
          </View>
          {item.levelBreakup.map(lb => (
            <View key={lb.level} style={dm.tableRow}>
              <Text style={[dm.td, { flex: 2 }]}>{lb.level}</Text>
              <Text style={[dm.td, { flex: 1, textAlign: 'center' }]}>{lb.count}</Text>
              <Text style={[dm.td, { flex: 2, textAlign: 'right' }]}>₹{lb.business.toLocaleString()}</Text>
              <Text style={[dm.td, { flex: 2, textAlign: 'right', color: colors.success }]}>₹{lb.commission.toLocaleString()}</Text>
            </View>
          ))}

          {item.referenceNo && (
            <>
              <Divider style={{ marginVertical: 12 }} />
              <Text style={dm.sectionLabel}>Payment Info</Text>
              <View style={dm.row}>
                <Text style={dm.rowLabel}>Bank</Text>
                <Text style={dm.rowVal}>{item.bankName} ••••{item.accountLast4}</Text>
              </View>
              <View style={dm.row}>
                <Text style={dm.rowLabel}>Reference No</Text>
                <Text style={[dm.rowVal, { color: colors.primary, fontSize: 11 }]}>{item.referenceNo}</Text>
              </View>
              {item.processedDate && (
                <View style={dm.row}>
                  <Text style={dm.rowLabel}>Processed Date</Text>
                  <Text style={dm.rowVal}>{item.processedDate}</Text>
                </View>
              )}
            </>
          )}

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
    backgroundColor: colors.surface, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: spacing.xl, paddingBottom: 40, maxHeight: '85%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.headlineMedium, color: colors.onSurface },
  cycleText: { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginTop: 4 },
  sectionLabel: { ...typography.titleSmall, color: colors.primary, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  rowVal: { ...typography.bodyMedium, color: colors.onSurface },
  tableHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: 4 },
  th: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  tableRow: { flexDirection: 'row', paddingVertical: 7 },
  td: { ...typography.bodySmall, color: colors.onSurface },
  closeBtn: { height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

export default function PayoutScreen() {
  const { user } = useSelector(state => state.user);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchPayouts = useCallback(async () => {
    const id = user?._id || user?.userId;
    if (!id) return;
    try {
      const res = await getMyPayouts(id);
      if (res.success) {
        const normalized = (res.data?.payouts || res.data || []).map(p => ({
          ...p,
          id: p._id,
          cycleStart: p.cycleStart || (p.periodFrom ? new Date(p.periodFrom).toLocaleDateString('en-IN') : ''),
          cycleEnd: p.cycleEnd || (p.periodTo ? new Date(p.periodTo).toLocaleDateString('en-IN') : ''),
          totalBusiness: p.totalBusiness || p.groupBusiness || 0,
          commissionEarned: p.commissionEarned || p.totalCommission || 0,
          netAmount: p.netAmount || p.payableAmount || null,
          tds: p.tds || p.tdsAmount || null,
          status: p.status || 'Pending',
          levelBreakup: p.levelBreakup || p.levelWise || [],
          referenceNo: p.referenceNo || p.transactionId || null,
          bankName: p.bankName || '',
          accountLast4: p.accountLast4 || '',
          processedDate: p.processedDate || (p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : null),
        }));
        setPayouts(normalized);
      }
    } catch (e) {
      console.error('[PAYOUT SCREEN] fetch error:', e);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPayouts();
      setLoading(false);
    })();
  }, [fetchPayouts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayouts();
    setRefreshing(false);
  };

  const totalPaid = payouts.filter(p => p.status === 'Paid').reduce((a, p) => a + (p.netAmount || 0), 0);
  const processing = payouts.find(p => p.status === 'Processing');

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Payout History" subtitle={`${payouts.length} cycles`} />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Summary Banner */}
          <View style={s.banner}>
            <View style={s.bannerLeft}>
              <Text style={s.bannerLabel}>Total Paid Out</Text>
              <Text style={s.bannerVal}>₹{totalPaid.toLocaleString()}</Text>
            </View>
            {processing && (
              <View style={s.bannerRight}>
                <Text style={s.bannerLabel}>Processing</Text>
                <Text style={[s.bannerVal, { color: colors.warning }]}>
                  ₹{(processing.commissionEarned || 0).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {payouts.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Icon name={Icons.empty} size={48} color={colors.onSurfaceMuted} style={{ opacity: 0.4, marginBottom: 10 }} />
              <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceMuted }}>No payout records yet</Text>
            </View>
          ) : (
            payouts.map(item => (
              <PayoutCard key={item.id} item={item} onPress={() => { setSelected(item); setShowDetail(true); }} />
            ))
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <DetailModal visible={showDetail} item={selected} onClose={() => setShowDetail(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  banner: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    flexDirection: 'row', padding: spacing.xl, marginBottom: 16, ...elevation.level2,
  },
  bannerLeft: { flex: 1 },
  bannerRight: { flex: 1, alignItems: 'flex-end' },
  bannerLabel: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  bannerVal: { ...typography.headlineMedium, color: colors.white, marginTop: 4 },
});
