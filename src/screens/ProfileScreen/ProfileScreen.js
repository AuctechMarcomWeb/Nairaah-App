import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, Divider, LevelBadge, InfoRow, FormField } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { distributor } from '../../data/mockData';

export default function ProfileScreen({ navigation }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name:    distributor.name,
    mobile:  distributor.mobile,
    email:   distributor.email,
    address: distributor.address,
    city:    distributor.city,
    state:   distributor.state,
    pincode: distributor.pincode,
  });

  const handleSave = () => {
    setEditMode(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="My Profile"
        subtitle={distributor.id}
        rightIconName={editMode ? null : Icons.edit}
        onRightPress={() => setEditMode(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar Card */}
        <View style={s.avatarCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarLetter}>{distributor.name.charAt(0)}</Text>
          </View>
          <View style={s.avatarInfo}>
            <Text style={s.avatarName}>{distributor.name}</Text>
            <Text style={s.avatarId}>{distributor.id}</Text>
            <View style={s.rankRow}>
              <View style={s.rankChip}>
                <Icon name={Icons.trophy} size={12} color={colors.white} />
                <Text style={s.rankChipText}> {distributor.rank} Distributor</Text>
              </View>
              <LevelBadge level={distributor.level} size="sm" />
            </View>
          </View>
        </View>

        {/* Distributor Details */}
        {!editMode ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Distributor Information</Text>
            <Divider style={{ marginBottom: 4 }} />
            <InfoRow icon={Icons.idCard}   label="Distributor ID"    value={distributor.id} />
            <Divider />
            <InfoRow icon={Icons.joinDate} label="Join Date"         value={distributor.joinDate} />
            <Divider />
            <InfoRow icon={Icons.upline}   label="Upline / Sponsor"  value={`${distributor.uplineName} (${distributor.uplineId})`} />
            <Divider />
            <InfoRow icon={Icons.level}    label="MLM Level"         value={distributor.level === 'A+' ? 'A+ (Admin-assigned)' : `Level ${distributor.level}`} />

            <Text style={[s.cardTitle, { marginTop: 20 }]}>Contact Information</Text>
            <Divider style={{ marginBottom: 4 }} />
            <InfoRow icon={Icons.mobile} label="Mobile" value={distributor.mobile} />
            <Divider />
            <InfoRow icon={Icons.email}  label="Email"  value={distributor.email} />

            <Text style={[s.cardTitle, { marginTop: 20 }]}>Address</Text>
            <Divider style={{ marginBottom: 4 }} />
            <InfoRow icon={Icons.address} label="Address" value={distributor.address} />
            <Divider />
            <InfoRow icon={Icons.city}    label="City"    value={distributor.city} />
            <Divider />
            <InfoRow icon={Icons.state}   label="State"   value={distributor.state} />
            <Divider />
            <InfoRow icon={Icons.pincode} label="Pincode" value={distributor.pincode} />
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
              <PrimaryButton label="Save Changes" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Icon name={Icons.logout} size={18} color={colors.error} />
          <Text style={s.logoutText}>Logout</Text>
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
