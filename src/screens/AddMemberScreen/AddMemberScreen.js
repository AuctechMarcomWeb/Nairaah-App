import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, Modal, FlatList, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, StatusChip, Divider, LevelBadge } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { createUser, getUsersCreatedBy, getUserById, convertToDistributor } from '../../api/users';

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-';

// ─── Text field ───────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, keyboardType, required, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}{required && <Text style={{ color: colors.error }}> *</Text>}</Text>
      <TextInput
        style={[f.input, focused && f.focused]}
        value={value} onChangeText={onChangeText}
        placeholder={placeholder || ''} placeholderTextColor={colors.onSurfaceMuted}
        keyboardType={keyboardType || 'default'}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoCapitalize="none"
      />
      {hint ? <Text style={f.hint}>{hint}</Text> : null}
    </View>
  );
}
const f = StyleSheet.create({
  wrap:   { marginBottom: spacing.md },
  label:  { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 5 },
  input:  { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, ...typography.bodyLarge, color: colors.onSurface, backgroundColor: colors.background },
  focused:{ borderColor: colors.primary, backgroundColor: colors.surface },
  hint:   { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 3 },
});

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ iconName, label }) {
  return (
    <View style={sh.row}>
      <Icon name={iconName} size={16} color={colors.primary} />
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 },
  label: { ...typography.titleSmall, color: colors.primary, fontWeight: '700' },
});

