import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, StatusBar, Alert, ActivityIndicator,
  Modal, FlatList, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, StatusChip, Divider, LevelBadge } from '../../components';
import Icon from '../../components/Icon';
import { distributorAssignableLevels } from '../../data/mockData';
import { createUser, getUsersCreatedBy, getUserById, convertToDistributor } from '../../api/users';

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—';

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrapper}>
      <Text style={f.label}>{label}{required ? <Text style={{ color: colors.error }}> *</Text> : ''}</Text>
      <TextInput
        style={[f.input, focused && f.focused, multiline && f.multi]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={colors.onSurfaceMuted}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}
const f = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label:   { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 5 },
  input:   { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, ...typography.bodyLarge, color: colors.onSurface, backgroundColor: colors.background },
  focused: { borderColor: colors.primary, backgroundColor: colors.surface },
  multi:   { height: 72, paddingTop: 12 },
});

// ─── View User Detail Modal ───────────────────────────────────────────────────
function UserDetailModal({ visible, userId, onClose, onConvert }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!visible || !userId) return;
    setDetail(null);
    setLoading(true);
    getUserById(userId)
      .then(r => { if (r.success) setDetail(r.data?.user || r.data); })
      .finally(() => setLoading(false));
  }, [visible, userId]);

  const handleConvert = () => {
    Alert.alert('Convert to Distributor', `${detail?.name} ko Customer se Distributor mein convert karein?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Convert', style: 'destructive',
        onPress: async () => {
          setConverting(true);
          const res = await convertToDistributor(userId);
          setConverting(false);
          if (res.success) {
            Alert.alert('Success ✅', `${detail?.name} ab Distributor hai!`);
            onClose();
            onConvert();
          } else {
            Alert.alert('Error', res.message || 'Failed to convert');
          }
        },
      },
    ]);
  };

  const d = detail;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={udm.overlay}>
        <View style={udm.sheet}>
          <View style={udm.handle} />
          <View style={udm.headerRow}>
            <View style={udm.avatar}>
              <Text style={udm.avatarTxt}>{(d?.name || 'U').charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={udm.name}>{d?.name || '—'}</Text>
              <Text style={udm.userId}>{d?.userId || '—'}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <StatusChip status={d?.isActive ? 'Active' : 'Inactive'} />
                {d?.level && <LevelBadge level={d.level} size="sm" />}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={udm.closeBtn}>
              <Text style={{ color: colors.onSurfaceMuted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color={colors.primary} />
          ) : d ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {[
                ['Role',        d.role || d.userType || '—'],
                ['Phone',       d.phone || d.mobile || '—'],
                ['Email',       d.email || '—'],
                ['Joined',      fmtDate(d.createdAt)],
                ['City',        d.city || '—'],
                ['State',       d.state || '—'],
                ['Pincode',     d.pincode || '—'],
                ['Address',     d.address || '—'],
                ['Referral Code', d.referralCode || '—'],
              ].map(([lbl, val]) => (
                <View key={lbl} style={udm.infoRow}>
                  <Text style={udm.infoLabel}>{lbl}</Text>
                  <Text style={udm.infoVal} numberOfLines={2}>{val}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ textAlign: 'center', color: colors.onSurfaceMuted, padding: 24 }}>User data not found</Text>
          )}

          {d?.role === 'Customer' && (
            <TouchableOpacity
              style={[udm.convertBtn, converting && { opacity: 0.6 }]}
              onPress={handleConvert}
              disabled={converting}>
              {converting
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={udm.convertTxt}>🤝  Convert to Distributor</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
const udm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, paddingBottom: 32 },
  handle:     { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  headerRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  avatar:     { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { fontSize: 24, fontWeight: '800', color: colors.white },
  name:       { ...typography.titleLarge, color: colors.onSurface },
  userId:     { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  closeBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  infoLabel:  { ...typography.labelLarge, color: colors.onSurfaceMuted, flex: 1 },
  infoVal:    { ...typography.bodyMedium, color: colors.onSurface, flex: 2, textAlign: 'right' },
  convertBtn: { backgroundColor: colors.success, borderRadius: radius.lg, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  convertTxt: { ...typography.titleSmall, color: colors.white, fontWeight: '700' },
});

// ─── Add User Form Modal ──────────────────────────────────────────────────────
function AddUserModal({ visible, onClose, onSuccess, sponsorId }) {
  const [userType,      setUserType]      = useState('Customer');
  const [selectedLevel, setSelectedLevel] = useState('B');
  const [submitting,    setSubmitting]    = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '' });

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const reset = () => {
    setUserType('Customer'); setSelectedLevel('B'); setSubmitting(false);
    setForm({ name: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '' });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      Alert.alert('Required', 'Name aur Mobile number required hai.'); return;
    }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(), phone: form.mobile.trim(),
      email: form.email.trim() || undefined, role: userType,
      address: form.address.trim() || undefined, city: form.city.trim() || undefined,
      state: form.state.trim() || undefined, pincode: form.pincode.trim() || undefined,
      sponsorId,
      ...(userType === 'Distributor' && { level: selectedLevel }),
    };
    const res = await createUser(payload);
    setSubmitting(false);
    if (res.success) {
      const lvlInfo = userType === 'Distributor' ? ` (Level ${selectedLevel})` : '';
      Alert.alert('Added ✅', `${userType} "${form.name}"${lvlInfo} successfully added!`);
      reset(); onClose(); onSuccess();
    } else {
      Alert.alert('Error', res.message || 'Failed to add user');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { reset(); onClose(); }}>
      <View style={aum.overlay}>
        <View style={aum.sheet}>
          <View style={aum.handle} />
          <View style={aum.titleRow}>
            <Text style={aum.title}>Add New Member</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={aum.closeBtn}>
              <Text style={{ fontSize: 16, color: colors.onSurfaceMuted }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* User Type */}
            <Text style={aum.sectionLabel}>User Type</Text>
            <View style={aum.toggleRow}>
              {['Customer', 'Distributor'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[aum.toggleBtn, userType === t && aum.toggleBtnActive]}
                  onPress={() => { setUserType(t); if (t === 'Distributor') setSelectedLevel('B'); }}>
                  <Text style={[aum.toggleTxt, userType === t && aum.toggleTxtActive]}>
                    {t === 'Customer' ? '👤' : '🤝'}  {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field label="Full Name" value={form.name}   onChangeText={set('name')}   placeholder="Enter full name" required />
            <Field label="Mobile"    value={form.mobile} onChangeText={set('mobile')} placeholder="10-digit mobile" keyboardType="phone-pad" required />
            <Field label="Email"     value={form.email}  onChangeText={set('email')}  placeholder="email@example.com" keyboardType="email-address" />

            {userType === 'Distributor' && (
              <>
                <Text style={[aum.sectionLabel, { marginTop: 4 }]}>MLM Level</Text>
                <View style={aum.levelGrid}>
                  {distributorAssignableLevels.map(lvl => {
                    const isSelected = selectedLevel === lvl.key;
                    return (
                      <TouchableOpacity
                        key={lvl.key}
                        style={[aum.levelBtn, { borderColor: lvl.borderColor }, isSelected && { backgroundColor: lvl.bgColor, borderColor: lvl.color, borderWidth: 2 }]}
                        onPress={() => setSelectedLevel(lvl.key)}>
                        <Text style={[aum.levelBtnLabel, { color: isSelected ? lvl.color : colors.onSurfaceMuted }]}>{lvl.label}</Text>
                        {isSelected && <Text style={[{ position: 'absolute', top: 2, right: 4, fontSize: 10, color: lvl.color }]}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Field label="City"    value={form.city}    onChangeText={set('city')}    placeholder="City" />
            <Field label="State"   value={form.state}   onChangeText={set('state')}   placeholder="State" />
            <Field label="Pincode" value={form.pincode} onChangeText={set('pincode')} placeholder="6-digit pincode" keyboardType="numeric" />
            <Field label="Address" value={form.address} onChangeText={set('address')} placeholder="Full address" multiline />

            <PrimaryButton
              label={submitting ? 'Adding...' : `Add ${userType}`}
              onPress={handleSubmit}
              disabled={submitting}
              style={{ marginTop: 8, marginBottom: 16 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const aum = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, maxHeight: '92%' },
  handle:    { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  titleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:     { ...typography.headlineSmall, color: colors.onSurface },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.md },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', backgroundColor: colors.background },
  toggleBtnActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  toggleTxt: { ...typography.labelLarge, color: colors.onSurfaceMuted },
  toggleTxtActive: { color: colors.primary, fontWeight: '700' },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  levelBtn:  { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1.5, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  levelBtnLabel: { ...typography.titleMedium, fontWeight: '800' },
});

// ─── User Row in list ─────────────────────────────────────────────────────────
function UserRow({ item, onView }) {
  return (
    <TouchableOpacity style={ur.row} onPress={() => onView(item._id || item.id)} activeOpacity={0.75}>
      <View style={[ur.avatar, { backgroundColor: item.role === 'Distributor' ? colors.primaryContainer : colors.successContainer }]}>
        <Text style={[ur.avatarTxt, { color: item.role === 'Distributor' ? colors.primary : colors.success }]}>
          {(item.name || 'U').charAt(0)}
        </Text>
      </View>
      <View style={ur.info}>
        <Text style={ur.name} numberOfLines={1}>{item.name || '—'}</Text>
        <Text style={ur.sub}>{item.userId || '—'}  ·  {item.phone || item.mobile || '—'}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
          <View style={[ur.typeBadge, { backgroundColor: item.role === 'Distributor' ? '#EDE9FE' : '#DBEAFE' }]}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: item.role === 'Distributor' ? '#7C3AED' : '#1A73E8' }}>
              {item.role === 'Distributor' ? '🤝 Dist' : '👤 Cust'}
            </Text>
          </View>
          <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
          {item.level && <LevelBadge level={item.level} size="sm" />}
        </View>
      </View>
      <Text style={ur.date}>{fmtDate(item.createdAt)}</Text>
      <Icon name="chevron-right" size={20} color={colors.onSurfaceMuted} />
    </TouchableOpacity>
  );
}
const ur = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar:    { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarTxt: { fontSize: 20, fontWeight: '800' },
  info:      { flex: 1 },
  name:      { ...typography.titleSmall, color: colors.onSurface },
  sub:       { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  typeBadge: { borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  date:      { ...typography.bodySmall, color: colors.onSurfaceMuted, marginRight: 4, fontSize: 10 },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AddMemberScreen({ navigation }) {
  const { user } = useSelector(state => state.user);
  const sponsorId = user?._id || user?.userId;

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('All');   // All | Customer | Distributor
  const [filterStatus,setFilterStatus]= useState('All');   // All | Active | Inactive

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [viewUserId,    setViewUserId]    = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const searchTimer = useRef(null);

  const fetchUsers = useCallback(async () => {
    if (!sponsorId) return;
    let params = '';
    if (filterType !== 'All')   params += `&userType=${filterType}`;
    if (filterStatus !== 'All') params += `&isActive=${filterStatus === 'Active' ? 'true' : 'false'}`;
    if (search.trim())          params += `&search=${encodeURIComponent(search.trim())}`;
    const res = await getUsersCreatedBy(sponsorId, params);
    if (res.success) {
      const list = res.data?.users || res.data || [];
      setUsers(list);
    }
    setLoading(false);
    setRefreshing(false);
  }, [sponsorId, filterType, filterStatus, search]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [fetchUsers]);

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const filtered = users; // server-side filtering already done

  const typeFilters   = ['All', 'Customer', 'Distributor'];
  const statusFilters = ['All', 'Active', 'Inactive'];

  const totalCustomers     = users.filter(u => u.role === 'Customer').length;
  const totalDistributors  = users.filter(u => u.role === 'Distributor').length;

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="My Members"
        subtitle={`${users.length} members`}
        rightIconName="account-plus"
        onRightPress={() => setShowAddModal(true)}
      />

      <View style={s.body}>
        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: users.length,      label: 'Total',        color: colors.primary   },
            { val: totalCustomers,    label: 'Customers',    color: colors.success   },
            { val: totalDistributors, label: 'Distributors', color: '#7C3AED'        },
            { val: users.filter(u => u.isActive).length, label: 'Active', color: colors.success },
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

        {/* Search */}
        <View style={s.searchRow}>
          <Icon name="magnify" size={18} color={colors.onSurfaceMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, ID, phone..."
            placeholderTextColor={colors.onSurfaceMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ paddingHorizontal: 10 }}>
              <Text style={{ color: colors.onSurfaceMuted, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {typeFilters.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.filterChip, filterType === t && s.filterChipActive]}
              onPress={() => setFilterType(t)}>
              <Text style={[s.filterTxt, filterType === t && s.filterTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
          <View style={s.filterDivider} />
          {statusFilters.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.filterChip, filterStatus === t && s.filterChipActive]}
              onPress={() => setFilterStatus(t)}>
              <Text style={[s.filterTxt, filterStatus === t && s.filterTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} size="large" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, i) => item._id || item.id || String(i)}
            renderItem={({ item }) => (
              <UserRow
                item={item}
                onView={(id) => { setViewUserId(id); setShowDetailModal(true); }}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>👥</Text>
                <Text style={s.emptyTxt}>No members found</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)}>
                  <Text style={s.addBtnTxt}>+ Add First Member</Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
        )}
      </View>

      {/* Add User Modal */}
      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchUsers}
        sponsorId={sponsorId}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        visible={showDetailModal}
        userId={viewUserId}
        onClose={() => setShowDetailModal(false)}
        onConvert={fetchUsers}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body:      { flex: 1, paddingTop: spacing.md, paddingHorizontal: spacing.md },

  statsRow:  { backgroundColor: colors.surface, borderRadius: radius.lg, flexDirection: 'row', padding: spacing.md, marginBottom: 10, ...elevation.level1 },
  statItem:  { flex: 1, alignItems: 'center' },
  statVal:   { ...typography.titleMedium, fontWeight: '800' },
  statLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 1 },
  statDiv:   { width: 1, backgroundColor: colors.divider },

  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outline, marginBottom: 8, ...elevation.level1 },
  searchInput:{ flex: 1, height: 44, paddingHorizontal: 8, ...typography.bodyMedium, color: colors.onSurface },

  filterScroll: { maxHeight: 48, marginBottom: 8 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surface, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  filterTxt:    { ...typography.labelMedium, color: colors.onSurfaceMuted },
  filterTxtActive: { color: colors.primary, fontWeight: '700' },
  filterDivider:{ width: 1, backgroundColor: colors.divider, marginRight: 8, height: 28, alignSelf: 'center' },

  empty:    { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:{ fontSize: 44, marginBottom: 8 },
  emptyTxt: { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginBottom: 16 },
  addBtn:   { backgroundColor: colors.primaryContainer, borderRadius: radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  addBtnTxt:{ ...typography.titleSmall, color: colors.primary },
});
