import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen/DashboardScreen';
import TeamScreen from '../screens/TeamScreen/TeamScreen';
import SalesHistoryScreen from '../screens/SalesHistoryScreen/SalesHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import AddMemberScreen from '../screens/AddMemberScreen/AddMemberScreen';
import CustomersScreen from '../screens/CustomersScreen/CustomersScreen';
import CreateSaleScreen from '../screens/CreateSaleScreen/CreateSaleScreen';
import CommissionScreen from '../screens/CommissionScreen/CommissionScreen';
import ProductsScreen from '../screens/ProductsScreen/ProductsScreen';
import BusinessPayoutScreen from '../screens/BusinessPayoutScreen/BusinessPayoutScreen';
import { DrawerOverlay } from './DrawerOverlay';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Team" component={TeamScreen} />
        <Stack.Screen name="SalesHistory" component={SalesHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AddMember" component={AddMemberScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="CreateSale" component={CreateSaleScreen} />
        <Stack.Screen name="Commission" component={CommissionScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="BusinessPayout" component={BusinessPayoutScreen} />
      </Stack.Navigator>
      <DrawerOverlay />
    </>
  );
};

export default AuthNavigation;