// ─── Credentials card ─────────────────────────────────────────────────────────
function CredentialsCard({ userId, password, userType }) {
  const color = userType === 'Customer' ? colors.success : '#7C3AED';
  const bg    = userType === 'Customer' ? '#ECFDF5' : '#F5F3FF';
  return (
    <View style={[cr.card, { backgroundColor: bg, borderLeftColor: color }]}>
      <View style={cr.titleRow}>
        <Icon name={Icons.success} size={18} color={color} />
        <Text style={[cr.title, { color }]}>{userType} Successfully Added</Text>
      </View>
      <View style={cr.row}>
        <View style={cr.col}><Text style={cr.colLabel}>User ID</Text><Text style={[cr.colVal, { color }]}>{userId}</Text></View>
        <View style={cr.col}><Text style={cr.colLabel}>Password</Text><Text style={[cr.colVal, { color }]}>{password}</Text></View>
      </View>
      <Text style={cr.hint}>Ye credentials {userType.toLowerCase()} ko share karo.</Text>
    </View>
  );
}
const cr = StyleSheet.create({
  card:     { borderLeftWidth: 4, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title:    { ...typography.titleSmall, fontWeight: '700' },
  row:      { flexDirection: 'row', gap: spacing.xl, marginBottom: 6 },
  col:      { flex: 1 },
  colLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, marginBottom: 2 },
  colVal:   { ...typography.headlineSmall, fontWeight: '800' },
  hint:     { ...typography.bodySmall, color: colors.onSurfaceMuted },
});

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ visible, onClose, sponsorId }) {
  const [userType,   setUserType]   = useState(null);
  const [tab,        setTab]        = useState('personal');
  const [loading,    setLoading]    = useState(false);
  const [created,    setCreated]    = useState(null);

  const [name,       setName]       = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone,      setPhone]      = useState('');
  const [email,      setEmail]      = useState('');
  const [gender,     setGender]     = useState('');
  const [address,    setAddress]    = useState('');
  const [city,       setCity]       = useState('');
  const [state,      setState]      = useState('');
  const [pincode,    setPincode]    = useState('');

  const [accHolder,  setAccHolder]  = useState('');
  const [bankName,   setBankName]   = useState('');
  const [accNumber,  setAccNumber]  = useState('');
  const [branch,     setBranch]     = useState('');
  const [ifsc,       setIfsc]       = useState('');
  const [accType,    setAccType]    = useState('Saving');
  const [upiId,      setUpiId]      = useState('');
  const [upiMobile,  setUpiMobile]  = useState('');

  const [aadhaar,    setAadhaar]    = useState('');
  const [pan,        setPan]        = useState('');
  const [gst,        setGst]        = useState('');

  const resetAll = () => {
    setUserType(null); setTab('personal'); setCreated(null);
    setName(''); setFatherName(''); setPhone(''); setEmail(''); setGender('');
    setAddress(''); setCity(''); setState(''); setPincode('');
    setAccHolder(''); setBankName(''); setAccNumber(''); setBranch('');
    setIfsc(''); setAccType('Saving'); setUpiId(''); setUpiMobile('');
    setAadhaar(''); setPan(''); setGst('');
  };

  const handleClose = () => { resetAll(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim())  { Alert.alert('Required', 'Full Name required hai.'); return; }
    if (!phone.trim() || phone.trim().length !== 10) {
      Alert.alert('Invalid', 'Valid 10-digit mobile number daalo.'); return;
    }
    setLoading(true);
    const res = await createUser({
      name: name.trim(), fatherName: fatherName.trim() || undefined,
      phone: phone.trim(), email: email.trim() || undefined,
      gender: gender || undefined, role: userType, userType,
      address: address.trim() || undefined, city: city.trim() || undefined,
      state: state.trim() || undefined, pincode: pincode.trim() || undefined,
      country: 'India',
      ...(userType === 'Distributor' && {
        bankDetails: { accountHolderName: accHolder.trim() || undefined, bankName: bankName.trim() || undefined, accountNumber: accNumber.trim() || undefined, branchName: branch.trim() || undefined, ifscCode: ifsc.trim() || undefined, accountType: accType, upiId: upiId.trim() || undefined, upiMobileNumber: upiMobile.trim() || undefined },
        kycDetails:  { aadhaarNumber: aadhaar.trim() || undefined, panNumber: pan.trim() || undefined, gstNumber: gst.trim() || undefined, documents: [] },
      }),
    });
    setLoading(false);
    if (res.success) {
      setCreated({ userId: res.data?.userId, password: res.data?.password });
      setName(''); setFatherName(''); setPhone(''); setEmail(''); setGender('');
      setAddress(''); setCity(''); setState(''); setPincode('');
      setAccHolder(''); setBankName(''); setAccNumber(''); setBranch('');
      setIfsc(''); setAccType('Saving'); setUpiId(''); setUpiMobile('');
      setAadhaar(''); setPan(''); setGst(''); setTab('personal');
    } else {
      Alert.alert('Error', res.message || `${userType} add karne mein error`);
    }
  };

  const TABS = [
    { key: 'personal', iconName: Icons.personal, label: 'Personal' },
    { key: 'bank',     iconName: Icons.bank,     label: 'Bank'     },
    { key: 'kyc',      iconName: Icons.kyc,      label: 'KYC'      },
  ];
  const GENDERS   = ['Male', 'Female', 'Other'];
  const ACC_TYPES = ['Saving', 'Current'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={am.overlay}>
        <View style={am.sheet}>
          <View style={am.handle} />

          {/* Title */}
          <View style={am.titleRow}>
            <Text style={am.title}>Add Distributor / Customer</Text>
            <TouchableOpacity onPress={handleClose} style={am.closeBtn}>
              <Icon name={Icons.close} size={18} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          </View>

          {/* User Type selector */}
          {!userType ? (
            <View style={am.typeSelect}>
              <Text style={am.typeHint}>User type select karo:</Text>
              <View style={am.typeRow}>
                {[
                  { t: 'Customer',    iconName: Icons.customer,    color: colors.success, bg: '#ECFDF5', desc: 'Regular buyer' },
                  { t: 'Distributor', iconName: Icons.distributor, color: '#7C3AED',      bg: '#F5F3FF', desc: 'Reseller with downline' },
                ].map(({ t, iconName, color, bg, desc }) => (
                  <TouchableOpacity
                    key={t}
                    style={[am.typeCard, { backgroundColor: bg, borderColor: color }]}
                    onPress={() => { setUserType(t); setTab('personal'); setCreated(null); }}>
                    <Icon name={iconName} size={32} color={color} style={{ marginBottom: 6 }} />
                    <Text style={[am.typeCardTitle, { color }]}>{t}</Text>
                    <Text style={am.typeCardDesc}>{desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {/* Change type button */}
              <TouchableOpacity
                style={am.changeType}
                onPress={() => { setUserType(null); setCreated(null); setTab('personal'); }}>
                <Icon
                  name={userType === 'Customer' ? Icons.customer : Icons.distributor}
                  size={14} color={colors.primary}
                />
                <Text style={am.changeTypeTxt}>{userType}  ·  Change</Text>
              </TouchableOpacity>

              {/* Tabs for Distributor */}
              {userType === 'Distributor' && (
                <View style={am.tabRow}>
                  {TABS.map(({ key, iconName, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[am.tabBtn, tab === key && am.tabBtnActive]}
                      onPress={() => setTab(key)}>
                      <Icon name={iconName} size={14} color={tab === key ? colors.primary : colors.onSurfaceMuted} />
                      <Text style={[am.tabTxt, tab === key && am.tabTxtActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: 360 }}>

                {/* Personal Tab */}
                {tab === 'personal' && (
                  <View style={{ paddingTop: 4 }}>
                    <SectionHead iconName={Icons.personal} label="Personal Details" />
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Full Name" value={name} onChangeText={setName} placeholder="Rahul Sharma" required /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Father's Name" value={fatherName} onChangeText={setFatherName} placeholder="Vijay Sharma" /></View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Mobile" value={phone} onChangeText={setPhone} placeholder="10-digit" keyboardType="phone-pad" required /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" keyboardType="email-address" /></View>
                    </View>

                    {/* Gender */}
                    <View style={f.wrap}>
                      <Text style={f.label}>Gender</Text>
                      <View style={am.chipRow}>
                        {GENDERS.map(g => (
                          <TouchableOpacity key={g} style={[am.chip, gender === g && am.chipActive]} onPress={() => setGender(g)}>
                            <Text style={[am.chipTxt, gender === g && am.chipTxtActive]}>{g}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <SectionHead iconName={Icons.address} label="Address" />
                    <Field label="Address" value={address} onChangeText={setAddress} placeholder="House / Street / Area" />
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="City" value={city} onChangeText={setCity} placeholder="City" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="State" value={state} onChangeText={setState} placeholder="State" /></View>
                    </View>
                    <Field label="Pincode" value={pincode} onChangeText={setPincode} placeholder="6-digit" keyboardType="numeric" />
                  </View>
                )}

                {/* Bank Tab */}
                {tab === 'bank' && userType === 'Distributor' && (
                  <View style={{ paddingTop: 4 }}>
                    <SectionHead iconName={Icons.bank} label="Bank Details" />
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Account Holder Name" value={accHolder} onChangeText={setAccHolder} placeholder="As per bank" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Bank Name" value={bankName} onChangeText={setBankName} placeholder="SBI / HDFC" /></View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Account Number" value={accNumber} onChangeText={setAccNumber} placeholder="Account no." keyboardType="numeric" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Branch Name" value={branch} onChangeText={setBranch} placeholder="Branch" /></View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="IFSC Code" value={ifsc} onChangeText={setIfsc} placeholder="SBIN0001234" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}>
                        <Text style={f.label}>Account Type</Text>
                        <View style={am.chipRow}>
                          {ACC_TYPES.map(t => (
                            <TouchableOpacity key={t} style={[am.chip, accType === t && am.chipActive]} onPress={() => setAccType(t)}>
                              <Text style={[am.chipTxt, accType === t && am.chipTxtActive]}>{t}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="example@upi" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="UPI Mobile" value={upiMobile} onChangeText={setUpiMobile} placeholder="10-digit" keyboardType="phone-pad" /></View>
                    </View>
                  </View>
                )}

                {/* KYC Tab */}
                {tab === 'kyc' && userType === 'Distributor' && (
                  <View style={{ paddingTop: 4 }}>
                    <SectionHead iconName={Icons.kyc} label="KYC Details" />
                    <Field label="Aadhaar Number" value={aadhaar} onChangeText={setAadhaar} placeholder="12-digit Aadhaar" keyboardType="numeric" hint="Optional" />
                    <Field label="PAN Number"     value={pan}     onChangeText={setPan}     placeholder="ABCDE1234F" hint="Optional" />
                    <Field label="GST Number"     value={gst}     onChangeText={setGst}     placeholder="09ABCDE1234F1Z5" hint="Optional" />
                  </View>
                )}
              </ScrollView>

              {created && <CredentialsCard userId={created.userId} password={created.password} userType={userType} />}

              <PrimaryButton
                label={loading ? 'Adding...' : `Add ${userType}`}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={{ marginTop: spacing.lg }}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const am = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 36, maxHeight: '94%' },
  handle:       { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  titleRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:        { ...typography.headlineSmall, color: colors.onSurface },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  typeSelect:   { paddingVertical: 8 },
  typeHint:     { ...typography.labelLarge, color: colors.onSurfaceMuted, marginBottom: 12 },
  typeRow:      { flexDirection: 'row', gap: 12 },
  typeCard:     { flex: 1, borderWidth: 2, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  typeCardTitle:{ ...typography.titleMedium, fontWeight: '800' },
  typeCardDesc: { ...typography.bodySmall, color: colors.onSurfaceMuted, textAlign: 'center', marginTop: 4 },
  changeType:   { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12 },
  changeTypeTxt:{ ...typography.labelLarge, color: colors.primary },
  tabRow:       { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: radius.md, padding: 3, marginBottom: 12 },
  tabBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: radius.sm },
  tabBtnActive: { backgroundColor: colors.surface, ...elevation.level1 },
  tabTxt:       { ...typography.labelMedium, color: colors.onSurfaceMuted },
  tabTxtActive: { color: colors.primary, fontWeight: '700' },
  twoCol:       { flexDirection: 'row' },
  chipRow:      { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.background },
  chipActive:   { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipTxt:      { ...typography.labelMedium, color: colors.onSurfaceMuted },
  chipTxtActive:{ color: colors.primary, fontWeight: '700' },
});

// ─── View User Detail Modal ───────────────────────────────────────────────────
function UserDetailModal({ visible, userId, onClose, onConvert }) {
  const [detail,     setDetail]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!visible || !userId) return;
    setDetail(null); setLoading(true);
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
          if (res.success) { Alert.alert('Success', `${detail?.name} ab Distributor hai!`); onClose(); onConvert(); }
          else Alert.alert('Error', res.message || 'Failed to convert');
        },
      },
    ]);
  };

  const d = detail;
  const isDistributor = d?.userType === 'Distributor';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={vd.overlay}>
        <View style={vd.sheet}>
          <View style={vd.handle} />

          {/* Header */}
          <View style={vd.headerRow}>
            <View style={[vd.avatar, { backgroundColor: isDistributor ? '#EDE9FE' : colors.primaryContainer }]}>
              <Icon name={isDistributor ? Icons.distributor : Icons.customer} size={24} color={isDistributor ? '#7C3AED' : colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={vd.name}>{d?.name || '-'}</Text>
              <Text style={vd.userId}>{d?.userId || '-'}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <StatusChip status={d?.isActive ? 'Active' : 'Inactive'} />
                {d?.distributorLevel && <LevelBadge level={d.distributorLevel} size="sm" />}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={vd.closeBtn}>
              <Icon name={Icons.close} size={18} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color={colors.primary} />
          ) : d ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Personal */}
              <InfoSection iconName={Icons.personal} label="Personal" />
              {[['Phone', d.phone], ['Email', d.email], ['Gender', d.gender], ["Father's Name", d.fatherName], ['Joined', fmtDate(d.createdAt)], ['Referral Code', d.referralCode]].map(([lbl, val]) => val ? (
                <InfoRow key={lbl} label={lbl} value={val} />
              ) : null)}

              {(d.address || d.city) && (
                <>
                  <InfoSection iconName={Icons.address} label="Address" />
                  {[['Address', d.address], ['City', d.city], ['State', d.state], ['Pincode', d.pincode]].map(([lbl, val]) => val ? <InfoRow key={lbl} label={lbl} value={val} /> : null)}
                </>
              )}

              {isDistributor && d.bankDetails && (
                <>
                  <InfoSection iconName={Icons.bank} label="Bank" />
                  {[['Account Holder', d.bankDetails?.accountHolderName], ['Bank Name', d.bankDetails?.bankName], ['Account No.', d.bankDetails?.accountNumber], ['IFSC', d.bankDetails?.ifscCode], ['UPI ID', d.bankDetails?.upiId]].map(([lbl, val]) => val ? <InfoRow key={lbl} label={lbl} value={val} /> : null)}
                </>
              )}

              {isDistributor && (
                <>
                  <InfoSection iconName={Icons.kyc} label="KYC" />
                  <View style={vd.row}>
                    <Text style={vd.rowLabel}>KYC Status</Text>
                    <StatusChip status={d.kycDetails?.status || 'Pending'} />
                  </View>
                </>
              )}

              <InfoSection iconName={Icons.agreement} label="Agreement" />
              <View style={vd.row}>
                <Text style={vd.rowLabel}>Status</Text>
                <StatusChip status={d.distributorAgreement?.isAccepted ? 'Approved' : 'Pending'} />
              </View>
            </ScrollView>
          ) : (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Icon name={Icons.emptyUser} size={40} color={colors.onSurfaceMuted} style={{ opacity: 0.4 }} />
              <Text style={{ ...typography.bodyMedium, color: colors.onSurfaceMuted, marginTop: 8 }}>Data not found</Text>
            </View>
          )}

          {d?.userType === 'Customer' && !loading && (
            <TouchableOpacity style={[vd.convertBtn, converting && { opacity: 0.6 }]} onPress={handleConvert} disabled={converting}>
              {converting
                ? <ActivityIndicator color={colors.white} size="small" />
                : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon name={Icons.convert} size={18} color={colors.white} />
                    <Text style={vd.convertTxt}>Convert to Distributor</Text>
                  </View>
                )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function InfoSection({ iconName, label }) {
  return (
    <View style={vd.sectionRow}>
      <Icon name={iconName} size={13} color={colors.onSurfaceMuted} />
      <Text style={vd.sectionTitle}>{label}</Text>
    </View>
  );
}
function InfoRow({ label, value }) {
  return (
    <View style={vd.row}>
      <Text style={vd.rowLabel}>{label}</Text>
      <Text style={vd.rowVal} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const vd = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 32 },
  handle:      { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  headerRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  avatar:      { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  name:        { ...typography.titleLarge, color: colors.onSurface },
  userId:      { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, marginBottom: 4 },
  sectionTitle:{ ...typography.labelMedium, color: colors.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  rowLabel:    { ...typography.labelLarge, color: colors.onSurfaceMuted, flex: 1 },
  rowVal:      { ...typography.bodyMedium, color: colors.onSurface, flex: 2, textAlign: 'right' },
  convertBtn:  { backgroundColor: colors.success, borderRadius: radius.lg, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  convertTxt:  { ...typography.titleSmall, color: colors.white, fontWeight: '700' },
});

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({ item, onView }) {
  const isDistributor = item.userType === 'Distributor' || item.role === 'Distributor';
  return (
    <TouchableOpacity style={ur.row} onPress={() => onView(item._id || item.id)} activeOpacity={0.75}>
      <View style={[ur.avatar, { backgroundColor: isDistributor ? '#EDE9FE' : colors.primaryContainer }]}>
        <Icon name={isDistributor ? Icons.distributor : Icons.customer} size={22} color={isDistributor ? '#7C3AED' : colors.primary} />
      </View>
      <View style={ur.info}>
        <Text style={ur.name} numberOfLines={1}>{item.name || '-'}</Text>
        <Text style={ur.sub}>{item.userId || '-'}  ·  {item.phone || '-'}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          <View style={[ur.typeBadge, { backgroundColor: isDistributor ? '#EDE9FE' : '#DBEAFE' }]}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: isDistributor ? '#7C3AED' : '#1A73E8' }}>
              {isDistributor ? 'Distributor' : 'Customer'}
            </Text>
          </View>
          <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
          {item.distributorLevel && <LevelBadge level={item.distributorLevel} size="sm" />}
        </View>
      </View>
      <View style={ur.right}>
        <Text style={ur.date}>{fmtDate(item.createdAt)}</Text>
        <Icon name={Icons.chevronRight} size={20} color={colors.onSurfaceMuted} />
      </View>
    </TouchableOpacity>
  );
}
const ur = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  info:     { flex: 1 },
  name:     { ...typography.titleSmall, color: colors.onSurface },
  sub:      { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  typeBadge:{ borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  right:    { alignItems: 'flex-end', gap: 4 },
  date:     { ...typography.bodySmall, color: colors.onSurfaceMuted, fontSize: 10 },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AddMemberScreen({ navigation }) {
  const { user } = useSelector(state => state.user);
  const sponsorId = user?._id || user?.userId;

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [viewUserId,      setViewUserId]      = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const searchTimer = useRef(null);

  const fetchUsers = useCallback(async () => {
    if (!sponsorId) return;
    let params = '';
    if (filterType)    params += `&userType=${filterType}`;
    if (filterStatus)  params += `&isActive=${filterStatus}`;
    if (search.trim()) params += `&search=${encodeURIComponent(search.trim())}`;
    const res = await getUsersCreatedBy(sponsorId, params);
    if (res.success) setUsers(res.data?.users || res.data || []);
    setLoading(false); setRefreshing(false);
  }, [sponsorId, filterType, filterStatus, search]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [fetchUsers]);

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const totalCustomers    = users.filter(u => u.userType === 'Customer').length;
  const totalDistributors = users.filter(u => u.userType === 'Distributor').length;
  const activeCount       = users.filter(u => u.isActive).length;

  const typeFilters   = [['', 'All'], ['Customer', 'Customer'], ['Distributor', 'Distributor']];
  const statusFilters = [['', 'All'], ['true', 'Active'], ['false', 'Inactive']];

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader
        title="Add Distributor / Customer"
        subtitle={`${users.length} members`}
        rightIconName="account-plus"
        onRightPress={() => setShowAddModal(true)}
      />

      <View style={s.body}>
        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: users.length,      label: 'Total',        color: colors.primary },
            { val: totalCustomers,    label: 'Customers',    color: colors.success },
            { val: totalDistributors, label: 'Distributors', color: '#7C3AED'      },
            { val: activeCount,       label: 'Active',       color: colors.success },
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
          <Icon name={Icons.search} size={18} color={colors.onSurfaceMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, ID, phone..."
            placeholderTextColor={colors.onSurfaceMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ paddingHorizontal: 10 }}>
              <Icon name={Icons.close} size={16} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {typeFilters.map(([val, lbl]) => (
            <TouchableOpacity key={val} style={[s.chip, filterType === val && s.chipActive]} onPress={() => setFilterType(val)}>
              <Text style={[s.chipTxt, filterType === val && s.chipTxtActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
          <View style={s.filterDiv} />
          {statusFilters.map(([val, lbl]) => (
            <TouchableOpacity key={val} style={[s.chip, filterStatus === val && s.chipActive]} onPress={() => setFilterStatus(val)}>
              <Text style={[s.chipTxt, filterStatus === val && s.chipTxtActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} size="large" />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item, i) => item._id || item.id || String(i)}
            renderItem={({ item }) => (
              <UserRow item={item} onView={id => { setViewUserId(id); setShowDetailModal(true); }} />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Icon name={Icons.emptyUser} size={48} color={colors.onSurfaceMuted} style={{ opacity: 0.4, marginBottom: 8 }} />
                <Text style={s.emptyTxt}>Koi member nahi mila</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)}>
                  <Text style={s.addBtnTxt}>Add First Member</Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
        )}
      </View>

      <AddUserModal
        visible={showAddModal}
        onClose={() => { setShowAddModal(false); fetchUsers(); }}
        sponsorId={sponsorId}
      />
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
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outline, marginBottom: 8, ...elevation.level1 },
  searchInput:{ flex: 1, height: 44, paddingHorizontal: 8, ...typography.bodyMedium, color: colors.onSurface },
  filterScroll:{ maxHeight: 48, marginBottom: 8 },
  chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surface, marginRight: 8 },
  chipActive:  { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  chipTxt:     { ...typography.labelMedium, color: colors.onSurfaceMuted },
  chipTxtActive:{ color: colors.primary, fontWeight: '700' },
  filterDiv:   { width: 1, backgroundColor: colors.divider, marginRight: 8, height: 28, alignSelf: 'center' },
  empty:       { alignItems: 'center', paddingVertical: 48 },
  emptyTxt:    { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginBottom: 16 },
  addBtn:      { backgroundColor: colors.primaryContainer, borderRadius: radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  addBtnTxt:   { ...typography.titleSmall, color: colors.primary },
});
