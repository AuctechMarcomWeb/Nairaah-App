import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, TextInput,
  Modal, FlatList, Linking, Alert,
} from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../theme';
import { AppHeader, Divider, StatusChip, LevelBadge } from '../components';
import Icon, { Icons } from '../components/Icon';
import { distributor, teamMembers } from '../data/mockData';
import { LEVEL_LABELS, LEVEL_COLORS } from '../constants/levels';

// ── Phone call helper ─────────────────────────────────────
function makeCall(mobile) {
  const cleaned = mobile.replace(/\s+/g, '');
  Linking.canOpenURL(`tel:${cleaned}`)
    .then(ok => ok ? Linking.openURL(`tel:${cleaned}`) : Alert.alert('Error', 'Dialer not supported'))
    .catch(() => Alert.alert('Error', 'Could not open dialer'));
}

// ── Flatten all members by level ──────────────────────────
function flattenByLevel(members, currentLevel) {
  let result = [];
  members.forEach(m => {
    result.push({ ...m, level: currentLevel });
    if (m.children && m.children.length > 0)
      result = result.concat(flattenByLevel(m.children, currentLevel + 1));
  });
  return result;
}

const allFlat = flattenByLevel(teamMembers, 1);
// LEVEL_LABELS and LEVEL_COLORS imported from ../constants/levels
const levelGroups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => ({
  level: lvl,
  label: LEVEL_LABELS[lvl],
  color: LEVEL_COLORS[lvl],
  members: allFlat.filter(m => m.level === lvl),
})).filter(g => g.members.length > 0);

// ── Member Detail Modal (center) ──────────────────────────
function MemberDetailModal({ visible, member, onClose, onViewDownline }) {
  if (!member) return null;
  const levelColor = LEVEL_COLORS[member.level] || colors.primary;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={detailMd.overlay}>
        <View style={detailMd.card}>
          {/* Avatar + name */}
          <View style={detailMd.avatarRow}>
            <View style={[detailMd.avatar, { backgroundColor: levelColor + '22' }]}>
              <Text style={[detailMd.avatarText, { color: levelColor }]}>
                {member.name.charAt(0)}
              </Text>
            </View>
            <View style={detailMd.avatarInfo}>
              <Text style={detailMd.memberName}>{member.name}</Text>
              <Text style={detailMd.memberId}>{member.id}</Text>
              <StatusChip status={member.isActive ? 'Active' : 'Inactive'} />
            </View>
          </View>

          <Divider style={{ marginVertical: 14 }} />

          {/* Phone Number — prominent with call button */}
          <View style={detailMd.phoneBox}>
            <View style={detailMd.phoneLeft}>
              <Text style={detailMd.phoneLabel}>Mobile Number</Text>
              <Text style={detailMd.phoneNumber}>{member.mobile}</Text>
            </View>
            <TouchableOpacity
              style={detailMd.callBtn}
              onPress={() => makeCall(member.mobile)}>
              <Icon name={Icons.phone} size={20} color={colors.white} />
              <Text style={detailMd.callText}>Call</Text>
            </TouchableOpacity>
          </View>

          <Divider style={{ marginVertical: 14 }} />

          {/* Other details */}
          {[
            [Icons.idCard,   'Distributor ID', member.id],
            [Icons.upline,   'Referrer',        distributor.name],
            [Icons.joinDate, 'Join Date',        member.joinDate],
            [Icons.payout,   'Total Business',  `₹${member.totalBusiness.toLocaleString()}`],
            [Icons.commission,'Total Earning',  `₹${member.totalEarning.toLocaleString()}`],
          ].map(([icon, label, value]) => (
            <View key={label} style={detailMd.row}>
              <Icon name={icon} size={15} color={colors.primary} style={{ marginRight: 8, width: 24 }} />
              <Text style={detailMd.rowLabel}>{label}</Text>
              <Text style={detailMd.rowVal}>{value}</Text>
            </View>
          ))}
          {/* MLM Level row with badge */}
          <View style={detailMd.row}>
            <Icon name={Icons.level} size={15} color={colors.primary} style={{ marginRight: 8, width: 24 }} />
            <Text style={detailMd.rowLabel}>MLM Level</Text>
            <LevelBadge level={member.mlmLevel || LEVEL_LABELS[member.level]} size="sm" />
          </View>

          <Divider style={{ marginVertical: 14 }} />

          {/* View Downline button — only if member has children */}
          {findMemberNode(teamMembers, member.id)?.children?.length > 0 && (
            <TouchableOpacity style={detailMd.downlineBtn} onPress={onViewDownline}>
              <Icon name={Icons.downline} size={18} color={colors.primary} />
              <Text style={detailMd.downlineBtnText}>
                View {member.name.split(' ')[0]}'s Downline
              </Text>
              <Text style={detailMd.downlineBtnArrow}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={detailMd.closeBtn} onPress={onClose}>
            <Text style={detailMd.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const detailMd = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 24,
    padding: spacing.xl, width: '100%',
    elevation: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800' },
  avatarInfo: { flex: 1 },
  memberName: { ...typography.headlineSmall, color: colors.onSurface },
  memberId: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2, marginBottom: 4 },

  phoneBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg, padding: spacing.md, gap: 12,
  },
  phoneLeft: { flex: 1 },
  phoneLabel: { ...typography.labelMedium, color: colors.primaryDark },
  phoneNumber: { ...typography.headlineSmall, color: colors.primary, marginTop: 4 },
  callBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', gap: 4,
  },
  callIcon: { fontSize: 20 },
  callText: { ...typography.labelLarge, color: colors.white },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowIcon: { fontSize: 15, width: 24, marginRight: 8 },
  rowLabel: { ...typography.labelLarge, color: colors.onSurfaceMuted, flex: 1 },
  rowVal: { ...typography.titleSmall, color: colors.onSurface },
  closeBtn: {
    height: 48, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.outline,
  },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
  downlineBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg, height: 50,
    paddingHorizontal: spacing.lg, marginBottom: 10, gap: 8,
  },
  downlineBtnIcon: { fontSize: 18 },
  downlineBtnText: { ...typography.titleSmall, color: colors.primary, flex: 1 },
  downlineBtnArrow: { fontSize: 22, color: colors.primary },
});

