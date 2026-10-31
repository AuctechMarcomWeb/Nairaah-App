import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Modal,
} from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../theme';
import { AppHeader, StatusChip, Divider } from '../components';
import Icon, { Icons } from '../components/Icon';
import {
  teamMembers, payoutHistory, payoutCycles, salesHistory,
  commissionHistory, levelCommissions, earningsByLevel,
  monthlyCapping, cappingSlots, cappingPerSlot,
  payoutPolicy, dashboardStats,
} from '../data/mockData';

function flattenTeam(members) {
  let result = [];
  members.forEach(m => {
    result.push(m);
    if (m.children && m.children.length > 0)
      result = result.concat(flattenTeam(m.children));
  });
  return result;
}

const allMembers      = flattenTeam(teamMembers);
const selfBusiness    = salesHistory.reduce((a, s) => a + s.totalAmount, 0);
const totalGroupBusiness = allMembers.reduce((a, m) => a + m.totalBusiness, 0);
const totalBusiness   = selfBusiness + totalGroupBusiness;

// ── Payout Detail Modal ───────────────────────────────────
function PayoutDetailModal({ visible, item, onClose }) {
  if (!item) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={dm.overlay}>
        <ScrollView>
          <View style={dm.sheet}>
            <View style={dm.handle} />
            <View style={dm.titleRow}>
              <Text style={dm.title}>Payout Details</Text>
              <StatusChip status={item.status} />
            </View>
            <Text style={dm.cycleText}>{item.cycleStart} – {item.cycleEnd}</Text>
            <Divider style={{ marginVertical: 14 }} />
            <Text style={dm.sectionLabel}>PO Summary</Text>
            <View style={dm.summaryBox}>
              {[
                ['Total Business',    `₹${item.totalBusiness.toLocaleString()}`],
                ['Commission Earned', `₹${item.commissionEarned.toLocaleString()}`],
                ['TDS (10%)',         item.tds ? `-₹${item.tds.toLocaleString()}` : 'N/A'],
                ['Net Payout',        item.netAmount ? `₹${item.netAmount.toLocaleString()}` : 'Processing'],
              ].map(([label, value], i) => (
                <View key={i} style={[dm.summaryRow, i === 3 && dm.summaryRowLast]}>
                  <Text style={dm.summaryLabel}>{label}</Text>
                  <Text style={[dm.summaryVal, i === 3 && { color: colors.primary, fontWeight: '700', fontSize: 16 }]}>{value}</Text>
                </View>
              ))}
            </View>
            <Divider style={{ marginVertical: 14 }} />
            <Text style={dm.sectionLabel}>Level-wise Breakup</Text>
            <View style={dm.tableCard}>
              <View style={dm.tableHeader}>
                <Text style={[dm.th, { flex: 2 }]}>Level</Text>
                <Text style={[dm.th, { flex: 1, textAlign: 'center' }]}>Count</Text>
                <Text style={[dm.th, { flex: 2, textAlign: 'right' }]}>Business</Text>
                <Text style={[dm.th, { flex: 2, textAlign: 'right' }]}>Commission</Text>
              </View>
              {item.levelBreakup.map((lb, i) => (
                <View key={i}>
                  <View style={dm.tableRow}>
                    <Text style={[dm.td, { flex: 2 }]}>{lb.level}</Text>
                    <Text style={[dm.td, { flex: 1, textAlign: 'center' }]}>{lb.count}</Text>
                    <Text style={[dm.td, { flex: 2, textAlign: 'right' }]}>₹{lb.business.toLocaleString()}</Text>
                    <Text style={[dm.td, { flex: 2, textAlign: 'right', color: colors.success }]}>₹{lb.commission.toLocaleString()}</Text>
                  </View>
                  {i < item.levelBreakup.length - 1 && <Divider />}
                </View>
              ))}
            </View>

            {item.referenceNo && (
              <>
                <Divider style={{ marginVertical: 14 }} />
                <Text style={dm.sectionLabel}>Payment Info</Text>
                <View style={dm.summaryBox}>
                  <View style={dm.summaryRow}>
                    <Text style={dm.summaryLabel}>Bank Account</Text>
                    <Text style={dm.summaryVal}>{item.bankName} ••••{item.accountLast4}</Text>
                  </View>
                  <View style={dm.summaryRow}>
                    <Text style={dm.summaryLabel}>Reference No</Text>
                    <Text style={[dm.summaryVal, { color: colors.primary, fontSize: 11 }]}>{item.referenceNo}</Text>
                  </View>
                  {item.processedDate && (
                    <View style={dm.summaryRowLast}>
                      <Text style={dm.summaryLabel}>Processed Date</Text>
                      <Text style={dm.summaryVal}>{item.processedDate}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
            <Divider style={{ marginVertical: 14 }} />
            <TouchableOpacity style={dm.closeBtn} onPress={onClose}>
              <Text style={dm.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.surface, marginTop: 80, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.xl, paddingBottom: 48, minHeight: '100%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.headlineMedium, color: colors.onSurface },
  cycleText: { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginTop: 4 },
  sectionLabel: { ...typography.titleSmall, color: colors.primary, marginBottom: 10 },
  summaryBox: { backgroundColor: colors.surfaceVariant, borderRadius: radius.md, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.divider },
  summaryRowLast: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 11 },
  summaryLabel: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  summaryVal: { ...typography.titleSmall, color: colors.onSurface },
  tableCard: { backgroundColor: colors.surfaceVariant, borderRadius: radius.md, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: 8, backgroundColor: colors.primaryContainer },
  th: { ...typography.labelSmall, color: colors.primaryDark },
  tableRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: 10 },
  td: { ...typography.bodySmall, color: colors.onSurface },
  closeBtn: { height: 50, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

// ── Main Screen ───────────────────────────────────────────
export default function BusinessPayoutScreen() {
  const [activeTab, setActiveTab] = useState('business');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPayoutDetail, setShowPayoutDetail] = useState(false);

  const totalPaid   = payoutHistory.filter(p => p.status === 'Paid').reduce((a, p) => a + (p.netAmount || 0), 0);
  const pendingComm = commissionHistory.filter(c => c.status === 'Pending').reduce((a, c) => a + c.amount, 0);

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Business & Payout" subtitle="Commission summary" />

      {/* Tab Toggle */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'business' && s.tabBtnActive]}
          onPress={() => setActiveTab('business')}>
          <Icon name={Icons.payout} size={16} color={activeTab === 'business' ? colors.primary : colors.onSurfaceMuted} />
          <Text style={[s.tabBtnText, activeTab === 'business' && s.tabBtnTextActive]}>  Business</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'payout' && s.tabBtnActive]}
          onPress={() => setActiveTab('payout')}>
          <Icon name={Icons.commission} size={16} color={activeTab === 'payout' ? colors.primary : colors.onSurfaceMuted} />
          <Text style={[s.tabBtnText, activeTab === 'payout' && s.tabBtnTextActive]}>  Payout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {activeTab === 'business' && (
          <>
            {/* Total Business Banner */}
            <View style={s.banner}>
              <View style={s.bannerLeft}>
                <Text style={s.bannerLabel}>Total Group Business</Text>
                <Text style={s.bannerVal}>₹{totalBusiness.toLocaleString()}</Text>
              </View>
              <View style={s.bannerRight}>
                <Text style={s.bannerLabel}>My Self Business</Text>
                <Text style={s.bannerValSm}>₹{selfBusiness.toLocaleString()}</Text>
                <Text style={[s.bannerLabel, { marginTop: 8 }]}>Team Business</Text>
                <Text style={s.bannerValSm}>₹{totalGroupBusiness.toLocaleString()}</Text>
              </View>
            </View>

            {/* Monthly Capping */}
            <View style={s.cappingCard}>
              <View style={s.cappingRow}>
                <View style={s.cappingLeft}>
                  <Text style={s.cappingTitle}>Monthly Capping ({cappingSlots} slots)</Text>
                  <Text style={s.cappingAmt}>₹{cappingPerSlot.toLocaleString()} × {cappingSlots} = ₹{monthlyCapping.toLocaleString()}</Text>
                  <Text style={s.cappingEarned}>This month: ₹{dashboardStats.thisMonthEarning.toLocaleString()}</Text>
                </View>
                <View style={s.cappingRight}>
                  <View style={s.cappingCircle}>
                    <Text style={s.cappingPct}>{Math.round((dashboardStats.thisMonthEarning / monthlyCapping) * 100)}%</Text>
                    <Text style={s.cappingPctLabel}>Used</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                {Array.from({ length: cappingSlots }).map((_, i) => {
                  const slotEarned = Math.max(0, Math.min(cappingPerSlot, dashboardStats.thisMonthEarning - i * cappingPerSlot));
                  return (
                    <View key={i} style={{ flex: 1 }}>
                      <View style={s.cappingBarBg}>
                        <View style={[s.cappingBarFill, { width: `${Math.min((slotEarned / cappingPerSlot) * 100, 100)}%`, backgroundColor: slotEarned >= cappingPerSlot ? colors.successContainer : colors.primaryLight }]} />
                      </View>
                      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, textAlign: 'center', marginTop: 2 }}>Slot {i + 1}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Bonus Structure */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Bonus Structure</Text>
              <View style={s.bonusRow}>
                <View style={s.bonusItem}>
                  <Icon name={Icons.target} size={28} color={colors.primary} style={{ marginBottom: 6 }} />
                  <Text style={s.bonusLabel}>Per ₹10,000 sale</Text>
                  <Text style={s.bonusVal}>1% Bonus</Text>
                  <Text style={s.bonusType}>Cash</Text>
                </View>
                <View style={s.bonusDivider} />
                <View style={s.bonusItem}>
                  <Icon name={Icons.trophy} size={28} color={colors.warning} style={{ marginBottom: 6 }} />
                  <Text style={s.bonusLabel}>Per ₹1,00,000 sale</Text>
                  <Text style={s.bonusVal}>10% Bonus</Text>
                  <Text style={s.bonusType}>Cash / Voucher</Text>
                </View>
              </View>
            </View>

            {/* Level Commission Table */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Level-wise Commission Structure</Text>
              <View style={s.levelTableHeader}>
                <Text style={[s.lth, { width: 48 }]}>Level</Text>
                <Text style={[s.lth, { flex: 1 }]}>Name</Text>
                <Text style={[s.lth, { width: 48, textAlign: 'center' }]}>%</Text>
                <Text style={[s.lth, { width: 60, textAlign: 'center' }]}>Members</Text>
                <Text style={[s.lth, { width: 80, textAlign: 'right' }]}>Earned</Text>
              </View>
              {levelCommissions.map((lv, i) => {
                const earnData = earningsByLevel.find(e => e.level === lv.level);
                return (
                  <View key={lv.label}>
                    <View style={[s.levelTableRow, i % 2 !== 0 && { backgroundColor: colors.background }]}>
                      <View style={{ width: 48 }}>
                        <View style={[s.lvlBadge, { backgroundColor: lv.color + '20', borderColor: lv.color }]}>
                          <Text style={[s.lvlBadgeText, { color: lv.color }]}>{lv.label}</Text>
                        </View>
                      </View>
                      <Text style={[s.ltd, { flex: 1 }]}>{lv.name}</Text>
                      <Text style={[s.ltd, { width: 48, textAlign: 'center', color: lv.color, fontWeight: '700' }]}>{lv.percent}%{!earnData && lv.level >= 8 ? '*' : ''}</Text>
                      <Text style={[s.ltd, { width: 60, textAlign: 'center' }]}>{earnData?.members || 0}</Text>
                      <Text style={[s.ltd, { width: 80, textAlign: 'right', color: earnData ? colors.success : colors.onSurfaceMuted, fontWeight: '700' }]}>
                        {earnData ? `₹${earnData.earned.toLocaleString()}` : lv.level >= 8 ? 'TBC' : '—'}
                      </Text>
                    </View>
                    {i < levelCommissions.length - 1 && <Divider />}
                  </View>
                );
              })}
              <Divider style={{ marginTop: 2 }} />
              <View style={[s.levelTableRow, { backgroundColor: colors.primaryContainer }]}>
                <View style={{ width: 48 }} />
                <Text style={[s.ltd, { flex: 1, fontWeight: '700', color: colors.primaryDark }]}>Total</Text>
                <Text style={{ width: 48 }} />
                <Text style={[s.ltd, { width: 60, textAlign: 'center', fontWeight: '700' }]}>{earningsByLevel.reduce((a, e) => a + e.members, 0)}</Text>
                <Text style={[s.ltd, { width: 80, textAlign: 'right', color: colors.primary, fontWeight: '800' }]}>₹{earningsByLevel.reduce((a, e) => a + e.earned, 0).toLocaleString()}</Text>
              </View>
              <Text style={{ ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 8 }}>* 8th, 9th, 10th upline % pending client confirmation</Text>
            </View>

            {/* Commission Summary */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Commission Summary</Text>
              <View style={s.commRow}>
                {[
                  { iconName: Icons.pending,  color: colors.pending,      val: pendingComm,  label: 'Pending'  },
                  { iconName: Icons.eligible, color: colors.primaryLight, val: commissionHistory.filter(c => c.status === 'Approved').reduce((a, c) => a + c.amount, 0), label: 'Approved' },
                  { iconName: Icons.paid,     color: colors.success,      val: commissionHistory.filter(c => c.status === 'Paid').reduce((a, c) => a + c.amount, 0), label: 'Paid' },
                ].map((item, i) => (
                  <React.Fragment key={item.label}>
                    {i > 0 && <View style={s.commDiv} />}
                    <View style={s.commItem}>
                      <Icon name={item.iconName} size={22} color={item.color} style={{ marginBottom: 4 }} />
                      <Text style={[s.commVal, { color: item.color }]}>₹{item.val.toLocaleString()}</Text>
                      <Text style={s.commLabel}>{item.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Recent Commission Records */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Recent Commission Records</Text>
              {commissionHistory.slice(0, 5).map((item, i) => (
                <View key={item.id}>
                  <View style={s.commRecord}>
                    <View style={s.commRecordIconBox}>
                      <Icon name={Icons.commission} size={19} color={colors.success} />
                    </View>
                    <View style={s.commRecordInfo}>
                      <Text style={s.commRecordName}>{item.fromName}</Text>
                      <Text style={s.commRecordMeta}>{item.level} · {item.percentage}% · {item.date}</Text>
                    </View>
                    <View style={s.commRecordRight}>
                      <Text style={s.commRecordAmt}>₹{item.amount.toLocaleString()}</Text>
                      <StatusChip status={item.status} />
                    </View>
                  </View>
                  {i < 4 && <Divider />}
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'payout' && (
          <>
            <View style={s.banner}>
              <View style={s.bannerLeft}>
                <Text style={s.bannerLabel}>Total Paid Out</Text>
                <Text style={s.bannerVal}>₹{totalPaid.toLocaleString()}</Text>
              </View>
              {payoutHistory.find(p => p.status === 'Processing') && (
                <View style={s.bannerRight}>
                  <Text style={s.bannerLabel}>Processing</Text>
                  <Text style={[s.bannerValSm, { color: colors.warning }]}>₹{payoutHistory.find(p => p.status === 'Processing').commissionEarned.toLocaleString()}</Text>
                </View>
              )}
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Payout Cycles</Text>
              <Text style={{ ...typography.bodySmall, color: colors.onSurfaceMuted, marginBottom: 8 }}>Cycle Type: {payoutPolicy.cycleType}</Text>
              {payoutCycles?.map(cycle => (
                <View key={cycle.id} style={s.cycleRow}>
                  <Icon name={Icons.cycle} size={22} color={colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.cycleName}>{cycle.name}</Text>
                    <Text style={s.cycleDates}>{cycle.cycleStart} – {cycle.cycleEnd}</Text>
                  </View>
                  <StatusChip status={cycle.status} />
                </View>
              ))}
            </View>

            {payoutHistory.map(item => (
              <TouchableOpacity key={item.id} style={s.payoutCard} onPress={() => { setSelectedPayout(item); setShowPayoutDetail(true); }} activeOpacity={0.8}>
                <View style={s.payoutCardHeader}>
                  <View style={s.payoutCycleBox}>
                    <Icon name={Icons.cycle} size={22} color={colors.primary} />
                    <View>
                      <Text style={s.payoutCycleLabel}>Payout Cycle</Text>
                      <Text style={s.payoutCycleDates}>{item.cycleStart} – {item.cycleEnd}</Text>
                    </View>
                  </View>
                  <StatusChip status={item.status} />
                </View>
                <Divider style={{ marginVertical: 10 }} />
                <View style={s.payoutStatsRow}>
                  <View style={s.payoutStatItem}><Text style={s.payoutStatLabel}>Total Business</Text><Text style={s.payoutStatVal}>₹{item.totalBusiness.toLocaleString()}</Text></View>
                  <View style={s.payoutStatDiv} />
                  <View style={s.payoutStatItem}><Text style={s.payoutStatLabel}>Commission</Text><Text style={[s.payoutStatVal, { color: colors.success }]}>₹{item.commissionEarned.toLocaleString()}</Text></View>
                  <View style={s.payoutStatDiv} />
                  <View style={s.payoutStatItem}><Text style={s.payoutStatLabel}>Net Payout</Text><Text style={[s.payoutStatVal, { color: colors.primary }]}>{item.netAmount ? `₹${item.netAmount.toLocaleString()}` : 'Pending'}</Text></View>
                </View>
                <View style={s.payoutLevelRow}>
                  {item.levelBreakup.map((lb, i) => (
                    <View key={i} style={s.payoutLevelItem}>
                      <Text style={s.payoutLevelName}>{lb.level}</Text>
                      <Text style={s.payoutLevelComm}>₹{lb.commission.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
                {item.referenceNo && (
                  <View style={s.payoutRefRow}>
                    <Text style={s.payoutRefLabel}>Ref: </Text>
                    <Text style={s.payoutRefVal}>{item.referenceNo}</Text>
                  </View>
                )}
                <Text style={s.viewDetailText}>View Full Details ›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <PayoutDetailModal visible={showPayoutDetail} item={selectedPayout} onClose={() => setShowPayoutDetail(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surfaceVariant, borderRadius: radius.lg, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md, flexDirection: 'row', justifyContent: 'center' },
  tabBtnActive: { backgroundColor: colors.surface, ...elevation.level1 },
  tabBtnText: { ...typography.titleSmall, color: colors.onSurfaceMuted },
  tabBtnTextActive: { color: colors.primary },
  scroll: { padding: spacing.lg },
  banner: { backgroundColor: colors.primary, borderRadius: radius.lg, flexDirection: 'row', padding: spacing.xl, marginBottom: 12, ...elevation.level2 },
  bannerLeft: { flex: 1 },
  bannerRight: { flex: 1, alignItems: 'flex-end' },
  bannerLabel: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  bannerVal: { ...typography.headlineMedium, color: colors.white, marginTop: 4 },
  bannerValSm: { ...typography.titleLarge, color: colors.white, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface, marginBottom: spacing.md },
  cappingCard: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level2 },
  cappingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cappingLeft: { flex: 1 },
  cappingRight: { marginLeft: 12 },
  cappingTitle: { ...typography.titleSmall, color: 'rgba(255,255,255,0.8)' },
  cappingAmt: { ...typography.bodySmall, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  cappingEarned: { ...typography.titleSmall, color: colors.white, marginTop: 6 },
  cappingCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  cappingPct: { ...typography.titleSmall, color: colors.white, fontWeight: '800' },
  cappingPctLabel: { ...typography.labelSmall, color: 'rgba(255,255,255,0.6)', fontSize: 9 },
  cappingBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full },
  cappingBarFill: { height: 8, borderRadius: radius.full },
  bonusRow: { flexDirection: 'row', alignItems: 'center' },
  bonusItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  bonusDivider: { width: 1, height: 80, backgroundColor: colors.divider },
  bonusLabel: { ...typography.bodySmall, color: colors.onSurfaceMuted, textAlign: 'center' },
  bonusVal: { ...typography.titleMedium, color: colors.primary, marginTop: 4 },
  bonusType: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 2 },
  levelTableHeader: { flexDirection: 'row', paddingVertical: 8, backgroundColor: colors.primaryContainer, borderRadius: radius.sm, paddingHorizontal: spacing.sm, marginBottom: 4 },
  lth: { ...typography.labelSmall, color: colors.primaryDark },
  levelTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: spacing.sm },
  ltd: { ...typography.bodyMedium, color: colors.onSurface },
  lvlBadge: { borderRadius: radius.full, borderWidth: 1.5, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  lvlBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  commRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  commItem: { flex: 1, alignItems: 'center' },
  commVal: { ...typography.titleLarge },
  commLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 2 },
  commDiv: { width: 1, height: 50, backgroundColor: colors.divider },
  commRecord: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  commRecordIconBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.successContainer, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  commRecordInfo: { flex: 1 },
  commRecordName: { ...typography.titleSmall, color: colors.onSurface },
  commRecordMeta: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  commRecordRight: { alignItems: 'flex-end', gap: 4 },
  commRecordAmt: { ...typography.titleSmall, color: colors.success },
  payoutCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  payoutCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  payoutCycleBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payoutCycleLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  payoutCycleDates: { ...typography.titleSmall, color: colors.onSurface, marginTop: 2 },
  payoutStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  payoutStatItem: { flex: 1, alignItems: 'center' },
  payoutStatLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  payoutStatVal: { ...typography.titleSmall, color: colors.onSurface, marginTop: 2 },
  payoutStatDiv: { width: 1, height: 32, backgroundColor: colors.divider },
  payoutLevelRow: { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: radius.sm, padding: spacing.sm, gap: 4, marginBottom: 8 },
  payoutLevelItem: { flex: 1, alignItems: 'center' },
  payoutLevelName: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  payoutLevelComm: { ...typography.labelLarge, color: colors.success, marginTop: 2 },
  payoutRefRow: { flexDirection: 'row', marginBottom: 6 },
  payoutRefLabel: { ...typography.bodySmall, color: colors.onSurfaceMuted },
  payoutRefVal: { ...typography.bodySmall, color: colors.primary },
  viewDetailText: { ...typography.labelLarge, color: colors.primary, textAlign: 'right', marginTop: 4 },
  cycleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  cycleName: { ...typography.titleSmall, color: colors.onSurface },
  cycleDates: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
});
