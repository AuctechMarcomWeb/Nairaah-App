import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useDrawer } from '../../navigation/DrawerContext';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import Icon, { Icons } from '../../components/Icon';
import { AppHeader, StatusChip, Divider } from '../../components';
import { getDistributorDashboard } from '../../api/dashboard';
import { getMyOrders } from '../../api/orders';
import { getCommissionSlabs } from '../../api/commission';
import { getMilestoneProgress } from '../../api/milestone';

// ─── Helpers ────────────────────────────────────────────────────────────────

const rs = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const num = (v) => Number(v || 0).toLocaleString('en-IN');

// ─── Sub-components ──────────────────────────────────────────────────────────

// Section header with optional "See All" action
function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={sh.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const sh = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:  { ...typography.titleMedium, color: colors.onSurface },
  action: { ...typography.labelMedium, color: colors.primary },
});

// Metric row inside a card
function MetricRow({ dot, label, value, bold }) {
  return (
    <View style={mr.row}>
      {dot ? <View style={[mr.dot, { backgroundColor: dot }]} /> : null}
      <Text style={[mr.label, bold && mr.boldLabel]}>{label}</Text>
      <Text style={[mr.value, bold && mr.boldValue]}>{value}</Text>
    </View>
  );
}
const mr = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  dot:       { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  label:     { flex: 1, ...typography.bodyMedium, color: colors.onSurfaceMuted },
  value:     { ...typography.bodyMedium, color: colors.onSurface },
  boldLabel: { color: colors.onSurface, fontWeight: '700' },
  boldValue: { color: colors.primary, fontWeight: '700' },
});

// Card wrapper
function MetricCard({ title, children }) {
  return (
    <View style={mc.card}>
      <Text style={mc.title}>{title}</Text>
      <View style={mc.divider} />
      {children}
    </View>
  );
}
const mc = StyleSheet.create({
  card:    { flex: 1, minWidth: '47%', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, ...elevation.level1 },
  title:   { ...typography.titleSmall, color: colors.primary, fontWeight: '700', marginBottom: 8 },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginBottom: 8 },
});

