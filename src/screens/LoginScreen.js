/**
 * LoginScreen.js — Clean Classic Design
 * Inspired by: PhonePe / Paytm / modern fintech login UI
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Image, Platform,
  Dimensions, SafeAreaView, KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';

const { width: W, height: H } = Dimensions.get('window');

const MOCK_OTP   = '123456';
const OTP_LENGTH = 6;
const RESEND_SECS = 30;

export default function LoginScreen({ navigation }) {
  const [step, setStep]               = useState(1);
  const [mobile, setMobile]           = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [loadingSend, setLoadingSend]   = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [timer, setTimer]             = useState(0);
  const [sentMsg, setSentMsg]         = useState('');
  const [error, setError]             = useState('');
  const otpRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleSendOtp = () => {
    setError('');
    const c = mobile.replace(/\s/g, '');
    if (!/^[6-9]\d{9}$/.test(c)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoadingSend(true);
    setTimeout(() => {
      setLoadingSend(false);
      setStep(2);
      setTimer(RESEND_SECS);
      setSentMsg(`+91 ${c}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }, 1200);
  };

  const handleOtpChange = (val, i) => {
    setError('');
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const u = [...otp]; u[i] = digit; setOtp(u);
    if (digit && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (e, i) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    const entered = otp.join('');
    if (entered.length < OTP_LENGTH) { setError('Please enter all 6 digits'); return; }
    if (entered !== MOCK_OTP) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }
    setLoadingVerify(true);
    setTimeout(() => { setLoadingVerify(false); navigation.replace('Main'); }, 1200);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimer(RESEND_SECS);
    setTimeout(() => otpRefs.current[0]?.focus(), 200);
  };

  const handleBack = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setTimer(0);
    setError('');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}>

        {/* ── Top Brand Header ── */}
        <View style={s.header}>
          <View style={s.logoCircle}>
            <Image
              source={require('../assets/images/nairaah_logo.png')}
              style={s.logoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={s.brandName}>Nairaah</Text>
          <Text style={s.brandTagline}>Your MLM Growth Partner</Text>
        </View>

        {/* ── Form Card ── */}
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}>

          <View style={s.card}>

            {step === 1 ? (
              /* ── Step 1: Mobile Number ── */
              <>
                <Text style={s.title}>Sign In</Text>
                <Text style={s.subtitle}>Enter your registered mobile number</Text>

                {/* Mobile Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Mobile Number</Text>
                  <View style={s.inputRow}>
                    <View style={s.countryCode}>
                      <Text style={s.countryCodeText}>🇮🇳  +91</Text>
                    </View>
                    <View style={s.divider} />
                    <TextInput
                      style={s.input}
                      value={mobile}
                      onChangeText={t => {
                        setError('');
                        setMobile(t.replace(/[^0-9]/g, '').slice(0, 10));
                      }}
                      placeholder="00000 00000"
                      placeholderTextColor="#B0BEC5"
                      keyboardType="phone-pad"
                      maxLength={10}
                      returnKeyType="done"
                      blurOnSubmit={false}
                      onSubmitEditing={handleSendOtp}
                    />
                  </View>
                  {!!error && (
                    <View style={s.errorRow}>
                      <Icon name="alert-circle-outline" size={13} color="#E53935" />
                      <Text style={s.errorText}>{error}</Text>
                    </View>
                  )}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  style={[s.btn, loadingSend && s.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={loadingSend}
                  activeOpacity={0.85}>
                  <Text style={s.btnText}>
                    {loadingSend ? 'Sending OTP...' : 'Get OTP'}
                  </Text>
                  {!loadingSend && <Icon name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 6 }} />}
                </TouchableOpacity>

                {/* Terms */}
                <Text style={s.terms}>
                  By continuing, you agree to our{' '}
                  <Text style={s.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={s.termsLink}>Privacy Policy</Text>
                </Text>
              </>
            ) : (
              /* ── Step 2: OTP Verification ── */
              <>
                {/* Back button */}
                <TouchableOpacity style={s.backRow} onPress={handleBack}>
                  <Icon name="arrow-left" size={18} color="#1A237E" />
                  <Text style={s.backText}>Change Number</Text>
                </TouchableOpacity>

                <Text style={s.title}>Verify OTP</Text>
                <Text style={s.subtitle}>
                  6-digit OTP sent to{'\n'}
                  <Text style={s.highlightNum}>{sentMsg}</Text>
                </Text>

                {/* OTP Boxes */}
                <View style={s.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={r => (otpRefs.current[i] = r)}
                      style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={e => handleOtpKey(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectionColor="#1A237E"
                      blurOnSubmit={false}
                    />
                  ))}
                </View>

                {!!error && (
                  <View style={[s.errorRow, { marginBottom: 12 }]}>
                    <Icon name="alert-circle-outline" size={13} color="#E53935" />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {/* Resend */}
                <View style={s.resendRow}>
                  {timer > 0 ? (
                    <Text style={s.timerText}>
                      Resend OTP in{' '}
                      <Text style={s.timerCount}>0:{String(timer).padStart(2, '0')}</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResend}>
                      <Text style={s.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Demo hint */}
                <View style={s.hintBox}>
                  <Icon name="information-outline" size={13} color="#1A237E" />
                  <Text style={s.hintText}>Demo OTP: <Text style={s.hintBold}>123456</Text></Text>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[s.btn, (loadingVerify || otp.join('').length < OTP_LENGTH) && s.btnDisabled]}
                  onPress={handleVerify}
                  disabled={loadingVerify || otp.join('').length < OTP_LENGTH}
                  activeOpacity={0.85}>
                  <Text style={s.btnText}>
                    {loadingVerify ? 'Verifying...' : 'Verify & Login'}
                  </Text>
                  {!loadingVerify && <Icon name="shield-check-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <Text style={s.footer}>Secured by Nairaah  •  v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A237E',
  },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 36 : 20,
    paddingBottom: 28,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImg:       { width: 52, height: 52 },
  brandName:     { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  brandTagline:  { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4, letterSpacing: 0.4 },

  /* ── Scroll ── */
  scroll: {
    flexGrow: 1,
  },

  /* ── Card ── */
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: H * 0.62,
  },

  title:    { fontSize: 24, fontWeight: '800', color: '#1A237E', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#607D8B', marginBottom: 32, lineHeight: 22 },

  /* ── Input ── */
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#455A64', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  countryCode:     { paddingRight: 10 },
  countryCodeText: { fontSize: 14, fontWeight: '700', color: '#37474F' },
  divider:         { width: 1, height: 22, backgroundColor: '#CFD8DC', marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1C2B4A',
    height: '100%',
    letterSpacing: 1,
  },

  /* ── Error ── */
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  errorText: { fontSize: 12, color: '#E53935' },

  /* ── Button ── */
  btn: {
    backgroundColor: '#1A237E',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: { backgroundColor: '#90A4AE', shadowOpacity: 0, elevation: 0 },
  btnText:     { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },

  /* ── Terms ── */
  terms:     { textAlign: 'center', fontSize: 11, color: '#90A4AE', marginTop: 20, lineHeight: 18 },
  termsLink: { color: '#1A237E', fontWeight: '600' },

  /* ── Back ── */
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { fontSize: 13, color: '#1A237E', fontWeight: '600' },

  /* ── Highlight ── */
  highlightNum: { fontWeight: '800', color: '#1A237E' },

  /* ── OTP ── */
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  otpBox: {
    width: (W - 56 - 5 * 10) / 6,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    fontSize: 24,
    fontWeight: '800',
    color: '#1A237E',
    textAlign: 'center',
  },
  otpBoxFilled: {
    backgroundColor: '#E8EAF6',
    color: '#1A237E',
  },

  /* ── Resend ── */
  resendRow:  { alignItems: 'center', marginTop: 16, marginBottom: 16 },
  timerText:  { fontSize: 13, color: '#90A4AE' },
  timerCount: { color: '#1A237E', fontWeight: '700' },
  resendLink: { fontSize: 14, color: '#1A237E', fontWeight: '700' },

  /* ── Hint ── */
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF0FB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
  },
  hintText: { fontSize: 12, color: '#455A64' },
  hintBold: { fontWeight: '800', color: '#1A237E' },

  /* ── Footer ── */
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    paddingVertical: 16,
    backgroundColor: '#1A237E',
  },
});
