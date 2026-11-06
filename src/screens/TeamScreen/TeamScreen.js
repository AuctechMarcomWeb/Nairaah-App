/**
 * TeamScreen — My Distributor Network
 * Mirrors MLM-Admin → /distributor/downline-tree
 * 3 view modes: Tree | Levels | Table
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Modal, FlatList, Linking,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, Divider, StatusChip } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { getMyTeam } from '../../api/team';

// ─── Constants ───────────────────────────────────────────────────────────────
const BRAND = colors.primary;
const LEVEL_ORDER = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const LEVEL_COLORS = {
  'A+': '#7C3AED', 'A': '#1A73E8', 'B': '#059669', 'C': '#D97706',
  'D': '#DC2626', 'E': '#0891B2', 'F': '#7C3AED', 'G': '#059669',
  'H': '#D97706', 'I': '#DC2626', 'J': '#0891B2', 'K': '#6B7280',
};
const FALLBACK_COLORS = Object.values(LEVEL_COLORS);

function getLevelColor(distributorLevel, relLevel) {
  if (distributorLevel && LEVEL_COLORS[distributorLevel]) return LEVEL_COLORS[distributorLevel];
  return FALLBACK_COLORS[(relLevel - 1) % FALLBACK_COLORS.length] || colors.primary;
}
function getLevelLabel(distributorLevel, relLevel) {
  if (distributorLevel) return distributorLevel;
  return LEVEL_ORDER[relLevel] || `L${relLevel}`;
}

function getKids(node) { return node?.team || node?.children || []; }

function flattenAll(members, relLevel = 1) {
  let out = [];
  members.forEach(m => {
    out.push({ ...m, relLevel });
    const kids = getKids(m);
    if (kids.length) out = out.concat(flattenAll(kids, relLevel + 1));
  });
  return out;
}

function findNode(members, id) {
  for (const m of members) {
    if (String(m._id || m.id) === String(id)) return m;
    const kids = getKids(m);
    if (kids.length) { const f = findNode(kids, id); if (f) return f; }
  }
  return null;
}

function fmtBiz(n) {
  if (!n) return '₹0';
  return n >= 100000 ? `₹${(n / 100000).toFixed(0)}L`
    : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K`
    : `₹${n}`;
}

function makeCall(mobile) {
  const cleaned = (mobile || '').replace(/\s+/g, '');
  if (!cleaned) return;
  Linking.canOpenURL(`tel:${cleaned}`)
    .then(ok => ok ? Linking.openURL(`tel:${cleaned}`) : Alert.alert('Error', 'Dialer not supported'))
    .catch(() => Alert.alert('Error', 'Could not open dialer'));
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Av({ name, color, size = 40 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20', borderWidth: 2, borderColor: color + '55', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontWeight: '800', fontSize: size * 0.4, color }}>{(name || '?').charAt(0).toUpperCase()}</Text>
    </View>
  );
}

// ─── Member Detail Bottom Sheet ───────────────────────────────────────────────
function MemberSheet({ member, rootMembers, onClose, onDrill }) {
  if (!member) return null;
  const lc = getLevelColor(member.distributorLevel, member.relLevel);
  const lb = getLevelLabel(member.distributorLevel, member.relLevel);
  const node = findNode(rootMembers, member._id || member.id);
  const hasKids = getKids(node).length > 0;
  const phone = member.mobile || member.phone || '';
  const isActive = member.isActive !== false && member.distributorStatus !== 'Inactive';

  const rows = [
    ['Joined',        (member.joiningDate || member.joinDate) ? new Date(member.joiningDate || member.joinDate).toLocaleDateString('en-IN') : '—'],
    ['Direct Team',   member.directTeam ?? getKids(node).length],
    ['Total Team',    member.totalTeam ?? '—'],
    ['Level',         lb],
    ['Referral Code', member.referralCode || '—'],
    ['Direct Units',  member.directUnitSale ?? '—'],
    ['Direct Biz',    member.directBusinessAmount != null ? fmtBiz(member.directBusinessAmount) : '—'],
    ['Team Units',    member.teamUnitSale ?? '—'],
    ['Team Biz',      member.teamBusinessAmount != null ? fmtBiz(member.teamBusinessAmount) : '—'],
    ['Total Units',   member.totalUnitSale ?? '—'],
    ['Total Biz',     member.totalBusinessAmount != null ? fmtBiz(member.totalBusinessAmount) : '—'],
    ['Commission',    member.totalCommission != null ? fmtBiz(member.totalCommission) : '—'],
  ];

  return (
    <Modal visible={!!member} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sh.overlay} activeOpacity={1} onPress={onClose} />
      <View style={sh.sheet}>
        <View style={sh.handle} />

        {/* Header */}
        <View style={[sh.headerRow, { borderLeftWidth: 4, borderLeftColor: lc }]}>
          <Av name={member.name} color={lc} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={sh.name}>{member.name}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <View style={[sh.lvBadge, { backgroundColor: lc + '18', borderColor: lc }]}>
                <Text style={[sh.lvBadgeTxt, { color: lc }]}>Level {lb}</Text>
              </View>
              <View style={[sh.statusDot, { backgroundColor: isActive ? '#dcfce7' : '#f3f4f6' }]}>
                <View style={[sh.dot, { backgroundColor: isActive ? '#059669' : '#9ca3af' }]} />
                <Text style={[sh.statusTxt, { color: isActive ? '#059669' : '#9ca3af' }]}>{isActive ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={sh.closeX} onPress={onClose}>
            <Icon name={Icons.close} size={16} color={colors.onSurfaceMuted} />
          </TouchableOpacity>
        </View>

        {/* Phone */}
        {phone ? (
          <View style={[sh.phoneBox, { backgroundColor: lc + '12', borderColor: lc + '44' }]}>
            <Icon name={Icons.phone} size={18} color={lc} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={sh.phoneLabel}>Mobile</Text>
              <Text style={[sh.phoneNum, { color: lc }]}>{phone}</Text>
            </View>
            <TouchableOpacity style={[sh.callBtn, { backgroundColor: lc }]} onPress={() => makeCall(phone)}>
              <Icon name={Icons.phone} size={14} color="#fff" />
              <Text style={sh.callTxt}>Call</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Stats grid */}
        <View style={sh.grid}>
          {rows.map(([label, val]) => (
            <View key={label} style={sh.gridCell}>
              <Text style={sh.gridLabel}>{label}</Text>
              <Text style={sh.gridVal}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Drill button */}
        {hasKids && (
          <TouchableOpacity style={[sh.drillBtn, { backgroundColor: lc + '12', borderColor: lc + '55' }]} onPress={onDrill}>
            <Icon name={Icons.downline} size={18} color={lc} />
            <Text style={[sh.drillTxt, { color: lc }]}>View {member.name?.split(' ')[0]}'s Downline</Text>
            <Icon name={Icons.chevronRight} size={14} color={lc} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const sh = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:      { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 32, ...elevation.level3 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', paddingLeft: 12, marginBottom: 14 },
  name:       { ...typography.headlineSmall, color: colors.onSurface },
  lvBadge:    { borderRadius: radius.full, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 2 },
  lvBadgeTxt: { ...typography.labelMedium, fontWeight: '700' },
  statusDot:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  statusTxt:  { ...typography.labelSmall, fontWeight: '600' },
  closeX:     { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  phoneBox:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: 12, marginBottom: 14 },
  phoneLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  phoneNum:   { ...typography.titleMedium, fontWeight: '700', marginTop: 2 },
  callBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  callTxt:    { ...typography.labelLarge, color: '#fff', fontWeight: '700' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  gridCell:   { width: '47%', backgroundColor: colors.background, borderRadius: radius.md, padding: 10 },
  gridLabel:  { ...typography.labelSmall, color: colors.onSurfaceMuted, marginBottom: 2 },
  gridVal:    { ...typography.titleSmall, color: colors.onSurface, fontWeight: '700' },
  drillBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: radius.lg, paddingVertical: 13, paddingHorizontal: 16 },
  drillTxt:   { ...typography.titleSmall, flex: 1, fontWeight: '600' },
});

// ─── Sponsor / Root Banner ────────────────────────────────────────────────────
function RootBanner({ viewStack, sponsorInfo, currentMembers }) {
  const isRoot = viewStack.length <= 1;
  const root = isRoot ? null : viewStack[viewStack.length - 1].root;
  const name  = isRoot ? (sponsorInfo?.name || '—')  : (root?.name || '—');
  const phone = isRoot ? (sponsorInfo?.phone || '')   : (root?.mobile || root?.phone || '');
  const level = isRoot ? (sponsorInfo?.distributorLevel || '') : (root?.distributorLevel || '');

  return (
    <View style={rb.banner}>
      <View style={rb.avatarCircle}>
        <Text style={rb.avatarTxt}>{(name || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={rb.eyebrow}>{isRoot ? 'YOUR SPONSOR / UPLINE' : 'VIEWING DOWNLINE OF'}</Text>
        <Text style={rb.name}>{name}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          {level ? <View style={rb.lvChip}><Text style={rb.lvTxt}>Lv {level}</Text></View> : null}
          {!isRoot ? <Text style={rb.direct}>{currentMembers.length} direct</Text> : null}
        </View>
      </View>
      {!isRoot && phone ? (
        <TouchableOpacity style={rb.callBtn} onPress={() => makeCall(phone)}>
          <Icon name={Icons.phone} size={18} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const rb = StyleSheet.create({
  banner:      { borderRadius: 16, padding: 14, marginBottom: 14, backgroundColor: BRAND, ...elevation.level2 },
  avatarCircle:{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt:   { fontWeight: '800', fontSize: 20, color: '#fff' },
  eyebrow:     { fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, marginBottom: 2 },
  name:        { fontWeight: '800', fontSize: 16, color: '#fff' },
  lvChip:      { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  lvTxt:       { fontSize: 10, fontWeight: '700', color: '#fff' },
  direct:      { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  callBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
});

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ viewStack, onJump }) {
  if (viewStack.length <= 1) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
      <View style={bc.row}>
        <TouchableOpacity onPress={() => onJump(0)} style={bc.youChip}>
          <Text style={bc.youTxt}>You</Text>
        </TouchableOpacity>
        {viewStack.filter(v => v.root).map((v, i, arr) => {
          const isLast = i === arr.length - 1;
          const lc = getLevelColor(v.root?.distributorLevel, i + 1);
          return (
            <View key={v.root._id || v.root.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={bc.sep}>/</Text>
              <TouchableOpacity
                onPress={() => !isLast && onJump(i + 2)}
                style={[bc.chip, { backgroundColor: isLast ? colors.surfaceVariant : lc + '18' }]}
              >
                <Text style={[bc.chipTxt, { color: isLast ? colors.onSurface : lc, fontWeight: isLast ? '800' : '600' }]}>
                  {v.root.name?.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
const bc = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceVariant, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  youChip: { backgroundColor: BRAND + '18', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  youTxt:  { fontSize: 12, fontWeight: '700', color: BRAND },
  sep:     { fontSize: 13, color: colors.outline, marginHorizontal: 2 },
  chip:    { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  chipTxt: { fontSize: 12 },
});

// ─── Tree View ────────────────────────────────────────────────────────────────
function TreeNode({ member, depth, rootMembers, onSelect, drillInto }) {
  const kids = getKids(member);
  const hasKids = kids.length > 0;
  const [open, setOpen] = useState(depth < 1);
  const lc = getLevelColor(member.distributorLevel, depth + 1);
  const lb = getLevelLabel(member.distributorLevel, depth + 1);
  const isActive = member.isActive !== false && member.distributorStatus !== 'Inactive';

  return (
    <View style={{ marginLeft: depth === 0 ? 0 : 14 }}>
      <View style={tv.nodeRow}>
        {depth > 0 && <View style={[tv.connector, { backgroundColor: lc + '35' }]} />}
        <TouchableOpacity
          style={[tv.card, { borderLeftColor: lc }]}
          onPress={() => hasKids ? drillInto({ ...member, relLevel: depth + 1 }) : onSelect({ ...member, relLevel: depth + 1 })}
          activeOpacity={0.85}
        >
          {/* expand/collapse */}
          {hasKids ? (
            <TouchableOpacity
              style={[tv.toggle, { backgroundColor: open ? lc : '#fff', borderColor: lc }]}
              onPress={(e) => { e.stopPropagation?.(); setOpen(o => !o); }}
            >
              <Text style={[tv.toggleTxt, { color: open ? '#fff' : lc }]}>{open ? '−' : '+'}</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 22 }} />}

          <Av name={member.name} color={lc} size={40} />

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={tv.memberName}>{member.name}</Text>
              <View style={[tv.lvBadge, { backgroundColor: lc + '18', borderColor: lc }]}>
                <Text style={[tv.lvTxt, { color: lc }]}>Lv {lb}</Text>
              </View>
              <View style={[tv.statusDot, { backgroundColor: isActive ? '#059669' : '#9ca3af' }]} />
            </View>
            <Text style={[tv.phone, { color: lc }]}>{member.mobile || member.phone || ''}</Text>
            {hasKids && <Text style={tv.directCount}>{kids.length} direct</Text>}
          </View>

          {/* info button */}
          <TouchableOpacity
            style={[tv.infoBtn, { backgroundColor: lc + '18', borderColor: lc + '44' }]}
            onPress={() => onSelect({ ...member, relLevel: depth + 1 })}
          >
            <Text style={[tv.infoTxt, { color: lc }]}>i</Text>
          </TouchableOpacity>

          {hasKids && <Icon name={Icons.chevronRight} size={11} color={lc} />}
        </TouchableOpacity>
      </View>

      {hasKids && open && (
        <View style={[tv.childrenBox, { borderLeftColor: lc + '20' }]}>
          {kids.map(child => (
            <TreeNode
              key={child._id || child.id}
              member={child}
              depth={depth + 1}
              rootMembers={rootMembers}
              onSelect={onSelect}
              drillInto={drillInto}
            />
          ))}
        </View>
      )}
    </View>
  );
}
const tv = StyleSheet.create({
  nodeRow:     { flexDirection: 'row', alignItems: 'stretch' },
  connector:   { width: 14, borderRadius: 1 },
  card:        { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: 12, marginBottom: 5, backgroundColor: colors.surface, borderLeftWidth: 3, ...elevation.level1 },
  toggle:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 },
  toggleTxt:   { fontWeight: '700', fontSize: 15, lineHeight: 18 },
  memberName:  { ...typography.titleSmall, color: colors.onSurface },
  lvBadge:     { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 7, paddingVertical: 1 },
  lvTxt:       { fontSize: 10, fontWeight: '700' },
  statusDot:   { width: 7, height: 7, borderRadius: 4 },
  phone:       { ...typography.labelMedium, fontWeight: '600', marginTop: 2 },
  directCount: { fontSize: 10, color: colors.onSurfaceMuted, marginTop: 2 },
  infoBtn:     { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  infoTxt:     { fontWeight: '700', fontSize: 13 },
  childrenBox: { paddingLeft: 14, borderLeftWidth: 2, marginLeft: 8, marginBottom: 4 },
});

// ─── Levels View ─────────────────────────────────────────────────────────────
function LevelsView({ currentMembers, rootMembers, onSelect, drillInto, isRoot }) {
  const flat = flattenAll(currentMembers, 1);
  const grouped = {};
  flat.forEach(m => {
    const lbl = m.distributorLevel || `L${m.relLevel}`;
    if (!grouped[lbl]) grouped[lbl] = [];
    grouped[lbl].push(m);
  });
  const groups = LEVEL_ORDER.filter(l => grouped[l]).map(l => ({ label: l, color: getLevelColor(l, 1), members: grouped[l] }));
  Object.keys(grouped).filter(l => !LEVEL_ORDER.includes(l)).forEach(l => {
    groups.push({ label: l, color: getLevelColor(l, 1), members: grouped[l] });
  });

  if (groups.length === 0) return <EmptyState />;

  return (
    <View>
      {groups.map((group, idx) => (
        <LevelGroup
          key={group.label} group={group} idx={idx} isRoot={isRoot}
          rootMembers={rootMembers} drillInto={drillInto} onSelect={onSelect}
        />
      ))}
    </View>
  );
}

function LevelGroup({ group, idx, isRoot, rootMembers, drillInto, onSelect }) {
  const [open, setOpen] = useState(true);
  const displayLabel = isRoot ? group.label : String.fromCharCode(66 + idx);
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={lv.groupHeader}>
        <View style={[lv.levelBadge, { backgroundColor: group.color + '18', borderColor: group.color }]}>
          <Text style={[lv.levelTxt, { color: group.color }]}>Level {displayLabel}</Text>
        </View>
        <TouchableOpacity
          style={[lv.toggle, { backgroundColor: open ? group.color : '#fff', borderColor: group.color }]}
          onPress={() => setOpen(o => !o)}
        >
          <Text style={[lv.toggleTxt, { color: open ? '#fff' : group.color }]}>{open ? '−' : '+'}</Text>
        </TouchableOpacity>
        <View style={[lv.countBadge, { backgroundColor: group.color + '18', borderColor: group.color + '44' }]}>
          <Text style={[lv.countTxt, { color: group.color }]}>{group.members.length}</Text>
        </View>
        <View style={[lv.line, { backgroundColor: group.color + '25' }]} />
      </View>
      {open && group.members.map(m => {
        const hasKids = getKids(findNode(rootMembers, m._id || m.id)).length > 0;
        return (
          <MemberCard
            key={m._id || m.id} member={m} color={group.color}
            hasKids={hasKids}
            onPress={() => hasKids ? drillInto(m) : onSelect(m)}
          />
        );
      })}
    </View>
  );
}

function MemberCard({ member, color, hasKids, onPress }) {
  const phone = member.mobile || member.phone || '';
  const isActive = member.isActive !== false && member.distributorStatus !== 'Inactive';
  return (
    <TouchableOpacity style={[mc.card, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <Av name={member.name} color={color} size={46} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={mc.name}>{member.name}</Text>
          <View style={[mc.statusDot, { backgroundColor: isActive ? '#dcfce7' : '#f3f4f6' }]}>
            <View style={[mc.dot, { backgroundColor: isActive ? '#059669' : '#9ca3af' }]} />
            <Text style={[mc.statusTxt, { color: isActive ? '#059669' : '#9ca3af' }]}>{isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={[mc.phone, { color }]}>{phone}</Text>
        {(member.totalBusinessAmount > 0 || member.directTeam > 0) && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 3 }}>
            {member.totalBusinessAmount > 0 && <Text style={mc.meta}>{fmtBiz(member.totalBusinessAmount)}</Text>}
            {(member.directTeam || 0) > 0 && <Text style={mc.meta}>{member.directTeam} direct</Text>}
          </View>
        )}
      </View>
      <View style={[mc.arrow, { backgroundColor: hasKids ? color + '18' : colors.surfaceVariant, borderColor: hasKids ? color + '44' : colors.outline }]}>
        {hasKids
          ? <Icon name={Icons.chevronRight} size={12} color={color} />
          : <Icon name={Icons.customer} size={11} color={colors.onSurfaceMuted} />}
      </View>
    </TouchableOpacity>
  );
}

const lv = StyleSheet.create({
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  levelBadge:  { borderRadius: 999, borderWidth: 2, paddingHorizontal: 12, paddingVertical: 3 },
  levelTxt:    { fontWeight: '800', fontSize: 13 },
  toggle:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  toggleTxt:   { fontWeight: '700', fontSize: 14, lineHeight: 16 },
  countBadge:  { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  countTxt:    { fontWeight: '700', fontSize: 12 },
  line:        { flex: 1, height: 1 },
});
const mc = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 8, backgroundColor: colors.surface, borderLeftWidth: 3, ...elevation.level1 },
  name:      { ...typography.titleSmall, color: colors.onSurface },
  phone:     { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  dot:       { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 10, fontWeight: '600' },
  meta:      { fontSize: 11, color: colors.onSurfaceMuted },
  arrow:     { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});

// ─── Table View ───────────────────────────────────────────────────────────────
function TableView({ currentMembers, rootMembers, drillInto, onSelect, isRoot }) {
  const flat = flattenAll(currentMembers, 1);
  const grouped = {};
  flat.forEach(m => {
    const lbl = m.distributorLevel || `L${m.relLevel}`;
    if (!grouped[lbl]) grouped[lbl] = [];
    grouped[lbl].push(m);
  });
  const groups = LEVEL_ORDER.filter(l => grouped[l]).map(l => ({ label: l, color: getLevelColor(l, 1), members: grouped[l] }));
  Object.keys(grouped).filter(l => !LEVEL_ORDER.includes(l)).forEach(l => {
    groups.push({ label: l, color: getLevelColor(l, 1), members: grouped[l] });
  });

  if (groups.length === 0) return <EmptyState />;

  return (
    <View style={[tb.table, elevation.level1]}>
      {/* Header */}
      <View style={tb.thead}>
        <Text style={[tb.th, { width: 60 }]}>Level</Text>
        <Text style={[tb.th, { width: 44 }]}>Count</Text>
        <Text style={[tb.th, { flex: 1 }]}>Members (tap to drill in)</Text>
      </View>
      {groups.map((group, idx) => {
        const displayLabel = isRoot ? group.label : String.fromCharCode(66 + idx);
        return (
          <View key={group.label} style={[tb.row, idx % 2 === 1 && tb.rowAlt]}>
            <View style={{ width: 60 }}>
              <View style={[tb.lvBadge, { backgroundColor: group.color + '18', borderColor: group.color }]}>
                <Text style={[tb.lvTxt, { color: group.color }]}>{displayLabel}</Text>
              </View>
            </View>
            <Text style={[tb.count, { width: 44, color: group.color }]}>{group.members.length}</Text>
            <View style={[tb.chips, { flex: 1 }]}>
              {group.members.map(m => {
                const hasKids = getKids(findNode(rootMembers, m._id || m.id)).length > 0;
                const isActive = m.isActive !== false && m.distributorStatus !== 'Inactive';
                return (
                  <TouchableOpacity
                    key={m._id || m.id}
                    onPress={() => hasKids ? drillInto(m) : onSelect(m)}
                    style={[tb.chip, { backgroundColor: group.color + '12', borderColor: hasKids ? group.color + '66' : group.color + '22' }]}
                  >
                    {!isActive && <View style={[tb.inactiveDot]} />}
                    <Text style={[tb.chipTxt, { color: group.color }]}>{m.name?.split(' ')[0]}</Text>
                    {hasKids && <Icon name={Icons.chevronRight} size={9} color={group.color} />}
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
const tb = StyleSheet.create({
  table:    { borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface },
  thead:    { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND, padding: 12, gap: 8 },
  th:       { ...typography.labelSmall, color: '#fff', fontWeight: '700' },
  row:      { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowAlt:   { backgroundColor: colors.background },
  lvBadge:  { borderRadius: 999, borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  lvTxt:    { fontWeight: '800', fontSize: 13 },
  count:    { fontWeight: '800', fontSize: 20, textAlign: 'center' },
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:     { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5 },
  chipTxt:  { fontSize: 12, fontWeight: '700' },
  inactiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f59e0b' },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={em.wrap}>
      <Icon name={Icons.downline} size={52} color={colors.outline} style={{ marginBottom: 14 }} />
      <Text style={em.title}>No Downline Members Yet</Text>
      <Text style={em.sub}>Share your referral code to start building your network</Text>
    </View>
  );
}
const em = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  title: { ...typography.titleLarge, color: colors.onSurface, marginBottom: 8 },
  sub:   { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center' },
});

// ─── View Mode Toggle ─────────────────────────────────────────────────────────
const VIEW_MODES = [
  { key: 'tree',   label: 'Tree',   icon: 'format-list-bulleted' },
  { key: 'levels', label: 'Levels', icon: 'layers-outline' },
  { key: 'table',  label: 'Table',  icon: 'table-large' },
];

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function TeamScreen({ navigation }) {
  const { user } = useSelector(state => state.user);
  const [rootMembers, setRootMembers] = useState([]);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [directTeam, setDirectTeam]   = useState(0);
  const [totalTeam, setTotalTeam]     = useState(0);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);

  const [viewStack, setViewStack] = useState([]);
  const [viewMode, setViewMode]   = useState('table');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  const fetchTeam = useCallback(async () => {
    const id = user?._id || user?.userId;
    if (!id) return;
    setError(null);
    try {
      const res = await getMyTeam(id);
      if (res.success) {
        const d = res.data?.data || res.data || {};
        const team = d?.team || d?.downline || [];
        setRootMembers(team);
        setSponsorInfo(d?.sponsor || null);
        setDirectTeam(d?.directTeam ?? 0);
        setTotalTeam(d?.totalTeam ?? 0);
        setViewStack([{ root: null, members: team }]);
      } else {
        setError(res.message || 'Failed to load team.');
      }
    } catch (e) {
      setError('Failed to load your downline. Please try again.');
    }
  }, [user]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchTeam(); setLoading(false); })();
  }, [fetchTeam]);

  const onRefresh = async () => { setRefreshing(true); await fetchTeam(); setRefreshing(false); };

  const currentView   = viewStack[viewStack.length - 1] || { root: null, members: [] };
  const currentMembers = currentView.members || [];
  const allFlat        = flattenAll(currentMembers, 1);
  const globalFlat     = flattenAll(rootMembers, 1);
  const totalMembers   = globalFlat.length;
  const activeMembers  = globalFlat.filter(m => m.isActive !== false && m.distributorStatus !== 'Inactive').length;
  const isRoot         = viewStack.length <= 1;

  const searchResults = search.trim().length > 1
    ? globalFlat.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        (m._id || m.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.mobile || m.phone || '').includes(search) ||
        (m.referralCode || '').toLowerCase().includes(search.toLowerCase()))
    : [];

  const drillInto = (member) => {
    const node = findNode(rootMembers, member._id || member.id);
    setViewStack(prev => [...prev, { root: member, members: getKids(node) }]);
    setSearch(''); setSelected(null);
  };

  const handleSelect = (member) => setSelected(member);

  const handleJump = (index) => {
    setViewStack(prev => prev.slice(0, index));
    setSearch('');
  };

  const handleViewMode = (mode) => {
    setViewMode(mode);
    setSearch('');
    setViewStack(prev => [prev[0] || { root: null, members: rootMembers }]);
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="My Network"
        subtitle={`${totalMembers} total · ${activeMembers} active`}
        rightIconName="account-plus"
        onRightPress={() => navigation.navigate('AddMember')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* View mode toggle */}
        <View style={s.viewToggle}>
          {VIEW_MODES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[s.viewBtn, viewMode === m.key && s.viewBtnActive]}
              onPress={() => handleViewMode(m.key)}
            >
              <Icon name={m.icon} size={14} color={viewMode === m.key ? colors.white : colors.onSurfaceMuted} />
              <Text style={[s.viewBtnTxt, viewMode === m.key && s.viewBtnTxtActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sponsor / root banner */}
        {(sponsorInfo || viewStack.length > 1) && (
          <RootBanner viewStack={viewStack} sponsorInfo={sponsorInfo} currentMembers={currentMembers} />
        )}

        {/* Search */}
        <View style={s.searchBox}>
          <Icon name={Icons.search} size={16} color={colors.onSurfaceMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, ID, mobile or referral code..."
            placeholderTextColor={colors.onSurfaceMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 8 }}>
              <Icon name={Icons.close} size={16} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Breadcrumb */}
        {viewStack.length > 1 && (
          <Breadcrumb viewStack={viewStack} onJump={handleJump} />
        )}

        {/* Content */}
        {loading ? (
          <View style={s.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={s.errorBox}>
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => { setLoading(true); fetchTeam().finally(() => setLoading(false)); }}>
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : search.trim().length > 1 ? (
          // Search results
          <View>
            <Text style={s.searchResultsTitle}>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</Text>
            {searchResults.length === 0
              ? <Text style={s.noResults}>No members match</Text>
              : searchResults.map(m => (
                  <MemberCard
                    key={m._id || m.id}
                    member={m}
                    color={getLevelColor(m.distributorLevel, m.relLevel)}
                    hasKids={getKids(findNode(rootMembers, m._id || m.id)).length > 0}
                    onPress={() => {
                      const hasKids = getKids(findNode(rootMembers, m._id || m.id)).length > 0;
                      hasKids ? drillInto(m) : handleSelect(m);
                    }}
                  />
                ))}
          </View>
        ) : viewMode === 'tree' ? (
          currentMembers.length === 0 ? <EmptyState /> : (
            <View>
              {currentMembers.map(member => (
                <TreeNode
                  key={member._id || member.id}
                  member={member}
                  depth={0}
                  rootMembers={rootMembers}
                  onSelect={handleSelect}
                  drillInto={drillInto}
                />
              ))}
            </View>
          )
        ) : viewMode === 'levels' ? (
          <LevelsView currentMembers={currentMembers} rootMembers={rootMembers} onSelect={handleSelect} drillInto={drillInto} isRoot={isRoot} />
        ) : (
          <TableView currentMembers={currentMembers} rootMembers={rootMembers} onSelect={handleSelect} drillInto={drillInto} isRoot={isRoot} />
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Member Detail Sheet */}
      <MemberSheet
        member={selected}
        rootMembers={rootMembers}
        onClose={() => setSelected(null)}
        onDrill={() => { drillInto(selected); setSelected(null); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: colors.background },
  scroll:            { padding: spacing.lg },
  viewToggle:        { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: radius.lg, padding: 3, marginBottom: 14, gap: 3 },
  viewBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: radius.md },
  viewBtnActive:     { backgroundColor: BRAND },
  viewBtnTxt:        { ...typography.labelMedium, color: colors.onSurfaceMuted },
  viewBtnTxtActive:  { color: colors.white, fontWeight: '700' },
  searchBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.outline, height: 44, marginBottom: 10, ...elevation.level1 },
  searchInput:       { flex: 1, paddingHorizontal: 8, ...typography.bodyMedium, color: colors.onSurface },
  loaderBox:         { alignItems: 'center', paddingVertical: 48 },
  errorBox:          { alignItems: 'center', paddingVertical: 40 },
  errorTxt:          { ...typography.bodyMedium, color: colors.error, textAlign: 'center', marginBottom: 16 },
  retryBtn:          { backgroundColor: colors.primaryContainer, borderRadius: radius.lg, paddingHorizontal: 24, paddingVertical: 10 },
  retryTxt:          { ...typography.titleSmall, color: colors.primary },
  searchResultsTitle:{ ...typography.titleSmall, color: BRAND, marginBottom: 10 },
  noResults:         { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center', paddingVertical: 24 },
});
