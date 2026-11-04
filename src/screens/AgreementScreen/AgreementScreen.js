import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Alert,
  ScrollView, TouchableOpacity, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, Divider } from '../../components';
import { getProfile } from '../../api/auth';
import { getAllAgreements, getAgreementById, acceptAgreement } from '../../api/agreement';

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

export default function AgreementScreen({ navigation }) {
  const { user } = useSelector(state => state.user);

  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [accepted,    setAccepted]    = useState(false);
  const [acceptedAt,  setAcceptedAt]  = useState(null);
  const [signature,   setSignature]   = useState(null);
  const [agreement,   setAgreement]   = useState(null);
  const [checked,     setChecked]     = useState(false);
  const [mySignature, setMySignature] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await getProfile();
      if (profileRes.success) {
        const u = profileRes.user || profileRes.data?.user || profileRes.data;
        setAccepted(u?.isAgreementAccepted || false);
        setAcceptedAt(u?.agreementAcceptedAt || null);
        setSignature(u?.agreementSignature || null);
      }
      const allRes = await getAllAgreements();
      if (allRes.success) {
        const list = allRes.data?.agreements || allRes.data || [];
        const active = list.find(a => a.type === 'Agreement' && a.isActive) || list[0];
        if (active) {
          const detailRes = await getAgreementById(active._id);
          if (detailRes.success) setAgreement(detailRes.data?.agreement || detailRes.data);
        }
      }
    } catch (e) {
      console.error('[AGREEMENT] load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!checked) { Alert.alert('Required', 'Pehle declaration checkbox select karo.'); return; }
    if (!mySignature.trim()) { Alert.alert('Required', 'Apna naam signature ke roop mein daalo.'); return; }
    setSubmitting(true);
    const res = await acceptAgreement(mySignature.trim());
    setSubmitting(false);
    if (res.success) {
      Alert.alert('Agreement Accepted ✅', 'Aapka agreement successfully sign ho gaya!');
      loadData();
    } else {
      Alert.alert('Error', res.message || 'Agreement accept karne mein error aaya');
    }
  };

  if (loading) {
    return (
      <View style={s.container}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
        <AppHeader title="Agreement" onBack={() => navigation.goBack()} />
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
        <AppHeader title="Agreement" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Status Banner */}
          {accepted ? (
            <View style={s.acceptedBanner}>
              <Text style={s.acceptedIcon}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.acceptedTitle}>Agreement Accepted</Text>
                {acceptedAt && <Text style={s.acceptedDate}>Accepted on: {fmtDate(acceptedAt)}</Text>}
                {signature  && <Text style={s.acceptedSig}>Signature: {signature}</Text>}
              </View>
            </View>
          ) : (
            <View style={s.pendingBanner}>
              <Text style={s.pendingIcon}>⏳</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.pendingTitle}>Agreement Pending</Text>
                <Text style={s.pendingSub}>Neeche agreement padh ke sign karo</Text>
              </View>
            </View>
          )}

          {/* Agreement Content */}
          {agreement ? (
            <View style={s.card}>
              <Text style={s.agreementTitle}>{agreement.title || 'Distributor Agreement'}</Text>
              <Divider style={{ marginVertical: 12 }} />
              <Text style={s.agreementContent}>
                {agreement.content
                  ? agreement.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
                  : 'Agreement content load nahi ho saka.'}
              </Text>
            </View>
          ) : (
            <View style={s.card}>
              <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center' }}>
                Koi active agreement nahi mili.
              </Text>
            </View>
          )}

          {/* Sign Section — only if not accepted yet */}
          {!accepted && agreement && (
            <View style={s.card}>
              <Text style={s.signTitle}>Declaration & Signature</Text>
              <Divider style={{ marginVertical: 10 }} />

              {/* Checkbox */}
              <TouchableOpacity style={s.checkRow} onPress={() => setChecked(p => !p)} activeOpacity={0.8}>
                <View style={[s.checkbox, checked && s.checkboxActive]}>
                  {checked && <Text style={{ color: colors.white, fontSize: 12, fontWeight: '900' }}>✓</Text>}
                </View>
                <Text style={s.checkLabel}>
                  Main ye ghoshna karta/karti hoon ki maine upar diya hua agreement poora padh liya hai aur main iske saare terms aur conditions se sehmat hoon.
                </Text>
              </TouchableOpacity>

              {/* Signature input */}
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Naam as Signature *</Text>
                <TextInput
                  style={s.sigInput}
                  value={mySignature}
                  onChangeText={setMySignature}
                  placeholder="Apna poora naam likhein"
                  placeholderTextColor={colors.onSurfaceMuted}
                />
              </View>

              <PrimaryButton
                label={submitting ? 'Submitting...' : 'I Agree & Submit'}
                onPress={handleAccept}
                loading={submitting}
                disabled={submitting || !checked || !mySignature.trim()}
              />
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.lg },
  card:      { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },

  acceptedBanner: { backgroundColor: colors.successContainer, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  acceptedIcon:   { fontSize: 28 },
  acceptedTitle:  { ...typography.titleMedium, color: colors.success },
  acceptedDate:   { ...typography.bodySmall, color: colors.success, marginTop: 2 },
  acceptedSig:    { ...typography.bodySmall, color: colors.success, marginTop: 2, fontStyle: 'italic' },

  pendingBanner: { backgroundColor: colors.warningContainer, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  pendingIcon:   { fontSize: 28 },
  pendingTitle:  { ...typography.titleMedium, color: colors.warning },
  pendingSub:    { ...typography.bodySmall, color: colors.warning, marginTop: 2 },

  agreementTitle:   { ...typography.titleLarge, color: colors.onSurface },
  agreementContent: { ...typography.bodyMedium, color: colors.onSurface, lineHeight: 24 },

  signTitle: { ...typography.titleMedium, color: colors.onSurface },
  checkRow:  { flexDirection: 'row', gap: 12, marginBottom: spacing.lg },
  checkbox:  { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel:{ ...typography.bodyMedium, color: colors.onSurface, flex: 1, lineHeight: 22 },

  sigBox:   { marginBottom: spacing.lg },
  sigLabel: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 6 },
  sigInput: { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 50, paddingHorizontal: spacing.md, ...typography.bodyLarge, color: colors.onSurface, backgroundColor: colors.background },
});