// ── Members List Modal (on level row click) ───────────────
function MembersListModal({ visible, group, onClose, onMemberPress }) {
  const [search, setSearch] = useState('');
  if (!group) return null;
  const filtered = group.members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search),
  );
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={listMd.overlay}>
        <View style={listMd.card}>
          {/* Header */}
          <View style={listMd.header}>
            <View style={[listMd.levelBadge, { backgroundColor: group.color + '20', borderColor: group.color }]}>
              <Text style={[listMd.levelBadgeText, { color: group.color }]}>Level {group.label}</Text>
            </View>
            <Text style={listMd.headerTitle}>Members</Text>
            <Text style={listMd.headerCount}>{group.members.length}</Text>
          </View>

          {/* Search */}
          <View style={listMd.searchBox}>
            <Text style={listMd.searchIcon}>🔍</Text>
            <TextInput
              style={listMd.searchInput}
              placeholder="Search name, ID or mobile..."
              placeholderTextColor={colors.onSurfaceMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={listMd.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <Divider style={{ marginBottom: 4 }} />

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            style={listMd.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <Divider />}
            ListEmptyComponent={
              <View style={listMd.empty}>
                <Text style={listMd.emptyIcon}>🔍</Text>
                <Text style={listMd.emptyText}>No members found</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={listMd.memberRow}
                onPress={() => { setSearch(''); onMemberPress(item); }}
                activeOpacity={0.7}>
                <View style={[listMd.memberAvatar, { backgroundColor: group.color + '18' }]}>
                  <Text style={[listMd.memberAvatarText, { color: group.color }]}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={listMd.memberInfo}>
                  <Text style={listMd.memberName}>{item.name}</Text>
                  {/* Phone number visible directly */}
                  <Text style={listMd.memberPhone}>{item.mobile}</Text>
                  <Text style={listMd.memberMeta}>{item.id} · Joined {item.joinDate}</Text>
                </View>
                <View style={listMd.memberRight}>
                  <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
                  <TouchableOpacity
                    style={listMd.callMiniBtn}
                    onPress={() => makeCall(item.mobile)}>
                    <Text style={listMd.callMiniIcon}>📞</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />

          <Divider style={{ marginTop: 6 }} />
          <TouchableOpacity style={listMd.closeBtn} onPress={() => { setSearch(''); onClose(); }}>
            <Text style={listMd.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const listMd = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 24,
    padding: spacing.lg, width: '100%', maxHeight: '82%',
    elevation: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  levelBadge: { borderRadius: radius.full, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 3 },
  levelBadgeText: { ...typography.labelLarge },
  headerTitle: { ...typography.headlineSmall, color: colors.onSurface, flex: 1 },
  headerCount: {
    backgroundColor: colors.primaryContainer, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    ...typography.titleSmall, color: colors.primary,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.outline,
    paddingHorizontal: spacing.md, height: 44, marginBottom: 10,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, ...typography.bodyMedium, color: colors.onSurface },
  clearBtn: { fontSize: 13, color: colors.onSurfaceMuted, padding: 4 },
  list: { maxHeight: 300 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  memberAvatarText: { fontSize: 20, fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { ...typography.titleSmall, color: colors.onSurface },
  memberPhone: { ...typography.titleSmall, color: colors.primary, marginTop: 2 },
  memberMeta: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 1 },
  memberRight: { alignItems: 'flex-end', gap: 6 },
  callMiniBtn: {
    backgroundColor: colors.successContainer, borderRadius: radius.full,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  callMiniIcon: { fontSize: 16 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  closeBtn: {
    height: 46, borderRadius: radius.lg, marginTop: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.outline,
  },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

// ── Find member's full node in tree ──────────────────────
function findMemberNode(members, targetId) {
  for (const m of members) {
    if (m.id === targetId) return m;
    if (m.children && m.children.length > 0) {
      const found = findMemberNode(m.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

// ── Flatten subtree by relative level ────────────────────
function flattenSubtree(members, relativeLevel) {
  let result = [];
  members.forEach(m => {
    result.push({ ...m, relativeLevel });
    if (m.children && m.children.length > 0)
      result = result.concat(flattenSubtree(m.children, relativeLevel + 1));
  });
  return result;
}

// REL_LEVEL_LABELS / REL_LEVEL_COLORS = same as LEVEL_LABELS / LEVEL_COLORS (imported from constants)
const REL_LEVEL_LABELS = LEVEL_LABELS;
const REL_LEVEL_COLORS = LEVEL_COLORS;

// ── Member Downline Modal — recursive nav stack ───────────
function MemberRow({ item, lc, hasKids, onDrillIn }) {
  return (
    <TouchableOpacity
      style={dlMd.memberRow}
      onPress={() => hasKids && onDrillIn(item)}
      activeOpacity={hasKids ? 0.75 : 1}>
      <View style={[dlMd.memberAvatar, { backgroundColor: lc + '18' }]}>
        <Text style={[dlMd.memberAvatarText, { color: lc }]}>{item.name.charAt(0)}</Text>
      </View>
      <View style={dlMd.memberInfo}>
        <Text style={dlMd.memberName}>{item.name}</Text>
        <Text style={dlMd.memberPhone}>{item.mobile}</Text>
        <Text style={dlMd.memberMeta}>{item.id} · Joined {item.joinDate}</Text>
      </View>
      <View style={dlMd.memberRight}>
        <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <TouchableOpacity style={dlMd.callBtn} onPress={() => makeCall(item.mobile)}>
            <Text style={{ fontSize: 14 }}>📞</Text>
          </TouchableOpacity>
          {hasKids && (
            <TouchableOpacity style={dlMd.drillBtn} onPress={() => onDrillIn(item)}>
              <Text style={dlMd.drillBtnText}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MemberDownlineModal({ visible, member, onClose }) {
  const [navStack, setNavStack] = useState([]);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (visible && member) { setNavStack([member]); setSearch(''); }
  }, [visible, member?.id]);

  if (!visible || navStack.length === 0) return null;

  const currentRoot = navStack[navStack.length - 1];
  const fullNode = findMemberNode(teamMembers, currentRoot.id);
  const children = fullNode?.children || [];
  const subtreeFlat = flattenSubtree(children, 1);

  const maxLevel = subtreeFlat.length > 0 ? Math.max(...subtreeFlat.map(m => m.relativeLevel)) : 0;
  const levelGroups = [];
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const ms = subtreeFlat.filter(m => m.relativeLevel === lvl);
    if (ms.length > 0) levelGroups.push({ level: lvl, label: REL_LEVEL_LABELS[lvl] || `L${lvl}`, members: ms });
  }

  const searchFiltered = search.trim().length > 0
    ? subtreeFlat.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()))
    : [];

  const drillInto = (m) => { setSearch(''); setNavStack(prev => [...prev, m]); };
  const goBack = () => { setSearch(''); setNavStack(prev => prev.slice(0, -1)); };
  const handleClose = () => { setNavStack([]); setSearch(''); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={dlMd.overlay}>
        <View style={dlMd.card}>

          {/* Header */}
          <View style={dlMd.header}>
            {navStack.length > 1 ? (
              <TouchableOpacity style={dlMd.backBtn} onPress={goBack}>
                <Text style={dlMd.backBtnText}>‹</Text>
              </TouchableOpacity>
            ) : (
              <View style={dlMd.headerAvatar}>
                <Text style={dlMd.headerAvatarText}>{currentRoot.name.charAt(0)}</Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 8 }}>
              {/* Breadcrumb */}
              {navStack.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 2 }}>
                  <Text style={dlMd.breadcrumb}>
                    {navStack.map((m, i) => m.name.split(' ')[0] + (i < navStack.length - 1 ? ' › ' : '')).join('')}
                  </Text>
                </ScrollView>
              )}
              <Text style={dlMd.headerName}>{currentRoot.name.split(' ')[0]}'s Downline</Text>
              <Text style={dlMd.headerSub}>
                {subtreeFlat.length} member{subtreeFlat.length !== 1 ? 's' : ''}
                {levelGroups.length > 0 ? ` · ${levelGroups.length} level${levelGroups.length !== 1 ? 's' : ''}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={dlMd.xBtn}>
              <Text style={dlMd.xBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={dlMd.searchBox}>
            <Text style={dlMd.searchIcon}>🔍</Text>
            <TextInput
              style={dlMd.searchInput}
              placeholder="Search members..."
              placeholderTextColor={colors.onSurfaceMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={dlMd.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Empty */}
          {children.length === 0 ? (
            <View style={dlMd.emptyBox}>
              <Text style={dlMd.emptyIcon}>👤</Text>
              <Text style={dlMd.emptyText}>{currentRoot.name.split(' ')[0]} has no downline yet.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 370 }}>
              {search.trim().length > 0 ? (
                <View style={dlMd.section}>
                  <Text style={dlMd.sectionTitle}>{searchFiltered.length} result{searchFiltered.length !== 1 ? 's' : ''}</Text>
                  {searchFiltered.length === 0
                    ? <Text style={{ ...typography.bodySmall, color: colors.onSurfaceMuted, padding: spacing.md }}>No members match</Text>
                    : searchFiltered.map((item, idx) => {
                        const lc = REL_LEVEL_COLORS[item.relativeLevel] || colors.primary;
                        const hasKids = (findMemberNode(teamMembers, item.id)?.children?.length || 0) > 0;
                        return (
                          <View key={item.id}>
                            <MemberRow item={item} lc={lc} hasKids={hasKids} onDrillIn={drillInto} />
                            {idx < searchFiltered.length - 1 && <Divider />}
                          </View>
                        );
                      })}
                </View>
              ) : (
                levelGroups.map(group => {
                  const lc = REL_LEVEL_COLORS[group.level] || colors.primary;
                  return (
                    <View key={group.label} style={dlMd.section}>
                      <View style={[dlMd.levelHeader, { backgroundColor: lc + '15', borderLeftColor: lc }]}>
                        <View style={[dlMd.levelBadge, { backgroundColor: lc + '25', borderColor: lc }]}>
                          <Text style={[dlMd.levelBadgeText, { color: lc }]}>Level {group.label}</Text>
                        </View>
                        <Text style={[dlMd.levelCount, { color: lc }]}>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</Text>
                      </View>
                      {group.members.map((item, idx) => {
                        const hasKids = (findMemberNode(teamMembers, item.id)?.children?.length || 0) > 0;
                        return (
                          <View key={item.id}>
                            <MemberRow item={item} lc={lc} hasKids={hasKids} onDrillIn={drillInto} />
                            {idx < group.members.length - 1 && <Divider />}
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              )}
              <View style={{ height: 8 }} />
            </ScrollView>
          )}

          <TouchableOpacity style={dlMd.closeBtn} onPress={handleClose}>
            <Text style={dlMd.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dlMd = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.lg, width: '100%', maxHeight: '88%', elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: colors.primary, fontWeight: '700', lineHeight: 28 },
  breadcrumb: { ...typography.bodySmall, color: colors.primaryLight },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { ...typography.titleLarge, color: colors.primary },
  headerName: { ...typography.headlineSmall, color: colors.onSurface },
  headerSub: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  xBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  xBtnText: { fontSize: 13, color: colors.onSurfaceMuted },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.outline, paddingHorizontal: spacing.md, height: 44, marginBottom: 12 },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, ...typography.bodyMedium, color: colors.onSurface },
  clearBtn: { fontSize: 13, color: colors.onSurfaceMuted, padding: 4 },
  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center' },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: colors.divider },
  sectionTitle: { ...typography.titleSmall, color: colors.primary, padding: spacing.md },
  levelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderLeftWidth: 4 },
  levelBadge: { borderRadius: radius.full, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 3 },
  levelBadgeText: { ...typography.labelLarge },
  levelCount: { ...typography.titleSmall },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  memberAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  memberAvatarText: { fontSize: 19, fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { ...typography.titleSmall, color: colors.onSurface },
  memberPhone: { ...typography.titleSmall, color: colors.primary, marginTop: 2 },
  memberMeta: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 1 },
  memberRight: { alignItems: 'flex-end', gap: 4 },
  callBtn: { backgroundColor: colors.successContainer, borderRadius: radius.full, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  drillBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  drillBtnText: { fontSize: 20, color: colors.primary, fontWeight: '700', lineHeight: 24 },
  closeBtn: { height: 48, borderRadius: radius.lg, marginTop: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.outline },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});



export default function TeamScreen({ navigation }) {
  // ── viewStack: each item = { root, members }
  // root = null means "self" (distributor), members = direct downline
  const [viewStack, setViewStack] = useState([
    { root: null, members: teamMembers }
  ]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const currentView = viewStack[viewStack.length - 1];
  const currentRoot = currentView.root; // null = self
  const currentMembers = currentView.members;

  const totalMembers = allFlat.length;
  const activeMembers = allFlat.filter(m => m.isActive).length;
  const totalBusiness = allFlat.reduce((a, m) => a + m.totalBusiness, 0);

  const canGoBack = viewStack.length > 1;

  // Flatten current view's members by level
  const currentFlat = flattenSubtree(currentMembers, 1);
  const maxLevel = currentFlat.length > 0 ? Math.max(...currentFlat.map(m => m.relativeLevel)) : 0;
  const currentLevelGroups = [];
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const ms = currentFlat.filter(m => m.relativeLevel === lvl);
    if (ms.length > 0) currentLevelGroups.push({
      level: lvl,
      label: REL_LEVEL_LABELS[lvl] || `L${lvl}`,
      color: REL_LEVEL_COLORS[lvl] || colors.primary,
      members: ms,
    });
  }

  // Search across ALL members always
  const searchResults = globalSearch.trim().length > 1
    ? allFlat.filter(m =>
        m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        m.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        m.mobile.includes(globalSearch))
    : [];

  // Click on a member in the table → they become the new root
  const drillInto = (member) => {
    const fullNode = findMemberNode(teamMembers, member.id);
    const children = fullNode?.children || [];
    setViewStack(prev => [...prev, { root: member, members: children }]);
    setGlobalSearch('');
  };

  const goBack = () => {
    setViewStack(prev => prev.slice(0, -1));
  };

  const handleMemberPress = (member) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  // Breadcrumb path
  const breadcrumb = viewStack
    .filter(v => v.root !== null)
    .map(v => v.root.name.split(' ')[0])
    .join(' › ');

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="Downline"
        subtitle={`${totalMembers} total members`}
        rightIcon="➕"
        onRightPress={() => navigation.navigate('AddMember')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled">

        {/* Back bar — shown when drilled in */}
        {canGoBack && (
          <TouchableOpacity style={s.backBar} onPress={goBack}>
            <Text style={s.backBarArrow}>‹</Text>
            <Text style={s.backBarText}>
              {breadcrumb || 'Back'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Upline / Current Root Card */}
        <View style={[s.uplineCard, canGoBack && s.uplineCardActive]}>
          {canGoBack ? (
            // Drilled in — show current root member as "A"
            <>
              <View style={s.uplineLabelRow}>
                <Text style={s.uplineLabel}>Viewing as Root (A)</Text>
                <View style={s.rootBadge}><Text style={s.rootBadgeText}>A</Text></View>
              </View>
              <View style={s.uplineRow}>
                <View style={[s.uplineAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={s.uplineAvatarText}>{currentRoot.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.uplineName}>{currentRoot.name}</Text>
                  <Text style={s.uplineId}>{currentRoot.id} · {currentRoot.mobile}</Text>
                </View>
                <TouchableOpacity style={s.callBtn} onPress={() => makeCall(currentRoot.mobile)}>
                  <Text style={s.callBtnText}>📞</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.downlineCount}>
                Direct downline: {currentMembers.length} member{currentMembers.length !== 1 ? 's' : ''}
              </Text>
            </>
          ) : (
            // Root view — show your own upline (Anil)
            <>
              <Text style={s.uplineLabel}>Your Upline / Sponsor</Text>
              <View style={s.uplineRow}>
                <View style={[s.uplineAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={s.uplineAvatarText}>{distributor.uplineName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={s.uplineName}>{distributor.uplineName}</Text>
                  <Text style={s.uplineId}>{distributor.uplineId}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>{totalMembers}</Text>
            <Text style={s.summaryLabel}>Total</Text>
          </View>
          <View style={s.summaryDiv} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryVal, { color: colors.success }]}>{activeMembers}</Text>
            <Text style={s.summaryLabel}>Active</Text>
          </View>
          <View style={s.summaryDiv} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryVal, { color: colors.pending }]}>{totalMembers - activeMembers}</Text>
            <Text style={s.summaryLabel}>Inactive</Text>
          </View>
          <View style={s.summaryDiv} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryVal, { fontSize: 14, color: colors.primary }]}>
              ₹{(totalBusiness / 1000).toFixed(0)}K
            </Text>
            <Text style={s.summaryLabel}>Business</Text>
          </View>
        </View>

        {/* Global Search */}
        <View style={[s.searchBox, searchFocused && s.searchBoxFocused]}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search any member by name, ID or mobile..."
            placeholderTextColor={colors.onSurfaceMuted}
            value={globalSearch}
            onChangeText={setGlobalSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {globalSearch.length > 0 && (
            <TouchableOpacity onPress={() => setGlobalSearch('')}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {globalSearch.trim().length > 1 ? (
          <View style={s.searchResultsCard}>
            <Text style={s.searchResultsTitle}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            {searchResults.length === 0 ? (
              <Text style={s.noResultText}>No members match your search</Text>
            ) : searchResults.map((item, idx) => {
              const lc = LEVEL_COLORS[item.level] || colors.primary;
              const hasKids = (findMemberNode(teamMembers, item.id)?.children?.length || 0) > 0;
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={s.searchResultRow}
                    onPress={() => { setGlobalSearch(''); drillInto(item); }}
                    activeOpacity={0.7}>
                    <View style={[s.srAvatar, { backgroundColor: lc + '18' }]}>
                      <Text style={[s.srAvatarText, { color: lc }]}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={s.srInfo}>
                      <Text style={s.srName}>{item.name}</Text>
                      <Text style={s.srPhone}>{item.mobile}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <Text style={s.srMeta}>{item.id}</Text>
                        <LevelBadge level={item.mlmLevel || LEVEL_LABELS[item.level]} size="sm" />
                      </View>
                    </View>
                    <View style={s.srRight}>
                      <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
                      <TouchableOpacity style={s.srCallBtn} onPress={() => makeCall(item.mobile)}>
                        <Text style={s.srCallIcon}>📞</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  {idx < searchResults.length - 1 && <Divider />}
                </View>
              );
            })}
          </View>
        ) : (
          /* Level Table */
          <View style={s.tableCard}>
            <View style={s.tableHeader}>
              <Text style={[s.th, { width: 56 }]}>Level</Text>
              <Text style={[s.th, { width: 52 }]}>Count</Text>
              <Text style={[s.th, { flex: 1 }]}>Members (tap to drill in)</Text>
            </View>

            {currentLevelGroups.length === 0 ? (
              <View style={s.emptyTable}>
                <Text style={s.emptyTableIcon}>👤</Text>
                <Text style={s.emptyTableText}>No downline members</Text>
              </View>
            ) : currentLevelGroups.map((group, idx) => (
              <View key={group.label} style={[s.tableRow, idx % 2 !== 0 && s.tableRowAlt]}>
                {/* Level badge */}
                <View style={{ width: 56 }}>
                  <View style={[s.levelBadge, { backgroundColor: group.color + '20', borderColor: group.color }]}>
                    <Text style={[s.levelBadgeText, { color: group.color }]}>{group.label}</Text>
                  </View>
                </View>
                {/* Count */}
                <View style={{ width: 52, alignItems: 'center' }}>
                  <Text style={[s.countText, { color: group.color }]}>{group.members.length}</Text>
                </View>
                {/* Members — horizontal chips, each tappable */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.memberChips}>
                  {group.members.map(m => {
                    const hasKids = (findMemberNode(teamMembers, m.id)?.children?.length || 0) > 0;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[s.nameChip, { backgroundColor: group.color + '15' }, hasKids && s.nameChipClickable]}
                        onPress={() => drillInto(m)}
                        activeOpacity={0.75}>
                        <Text style={[s.nameChipText, { color: group.color }]} numberOfLines={1}>
                          {m.name.split(' ')[0]}
                        </Text>
                        {hasKids && <Text style={[s.nameChipArrow, { color: group.color }]}>›</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <MemberDetailModal
        visible={showDetail}
        member={selectedMember}
        onClose={() => setShowDetail(false)}
        onViewDownline={() => { setShowDetail(false); drillInto(selectedMember); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },

  backBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: 8, marginBottom: 10, gap: 6,
  },
  backBarArrow: { fontSize: 22, color: colors.primary, fontWeight: '700', lineHeight: 26 },
  backBarText: { ...typography.titleSmall, color: colors.primary, flex: 1 },

  uplineCard: {
    backgroundColor: colors.primaryContainer, borderRadius: radius.lg,
    padding: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 12,
  },
  uplineCardActive: { backgroundColor: colors.primary + '22', borderLeftColor: colors.primaryDark },
  uplineLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  rootBadge: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  rootBadgeText: { ...typography.titleSmall, color: colors.white },
  uplineLabel: { ...typography.labelMedium, color: colors.primaryDark, marginBottom: 8 },
  uplineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  uplineAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  uplineAvatarText: { ...typography.titleLarge, color: colors.white },
  uplineName: { ...typography.titleSmall, color: colors.onPrimaryContainer },
  uplineId: { ...typography.bodySmall, color: colors.primaryDark, marginTop: 2 },
  downlineCount: { ...typography.bodySmall, color: colors.primaryDark, marginTop: 8 },
  callBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  callBtnText: { fontSize: 18 },

  summaryRow: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', padding: spacing.md, marginBottom: 12, ...elevation.level1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { ...typography.headlineSmall, color: colors.primary },
  summaryLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 2 },
  summaryDiv: { width: 1, backgroundColor: colors.divider },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.outline,
    paddingHorizontal: spacing.md, height: 48, marginBottom: 12,
  },
  searchBoxFocused: { borderColor: colors.primary },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, ...typography.bodyLarge, color: colors.onSurface },
  clearBtn: { fontSize: 13, color: colors.onSurfaceMuted, padding: 4 },

  searchResultsCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: 12, ...elevation.level1,
  },
  searchResultsTitle: { ...typography.titleSmall, color: colors.primary, marginBottom: 10 },
  noResultText: { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center', paddingVertical: 16 },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  srAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  srAvatarText: { fontSize: 20, fontWeight: '700' },
  srInfo: { flex: 1 },
  srName: { ...typography.titleSmall, color: colors.onSurface },
  srPhone: { ...typography.titleSmall, color: colors.primary, marginTop: 2 },
  srMeta: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 1 },
  srRight: { alignItems: 'flex-end', gap: 6 },
  srCallBtn: { backgroundColor: colors.successContainer, borderRadius: radius.full, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  srCallIcon: { fontSize: 16 },

  tableCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    overflow: 'hidden', marginBottom: 12, ...elevation.level1,
  },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  th: { ...typography.labelSmall, color: colors.primaryDark, fontWeight: '700' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.divider, minHeight: 56,
  },
  tableRowAlt: { backgroundColor: colors.background },
  levelBadge: { borderRadius: radius.full, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  levelBadgeText: { ...typography.titleSmall, fontWeight: '800' },
  countText: { ...typography.headlineSmall, fontWeight: '800' },
  memberChips: { flex: 1, paddingHorizontal: 4 },
  nameChip: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
    marginRight: 6, maxWidth: 110,
  },
  nameChipClickable: { borderWidth: 1, borderColor: 'transparent' },
  nameChipText: { ...typography.labelMedium, fontSize: 11 },
  nameChipArrow: { fontSize: 14, fontWeight: '700', marginLeft: 2 },
  emptyTable: { alignItems: 'center', paddingVertical: 28 },
  emptyTableIcon: { fontSize: 32, marginBottom: 6 },
  emptyTableText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});