// Team card
function TeamCard({ team }) {
  const direct   = team?.directMembers  ?? 0;
  const downline = team?.totalDownline  ?? 0;
  return (
    <MetricCard title="👥 Team">
      <View style={tc.center}>
        <Text style={tc.big}>{num(direct + downline)}</Text>
        <Text style={tc.sub}>Total Team</Text>
      </View>
      <View style={tc.row}>
        <View style={tc.cell}>
          <Text style={[tc.cellVal, { color: '#2563eb' }]}>{num(direct)}</Text>
          <Text style={tc.cellLbl}>Direct</Text>
        </View>
        <View style={tc.sep} />
        <View style={tc.cell}>
          <Text style={[tc.cellVal, { color: '#7c3aed' }]}>{num(downline)}</Text>
          <Text style={tc.cellLbl}>Downline</Text>
        </View>
      </View>
    </MetricCard>
  );
}
const tc = StyleSheet.create({
  center:  { alignItems: 'center', marginBottom: 10 },
  big:     { fontSize: 28, fontWeight: '800', color: colors.primary },
  sub:     { ...typography.bodySmall, color: colors.onSurfaceMuted },
  row:     { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  cell:    { alignItems: 'center' },
  sep:     { width: 1, backgroundColor: colors.outlineVariant },
  cellVal: { fontSize: 18, fontWeight: '700' },
  cellLbl: { ...typography.bodySmall, color: colors.onSurfaceMuted },
});

// Business card
function BusinessCard({ business }) {
  const direct = business?.direct ?? {};
  const team   = business?.team   ?? {};
  const total  = business?.total  ?? {};
  return (
    <MetricCard title="💼 Business">
      <View style={bc.row}>
        <Text style={bc.hdr}>Type</Text>
        <Text style={bc.hdrR}>Orders</Text>
        <Text style={bc.hdrR}>Amount</Text>
      </View>
      <View style={bc.row}>
        <View style={bc.dotCell}><View style={[bc.dot, { backgroundColor: '#3b82f6' }]} /><Text style={bc.lbl}>Direct</Text></View>
        <Text style={bc.val}>{num(direct.orderCount)}</Text>
        <Text style={bc.val}>{rs(direct.businessAmount)}</Text>
      </View>
      <View style={bc.row}>
        <View style={bc.dotCell}><View style={[bc.dot, { backgroundColor: '#f59e0b' }]} /><Text style={bc.lbl}>Team</Text></View>
        <Text style={bc.val}>{num(team.orderCount)}</Text>
        <Text style={bc.val}>{rs(team.businessAmount)}</Text>
      </View>
      <View style={[bc.row, bc.totalRow]}>
        <Text style={bc.totalLbl}>Total</Text>
        <Text style={bc.totalVal}>{num(total.orderCount)}</Text>
        <Text style={bc.totalVal}>{rs(total.businessAmount)}</Text>
      </View>
    </MetricCard>
  );
}
const bc = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dotCell:  { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dot:      { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  lbl:      { ...typography.bodySmall, color: colors.onSurfaceMuted },
  hdr:      { flex: 1, ...typography.labelSmall, color: colors.onSurfaceMuted, textTransform: 'uppercase' },
  hdrR:     { width: 60, ...typography.labelSmall, color: colors.onSurfaceMuted, textAlign: 'right', textTransform: 'uppercase' },
  val:      { width: 60, ...typography.bodySmall, color: colors.onSurface, textAlign: 'right' },
  totalRow: { borderTopWidth: 1, borderColor: colors.outlineVariant, marginTop: 4, paddingTop: 6 },
  totalLbl: { flex: 1, ...typography.labelMedium, color: colors.onSurface, fontWeight: '700' },
  totalVal: { width: 60, ...typography.labelMedium, color: colors.primary, textAlign: 'right', fontWeight: '700' },
});

// Commission card
function CommissionCard({ commission }) {
  const direct   = commission?.directCommission ?? 0;
  const team     = commission?.teamCommission   ?? 0;
  const credit   = commission?.totalCredit      ?? 0;
  const reversal = commission?.totalReversal    ?? 0;
  const total    = commission?.totalCommission  ?? 0;
  return (
    <MetricCard title="⭐ Commission">
      <MetricRow dot="#3b82f6" label="Direct"       value={rs(direct)}   />
      <MetricRow dot="#f59e0b" label="Team"         value={rs(team)}     />
      <MetricRow dot="#10b981" label="Total Credit" value={rs(credit)}   />
      <MetricRow dot="#dc2626" label="Reversal"     value={rs(reversal)} />
      <View style={{ height: 1, backgroundColor: colors.outlineVariant, marginVertical: 6 }} />
      <MetricRow label="Total Commission" value={rs(total)} bold />
    </MetricCard>
  );
}

// Payout card
function PayoutCard({ payout }) {
  const generated  = payout?.totalPayoutGenerated ?? 0;
  const paid       = payout?.totalPaid            ?? 0;
  const pending    = payout?.totalPending         ?? 0;
  const unpaid     = payout?.unpaidCommission     ?? 0;
  return (
    <MetricCard title="💳 Payout">
      <MetricRow dot="#6366f1" label="Generated" value={rs(generated)} />
      <MetricRow dot="#10b981" label="Paid"      value={rs(paid)}      />
      <MetricRow dot="#f59e0b" label="Pending"   value={rs(pending)}   />
      <View style={{ height: 1, backgroundColor: colors.outlineVariant, marginVertical: 6 }} />
      <MetricRow label="Unpaid / Remaining" value={rs(unpaid)} bold />
    </MetricCard>
  );
}

// Milestone progress section
function MilestoneSection({ milestone }) {
  if (!milestone) return null;
  const milestones         = milestone?.milestoneProgress ?? [];
  const summary            = milestone?.summary           ?? {};
  const total              = summary.total    ?? milestones.length;
  const achieved           = summary.achieved ?? milestones.filter(m => m.isAchieved).length;
  const currentMs          = milestones.find(m => !m.isAchieved) ?? milestones[milestones.length - 1];
  const eligibleUnits      = currentMs?.eligibleUnits   ?? 0;
  const targetUnit         = currentMs?.targetUnit      ?? 100000;
  const unitsRemaining     = currentMs?.unitsRemaining  ?? 0;
  const directCount        = currentMs?.directTeamCount ?? 0;
  const requiredDirects    = currentMs?.requiredDirects ?? 10;
  const capPerLeg          = currentMs?.capPerLeg       ?? 1000;
  const nextReward         = currentMs?.rewardAmount    ?? 0;
  const nextTitle          = currentMs?.title           ?? '';
  const isQualified        = achieved > 0;
  const overallPct         = total > 0 ? Math.min((achieved / total) * 100, 100) : 0;
  const unitPct            = targetUnit > 0 ? Math.min((eligibleUnits / targetUnit) * 100, 100) : 0;

  return (
    <View style={ms.card}>
      <View style={ms.header}>
        <Text style={ms.title}>🏆 Milestone Progress</Text>
        <View style={[ms.badge, { backgroundColor: isQualified ? '#dcfce7' : '#fef9c3' }]}>
          <Text style={[ms.badgeText, { color: isQualified ? '#166534' : '#713f12' }]}>
            {isQualified ? `${achieved}/${total} achieved` : `Not qualified — ${achieved}/${total}`}
          </Text>
        </View>
      </View>

      {/* Dots track */}
      <View style={ms.track}>
        <View style={ms.trackLine}>
          <View style={[ms.trackFill, { width: `${overallPct}%` }]} />
        </View>
        <View style={ms.dotsRow}>
          {milestones.slice(0, 10).map((m, i) => (
            <View key={i} style={[ms.dot, m.isAchieved && ms.dotAchieved]} />
          ))}
        </View>
      </View>

      {/* Progress info */}
      <View style={ms.progressBar}>
        <View style={[ms.progressFill, { width: `${unitPct}%` }]} />
      </View>
      <Text style={ms.progressText}>
        {num(eligibleUnits)} eligible units of {num(targetUnit)}
        {'  ·  '}{num(unitsRemaining)} remaining
      </Text>
      <View style={ms.infoRow}>
        <Text style={ms.infoText}>Per-leg cap: {num(capPerLeg)} units</Text>
        <Text style={ms.infoText}>Directs: {directCount}/{requiredDirects}</Text>
        {nextReward > 0 && <Text style={ms.nextReward}>Next: {rs(nextReward)} — {nextTitle}</Text>}
      </View>
    </View>
  );
}
const ms = StyleSheet.create({
  card:        { backgroundColor: '#f7f5ef', borderRadius: 14, padding: 16, marginBottom: 10, ...elevation.level1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 6 },
  title:       { ...typography.titleMedium, color: colors.onSurface },
  badge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: '600' },
  track:       { marginBottom: 10, position: 'relative' },
  trackLine:   { height: 3, backgroundColor: '#d9d3c0', borderRadius: 2, marginHorizontal: 10, marginBottom: 6 },
  trackFill:   { position: 'absolute', left: 0, top: 0, height: 3, backgroundColor: '#c8a000', borderRadius: 2 },
  dotsRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  dot:         { width: 14, height: 14, borderRadius: 7, backgroundColor: '#d9d3c0', borderWidth: 2, borderColor: '#b8b0a0' },
  dotAchieved: { backgroundColor: '#c8a000', borderColor: '#a08000' },
  progressBar: { height: 8, backgroundColor: '#d9d3c0', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill:{ height: 8, backgroundColor: '#c8a000', borderRadius: 4 },
  progressText:{ ...typography.bodySmall, color: colors.onSurfaceMuted, marginBottom: 6 },
  infoRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoText:    { ...typography.bodySmall, color: colors.onSurfaceMuted },
  nextReward:  { ...typography.bodySmall, color: '#c8a000', fontWeight: '600' },
});

// Commission Flow ("How ₹100 flows") section
const SLAB_LABELS  = ['You — Direct Seller', 'Direct Sponsor', 'Next Downline', 'Next Downline', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10'];
const SLAB_COLORS  = ['#16a34a', '#b45309', '#dc2626', '#dc2626', '#7c3aed', '#2563eb', '#0891b2', '#d97706', '#9ca3af', '#9ca3af'];

function CommissionFlowSection({ slabs }) {
  if (!slabs || slabs.length === 0) return null;
  return (
    <View style={cf.card}>
      <Text style={cf.title}>How ₹100 flows on your sale</Text>
      {slabs.map((s, i) => (
        <View key={i} style={cf.row}>
          <View style={[cf.dot, { backgroundColor: s.color ?? SLAB_COLORS[i] ?? '#9ca3af' }]} />
          <Text style={cf.label}>{s.label ?? SLAB_LABELS[i] ?? `Level ${i + 1}`}</Text>
          <View style={cf.barBg}>
            <View style={[cf.barFill, { width: `${Math.min(s.percent, 100)}%`, backgroundColor: s.color ?? SLAB_COLORS[i] ?? '#9ca3af' }]} />
          </View>
          <Text style={cf.pct}>{s.percent}%  ₹{s.amount}</Text>
        </View>
      ))}
    </View>
  );
}
const cf = StyleSheet.create({
  card:    { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, ...elevation.level1 },
  title:   { ...typography.titleMedium, color: colors.onSurface, marginBottom: 14 },
  row:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot:     { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  label:   { width: 120, ...typography.bodySmall, color: colors.onSurfaceMuted },
  barBg:   { flex: 1, height: 8, backgroundColor: colors.outlineVariant, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  pct:     { width: 60, ...typography.bodySmall, color: colors.onSurface, textAlign: 'right' },
});

// Recent order row
function RecentSaleRow({ item, onPress }) {
  const name   = item.buyer?.name || item.buyerName || item.customerName || '—';
  const amount = item.totalAmount || item.amount || 0;
  const status = item.orderStatus || item.status || 'Placed';
  const billNo = item.billNo || item.orderNumber || item._id || '';
  const date   = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '';
  return (
    <TouchableOpacity style={rsr.row} onPress={onPress} activeOpacity={0.7}>
      <View style={rsr.iconBox}>
        <Icon name={Icons.orders} size={20} color={colors.primary} />
      </View>
      <View style={rsr.info}>
        <Text style={rsr.name}>{name}</Text>
        <Text style={rsr.sub}>{billNo}{date ? `  ·  ${date}` : ''}</Text>
      </View>
      <View style={rsr.right}>
        <Text style={rsr.amount}>{rs(amount)}</Text>
        <StatusChip status={status} />
      </View>
    </TouchableOpacity>
  );
}
const rsr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info:    { flex: 1 },
  name:    { ...typography.titleSmall, color: colors.onSurface },
  sub:     { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  right:   { alignItems: 'flex-end', gap: 4 },
  amount:  { ...typography.titleSmall, color: colors.primary },
});

// ─── Slab transform (matches Admin logic) ───────────────────────────────────

function transformSlabs(slabs) {
  const rows = slabs
    .sort((a, b) => (a.order ?? a.level ?? 0) - (b.order ?? b.level ?? 0))
    .map((slab, idx) => {
      const pct = slab.commissionPercentage ?? 0;
      return {
        label:   SLAB_LABELS[idx] ?? `Level ${slab.level}`,
        percent: pct,
        amount:  parseFloat(((pct / 100) * 100).toFixed(1)),
        color:   SLAB_COLORS[idx] ?? '#9ca3af',
      };
    });
  rows.push({ label: 'A+ / Leader', percent: 0.5, amount: 0.5, color: '#c8b400' });
  return rows;
}

// ─── Dashboard Screen ────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }) {
  const { openDrawer } = useDrawer();
  const { user }       = useSelector(state => state.user);

  const [dashData,     setDashData]     = useState(null);   // from /dashboard/distributor/:id
  const [recentOrders, setRecentOrders] = useState([]);
  const [commSlabs,    setCommSlabs]    = useState([]);
  const [milestone,    setMilestone]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const displayName = user?.name || user?.fullName || user?.userId || 'User';
  const displayId   = user?.userId || '-';

  // Derived data from the single dashboard summary response
  const team       = dashData?.team       ?? {};
  const business   = dashData?.business   ?? {};
  const commission = dashData?.commission ?? {};
  const payout     = dashData?.payout     ?? {};

  const fetchDashboard = useCallback(async () => {
    if (!user?._id && !user?.userId) return;
    const id = user._id || user.userId;
    try {
      const [dashRes, ordersRes, slabsRes, msRes] = await Promise.allSettled([
        getDistributorDashboard(id),
        getMyOrders('?limit=5&sortBy=recent'),
        getCommissionSlabs(),
        getMilestoneProgress(id),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success) {
        setDashData(dashRes.value.data);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        const raw = ordersRes.value.data;
        setRecentOrders(Array.isArray(raw) ? raw : (raw?.orders ?? []));
      }

      if (slabsRes.status === 'fulfilled' && slabsRes.value?.success) {
        const d     = slabsRes.value.data;
        const slabs = d?.commissionSlabs ?? (Array.isArray(d) ? d : []);
        if (slabs.length > 0) setCommSlabs(transformSlabs(slabs));
      }

      if (msRes.status === 'fulfilled' && msRes.value?.success) {
        setMilestone(msRes.value.data);
      }
    } catch (e) {
      console.error('[DASHBOARD] fetch error:', e);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchDashboard();
      setLoading(false);
    })();
  }, [fetchDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" translucent={false} />

      <View style={styles.container}>

        {/* ── Top Header ─────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => openDrawer()} activeOpacity={0.7}>
            <Icon name="menu" size={26} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.topLogoWrap}>
            <Image
              source={require('../../assets/images/nairaah_logo.png')}
              style={styles.topLogoImg}
              resizeMode="contain"
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userId}>ID: {displayId}</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarBox}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Content ────────────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >

            {/* ── Row 1: Team + Business ─────────────────────────────────── */}
            <View style={styles.cardRow}>
              <TeamCard     team={team} />
              <BusinessCard business={business} />
            </View>

            {/* ── Row 2: Commission + Payout ────────────────────────────── */}
            <View style={styles.cardRow}>
              <CommissionCard commission={commission} />
              <PayoutCard     payout={payout} />
            </View>

            {/* ── Milestone Progress ────────────────────────────────────── */}
            <MilestoneSection milestone={milestone} />

            {/* ── Recent Orders ─────────────────────────────────────────── */}
            <View style={styles.card}>
              <SectionHeader
                title="Recent Orders"
                actionLabel="See All"
                onAction={() => navigation.navigate('SalesHistory')}
              />
              {recentOrders.length === 0 ? (
                <Text style={styles.emptyText}>No recent orders</Text>
              ) : (
                recentOrders.map((item, index) => (
                  <View key={item._id || index}>
                    <RecentSaleRow item={item} onPress={() => navigation.navigate('SalesHistory')} />
                    {index < recentOrders.length - 1 && <Divider />}
                  </View>
                ))
              )}
            </View>

            {/* ── Commission Flow ───────────────────────────────────────── */}
            <CommissionFlowSection slabs={commSlabs} />

            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLogoWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  topLogoImg: {
    width: 38,
    height: 38,
  },
  userInfo: {
    flex: 1,
    marginLeft: 2,
  },
  greeting: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },
  userName: {
    ...typography.headlineSmall,
    color: colors.white,
    marginTop: 2,
  },
  userId: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 30,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: 10,
    ...elevation.level1,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
