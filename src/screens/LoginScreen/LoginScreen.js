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
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { loginWithPassword } from '../../api/auth';
import {
  setLoading,
  loginSuccess,
  loginError,
} from '../../redux/slice/userSlice';
import Icon from '../../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector(state => state.user);

  const [userId, setUserId] = useState('Admin');
  const [password, setPassword] = useState('Admin@123');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLocalError('');

    // Validation
    if (!userId.trim()) {
      setLocalError('Please enter User ID');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter Password');
      return;
    }

    try {
      // 1️⃣ Set loading
      dispatch(setLoading(true));

      // 2️⃣ Call API
      const result = await loginWithPassword(userId, password);

      // 3️⃣ Handle response
      if (result.success) {
        // Save to AsyncStorage
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));

        // Update Redux
        dispatch(
          loginSuccess({
            token: result.token,
            user: result.user,
          }),
        );

        // Navigation happens automatically in RootNavigation
      } else {
        // API error
        dispatch(loginError(result.message || 'Login failed'));
      }
    } catch (err) {
      dispatch(loginError(err.message || 'Something went wrong'));
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        {/* ── Top Brand Header ── */}
        <View style={s.header}>
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
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <Text style={s.title}>Sign In</Text>
            <Text style={s.subtitle}>Enter your credentials to continue</Text>

            {/* User ID Input */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>User ID</Text>
              <View style={s.inputRow}>
                <Icon
                  name="account-circle-outline"
                  size={20}
                  color="#1A237E"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={s.input}
                  value={userId}
                  onChangeText={text => {
                    setUserId(text);
                    setLocalError('');
                  }}
                  placeholder="Enter User ID"
                  placeholderTextColor="#B0BEC5"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Password</Text>
              <View style={s.inputRow}>
                <Icon
                  name="lock-outline"
                  size={20}
                  color="#1A237E"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    setLocalError('');
                  }}
                  placeholder="Enter Password"
                  placeholderTextColor="#B0BEC5"
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#1A237E"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {(localError || reduxError) && (
              <View style={s.errorRow}>
                <Icon name="alert-circle-outline" size={16} color="#E53935" />
                <Text style={s.errorText}>{localError || reduxError}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={s.btnText}>Login</Text>
                  <Icon
                    name="arrow-right"
                    size={18}
                    color="#FFF"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>

       
            {/* Terms */}
            {/* <Text style={s.terms}>
              By continuing, you agree to our{' '}
              <Text style={s.termsLink}>Terms of Service</Text> and{' '}
              <Text style={s.termsLink}>Privacy Policy</Text>
            </Text> */}
          </View>

          {/* Footer */}
          <Text style={s.footer}>Secured by Nairaah • v1.0</Text>
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
  logoImg: { width: 52, height: 52 },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    letterSpacing: 0.4,
  },

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

  title: { fontSize: 24, fontWeight: '800', color: '#1A237E', marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    color: '#607D8B',
    marginBottom: 32,
    lineHeight: 22,
  },

  /* ── Input ── */
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#455A64',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C2B4A',
    height: '100%',
  },

  /* ── Error ── */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  errorText: { fontSize: 13, color: '#E53935', flex: 1 },

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
    marginBottom: 20,
  },
  btnDisabled: { backgroundColor: '#90A4AE', shadowOpacity: 0, elevation: 0 },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  /* ── Info Box ── */
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF0FB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 4,
  },
  infoText: { fontSize: 11, color: '#455A64', marginVertical: 2 },

  /* ── Terms ── */
  terms: {
    textAlign: 'center',
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 20,
    lineHeight: 18,
  },
  termsLink: { color: '#1A237E', fontWeight: '600' },

  /* ── Footer ── */
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    paddingVertical: 16,
    backgroundColor: '#1A237E',
  },
});
