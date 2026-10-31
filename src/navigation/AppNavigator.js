import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, TouchableWithoutFeedback, Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen         from '../screens/SplashScreen';
import LoginScreen          from '../screens/LoginScreen';
import DashboardScreen      from '../screens/DashboardScreen';
import TeamScreen           from '../screens/TeamScreen';
import SalesHistoryScreen   from '../screens/SalesHistoryScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import AddMemberScreen      from '../screens/AddMemberScreen';
import CustomersScreen      from '../screens/CustomersScreen';
import CreateSaleScreen     from '../screens/CreateSaleScreen';
import CommissionScreen     from '../screens/CommissionScreen';
import ProductsScreen       from '../screens/ProductsScreen';
import BusinessPayoutScreen from '../screens/BusinessPayoutScreen';

import Icon, { Icons } from '../components/Icon';
import Sidebar from '../components/Sidebar';
import { colors, typography, elevation } from '../theme';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();
const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_W = SCREEN_W * 0.82;

// ── Custom Tab Bar ──────────────────────────────────────────
const TAB_CONFIG = [
  { name: 'Dashboard',      label: 'Dashboard',          icon: Icons.dashboard,  iconActive: Icons.dashboardActive },
  { name: 'Orders',         label: 'Orders',             icon: Icons.orders,     iconActive: Icons.ordersActive    },
  { name: 'Downline',       label: 'Downline',           icon: Icons.downline,   iconActive: Icons.downlineActive  },
  { name: 'BusinessPayout', label: 'Business &\nPayout', icon: Icons.payout,     iconActive: Icons.payoutActive    },
  { name: 'Profile',        label: 'Profile',            icon: Icons.profile,    iconActive: Icons.profileActive   },
];

function CustomTabBar({ state, navigation }) {
  return (
    <View style={tb.container}>
      {state.routes.map((route, index) => {
        const tab = TAB_CONFIG.find(t => t.name === route.name) || TAB_CONFIG[index];
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={tb.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}>
            {isFocused && <View style={tb.activeDot} />}
            <View style={[tb.iconWrap, isFocused && tb.iconWrapActive]}>
              <Icon
                name={isFocused ? tab.iconActive : tab.icon}
                size={22}
                color={isFocused ? colors.primary : colors.onSurfaceMuted}
              />
            </View>
            <Text style={[tb.label, isFocused && tb.labelActive]} numberOfLines={2}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  container: {
    flexDirection: 'row', backgroundColor: colors.surface,
    paddingBottom: 10, paddingTop: 6,
    borderTopWidth: 1, borderTopColor: colors.divider,
    ...elevation.level3,
  },
  tab:           { flex: 1, alignItems: 'center', paddingTop: 6 },
  activeDot:     { position: 'absolute', top: 0, width: 28, height: 3, backgroundColor: colors.primary, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  iconWrap:      { width: 40, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive:{ backgroundColor: colors.primaryContainer },
  label:         { ...typography.labelSmall, color: colors.onSurfaceMuted, marginTop: 2, textAlign: 'center', lineHeight: 13 },
  labelActive:   { color: colors.primary, fontWeight: '700' },
});

// ── Sidebar Context ─────────────────────────────────────────
export const SidebarContext = React.createContext({ openDrawer: () => {}, closeDrawer: () => {} });

// ── Custom Drawer Layout (no @react-navigation/drawer needed) ──
function DrawerLayout({ navigation }) {
  const slideAnim  = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  const openDrawer = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim,  { toValue: 0,   duration: 280, useNativeDriver: true }),
      Animated.timing(overlayAnim,{ toValue: 1,   duration: 280, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim,  { toValue: -DRAWER_W, duration: 260, useNativeDriver: true }),
      Animated.timing(overlayAnim,{ toValue: 0,         duration: 260, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [slideAnim, overlayAnim]);

  return (
    <SidebarContext.Provider value={{ openDrawer, closeDrawer }}>
      <View style={{ flex: 1 }}>
        {/* Main content — Bottom Tabs */}
        <MainTabs navigation={navigation} />

        {/* Overlay + Drawer on top */}
        {visible && (
          <>
            {/* Dim overlay */}
            <TouchableWithoutFeedback onPress={closeDrawer}>
              <Animated.View style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: '#000', opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
              ]} />
            </TouchableWithoutFeedback>

            {/* Sidebar panel */}
            <Animated.View style={[
              dw.drawer,
              { transform: [{ translateX: slideAnim }] },
            ]}>
              <Sidebar
                closeDrawer={closeDrawer}
                navigation={navigation}
                activeRoute="Dashboard"
              />
            </Animated.View>
          </>
        )}
      </View>
    </SidebarContext.Provider>
  );
}

const dw = StyleSheet.create({
  drawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: DRAWER_W,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 100,
  },
});

// ── Main Tabs ───────────────────────────────────────────────
function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={() => null}>
      <Tab.Screen name="Dashboard"      component={DashboardScreen} />
      <Tab.Screen name="Orders"         component={SalesHistoryScreen} />
      <Tab.Screen name="Downline"       component={TeamScreen} />
      <Tab.Screen name="BusinessPayout" component={BusinessPayoutScreen} />
      <Tab.Screen name="Profile"        component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Root Stack ──────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"   component={SplashScreen} />
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Main"     component={DrawerLayout} />

        {/* Full-screen stack screens */}
        <Stack.Screen name="AddMember"         component={AddMemberScreen} />
        <Stack.Screen name="Customers"         component={CustomersScreen} />
        <Stack.Screen name="CreateSale"        component={CreateSaleScreen} />
        <Stack.Screen name="CommissionHistory" component={CommissionScreen} />
        <Stack.Screen name="SalesHistory"      component={SalesHistoryScreen} />
        <Stack.Screen name="Products"          component={ProductsScreen} />
        <Stack.Screen name="PayoutHistory"     component={BusinessPayoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
