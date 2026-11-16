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
function Field({ label, value, onChangeText, placeholder, keyboardType, required, hint, maxLength, autoCapitalize }) {
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
        autoCapitalize={autoCapitalize || 'none'}
        maxLength={maxLength}
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
      <Text style={cr.hint}>Share these credentials with the {userType.toLowerCase()}.</Text>
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
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Pincode se city/state auto-fill
  const fetchLocationByPincode = async (pin) => {
    if (!pin || pin.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setCity(po.District || '');
        setState(po.State || '');
      } else {
        Alert.alert('Invalid Pincode', 'City/State not found for this pincode.');
      }
    } catch {
      Alert.alert('Error', 'Could not fetch location. Check internet connection.');
    } finally {
      setPincodeLoading(false);
    }
  };

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
    // ── Name ──────────────────────────────────────────────
    if (!name.trim()) {
      Alert.alert('Required', 'Full name is required.'); return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Invalid', 'Name must be at least 2 characters.'); return;
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
      Alert.alert('Invalid', 'Name should only contain letters, spaces or dots.'); return;
    }

    // ── Phone ─────────────────────────────────────────────
    const ph = phone.trim();
    if (!ph) {
      Alert.alert('Required', 'Mobile number is required.'); return;
    }
    if (!/^[6-9]\d{9}$/.test(ph)) {
      Alert.alert('Invalid Mobile', 'Enter a valid 10-digit Indian mobile number starting with 6-9.'); return;
    }

    // ── Email (optional but validate format if entered) ───
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.'); return;
    }

    // ── Pincode (optional but validate if entered) ────────
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
      Alert.alert('Invalid Pincode', 'Pincode must be exactly 6 digits.'); return;
    }

    // ── Distributor-specific validations ──────────────────
    if (userType === 'Distributor') {
      // Bank — account number digits only, 9-18 chars
      if (accNumber.trim() && !/^\d{9,18}$/.test(accNumber.trim())) {
        Alert.alert('Invalid Account Number', 'Account number must be 9–18 digits only.'); return;
      }
      // IFSC — standard format
      if (ifsc.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
        Alert.alert('Invalid IFSC', 'IFSC format: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234).'); return;
      }
      // UPI Mobile
      if (upiMobile.trim() && !/^[6-9]\d{9}$/.test(upiMobile.trim())) {
        Alert.alert('Invalid UPI Mobile', 'UPI mobile must be a valid 10-digit Indian number.'); return;
      }
      // Aadhaar — exactly 12 digits
      if (aadhaar.trim() && !/^\d{12}$/.test(aadhaar.trim())) {
        Alert.alert('Invalid Aadhaar', 'Aadhaar number must be exactly 12 digits.'); return;
      }
      // PAN — standard format
      if (pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())) {
        Alert.alert('Invalid PAN', 'PAN format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).'); return;
      }
      // GST — standard format
      if (gst.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst.trim().toUpperCase())) {
        Alert.alert('Invalid GST', 'Enter a valid 15-character GST number.'); return;
      }
    }

    setLoading(true);
    const res = await createUser({
      name: name.trim(), fatherName: fatherName.trim() || undefined,
      phone: phone.trim(), email: email.trim() || undefined,
      gender: gender || undefined, role: userType, userType,
      address: address.trim() || undefined, city: city.trim() || undefined,
      state: state.trim() || undefined, pincode: pincode.trim() || undefined,
      country: 'India',
      ...(sponsorId && { createdBy: sponsorId }),
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
      Alert.alert('Error', res.message || `Failed to add ${userType}.`);
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
      <TouchableOpacity style={am.overlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity style={am.sheet} activeOpacity={1} onPress={() => {}}>
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
              <Text style={am.typeHint}>Select user type:</Text>
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

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: 440 }}>

                {/* Personal Tab */}
                {tab === 'personal' && (
                  <View style={{ paddingTop: 4 }}>
                    <SectionHead iconName={Icons.personal} label="Personal Details" />
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Full Name" value={name} onChangeText={v => setName(v.replace(/[^a-zA-Z\s.'-]/g, ''))} placeholder="Rahul Sharma" required maxLength={50} autoCapitalize="words" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Father's Name" value={fatherName} onChangeText={v => setFatherName(v.replace(/[^a-zA-Z\s.'-]/g, ''))} placeholder="Vijay Sharma" maxLength={50} autoCapitalize="words" /></View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Mobile" value={phone} onChangeText={v => setPhone(v.replace(/\D/g, ''))} placeholder="10-digit" keyboardType="phone-pad" required maxLength={10} /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" keyboardType="email-address" maxLength={80} /></View>
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
                    <Field label="Address" value={address} onChangeText={setAddress} placeholder="House / Street / Area" maxLength={150} autoCapitalize="sentences" />
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}>
                        <Field
                          label="Pincode"
                          value={pincode}
                          onChangeText={(v) => {
                            const clean = v.replace(/\D/g, '');
                            setPincode(clean);
                            if (clean.length === 6) fetchLocationByPincode(clean);
                          }}
                          placeholder="6-digit"
                          keyboardType="numeric"
                          maxLength={6}
                          hint={pincodeLoading ? 'Fetching city/state...' : ''}
                        />
                      </View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="City" value={city} onChangeText={setCity} placeholder="Auto-filled" maxLength={50} autoCapitalize="words" /></View>
                    </View>
                    <Field label="State" value={state} onChangeText={setState} placeholder="Auto-filled" maxLength={50} autoCapitalize="words" />
                  </View>
                )}

                {/* Bank Tab */}
                {tab === 'bank' && userType === 'Distributor' && (
                  <View style={{ paddingTop: 4 }}>
                    <SectionHead iconName={Icons.bank} label="Bank Details" />
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Account Holder Name" value={accHolder} onChangeText={v => setAccHolder(v.replace(/[^a-zA-Z\s.]/g, ''))} placeholder="As per bank" maxLength={60} autoCapitalize="words" /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Bank Name" value={bankName} onChangeText={v => setBankName(v.replace(/[^a-zA-Z\s]/g, ''))} placeholder="SBI / HDFC" maxLength={50} autoCapitalize="words" /></View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="Account Number" value={accNumber} onChangeText={v => setAccNumber(v.replace(/\D/g, ''))} placeholder="Account no." keyboardType="numeric" maxLength={18} /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="Branch Name" value={branch} onChangeText={v => setBranch(v.replace(/[^a-zA-Z\s]/g, ''))} placeholder="Branch" maxLength={50} autoCapitalize="words" /></View>
                    </View>
                    <View style={am.twoCol}>
                      <View style={{ flex: 1 }}><Field label="IFSC Code" value={ifsc} onChangeText={v => setIfsc(v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())} placeholder="SBIN0001234" maxLength={11} /></View>
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
                      <View style={{ flex: 1 }}><Field label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="example@upi" maxLength={50} /></View>
                      <View style={{ width: spacing.md }} />
                      <View style={{ flex: 1 }}><Field label="UPI Mobile" value={upiMobile} onChangeText={v => setUpiMobile(v.replace(/\D/g, ''))} placeholder="10-digit" keyboardType="phone-pad" maxLength={10} /></View>
                    </View>
                  </View>
                )}

                {/* KYC Tab */}
                {tab === 'kyc' && userType === 'Distributor' && (
                  <View style={{ paddingTop: 4 }}>
                    <SectionHead iconName={Icons.kyc} label="KYC Details" />
                    <Field label="Aadhaar Number" value={aadhaar} onChangeText={v => setAadhaar(v.replace(/\D/g, ''))}     placeholder="12-digit Aadhaar" keyboardType="numeric" maxLength={12} hint="Optional" />
                    <Field label="PAN Number"     value={pan}     onChangeText={v => setPan(v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())} placeholder="ABCDE1234F"     maxLength={10} hint="Optional" />
                    <Field label="GST Number"     value={gst}     onChangeText={v => setGst(v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())} placeholder="09ABCDE1234F1Z5" maxLength={15} hint="Optional" />
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const am = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 24, maxHeight: '98%' },
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
    Alert.alert('Convert to Distributor', `Convert ${detail?.name} from Customer to Distributor?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Convert', style: 'destructive',
        onPress: async () => {
          setConverting(true);
          const res = await convertToDistributor(userId);
          setConverting(false);
          if (res.success) { Alert.alert('Success', `${detail?.name} is now a Distributor.`); onClose(); onConvert(); }
          else Alert.alert('Error', res.message || 'Failed to convert');
        },
      },
    ]);
  };

  const d = detail;
  const isDistributor = d?.userType === 'Distributor';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={vd.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={vd.sheet} activeOpacity={1} onPress={() => {}}>
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
        </TouchableOpacity>
      </TouchableOpacity>
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
          <View style={[ur.typeBadge, { backgroundColor: isDistributor ? '#EDE9FE' : '#FDDCCC' }]}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: isDistributor ? '#7C3AED' : '#C0571C' }}>
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
        onBack={() => navigation.goBack()}
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
        <View style={s.filterContainer}>
          {/* Row 1: Type filter */}
          <View style={s.filterRow}>
            <View style={s.filterLabelWrap}>
              <Icon name={Icons.distributor} size={12} color={colors.onSurfaceMuted} />
              <Text style={s.filterLabel}>Type</Text>
            </View>
            <View style={s.filterChips}>
              {typeFilters.map(([val, lbl]) => {
                const active = filterType === val;
                const color = val === 'Customer' ? colors.success : val === 'Distributor' ? '#7C3AED' : colors.primary;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[s.chip, active && { backgroundColor: color + '18', borderColor: color }]}
                    onPress={() => setFilterType(val)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.chipTxt, active && { color: color, fontWeight: '700' }]}>{lbl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Row 2: Status filter */}
          <View style={[s.filterRow, { marginBottom: 0 }]}>
            <View style={s.filterLabelWrap}>
              <Icon name={Icons.success} size={12} color={colors.onSurfaceMuted} />
              <Text style={s.filterLabel}>Status</Text>
            </View>
            <View style={s.filterChips}>
              {statusFilters.map(([val, lbl]) => {
                const active = filterStatus === val;
                const color = val === 'true' ? colors.success : val === 'false' ? colors.error : colors.primary;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[s.chip, active && { backgroundColor: color + '18', borderColor: color }]}
                    onPress={() => setFilterStatus(val)}
                    activeOpacity={0.75}
                  >
                    {val === 'true' && <View style={[s.dot, { backgroundColor: colors.success }]} />}
                    {val === 'false' && <View style={[s.dot, { backgroundColor: colors.error }]} />}
                    <Text style={[s.chipTxt, active && { color: color, fontWeight: '700' }]}>{lbl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

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
                <Text style={s.emptyTxt}>No members found</Text>
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
  filterContainer: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: 8, ...elevation.level1, gap: 6 },
  filterRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  filterLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 52 },
  filterLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips: { flexDirection: 'row', gap: 7, flex: 1, flexWrap: 'wrap' },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.background },
  chipTxt:     { ...typography.labelMedium, color: colors.onSurfaceMuted },
  dot:         { width: 6, height: 6, borderRadius: 3 },
  empty:       { alignItems: 'center', paddingVertical: 48 },
  emptyTxt:    { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginBottom: 16 },
  addBtn:      { backgroundColor: colors.primaryContainer, borderRadius: radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  addBtnTxt:   { ...typography.titleSmall, color: colors.primary },
});
