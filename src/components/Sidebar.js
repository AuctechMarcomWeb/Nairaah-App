/**
 * Sidebar.js — Drawer sidebar for Nairaah
 * Premium dark design with user profile header, nav items, and logout
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, radius, spacing } from '../themes';
import Icon, { Icons } from './Icon';
import { LevelBadge } from './index';
import { logout } from '../redux/slice/userSlice';
import { clearCachedToken } from '../api/apiConfig';

const { height: H } = Dimensions.get('window');

// ── Sidebar nav items ───────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',         icon: 'view-dashboard-outline',     screen: 'Dashboard'      },
  { label: 'Orders',            icon: 'receipt-outline',            screen: 'SalesHistory'   },
  { label: 'Team / Downline',   icon: 'account-group-outline',      screen: 'Team'           },
  { label: 'Business & Payout', icon: 'briefcase-outline',          screen: 'BusinessPayout' },
  { label: 'Payout History',    icon: 'wallet-outline',             screen: 'Payout'         },
  { label: 'My Profile',        icon: 'account-circle-outline',     screen: 'Profile'        },
];

const QUICK_ITEMS = [
  { label: 'New Order',         icon: 'cart-plus',                  screen: 'CreateSale'     },
  { label: 'Add Distributor/Customer', icon: 'account-plus-outline', screen: 'AddMember'    },
  { label: 'Customers',         icon: 'account-multiple-outline',   screen: 'Customers'      },
  { label: 'Products',          icon: 'package-variant-outline',    screen: 'Products'       },
  { label: 'Commission',        icon: 'cash-multiple',              screen: 'Commission'     },
  { label: 'Change Password',   icon: 'lock-reset',                 screen: 'ChangePassword' },
  { label: 'Agreement',         icon: 'file-sign',                  screen: 'Agreement'      },
  { label: 'Refund Policy',     icon: 'file-document-outline',      screen: 'RefundPolicy'   },
];

// ── Nav row ─────────────────────────────────────────────────
function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[ni.row, active && ni.rowActive]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={[ni.iconBox, active && ni.iconBoxActive]}>
        <Icon name={icon} size={20} color={active ? '#FFFFFF' : 'rgba(255,255,255,0.55)'} />
      </View>
      <Text style={[ni.label, active && ni.labelActive]}>{label}</Text>
      {active && <View style={ni.activePip} />}
    </TouchableOpacity>
  );
}

const ni = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 16,
    borderRadius: 14, marginBottom: 2,
  },
  rowActive: { backgroundColor: 'rgba(108,99,255,0.22)' },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxActive: { backgroundColor: '#6C63FF' },
  label: { ...typography.bodyMedium, color: 'rgba(255,255,255,0.65)', flex: 1, fontSize: 14 },
  labelActive: { color: '#FFFFFF', fontWeight: '700' },
  activePip: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#6C63FF',
  },
});

// ── Section title ────────────────────────────────────────────
function SectionTitle({ label }) {
  return (
    <Text style={{
      fontSize: 10, fontWeight: '700',
      color: 'rgba(255,255,255,0.35)',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginLeft: 16, marginTop: 16, marginBottom: 6,
    }}>
      {label}
    </Text>
  );
}

// ══════════════════════════════════════════════════════════
//  Main Sidebar Component
// ══════════════════════════════════════════════════════════
export default function Sidebar({ closeDrawer, navigation, activeRoute = 'Dashboard' }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);

  const displayName = user?.name || user?.fullName || user?.userId || 'User';
  const displayId   = user?.userId || user?.distributorId || '-';
  const displayLevel = user?.level || null;

  const goTo = (screen) => {
    closeDrawer();
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    closeDrawer();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    clearCachedToken();
    dispatch(logout()); // RootNavigation auto switches to UnauthNavigation
  };

  return (
    <LinearGradient
      colors={['#0F0C29', '#302B63', '#24243E']}
      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      style={s.container}>

      {/* ── Profile Header ── */}
      <View style={s.profileHeader}>
        {/* Decorative ring */}
        <View style={s.bgRing} />

        <View style={s.logoRow}>
          <View style={s.logoBox}>
            <Image
              source={require('../assets/images/nairaah_logo.png')}
              style={s.logoImg}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.appName}>nairaah</Text>
            <Text style={s.appSub}>Distributor Portal</Text>
          </View>
        </View>

        {/* User info */}
        <View style={s.userCard}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.userName}>{displayName}</Text>
            <Text style={s.userId}>{displayId}</Text>
            {displayLevel && (
              <View style={{ marginTop: 5 }}>
                <LevelBadge level={displayLevel} size="sm" />
              </View>
            )}
          </View>
        </View>

        {/* Stats row — placeholder, replaced with real data from dashboard */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Icon name="briefcase-outline" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={s.statLab}>Business</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Icon name="cash-multiple" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={s.statLab}>Commission</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Icon name="medal-outline" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={s.statLab}>{displayLevel || 'My Level'}</Text>
          </View>
        </View>
      </View>

      {/* ── Nav Items ── */}
      <ScrollView
        style={s.navScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}>

        <SectionTitle label="Main Menu" />
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.screen}
            icon={item.icon}
            label={item.label}
            active={activeRoute === item.screen}
            onPress={() => goTo(item.screen)}
          />
        ))}

        <View style={s.dividerLine} />

        <SectionTitle label="Quick Actions" />
        {QUICK_ITEMS.map(item => (
          <NavItem
            key={item.screen}
            icon={item.icon}
            label={item.label}
            active={false}
            onPress={() => goTo(item.screen)}
          />
        ))}
      </ScrollView>

      {/* ── Footer: Logout ── */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <View style={s.logoutIconBox}>
          <Icon name={Icons.logout} size={18} color="#FF6B6B" />
        </View>
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// ── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },

  // Profile header
  profileHeader: {
    paddingTop: 52, paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  bgRing: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    top: -60, right: -60,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    padding: 3,
  },
  logoImg:  { width: 32, height: 32 },
  appName:  { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5 },
  appSub:   { fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 },

  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#6C63FF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLetter: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  userId:   { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statVal:     { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  statLab:     { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 4 },

  // Nav
  navScroll: { flex: 1, paddingHorizontal: 8 },
  dividerLine: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8, marginHorizontal: 8,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, padding: 14,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)',
  },
  logoutIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,107,107,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#FF6B6B' },
});
