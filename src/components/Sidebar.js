/**
 * Sidebar.js — Drawer sidebar for Nairaah
 * Orange brand theme
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, radius, spacing } from '../themes';
import Icon, { Icons } from './Icon';
import { LevelBadge } from './index';
import { logout } from '../redux/slice/userSlice';
import { clearCachedToken } from '../api/apiConfig';

// Deep dark-brown gradient — orange accents clearly visible on this
const SIDEBAR_GRAD = ['#1C0F09', '#2A1510', '#1C0F09'];

// Active nav highlight
const ACTIVE_BG   = 'rgba(192,87,28,0.30)';  // #C0571C at 30%
const ACTIVE_ICON = '#C0571C';                 // primary orange
const ACCENT      = '#EF8B61';                 // light orange for pip + avatar

// ── Nav items ───────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',              icon: 'view-dashboard-outline',   screen: 'Dashboard'     },
  { label: 'Add Distributor/Customer',icon: 'account-plus-outline',    screen: 'AddMember'     },
  { label: 'Orders',                 icon: 'receipt-outline',          screen: 'SalesHistory'  },
  { label: 'Team / Downline',        icon: 'account-group-outline',    screen: 'Team'          },
  { label: 'Earnings',               icon: 'cash-multiple',            screen: 'Commission'    },
  { label: 'My Commission',          icon: 'wallet-outline',           screen: 'Payout'        },
];

const QUICK_ITEMS = [
  { label: 'New Order',               icon: 'cart-plus',                screen: 'CreateSale'    },
  { label: 'Add Distributor/Customer',icon: 'account-plus-outline',    screen: 'AddMember'     },
  { label: 'Customers',               icon: 'account-multiple-outline', screen: 'Customers'     },
  { label: 'Products',                icon: 'package-variant-outline',  screen: 'Products'      },
  { label: 'My Profile',              icon: 'account-circle-outline',   screen: 'Profile'       },
  { label: 'Change Password',         icon: 'lock-reset',               screen: 'ChangePassword'},
  { label: 'Agreement',               icon: 'file-sign',                screen: 'Agreement'     },
  { label: 'Refund Policy',           icon: 'file-document-outline',    screen: 'RefundPolicy'  },
];

// ── Nav row ─────────────────────────────────────────────────
function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[ni.row, active && ni.rowActive]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={[ni.iconBox, active && ni.iconBoxActive]}>
        <Icon
          name={icon}
          size={20}
          color={active ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
        />
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
  rowActive:     { backgroundColor: ACTIVE_BG },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxActive: { backgroundColor: ACTIVE_ICON },
  label:         { ...typography.bodyMedium, color: 'rgba(255,255,255,0.65)', flex: 1, fontSize: 14 },
  labelActive:   { color: '#FFFFFF', fontWeight: '700' },
  activePip: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#EF8B61',
  },
});

// ── Section title ────────────────────────────────────────────
function SectionTitle({ label }) {
  return (
    <Text style={{
      fontSize: 10, fontWeight: '700',
      color: 'rgba(255,255,255,0.40)',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginLeft: 16, marginTop: 16, marginBottom: 6,
    }}>
      {label}
    </Text>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────
export default function Sidebar({ closeDrawer, navigation, activeRoute = 'Dashboard' }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);

  const displayName  = user?.name || user?.fullName || user?.userId || 'User';
  const displayId    = user?.userId || user?.distributorId || '-';
  const displayLevel = user?.level || null;

  const goTo = (screen) => { closeDrawer(); navigation.navigate(screen); };

  const handleLogout = async () => {
    closeDrawer();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    clearCachedToken();
    dispatch(logout());
  };

  return (
    <LinearGradient
      colors={SIDEBAR_GRAD}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={s.container}>

      {/* ── Profile Header ── */}
      <View style={s.profileHeader}>
        {/* Decorative rings */}
        <View style={s.bgRing1} />
        <View style={s.bgRing2} />

        {/* Logo + app name */}
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

        {/* User card */}
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

        {/* Stats shortcuts */}
        <View style={s.statsRow}>
          <TouchableOpacity style={s.statItem} onPress={() => goTo('BusinessPayout')} activeOpacity={0.7}>
            <Icon name="briefcase-outline" size={20} color="rgba(255,255,255,0.75)" />
            <Text style={s.statLab}>Business</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <TouchableOpacity style={s.statItem} onPress={() => goTo('Commission')} activeOpacity={0.7}>
            <Icon name="cash-multiple" size={20} color="rgba(255,255,255,0.75)" />
            <Text style={s.statLab}>Commission</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <TouchableOpacity style={s.statItem} onPress={() => goTo('Commission')} activeOpacity={0.7}>
            <Icon name="medal-outline" size={20} color="rgba(255,255,255,0.75)" />
            <Text style={s.statLab}>{displayLevel || 'My Level'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Nav Items + Logout + Contact — all inside scroll ── */}
      <ScrollView
        style={s.navScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>

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

        {/* ── Logout ── */}
        <View style={s.dividerLine} />
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={s.logoutIconBox}>
            <Icon name={Icons.logout} size={18} color="#FF6B6B" />
          </View>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ── Contact ── */}
        <View style={s.contactBox}>
          <View style={s.contactRow}>
            <Icon name="email-outline" size={13} color="rgba(255,255,255,0.45)" />
            <Text style={s.contactItem}>  info@nairaah.in</Text>
          </View>
          <View style={s.contactRow}>
            <Icon name="phone-outline" size={13} color="rgba(255,255,255,0.45)" />
            <Text style={s.contactItem}>  7007416905</Text>
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  // Profile header
  profileHeader: {
    paddingTop: 52, paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(192,87,28,0.4)',  // orange tint divider
    overflow: 'hidden',
  },
  bgRing1: {
    position: 'absolute', width: '55%', height: undefined, aspectRatio: 1, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(192,87,28,0.20)',
    top: -40, right: -30,
  },
  bgRing2: {
    position: 'absolute', width: '32%', height: undefined, aspectRatio: 1, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(239,139,97,0.12)',
    top: 30, left: -20,
  },

  logoRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoBox:  {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    padding: 3,
  },
  logoImg:  { width: 32, height: 32 },
  appName:  { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5 },
  appSub:   { fontSize: 10, color: 'rgba(255,255,255,0.50)', letterSpacing: 0.5 },

  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(192,87,28,0.20)',   // subtle orange tint
    borderRadius: 14, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(239,139,97,0.35)',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#C0571C',          // primary orange on dark bg
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#EF8B61',  // light orange ring
  },
  avatarLetter: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  userName:     { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  userId:       { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(192,87,28,0.18)',
    borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: 'rgba(239,139,97,0.25)',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statLab:     { fontSize: 10, color: 'rgba(255,255,255,0.60)', marginTop: 3 },
  statDivider: { width: 1, backgroundColor: 'rgba(239,139,97,0.30)', marginHorizontal: 4 },

  // Nav
  navScroll:   { flex: 1, paddingHorizontal: 8 },
  dividerLine: {
    height: 1, backgroundColor: 'rgba(192,87,28,0.30)',
    marginVertical: 8, marginHorizontal: 8,
  },

  // Logout — inside scroll
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 8, marginTop: 4, marginBottom: 4,
    padding: 14,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,107,107,0.22)',
  },
  logoutIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,107,107,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#FF6B6B' },

  // Contact — inside scroll
  contactBox: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(192,87,28,0.30)',
    marginTop: 4,
    gap: 6,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactItem: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
});
