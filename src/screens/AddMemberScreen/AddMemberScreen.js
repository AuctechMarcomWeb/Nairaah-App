import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton } from '../../components';
import { distributorAssignableLevels } from '../../data/mockData';

function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrapper}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && f.inputFocused, multiline && f.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={colors.onSurfaceMuted}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const f = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 7 },
  input: {
    borderWidth: 1.5, borderColor: colors.outline,
    borderRadius: radius.md, height: 50,
    paddingHorizontal: spacing.lg,
    ...typography.bodyLarge, color: colors.onSurface,
    backgroundColor: colors.background,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  inputMulti: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
});

export default function AddMemberScreen({ navigation }) {
  const [userType, setUserType] = useState('Customer');
  const [selectedLevel, setSelectedLevel] = useState('B'); // default B — distributor ka pehla level
  const [form, setForm] = useState({
    name: '', mobile: '', email: '',
    address: '', city: '', state: '', pincode: '',
  });

  const set = (key) => (val) => setForm({ ...form, [key]: val });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      Alert.alert('Required', 'Please enter Name and Mobile Number.');
      return;
    }
    const levelInfo = userType === 'Distributor' ? ` (Level ${selectedLevel})` : '';
    Alert.alert(
      'Added Successfully',
      `${userType} "${form.name}"${levelInfo} has been added to your network.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Add New Member" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* User Type Toggle */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>User Type</Text>
          <View style={s.toggleRow}>
            {['Customer', 'Distributor'].map(type => (
              <TouchableOpacity
                key={type}
                style={[s.toggleBtn, userType === type && s.toggleBtnActive]}
                onPress={() => { setUserType(type); if (type === 'Distributor') setSelectedLevel('B'); }}>
                <Text style={[s.toggleBtnIcon]}>
                  {type === 'Customer' ? '👤' : '🤝'}
                </Text>
                <Text style={[s.toggleBtnText, userType === type && s.toggleBtnTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personal Details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Personal Details</Text>
          <Field label="Full Name *" value={form.name} onChangeText={set('name')} placeholder="Enter full name" />
          <Field label="Mobile Number *" value={form.mobile} onChangeText={set('mobile')} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
          <Field label="Email Address" value={form.email} onChangeText={set('email')} placeholder="email@example.com" keyboardType="email-address" />
        </View>

        {/* MLM Level — only for Distributor */}
        {userType === 'Distributor' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>MLM Level</Text>

            {/* A+ info note */}
            <View style={s.aplusNote}>
              <Text style={s.aplusNoteIcon}>🔒</Text>
              <Text style={s.aplusNoteText}>
                <Text style={s.aplusNoteStrong}>A+ level sirf Admin assign karta hai.</Text>
                {' '}Aap Level A se K tak assign kar sakte hain.
              </Text>
            </View>

            {/* Level grid — A to K */}
            <View style={s.levelGrid}>
              {distributorAssignableLevels.map(lvl => {
                const isSelected = selectedLevel === lvl.key;
                return (
                  <TouchableOpacity
                    key={lvl.key}
                    style={[
                      s.levelBtn,
                      { borderColor: lvl.borderColor },
                      isSelected && { backgroundColor: lvl.bgColor, borderColor: lvl.color, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedLevel(lvl.key)}
                    activeOpacity={0.75}>
                    <Text style={[s.levelBtnLabel, { color: isSelected ? lvl.color : colors.onSurfaceMuted }]}>
                      {lvl.label}
                    </Text>
                    {isSelected && (
                      <Text style={[s.levelBtnCheck, { color: lvl.color }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected level description */}
            {(() => {
              const lvl = distributorAssignableLevels.find(l => l.key === selectedLevel);
              return lvl ? (
                <View style={[s.levelDesc, { backgroundColor: lvl.bgColor, borderColor: lvl.borderColor }]}>
                  <Text style={[s.levelDescLabel, { color: lvl.color }]}>Level {lvl.label}</Text>
                  <Text style={[s.levelDescText, { color: lvl.color }]}>{lvl.description}</Text>
                </View>
              ) : null;
            })()}
          </View>
        )}

        {/* Address */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Address Details</Text>
          <Field label="Full Address" value={form.address} onChangeText={set('address')} placeholder="House No, Street, Area" multiline />
          <Field label="City" value={form.city} onChangeText={set('city')} placeholder="Enter city" />
          <Field label="State" value={form.state} onChangeText={set('state')} placeholder="Enter state" />
          <Field label="Pincode" value={form.pincode} onChangeText={set('pincode')} placeholder="6-digit pincode" keyboardType="numeric" />
        </View>

        <PrimaryButton
          label={`Add ${userType}`}
          onPress={handleSubmit}
          style={s.submitBtn}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: 12, ...elevation.level1,
  },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface, marginBottom: spacing.lg },
  sectionLabel: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 10 },

  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 52, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.outline,
    backgroundColor: colors.background,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  toggleBtnIcon: { fontSize: 18 },
  toggleBtnText: { ...typography.titleSmall, color: colors.onSurfaceMuted },
  toggleBtnTextActive: { color: colors.primary },

  // ── Level selector styles ─────────────────────────────
  aplusNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF7ED', borderRadius: radius.md,
    borderWidth: 1, borderColor: '#FED7AA',
    padding: spacing.md, marginBottom: spacing.lg,
  },
  aplusNoteIcon: { fontSize: 15, marginTop: 1 },
  aplusNoteText: { ...typography.bodySmall, color: '#92400E', flex: 1, lineHeight: 18 },
  aplusNoteStrong: { fontWeight: '700' },

  levelGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginBottom: spacing.lg,
  },
  levelBtn: {
    width: 52, height: 52, borderRadius: radius.md,
    borderWidth: 1.5, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  levelBtnLabel: { ...typography.titleMedium, fontWeight: '800' },
  levelBtnCheck: { position: 'absolute', top: 2, right: 4, fontSize: 10, fontWeight: '900' },

  levelDesc: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: radius.md, borderWidth: 1,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  levelDescLabel: { ...typography.titleSmall, fontWeight: '800' },
  levelDescText: { ...typography.bodySmall, flex: 1 },

  submitBtn: { marginTop: 4 },
});
