import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, Divider, LevelBadge, InfoRow, FormField } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { logout as logoutAction, updateProfile as updateProfileAction } from '../../redux/slice/userSlice';
import { clearCachedToken } from '../../api/apiConfig';
import { logout as logoutApi } from '../../api/auth';
import { updateUserProfile } from '../../api/users';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [editMode, setEditMode] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [form, setForm] = useState({
    name:    user?.name || user?.fullName || '',
    mobile:  user?.mobile || user?.phone || '',
    email:   user?.email || '',
    address: user?.address || '',
    city:    user?.city || '',
    state:   user?.state || '',
    pincode: user?.pincode || '',
  });

  const [saveLoading, setSaveLoading] = useState(false);

  const handleSave = async () => {
    const id = user?._id || user?.userId;
    if (!id) { Alert.alert('Error', 'User ID not found'); return; }
    setSaveLoading(true);
    try {
      const res = await updateUserProfile(id, {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });
      if (res.success) {
        dispatch(updateProfileAction(form));
        // Update AsyncStorage too
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored);
          await AsyncStorage.setItem('userData', JSON.stringify({ ...parsed, ...form }));
        }
        setEditMode(false);
        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', res.message || 'Update failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setSaveLoading(false);
    }
  };

  const performLogout = async () => {
    try {
      setLogoutLoading(true);
      // Optional API call to invalidate server session
      await logoutApi();
    } catch (_) {
      // Ignore API error — local logout must still happen
    } finally {
      // Clear everything
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      clearCachedToken();
      dispatch(logoutAction()); // RootNavigation auto-switches to UnauthNavigation
      setLogoutLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  // Display values — fallback gracefully if user data missing
  const displayName    = user?.name || user?.fullName || user?.userId || 'User';
  const displayId      = user?.userId || user?.distributorId || '-';
  const displayMobile  = user?.mobile || user?.phone || '-';
  const displayEmail   = user?.email || '-';
  const displayAddress = user?.address || '-';
  const displayCity    = user?.city || '-';
  const displayState   = user?.state || '-';
  const displayPincode = user?.pincode || '-';

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="My Profile"
        subtitle={displayId}
        rightIconName={editMode ? null : Icons.edit}
        onRightPress={() => setEditMode(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar Card */}
        <View style={s.avatarCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={s.avatarInfo}>
            <Text style={s.avatarName}>{displayName}</Text>
            <Text style={s.avatarId}>{displayId}</Text>
            <View style={s.rankRow}>
              <View style={s.rankChip}>
                <Icon name={Icons.trophy} size={12} color={colors.white} />
                <Text style={s.rankChipText}> {user?.role || 'Distributor'}</Text>
              </View>
              {user?.level && <LevelBadge level={user.level} size="sm" />}
            </View>
          </View>
        </View>

        {/* Distributor Details */}
        {!editMode ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Distributor Information</Text>
            <Divider style={{ marginBottom: 4 }} />
            <InfoRow icon={Icons.idCard}   label="Distributor ID"    value={displayId} />
            <Divider />
            <InfoRow icon={Icons.joinDate} label="Join Date"         value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '-'} />
            <Divider />
            {user?.uplineName && <>
              <InfoRow icon={Icons.upline} label="Upline / Sponsor" value={`${user.uplineName}${user.uplineId ? ` (${user.uplineId})` : ''}`} />
              <Divider />
            </>}
            {user?.level && <>
              <InfoRow icon={Icons.level} label="MLM Level" value={user.level === 'A+' ? 'A+ (Admin-assigned)' : `Level ${user.level}`} />
              <Divider />
            </>}

            <Text style={[s.cardTitle, { marginTop: 20 }]}>Contact Information</Text>
            <Divider style={{ marginBottom: 4 }} />
            <InfoRow icon={Icons.mobile} label="Mobile" value={displayMobile} />
            <Divider />
            <InfoRow icon={Icons.email}  label="Email"  value={displayEmail} />

            <Text style={[s.cardTitle, { marginTop: 20 }]}>Address</Text>
            <Divider style={{ marginBottom: 4 }} />
            <InfoRow icon={Icons.address} label="Address" value={displayAddress} />
            <Divider />
            <InfoRow icon={Icons.city}    label="City"    value={displayCity} />
            <Divider />
            <InfoRow icon={Icons.state}   label="State"   value={displayState} />
            <Divider />
            <InfoRow icon={Icons.pincode} label="Pincode" value={displayPincode} />
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.cardTitle}>Edit Profile</Text>
            <Divider style={{ marginVertical: 12 }} />
            <FormField label="Full Name"      value={form.name}    onChangeText={v => setForm({ ...form, name: v })} />
            <FormField label="Mobile Number"  value={form.mobile}  onChangeText={v => setForm({ ...form, mobile: v })}  keyboardType="phone-pad" />
            <FormField label="Email Address"  value={form.email}   onChangeText={v => setForm({ ...form, email: v })}   keyboardType="email-address" />
            <FormField label="Address"        value={form.address} onChangeText={v => setForm({ ...form, address: v })} />
            <FormField label="City"           value={form.city}    onChangeText={v => setForm({ ...form, city: v })} />
            <FormField label="State"          value={form.state}   onChangeText={v => setForm({ ...form, state: v })} />
            <FormField label="Pincode"        value={form.pincode} onChangeText={v => setForm({ ...form, pincode: v })} keyboardType="numeric" />

            <View style={s.editBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setEditMode(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton label={saveLoading ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={saveLoading} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {/* Quick Links */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Settings</Text>
          <Divider style={{ marginBottom: 4 }} />
          {[
            { icon: Icons.edit,     label: 'Change Password', screen: 'ChangePassword' },
            { icon: 'file-sign',    label: 'Agreement',       screen: 'Agreement'      },
            { icon: 'file-document-outline', label: 'Refund Policy', screen: 'RefundPolicy' },
          ].map(({ icon, label, screen }) => (
            <React.Fragment key={label}>
              <TouchableOpacity
                style={s.settingRow}
                onPress={() => navigation.navigate(screen)}
                activeOpacity={0.75}>
                <Icon name={icon} size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <Text style={s.settingLabel}>{label}</Text>
                <Icon name="chevron-right" size={20} color={colors.onSurfaceMuted} />
              </TouchableOpacity>
              <Divider />
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} disabled={logoutLoading}>
          {logoutLoading ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Icon name={Icons.logout} size={18} color={colors.error} />
              <Text style={s.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.lg },

  avatarCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...elevation.level2,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 16,
  },
  avatarLetter: { fontSize: 30, fontWeight: '800', color: colors.white },
  avatarInfo:   { flex: 1 },
  avatarName:   { ...typography.headlineSmall, color: colors.white },
  avatarId:     { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 7,
    flexWrap: 'wrap',
  },
  rankChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 7,
  },
  rankChipText: { ...typography.labelSmall, color: colors.white },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: 12,
    ...elevation.level1,
  },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface },

  editBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, height: 52, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.outline,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },

  settingRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  settingLabel:  { ...typography.bodyMedium, color: colors.onSurface, flex: 1 },

  logoutBtn: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.lg,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    ...elevation.level1,
  },
  logoutText: { ...typography.titleSmall, color: colors.error },
});
