import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  StatusBar, Image, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography } from '../../themes';

const { width: W, height: H } = Dimensions.get('window');
const LOGO_SIZE   = Math.min(W * 0.32, 140);   // 32% of screen, max 140
const RING1_SIZE  = W * 0.80;                   // 80% of screen width
const RING2_SIZE  = W * 0.50;
const FOOTER_BOT  = H * 0.07;                   // 7% from bottom

// ── Brand gradient (matches theme primary colors) ──────────
const GRAD = ['#6B2A07', '#C0571C', '#EF8B61'];

export default function SplashScreen({ navigation }) {
  const fade   = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0.72)).current;
  const slideUp = useRef(new Animated.Value(28)).current;
  const tagFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1 — logo pops in
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
    ]).start(() => {
      // Step 2 — tagline slides up
      Animated.parallel([
        Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(tagFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    });

    const t = setTimeout(() => navigation.replace('Login'), 2800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Decorative rings */}
      <View style={[s.ring, { width: RING1_SIZE, height: RING1_SIZE, borderRadius: RING1_SIZE/2, opacity: 0.07 }]} />
      <View style={[s.ring, { width: RING2_SIZE, height: RING2_SIZE, borderRadius: RING2_SIZE/2, opacity: 0.10 }]} />

      {/* Logo box */}
      <Animated.View style={[s.logoWrap, { opacity: fade, transform: [{ scale }] }]}>
        <View style={s.logoCard}>
          <Image
            source={require('../../assets/images/nairaah_logo.png')}
            style={s.logoImg}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* App name + tagline */}
      <Animated.View style={[s.textBox, { opacity: tagFade, transform: [{ translateY: slideUp }] }]}>
        <Text style={s.appName}>nairaah</Text>
        <Text style={s.tagline}>Distribution Management Platform</Text>
      </Animated.View>

      {/* Bottom dots loader */}
      <Animated.View style={[s.footer, { opacity: tagFade }]}>
        <View style={s.dotRow}>
          <View style={[s.dot, s.dotActive]} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
        <Text style={s.version}>v1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Decorative rings
  ring: {
    position: 'absolute',
    borderRadius: 500,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: H * 0.035 },
  logoCard: {
    width: LOGO_SIZE, height: LOGO_SIZE,
    borderRadius: LOGO_SIZE * 0.26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    padding: LOGO_SIZE * 0.07,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45, shadowRadius: 24,
    elevation: 18,
  },
  logoImg: { width: LOGO_SIZE * 0.82, height: LOGO_SIZE * 0.82 },

  // Text
  textBox:  { alignItems: 'center' },
  appName:  {
    fontSize: Math.min(W * 0.088, 36), fontWeight: '900',
    color: '#FFFFFF', letterSpacing: 3,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.62)',
    letterSpacing: 0.5,
  },

  // Footer
  footer:  { position: 'absolute', bottom: FOOTER_BOT, alignItems: 'center' },
  dotRow:  { flexDirection: 'row', gap: 6, marginBottom: 12 },
  dot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 22, borderRadius: 4 },
  version: { fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
});
