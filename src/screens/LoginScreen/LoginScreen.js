/**
 * LoginScreen.js — Login with userId & Password
 * Uses API from auth.js + Redux state management
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { loginWithPassword } from '../../api/auth';
import { setLoading, loginSuccess, loginError } from '../../redux/slice/userSlice';
import Icon from '../../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../themes';

const { height: H } = Dimensions.get('window');

export default function LoginScreen() {
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector(state => state.user);

  const [userId,       setUserId]       = useState('');
  const [password,     setPassword]     = useState('');
  const [localError,   setLocalError]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userFocused,  setUserFocused]  = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  const handleLogin = async () => {
    setLocalError('');
    if (!userId.trim())    { setLocalError('Please enter User ID');   return; }
    if (!password.trim())  { setLocalError('Please enter Password');  return; }

    try {
      dispatch(setLoading(true));
      const result = await loginWithPassword(userId, password);

      if (result.success) {
        await AsyncStorage.setItem('authToken',  result.token);
        await AsyncStorage.setItem('userData',   JSON.stringify(result.user));
        dispatch(loginSuccess({ token: result.token, user: result.user }));
      } else {
        dispatch(loginError(result.message || 'Login failed'));
      }
    } catch (err) {
      dispatch(loginError(err.message || 'Something went wrong'));
    }
  };

  const displayError = localError || reduxError;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Brand Header ── */}
        <View style={s.header}>
          {/* Decorative circles */}
          <View style={s.decCircle1} />
          <View style={s.decCircle2} />

          <View style={s.logoCircle}>
            <Image
              source={require('../../assets/images/nairaah_logo.png')}
              style={s.logoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={s.brandName}>nairaah</Text>
          <Text style={s.brandTagline}>Distribution Management Platform</Text>
        </View>

        {/* ── Form Card ── */}
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>

            {/* Card top accent bar */}
            <View style={s.accentBar} />

            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.subtitle}>Sign in to your distributor account</Text>

            {/* User ID */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>User ID</Text>
              <View style={[s.inputRow, userFocused && s.inputRowFocused]}>
                <Icon name="account-circle-outline" size={20} color={userFocused ? colors.primary : colors.onSurfaceMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={userId}
                  onChangeText={t => { setUserId(t); setLocalError(''); }}
                  placeholder="Enter your User ID"
                  placeholderTextColor={colors.onSurfaceMuted}
                  editable={!loading}
                  returnKeyType="next"
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Password</Text>
              <View style={[s.inputRow, passFocused && s.inputRowFocused]}>
                <Icon name="lock-outline" size={20} color={passFocused ? colors.primary : colors.onSurfaceMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={t => { setPassword(t); setLocalError(''); }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.onSurfaceMuted}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} disabled={loading}>
                  <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.onSurfaceMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {displayError ? (
              <View style={s.errorRow}>
                <Icon name="alert-circle-outline" size={15} color={colors.error} />
                <Text style={s.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={s.btnText}>Login</Text>
                  <Icon name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Support hint */}
            <View style={s.supportRow}>
              <Icon name="headset" size={14} color={colors.onSurfaceMuted} />
              <Text style={s.supportText}>
                Need help?{' '}
                <Text style={s.supportLink}>Contact support</Text>
              </Text>
            </View>
          </View>

          <Text style={s.footer}>Secured by Nairaah  •  v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,   // #C0571C
  },

  // ── Brand Header ──
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 32 : 20,
    paddingBottom: 32,
    overflow: 'hidden',
    position: 'relative',
  },

  // Decorative background circles
  decCircle1: {
    position: 'absolute',
    width: W * 0.45, height: W * 0.45, borderRadius: W * 0.225,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -W * 0.12, right: -W * 0.10,
  },
  decCircle2: {
    position: 'absolute',
    width: W * 0.30, height: W * 0.30, borderRadius: W * 0.15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: W * 0.05, left: -W * 0.08,
  },

  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  logoImg:     { width: 54, height: 54 },
  brandName:   { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5 },
  brandTagline:{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: 0.4 },

  // ── Scroll ──
  scroll: { flexGrow: 1 },

  // ── Card ──
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    minHeight: H * 0.60,
  },

  // Orange accent bar at top of card
  accentBar: {
    width: 48, height: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: 24,
  },

  title:    { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.onSurfaceMuted, marginBottom: 28, lineHeight: 22 },

  // ── Input ──
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 11, fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    height: 54,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  inputRowFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  input: {
    flex: 1,
    fontSize: 15, fontWeight: '500',
    color: colors.onSurface,
    height: '100%',
  },

  // ── Error ──
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: { fontSize: 13, color: colors.error, flex: 1 },

  // ── Button ──
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
    marginTop: 4,
  },
  btnDisabled: { backgroundColor: colors.onSurfaceMuted, shadowOpacity: 0, elevation: 0 },
  btnText:     { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },

  // ── Support ──
  supportRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  supportText: { fontSize: 12, color: colors.onSurfaceMuted },
  supportLink: { color: colors.primary, fontWeight: '700' },

  // ── Footer ──
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    paddingVertical: 18,
    backgroundColor: colors.primary,
  },
});
