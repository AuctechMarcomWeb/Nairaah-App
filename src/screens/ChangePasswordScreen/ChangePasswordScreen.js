import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Alert,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton } from '../../components';
import { updatePassword } from '../../api/users';

function Field({ label, value, onChangeText, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View style={f.wrapper}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.inputRow, focused && f.focused]}>
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceMuted}
          secureTextEntry={!show}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity onPress={() => setShow(p => !p)} style={f.eyeBtn}>
          <Text style={f.eyeIcon}>{show ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const f = StyleSheet.create({
  wrapper:  { marginBottom: spacing.lg },
  label:    { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, backgroundColor: colors.background },
  focused:  { borderColor: colors.primary, backgroundColor: colors.surface },
  input:    { flex: 1, height: 50, paddingHorizontal: spacing.md, ...typography.bodyLarge, color: colors.onSurface },
  eyeBtn:   { padding: spacing.md },
  eyeIcon:  { fontSize: 16 },
});

export default function ChangePasswordScreen({ navigation }) {
  const [oldPwd,   setOldPwd]   = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [confPwd,  setConfPwd]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!oldPwd.trim() || !newPwd.trim() || !confPwd.trim()) {
      Alert.alert('Required', 'Saare fields fill karo.'); return;
    }
    if (newPwd.length < 6) {
      Alert.alert('Invalid', 'New password kam se kam 6 characters ka hona chahiye.'); return;
    }
    if (newPwd !== confPwd) {
      Alert.alert('Mismatch', 'New password aur Confirm password match nahi kar rahe.'); return;
    }
    setLoading(true);
    const res = await updatePassword(oldPwd, newPwd);
    setLoading(false);
    if (res.success) {
      Alert.alert('Success ✅', 'Password successfully change ho gaya!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', res.message || 'Password change failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
        <AppHeader title="Change Password" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.card}>
            <View style={s.iconRow}>
              <Text style={s.icon}>🔒</Text>
            </View>
            <Text style={s.subtitle}>Apna secure password set karo</Text>

            <Field label="Current Password"  value={oldPwd}  onChangeText={setOldPwd}  placeholder="Enter current password" />
            <Field label="New Password"       value={newPwd}  onChangeText={setNewPwd}  placeholder="Min. 6 characters" />
            <Field label="Confirm New Password" value={confPwd} onChangeText={setConfPwd} placeholder="Re-enter new password" />

            <PrimaryButton
              label="Change Password"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.lg },
  card:      { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, ...elevation.level1 },
  iconRow:   { alignItems: 'center', marginBottom: 8 },
  icon:      { fontSize: 48 },
  subtitle:  { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center', marginBottom: spacing.xl },
});
