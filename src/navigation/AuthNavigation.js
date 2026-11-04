import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── Screens ─────────────────────────────────────────────────────────────────
import DashboardScreen        from '../screens/DashboardScreen/DashboardScreen';
import TeamScreen             from '../screens/TeamScreen/TeamScreen';
import SalesHistoryScreen     from '../screens/SalesHistoryScreen/SalesHistoryScreen';
import ProfileScreen          from '../screens/ProfileScreen/ProfileScreen';
import AddMemberScreen        from '../screens/AddMemberScreen/AddMemberScreen';
import CustomersScreen        from '../screens/CustomersScreen/CustomersScreen';
import CreateSaleScreen       from '../screens/CreateSaleScreen/CreateSaleScreen';
import CommissionScreen       from '../screens/CommissionScreen/CommissionScreen';
import ProductsScreen         from '../screens/ProductsScreen/ProductsScreen';
import BusinessPayoutScreen   from '../screens/BusinessPayoutScreen/BusinessPayoutScreen';
import PayoutScreen           from '../screens/PayoutScreen/PayoutScreen';
import ChangePasswordScreen   from '../screens/ChangePasswordScreen/ChangePasswordScreen';
import AgreementScreen        from '../screens/AgreementScreen/AgreementScreen';
import RefundPolicyScreen     from '../screens/RefundPolicyScreen/RefundPolicyScreen';

import { DrawerOverlay } from './DrawerOverlay';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Core */}
        <Stack.Screen name="Dashboard"      component={DashboardScreen} />
        <Stack.Screen name="SalesHistory"   component={SalesHistoryScreen} />
        <Stack.Screen name="CreateSale"     component={CreateSaleScreen} />
        <Stack.Screen name="Team"           component={TeamScreen} />
        <Stack.Screen name="AddMember"      component={AddMemberScreen} />
        <Stack.Screen name="Customers"      component={CustomersScreen} />
        <Stack.Screen name="Products"       component={ProductsScreen} />

        {/* Commission & Earnings */}
        <Stack.Screen name="Commission"     component={CommissionScreen} />
        <Stack.Screen name="BusinessPayout" component={BusinessPayoutScreen} />
        <Stack.Screen name="Payout"         component={PayoutScreen} />

        {/* Profile */}
        <Stack.Screen name="Profile"        component={ProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

        {/* Policies & Agreement */}
        <Stack.Screen name="Agreement"      component={AgreementScreen} />
        <Stack.Screen name="RefundPolicy"   component={RefundPolicyScreen} />
      </Stack.Navigator>
      <DrawerOverlay />
    </>
  );
};

export default AuthNavigation;
