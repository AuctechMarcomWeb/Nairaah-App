/**
 * CommissionScreen — Distributor Earnings + Downline (merged)
 * Mirrors MLM-Admin → /distributor/earnings
 *
 * Layout:
 *   • Dark gradient banner: sponsor info + date filter (calendar) + Business/Commission/Payout cards
 *   • Search bar
 *   • Breadcrumb (when drilled in)
 *   • Downline table (Level | Count | Member chips)
 *   • Level Earning modal (tap "Check Level Earning")
 *   • Member detail bottom sheet
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Modal, FlatList, ActivityIndicator,
  RefreshControl, Linking, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, Divider } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { getMyTeam } from '../../api/team';
import { createAxiosInstance } from '../../api/apiConfig';

// ─── API ─────────────────────────────────────────────────────────────────────

async function apiGet(endpoint, uid, fromDate, toDate, extra = '') {
  try {
    const api = createAxiosInstance('commission');
    let url = `/${endpoint}/${uid}`;
    const q = [];
    if (fromDate) q.push(`fromDate=${fromDate}`);
    if (toDate)   q.push(`toDate=${toDate}`);
    if (extra)    q.push(extra);
    if (q.length) url += `?${q.join('&')}`;
    const res = await api.get(url);
    if (res.data.success) return { ok: true, data: res.data.data };
    return { ok: false };
  } catch (e) {
    console.warn(`[EARNINGS] ${endpoint} error:`, e.message);
    return { ok: false };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND       = colors.primary;
const LEVEL_ORDER = ['A+','A','B','C','D','E','F','G','H','I','J','K'];
const LEVEL_COLORS = {
  'A+':'#7C3AED','A':'#1A73E8','B':'#059669','C':'#D97706',
  'D':'#DC2626','E':'#0891B2','F':'#7C3AED','G':'#059669',
  'H':'#D97706','I':'#DC2626','J':'#0891B2','K':'#6B7280',
};
const FB = Object.values(LEVEL_COLORS);

function lc(lv, rel) {
  if (lv && LEVEL_COLORS[lv]) return LEVEL_COLORS[lv];
  return FB[(rel - 1) % FB.length] || BRAND;
}
function ll(lv, rel) {
  if (lv) return lv;
  return LEVEL_ORDER[rel] || `L${rel}`;
}
function getKids(n) { return n?.team || n?.children || []; }
function flatAll(ms, rel = 1) {
  let out = [];
  ms.forEach(m => {
    out.push({ ...m, relLevel: rel });
    const k = getKids(m);
    if (k.length) out = out.concat(flatAll(k, rel + 1));
  });
  return out;
}
function findNode(ms, id) {
  for (const m of ms) {
    if (String(m._id || m.id) === String(id)) return m;
    const k = getKids(m);
    if (k.length) { const f = findNode(k, id); if (f) return f; }
  }
  return null;
}
function rs(n) { return `₹${(n || 0).toLocaleString('en-IN')}`; }
function makeCall(mobile) {
  const c = (mobile || '').replace(/\s+/g, '');
  if (!c) return;
  Linking.openURL(`tel:${c}`).catch(() => {});
}

// Date helpers
function toYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function monthStart() {
  const d = new Date(); d.setDate(1);
  return d;
}
function fmtDisplay(d) {
  if (!d) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Date Picker Row (calendar button) ───────────────────────────────────────
function DateFilterRow({ from, to, setFrom, setTo, onShow }) {
  const [pickerFor, setPickerFor] = useState(null); // 'from' | 'to' | null

  const handleChange = (_event, selected) => {
    if (Platform.OS === 'android') setPickerFor(null);
    if (!selected) return;
    if (pickerFor === 'from') setFrom(selected);
    else if (pickerFor === 'to') setTo(selected);
  };

  return (
    <View style={dfr.row}>
      {/* FROM */}
      <TouchableOpacity style={dfr.dateBtn} onPress={() => setPickerFor('from')}>
        <Icon name={Icons.calendar} size={13} color="rgba(255,255,255,0.7)" />
        <View style={{ marginLeft: 6 }}>
          <Text style={dfr.dateLabel}>FROM</Text>
          <Text style={dfr.dateVal}>{fmtDisplay(from)}</Text>
        </View>
      </TouchableOpacity>

      <Text style={dfr.arrow}>→</Text>

      {/* TO */}
      <TouchableOpacity style={dfr.dateBtn} onPress={() => setPickerFor('to')}>
        <Icon name={Icons.calendar} size={13} color="rgba(255,255,255,0.7)" />
        <View style={{ marginLeft: 6 }}>
          <Text style={dfr.dateLabel}>TO</Text>
          <Text style={dfr.dateVal}>{fmtDisplay(to)}</Text>
        </View>
      </TouchableOpacity>

      {/* Show */}
      <TouchableOpacity style={dfr.showBtn} onPress={onShow}>
        <Text style={dfr.showTxt}>Show</Text>
      </TouchableOpacity>

      {/* Calendar picker (Android: dialog, iOS: inline) */}
      {pickerFor !== null && (
        <DateTimePicker
          value={pickerFor === 'from' ? from : to}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
const dfr = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  dateBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  dateLabel:{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 0.6 },
  dateVal:  { fontSize: 12, fontWeight: '700', color: '#fff', marginTop: 1 },
  arrow:    { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  showBtn:  { backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  showTxt:  { fontSize: 12, fontWeight: '700', color: '#fff' },
});

// ─── Metric Tile ─────────────────────────────────────────────────────────────
function Tile({ label, value, green, amber, red }) {
  const textColor = green ? '#6ee7b7' : amber ? '#fcd34d' : red ? '#fca5a5' : '#fff';
  const bg     = green ? 'rgba(5,150,105,0.25)' : amber ? 'rgba(217,119,6,0.25)' : red ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.10)';
  const border = green ? 'rgba(5,150,105,0.5)'  : amber ? 'rgba(217,119,6,0.5)'  : red ? 'rgba(220,38,38,0.4)'  : 'rgba(255,255,255,0.15)';
  return (
    <View style={[tile.card, { backgroundColor: bg, borderColor: border }]}>
      <Text style={tile.label}>{label}</Text>
      <Text style={[tile.val, { color: textColor }]}>{value}</Text>
    </View>
  );
}
const tile = StyleSheet.create({
  card:  { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, width: '31%', minWidth: 96, flexGrow: 1 },
  label: { fontSize: 9, color: 'rgba(255,255,255,0.55)', marginBottom: 3, lineHeight: 12 },
  val:   { fontWeight: '800', fontSize: 13 },
});

// ─── Metrics Section ─────────────────────────────────────────────────────────
function MetricsSection({ commData, commLoading }) {
  if (commLoading) return (
    <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={{ marginTop: 12 }} />
  );
  if (!commData) return null;

  const b  = commData.business      || {};
  const c  = commData.commission     || {};
  const p  = commData.payoutSummary  || {};
  const isAPlus = commData.distributor?.distributorLevel === 'A+';

  const bizTiles = [
    !isAPlus && { label: 'Direct Units Sale',  value: String(b.directUnitSale      ?? 0) },
    !isAPlus && { label: 'Direct Amount',       value: rs(b.directBusinessAmount) },
    !isAPlus && { label: 'Team Units Sale',     value: String(b.teamUnitSale        ?? 0) },
    !isAPlus && { label: 'Team Amount',         value: rs(b.teamBusinessAmount) },
                 { label: 'Total Units Sale',   value: String(b.totalUnitSale       ?? 0) },
                 { label: 'Total Amount',       value: rs(b.totalBusinessAmount) },
  ].filter(Boolean);

  const commTiles = [
    !isAPlus && { label: 'Direct Comm.',  value: rs(c.directCommission), green: (c.directCommission ?? 0) >= 0, red: (c.directCommission ?? 0) < 0 },
    !isAPlus && { label: 'Team Comm.',    value: rs(c.teamCommission),   green: (c.teamCommission   ?? 0) >= 0, red: (c.teamCommission   ?? 0) < 0 },
                 { label: 'Total Comm.',  value: rs(c.totalCommission),  green: (c.totalCommission  ?? 0) >= 0, red: (c.totalCommission  ?? 0) < 0 },
                 { label: 'Total Credit', value: rs(c.totalCredit),    green: true },
                 { label: 'Reversal',     value: rs(c.totalReversal),  red:   true },
                 { label: 'Net Comm.',    value: rs(c.netCommission),  green: (c.netCommission ?? 0) >= 0, red: (c.netCommission ?? 0) < 0 },
  ].filter(Boolean);

  const payTiles = isAPlus
    ? [
        { label: 'Total Payouts',   value: rs(p.totalPayouts) },
        { label: 'Total Generated', value: rs(p.totalGenerated) },
        { label: 'Total Paid',      value: rs(p.totalPaid), green: true },
        { label: 'Balance',         value: rs(p.balanceRemaining), amber: true },
      ]
    : [
        { label: 'Total Payouts',   value: String(p.totalPayouts ?? 0) },
        { label: 'Total Generated', value: rs(p.totalGenerated) },
        { label: 'Total Paid',      value: rs(p.totalPaid),    green: true },
        { label: 'Total Pending',   value: rs(p.totalPending), amber: true },
        { label: 'Paid Count',      value: String(p.paidPayoutsCount ?? 0) },
        { label: 'Pending Count',   value: String(p.pendingPayoutsCount ?? 0), amber: true },
        { label: 'Balance',         value: rs(p.balanceRemaining) },
      ];

  return (
    <>
      <Text style={ms.hdr}>BUSINESS</Text>
      <View style={ms.row}>{bizTiles.map(t  => <Tile key={t.label}  {...t}  />)}</View>
      <Text style={ms.hdr}>COMMISSION</Text>
      <View style={ms.row}>{commTiles.map(t => <Tile key={t.label}  {...t}  />)}</View>
      <Text style={ms.hdr}>PAYOUT</Text>
      <View style={ms.row}>{payTiles.map(t  => <Tile key={t.label}  {...t}  />)}</View>
    </>
  );
}
const ms = StyleSheet.create({
  hdr: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
});

// ─── Earnings Banner ──────────────────────────────────────────────────────────
function EarningsBanner({
  name, level, totalTeam, currentMembersCount, isRoot,
  from, to, setFrom, setTo, onShow,
  commData, commLoading,
  onLevelEarning,
}) {
  return (
    <View style={ban.wrap}>
      {/* Top row */}
      <View style={ban.topRow}>
        <View style={ban.avatar}>
          <Text style={ban.avatarTxt}>{(name || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={ban.eyebrow}>{isRoot ? 'YOUR UPLINE / SPONSOR' : 'VIEWING DOWNLINE OF'}</Text>
          <Text style={ban.name} numberOfLines={1}>{name || '—'}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            {level  ? <View style={ban.lvChip}><Text style={ban.lvTxt}>Lv {isRoot ? level : 'A'}</Text></View> : null}
            {totalTeam != null && <Text style={ban.dim}>Total Team: {totalTeam}</Text>}
            {!isRoot && <Text style={ban.dim}>{currentMembersCount} direct</Text>}
          </View>
          <TouchableOpacity onPress={onLevelEarning} style={{ marginTop: 5 }}>
            <Text style={ban.levelLink}>📊 Check Level Earning</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date filter */}
      <DateFilterRow from={from} to={to} setFrom={setFrom} setTo={setTo} onShow={onShow} />

      {/* Metrics */}
      <MetricsSection commData={commData} commLoading={commLoading} />
    </View>
  );
}
const ban = StyleSheet.create({
  wrap:      { borderRadius: 16, padding: 14, marginBottom: 14, backgroundColor: BRAND },
  topRow:    { flexDirection: 'row', alignItems: 'flex-start' },
  avatar:    { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontWeight: '800', fontSize: 19, color: '#fff' },
  eyebrow:   { fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, marginBottom: 1 },
  name:      { fontWeight: '800', fontSize: 15, color: '#fff' },
  lvChip:    { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  lvTxt:     { fontSize: 10, fontWeight: '700', color: '#fff' },
  dim:       { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  levelLink: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 1, alignSelf: 'flex-start' },
});

// ─── Level Members Modal ──────────────────────────────────────────────────────
function LevelMembersModal({ visible, userId, level, levelLabel, fromYMD, toYMD, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !userId || level == null) return;
    setLoading(true); setMembers([]);
    apiGet('level-members', userId, fromYMD, toYMD, `level=${level}`)
      .then(r => { if (r.ok) setMembers(r.data?.members || []); })
      .finally(() => setLoading(false));
  }, [visible, userId, level, fromYMD, toYMD]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={lmm.overlay}>
        <View style={lmm.sheet}>
          <View style={lmm.handle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={lmm.avatar}><Text style={lmm.avatarTxt}>{levelLabel}</Text></View>
            <Text style={[lmm.title, { marginLeft: 10 }]}>Level {levelLabel} Members ({members.length})</Text>
            <TouchableOpacity style={lmm.closeX} onPress={onClose}>
              <Icon name={Icons.close} size={16} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          </View>
          {loading
            ? <ActivityIndicator size="large" color={BRAND} style={{ paddingVertical: 32 }} />
            : <FlatList
                data={members}
                keyExtractor={(m, i) => m._id || String(i)}
                style={{ maxHeight: 420 }}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', ...typography.bodyMedium, color: colors.onSurfaceMuted, paddingVertical: 24 }}>No members found</Text>}
                renderItem={({ item, index }) => {
                  const c = LEVEL_COLORS[item.distributorLevel] || BRAND;
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                      <Text style={{ width: 22, ...typography.labelSmall, color: colors.onSurfaceMuted }}>{index + 1}</Text>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c + '20', borderWidth: 2, borderColor: c + '55', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                        <Text style={{ fontWeight: '800', fontSize: 14, color: c }}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...typography.titleSmall, color: colors.onSurface }}>{item.name}</Text>
                        <Text style={{ ...typography.bodySmall, color: colors.onSurfaceMuted }}>{item.phone}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 3 }}>
                        <Text style={{ fontWeight: '800', fontSize: 13, color: (item.commissionEarned ?? 0) >= 0 ? '#059669' : '#dc2626' }}>
                          {rs(Math.abs(item.commissionEarned || 0))}
                        </Text>
                        <View style={{ backgroundColor: BRAND + '14', borderRadius: 999, borderWidth: 1, borderColor: BRAND + '33', paddingHorizontal: 6, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: BRAND }}>{item.commissionPercentage}%</Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
          }
          <TouchableOpacity style={lmm.closeBtn} onPress={onClose}>
            <Text style={lmm.closeBtnTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const lmm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 32, maxHeight: '85%' },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16 },
  avatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { fontWeight: '800', fontSize: 15, color: '#fff' },
  title:      { ...typography.titleLarge, color: colors.onSurface, flex: 1 },
  closeX:     { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  closeBtn:   { marginTop: 14, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  closeBtnTxt:{ ...typography.titleSmall, color: colors.onSurfaceVariant },
});

// ─── Level Earning Modal ──────────────────────────────────────────────────────
function LevelEarningModal({ visible, userId, fromYMD, toYMD, rootLevel, onClose }) {
  const [levels,  setLevels]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [drill,   setDrill]   = useState(null);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true); setLevels([]);
    apiGet('level-summary', userId, fromYMD, toYMD)
      .then(r => { if (r.ok) setLevels(r.data?.levelSummary || []); })
      .finally(() => setLoading(false));
  }, [visible, userId, fromYMD, toYMD]);

  const startCC = rootLevel === 'A+' ? 65 : 66;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={lem.overlay}>
          <View style={lem.sheet}>
            <View style={lem.handle} />
            <Text style={lem.title}>Level-wise Earning Summary</Text>
            <Text style={{ ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2, marginBottom: 14 }}>
              Tap a row to see members
            </Text>
            {loading
              ? <ActivityIndicator size="large" color={BRAND} style={{ paddingVertical: 32 }} />
              : (
                <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
                  {/* Header */}
                  <View style={lem.thead}>
                    <Text style={[lem.th, { width: 58 }]}>Level</Text>
                    <Text style={[lem.th, { width: 44, textAlign: 'center' }]}>Mbrs</Text>
                    <Text style={[lem.th, { width: 44, textAlign: 'center' }]}>Units</Text>
                    <Text style={[lem.th, { flex: 1, textAlign: 'right' }]}>Business</Text>
                    <Text style={[lem.th, { width: 38, textAlign: 'center' }]}>%</Text>
                    <Text style={[lem.th, { width: 74, textAlign: 'right' }]}>Commission</Text>
                  </View>
                  {levels
                    .filter(l => l.level !== 'Unknown' && l.relativeDepth !== 99)
                    .map((l, i) => {
                      const depth = Number(l.relativeDepth) || 1;
                      const label = String.fromCharCode(startCC + depth - 1);
                      const pos   = (l.totalCommission ?? 0) >= 0;
                      return (
                        <TouchableOpacity key={i} style={[lem.trow, i % 2 === 1 && { backgroundColor: colors.background }]}
                          onPress={() => setDrill({ level: l.relativeDepth, label })}>
                          <Text style={[lem.td, { width: 58, color: BRAND, fontWeight: '700' }]}>Lv {label}</Text>
                          <Text style={[lem.td, { width: 44, textAlign: 'center', fontWeight: '700', color: '#1A73E8' }]}>{l.memberCount}</Text>
                          <Text style={[lem.td, { width: 44, textAlign: 'center' }]}>{l.totalUnitSale ?? 0}</Text>
                          <Text style={[lem.td, { flex: 1, textAlign: 'right', color: '#059669', fontWeight: '700' }]}>{rs(l.totalBusinessAmount)}</Text>
                          <View style={{ width: 38, alignItems: 'center' }}>
                            <View style={{ backgroundColor: BRAND+'14', borderRadius:999, borderWidth:1, borderColor: BRAND+'33', paddingHorizontal:4, paddingVertical:1 }}>
                              <Text style={{ fontSize:9, fontWeight:'700', color:BRAND }}>{l.commissionPercentage}%</Text>
                            </View>
                          </View>
                          <Text style={[lem.td, { width: 74, textAlign: 'right', fontWeight: '800', color: pos ? '#059669' : '#dc2626' }]}>
                            {pos ? '' : '-'}{rs(Math.abs(l.totalCommission || 0))}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              )
            }
            <TouchableOpacity style={lmm.closeBtn} onPress={onClose}>
              <Text style={lmm.closeBtnTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LevelMembersModal
        visible={!!drill} userId={userId}
        level={drill?.level} levelLabel={drill?.label}
        fromYMD={fromYMD} toYMD={toYMD}
        onClose={() => setDrill(null)}
      />
    </>
  );
}
const lem = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end' },
  sheet:   { backgroundColor: colors.surface, borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing.lg, paddingBottom:32, maxHeight:'90%' },
  handle:  { width:40, height:4, borderRadius:2, backgroundColor:colors.outline, alignSelf:'center', marginBottom:16 },
  title:   { ...typography.titleLarge, color: colors.onSurface },
  thead:   { flexDirection:'row', alignItems:'center', backgroundColor:BRAND, paddingHorizontal:12, paddingVertical:8, borderRadius:8, marginBottom:4 },
  th:      { ...typography.labelSmall, color:'#fff', fontWeight:'700' },
  trow:    { flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:10, borderRadius:6 },
  td:      { ...typography.bodySmall, color: colors.onSurface },
});

// ─── Downline Table ───────────────────────────────────────────────────────────
function DownlineTable({ currentMembers, rootMembers, drillInto, onSelect, isRoot }) {
  const flat = flatAll(currentMembers, 1);
  const grouped = {};
  flat.forEach(m => {
    const lbl = m.distributorLevel || `L${m.relLevel}`;
    if (!grouped[lbl]) grouped[lbl] = [];
    grouped[lbl].push(m);
  });
  const groups = LEVEL_ORDER.filter(l => grouped[l]).map(l => ({ label: l, color: lc(l,1), members: grouped[l] }));
  Object.keys(grouped).filter(l => !LEVEL_ORDER.includes(l)).forEach(l => {
    groups.push({ label: l, color: lc(l,1), members: grouped[l] });
  });

  if (groups.length === 0) return (
    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
      <Icon name={Icons.downline} size={40} color={colors.outline} />
      <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceMuted, marginTop: 10 }}>No downline members</Text>
    </View>
  );

  return (
    <View style={[dt.table, elevation.level1]}>
      {/* Header */}
      <View style={dt.thead}>
        <Text style={[dt.th, { width: 56 }]}>Level</Text>
        <Text style={[dt.th, { width: 40 }]}>Count</Text>
        <Text style={[dt.th, { flex: 1 }]}>Members (tap to drill in)</Text>
      </View>
      {groups.map((g, idx) => {
        const displayLabel = isRoot ? g.label : String.fromCharCode(66 + idx);
        return (
          <View key={g.label} style={[dt.row, idx % 2 === 1 && { backgroundColor: colors.background }]}>
            {/* Level badge */}
            <View style={{ width: 56 }}>
              <View style={[dt.lvBadge, { backgroundColor: g.color+'18', borderColor: g.color }]}>
                <Text style={[dt.lvTxt, { color: g.color }]}>{displayLabel}</Text>
              </View>
            </View>
            {/* Count */}
            <Text style={[dt.count, { width: 40, color: g.color }]}>{g.members.length}</Text>
            {/* Chips */}
            <View style={[dt.chips, { flex: 1 }]}>
              {g.members.map(m => {
                const hasKids = getKids(findNode(rootMembers, m._id || m.id)).length > 0;
                const active  = m.isActive !== false && m.distributorStatus !== 'Inactive';
                return (
                  <TouchableOpacity
                    key={m._id || m.id}
                    onPress={() => hasKids ? drillInto(m) : onSelect(m)}
                    style={[dt.chip, { backgroundColor: g.color+'12', borderColor: hasKids ? g.color+'66' : g.color+'22' }]}
                  >
                    {!active && <View style={dt.inactiveDot} />}
                    <Text style={[dt.chipTxt, { color: g.color }]}>{m.name?.split(' ')[0]}</Text>
                    {hasKids && <Icon name={Icons.chevronRight} size={9} color={g.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
const dt = StyleSheet.create({
  table:       { borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface },
  thead:       { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND, paddingHorizontal: 12, paddingVertical: 11, gap: 6 },
  th:          { ...typography.labelSmall, color: '#fff', fontWeight: '700' },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 6 },
  lvBadge:     { borderRadius: 999, borderWidth: 2, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  lvTxt:       { fontWeight: '800', fontSize: 12 },
  count:       { fontWeight: '800', fontSize: 20, textAlign: 'center' },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5 },
  chipTxt:     { fontSize: 12, fontWeight: '700' },
  inactiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f59e0b' },
});

// ─── Member Detail Sheet ──────────────────────────────────────────────────────
function MemberSheet({ member, rootMembers, onClose, onDrill }) {
  if (!member) return null;
  const c  = lc(member.distributorLevel, member.relLevel);
  const l  = ll(member.distributorLevel, member.relLevel);
  const nd = findNode(rootMembers, member._id || member.id);
  const hasKids = getKids(nd).length > 0;
  const phone   = member.mobile || member.phone || '';
  const active  = member.isActive !== false && member.distributorStatus !== 'Inactive';

  return (
    <Modal visible={!!member} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={onClose} />
      <View style={msh.sheet}>
        <View style={msh.handle} />
        {/* Header */}
        <View style={[msh.headerRow, { borderLeftColor: c }]}>
          <View style={[msh.av, { backgroundColor: c+'20', borderColor: c+'55' }]}>
            <Text style={[msh.avTxt, { color: c }]}>{(member.name||'?').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex:1, marginLeft:10 }}>
            <Text style={msh.name}>{member.name}</Text>
            <View style={{ flexDirection:'row', gap:6, marginTop:4, flexWrap:'wrap' }}>
              <View style={[msh.lvBadge, { backgroundColor:c+'18', borderColor:c }]}>
                <Text style={[msh.lvTxt, { color:c }]}>Level {l}</Text>
              </View>
              <View style={[msh.statusPill, { backgroundColor: active ? '#dcfce7':'#f3f4f6' }]}>
                <View style={[msh.statusDot, { backgroundColor: active ? '#059669':'#9ca3af' }]} />
                <Text style={[msh.statusTxt, { color: active ? '#059669':'#9ca3af' }]}>{active ? 'Active':'Inactive'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={msh.closeX} onPress={onClose}>
            <Icon name={Icons.close} size={16} color={colors.onSurfaceMuted} />
          </TouchableOpacity>
        </View>
        {/* Phone */}
        {phone ? (
          <View style={[msh.phoneBox, { backgroundColor:c+'12', borderColor:c+'44' }]}>
            <Icon name={Icons.phone} size={18} color={c} />
            <View style={{ flex:1, marginLeft:10 }}>
              <Text style={msh.phoneLbl}>Mobile</Text>
              <Text style={[msh.phoneNum, { color:c }]}>{phone}</Text>
            </View>
            <TouchableOpacity style={[msh.callBtn, { backgroundColor:c }]} onPress={() => makeCall(phone)}>
              <Icon name={Icons.phone} size={14} color="#fff" />
              <Text style={msh.callTxt}>Call</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {/* Stats grid */}
        <View style={msh.grid}>
          {[
            ['Joined',      (member.joiningDate||member.joinDate) ? new Date(member.joiningDate||member.joinDate).toLocaleDateString('en-IN') : '—'],
            ['Direct Team', member.directTeam ?? getKids(nd).length],
            ['Level',       l],
            ['Referral',    member.referralCode || '—'],
            ['Direct Biz',  member.directBusinessAmount != null ? rs(member.directBusinessAmount) : '—'],
            ['Team Biz',    member.teamBusinessAmount   != null ? rs(member.teamBusinessAmount)   : '—'],
            ['Total Biz',   member.totalBusinessAmount  != null ? rs(member.totalBusinessAmount)  : '—'],
            ['Commission',  member.totalCommission      != null ? rs(member.totalCommission)      : '—'],
          ].map(([label, val]) => (
            <View key={label} style={msh.cell}>
              <Text style={msh.cellLbl}>{label}</Text>
              <Text style={msh.cellVal}>{val}</Text>
            </View>
          ))}
        </View>
        {hasKids && (
          <TouchableOpacity style={[msh.drillBtn, { borderColor:c+'55', backgroundColor:c+'12' }]} onPress={onDrill}>
            <Icon name={Icons.downline} size={18} color={c} />
            <Text style={[msh.drillTxt, { color:c }]}>View {member.name?.split(' ')[0]}'s Downline</Text>
            <Icon name={Icons.chevronRight} size={14} color={c} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={msh.closeBtn} onPress={onClose}>
          <Text style={msh.closeBtnTxt}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
const msh = StyleSheet.create({
  sheet:     { backgroundColor:colors.surface, borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing.lg, paddingBottom:32 },
  handle:    { width:40, height:4, borderRadius:2, backgroundColor:colors.outline, alignSelf:'center', marginBottom:16 },
  headerRow: { flexDirection:'row', alignItems:'center', borderLeftWidth:4, paddingLeft:12, marginBottom:14 },
  av:        { width:44, height:44, borderRadius:22, borderWidth:2, alignItems:'center', justifyContent:'center' },
  avTxt:     { fontWeight:'800', fontSize:18 },
  name:      { ...typography.headlineSmall, color:colors.onSurface },
  lvBadge:   { borderRadius:999, borderWidth:1.5, paddingHorizontal:10, paddingVertical:2 },
  lvTxt:     { fontSize:11, fontWeight:'700' },
  statusPill:{ flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:2, borderRadius:999 },
  statusDot: { width:6, height:6, borderRadius:3 },
  statusTxt: { fontSize:10, fontWeight:'600' },
  closeX:    { width:30, height:30, borderRadius:15, backgroundColor:colors.surfaceVariant, alignItems:'center', justifyContent:'center' },
  phoneBox:  { flexDirection:'row', alignItems:'center', borderWidth:1, borderRadius:12, padding:12, marginBottom:14 },
  phoneLbl:  { fontSize:10, color:colors.onSurfaceMuted },
  phoneNum:  { fontWeight:'700', fontSize:15, marginTop:2 },
  callBtn:   { flexDirection:'row', alignItems:'center', gap:4, borderRadius:8, paddingHorizontal:14, paddingVertical:8 },
  callTxt:   { fontSize:12, fontWeight:'700', color:'#fff' },
  grid:      { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 },
  cell:      { width:'47%', backgroundColor:colors.background, borderRadius:10, padding:10 },
  cellLbl:   { fontSize:10, color:colors.onSurfaceMuted, marginBottom:2 },
  cellVal:   { fontWeight:'700', fontSize:13, color:colors.onSurface },
  drillBtn:  { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderRadius:12, paddingVertical:13, paddingHorizontal:16, marginBottom:10 },
  drillTxt:  { flex:1, fontWeight:'600' },
  closeBtn:  { height:48, borderRadius:12, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:colors.outline },
  closeBtnTxt:{ ...typography.titleSmall, color:colors.onSurfaceVariant },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function CommissionScreen({ navigation }) {
  const { user } = useSelector(state => state.user);

  // Team
  const [rootMembers, setRootMembers] = useState([]);
  const [sponsorInfo,  setSponsorInfo]  = useState(null);
  const [viewStack,    setViewStack]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [selected,     setSelected]     = useState(null);
  const [levelModal,   setLevelModal]   = useState(false);

  // Commission
  const [commData,    setCommData]    = useState(null);
  const [commLoading, setCommLoading] = useState(false);
  const [fromDate,    setFromDate]    = useState(monthStart());
  const [toDate,      setToDate]      = useState(new Date());

  // Applied dates (only change on "Show" press)
  const [appliedFrom, setAppliedFrom] = useState(monthStart());
  const [appliedTo,   setAppliedTo]   = useState(new Date());

  const fromYMD = toYMD(appliedFrom);
  const toYMD_  = toYMD(appliedTo);

  const fetchComm = useCallback(async (uid, from, to) => {
    if (!uid) return;
    setCommLoading(true);
    const res = await apiGet('my', uid, toYMD(from), toYMD(to));
    if (res.ok && res.data) setCommData(res.data);
    setCommLoading(false);
  }, []);

  const fetchTeam = useCallback(async () => {
    const id = user?._id || user?.userId;
    if (!id) return;
    try {
      const res = await getMyTeam(id);
      if (res.success) {
        const d    = res.data?.data || res.data || {};
        const team = d?.team || d?.downline || [];
        setRootMembers(team);
        setSponsorInfo(d?.sponsor || null);
        setViewStack([{ root: null, members: team, userId: id }]);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    const id = user?._id || user?.userId;
    setLoading(true);
    Promise.all([fetchTeam(), fetchComm(id, fromDate, toDate)])
      .finally(() => setLoading(false));
  }, [user]);

  const handleShow = () => {
    const view = viewStack[viewStack.length - 1];
    const uid  = view?.userId || user?._id || user?.userId;
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    fetchComm(uid, fromDate, toDate);
  };

  const onRefresh = async () => {
    const id = user?._id || user?.userId;
    setRefreshing(true);
    await Promise.all([fetchTeam(), fetchComm(id, appliedFrom, appliedTo)]);
    setRefreshing(false);
  };

  const cv           = viewStack[viewStack.length - 1] || { root: null, members: [], userId: user?._id };
  const activeUserId = cv.userId || user?._id || user?.userId;
  const curMembers   = cv.members || [];
  const globalFlat   = flatAll(rootMembers, 1);
  const totalMembers = globalFlat.length;
  const activeCount  = globalFlat.filter(m => m.isActive !== false && m.distributorStatus !== 'Inactive').length;
  const isRoot       = viewStack.length <= 1;

  const rootName  = isRoot ? (sponsorInfo?.name  || commData?.distributor?.name  || '—') : (cv.root?.name  || '—');
  const rootLevel = isRoot ? (sponsorInfo?.distributorLevel || commData?.distributor?.distributorLevel || '') : (cv.root?.distributorLevel || '');

  const searchResults = search.trim().length > 1
    ? globalFlat.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        (m._id || m.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.mobile || m.phone || '').includes(search) ||
        (m.referralCode || '').toLowerCase().includes(search.toLowerCase()))
    : [];

  const drillInto = (member) => {
    const nd  = findNode(rootMembers, member._id || member.id);
    const uid = member._id || member.id;
    setViewStack(prev => [...prev, { root: member, members: getKids(nd), userId: uid }]);
    setSearch(''); setSelected(null);
    fetchComm(uid, appliedFrom, appliedTo);
  };

  const jumpTo = (index) => {
    const target = viewStack[index - 1] || viewStack[0];
    const uid    = target?.userId || user?._id || user?.userId;
    setViewStack(prev => prev.slice(0, index));
    setSearch('');
    fetchComm(uid, appliedFrom, appliedTo);
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="Distributor Earnings"
        subtitle={`${totalMembers} members · ${activeCount} active`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Earnings Banner ────────────────────────────────────── */}
        <EarningsBanner
          name={rootName}
          level={rootLevel}
          totalTeam={commData?.totalTeam}
          currentMembersCount={curMembers.length}
          isRoot={isRoot}
          from={fromDate}   to={toDate}
          setFrom={setFromDate} setTo={setToDate}
          onShow={handleShow}
          commData={commData}
          commLoading={commLoading}
          onLevelEarning={() => setLevelModal(true)}
        />

        {/* ── Search ─────────────────────────────────────────────── */}
        <View style={s.searchBox}>
          <Icon name={Icons.search} size={16} color={colors.onSurfaceMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, ID, mobile or referral..."
            placeholderTextColor={colors.onSurfaceMuted}
            value={search} onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 8 }}>
              <Icon name={Icons.close} size={16} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        {viewStack.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={s.bcRow}>
              <TouchableOpacity onPress={() => jumpTo(1)} style={s.bcYou}>
                <Text style={s.bcYouTxt}>You</Text>
              </TouchableOpacity>
              {viewStack.filter(v => v.root).map((v, i, arr) => {
                const last = i === arr.length - 1;
                const c_   = lc(v.root?.distributorLevel, i + 1);
                return (
                  <View key={v.root._id || v.root.id} style={{ flexDirection:'row', alignItems:'center' }}>
                    <Text style={s.bcSep}>/</Text>
                    <TouchableOpacity onPress={() => !last && jumpTo(i + 2)}
                      style={[s.bcChip, { backgroundColor: last ? colors.surfaceVariant : c_+'18' }]}>
                      <Text style={[s.bcChipTxt, { color: last ? colors.onSurface : c_, fontWeight: last ? '800':'600' }]}>
                        {v.root.name?.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* ── Content ───────────────────────────────────────────── */}
        {loading ? (
          <ActivityIndicator size="large" color={BRAND} style={{ paddingVertical: 40 }} />
        ) : search.trim().length > 1 ? (
          <View>
            <Text style={s.searchTitle}>{searchResults.length} results found</Text>
            {searchResults.length === 0
              ? <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center', paddingVertical: 24 }}>No members match</Text>
              : searchResults.map(m => {
                  const c_ = lc(m.distributorLevel, m.relLevel);
                  const hasK = getKids(findNode(rootMembers, m._id || m.id)).length > 0;
                  return (
                    <TouchableOpacity key={m._id||m.id}
                      onPress={() => hasK ? drillInto(m) : setSelected(m)}
                      style={[s.searchRow, { borderLeftColor: c_ }]}>
                      <View style={[s.searchAv, { backgroundColor: c_+'20', borderColor: c_+'55' }]}>
                        <Text style={[s.searchAvTxt, { color: c_ }]}>{(m.name||'?').charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex:1, marginLeft:10 }}>
                        <Text style={{ ...typography.titleSmall, color:colors.onSurface }}>{m.name}</Text>
                        <Text style={{ ...typography.bodySmall, color:colors.onSurfaceMuted }}>{m.mobile||m.phone||''}</Text>
                      </View>
                      {hasK && <Icon name={Icons.chevronRight} size={16} color={c_} />}
                    </TouchableOpacity>
                  );
                })
            }
          </View>
        ) : (
          <DownlineTable
            currentMembers={curMembers}
            rootMembers={rootMembers}
            drillInto={drillInto}
            onSelect={setSelected}
            isRoot={isRoot}
          />
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Level Earning Modal ─────────────────────────────────── */}
      <LevelEarningModal
        visible={levelModal} userId={activeUserId}
        fromYMD={fromYMD} toYMD={toYMD_}
        rootLevel={rootLevel}
        onClose={() => setLevelModal(false)}
      />

      {/* ── Member Detail Sheet ─────────────────────────────────── */}
      <MemberSheet
        member={selected} rootMembers={rootMembers}
        onClose={() => setSelected(null)}
        onDrill={() => { drillInto(selected); setSelected(null); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  scroll:      { padding: spacing.lg, paddingBottom: 40 },
  searchBox:   { flexDirection:'row', alignItems:'center', backgroundColor:colors.surface, borderRadius:radius.md, borderWidth:1.5, borderColor:colors.outline, height:44, marginBottom:10, ...elevation.level1 },
  searchInput: { flex:1, paddingHorizontal:8, ...typography.bodyMedium, color:colors.onSurface },
  searchTitle: { ...typography.titleSmall, color:BRAND, marginBottom:10 },
  searchRow:   { flexDirection:'row', alignItems:'center', backgroundColor:colors.surface, borderRadius:12, borderLeftWidth:3, padding:12, marginBottom:8, ...elevation.level1 },
  searchAv:    { width:38, height:38, borderRadius:19, borderWidth:2, alignItems:'center', justifyContent:'center' },
  searchAvTxt: { fontWeight:'800', fontSize:16 },
  bcRow:       { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:colors.surfaceVariant, borderRadius:999, paddingHorizontal:8, paddingVertical:5 },
  bcYou:       { backgroundColor:BRAND+'18', borderRadius:999, paddingHorizontal:10, paddingVertical:3 },
  bcYouTxt:    { fontSize:12, fontWeight:'700', color:BRAND },
  bcSep:       { fontSize:13, color:colors.outline, marginHorizontal:2 },
  bcChip:      { borderRadius:999, paddingHorizontal:10, paddingVertical:3 },
  bcChipTxt:   { fontSize:12 },
});
