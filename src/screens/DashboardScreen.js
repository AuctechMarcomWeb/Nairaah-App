import React, { useContext } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../theme';
import { SummaryCard, SectionHeader, StatusChip, Divider } from '../components';
import Icon, { Icons } from '../components/Icon';
import { SidebarContext } from '../navigation/AppNavigator';
import { distributor, dashboardStats, recentSales, recentCommissions, teamMembers } from '../data/mockData';

function RecentSaleRow({ item, onPress }) {
  const isDistributor = item.buyerType === 'Distributor';
  return (
    <TouchableOpacity style={saleRow.row} onPress={onPress} activeOpacity={0.7}>
      <View style={saleRow.iconBox}>
        <Icon
          name={isDistributor ? Icons.distributor : Icons.customer}
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={saleRow.info}>
        <Text style={saleRow.name}>{item.buyerName}</Text>
        <Text style={saleRow.sub}>{item.billNo} · {item.date}</Text>
      </View>
      <View style={saleRow.right}>
        <Text style={saleRow.amount}>₹{item.totalAmount.toLocaleString()}</Text>
        <StatusChip status={item.paymentStatus} />
      </View>
    </TouchableOpacity>
  );
}

const saleRow = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox:{
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  info:   { flex: 1 },
  name:   { ...typography.titleSmall, color: colors.onSurface },
  sub:    { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  right:  { alignItems: 'flex-end', gap: 4 },
  amount: { ...typography.titleSmall, color: colors.primary },
});

function RecentCommRow({ item }) {
  return (
    <View style={commRow.row}>
      <View style={commRow.iconBox}>
        <Icon name={Icons.commission} size={20} color={colors.success} />
      </View>
      <View style={commRow.info}>
        <Text style={commRow.name}>{item.fromName}</Text>
        <Text style={commRow.sub}>{item.level} · {item.percentage}% · {item.date}</Text>
      </View>
      <View style={commRow.right}>
        <Text style={commRow.amount}>₹{item.amount.toLocaleString()}</Text>
        <StatusChip status={item.status} />
      </View>
    </View>
  );
}

const commRow = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox:{
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: colors.successContainer, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  info:   { flex: 1 },
  name:   { ...typography.titleSmall, color: colors.onSurface },
  sub:    { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
  right:  { alignItems: 'flex-end', gap: 4 },
  amount: { ...typography.titleSmall, color: colors.success },
});

// Quick action config removed

export default function DashboardScreen({ navigation }) {
  const { openDrawer } = useContext(SidebarContext);

  const countAllDownline = (members) => {
    let count = members.length;
    members.forEach(m => {
      if (m.children && m.children.length > 0) count += countAllDownline(m.children);
    });
    return count;
  };

  const totalDownline      = countAllDownline(teamMembers);
  const directDistributors = teamMembers.length;

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Top Bar */}
      <View style={s.topBar}>
        {/* Hamburger — opens sidebar */}
        <TouchableOpacity
          style={s.menuBtn}
          onPress={openDrawer}>
          <Icon name="menu" size={26} color={colors.white} />
        </TouchableOpacity>
        {/* Logo */}
        <View style={s.topLogoWrap}>
          <Image
            source={require('../assets/images/nairaah_logo.png')}
            style={s.topLogoImg}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.greeting}>Good morning</Text>
          <Text style={s.userName}>{distributor.name}</Text>
          <Text style={s.userId}>ID: {distributor.id}</Text>
        </View>
        <TouchableOpacity
          style={s.avatarBox}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={s.avatarText}>{distributor.name.charAt(0)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          <SummaryCard
            label="Total Sales"
            value={`₹${(dashboardStats.totalSales / 1000).toFixed(0)}K`}
            iconName={Icons.sale}
            accentColor={colors.primary}
            containerColor={colors.primaryContainer}
          />
          <SummaryCard
            label="Total Commission"
            value={`₹${(dashboardStats.totalCommission / 1000).toFixed(1)}K`}
            iconName={Icons.commission}
            accentColor={colors.success}
            containerColor={colors.successContainer}
          />
          <SummaryCard
            label="Total Downline"
            value={totalDownline}
            iconName={Icons.downline}
            accentColor={colors.primary}
            containerColor={colors.primaryContainer}
          />
          <SummaryCard
            label="Direct Distributors"
            value={directDistributors}
            iconName={Icons.distributor}
            accentColor={colors.primaryLight}
            containerColor={colors.primaryContainer}
          />
          <SummaryCard
            label="Pending"
            value={`₹${dashboardStats.pendingCommission.toLocaleString()}`}
            iconName={Icons.pending}
            accentColor={colors.pending}
            containerColor={colors.pendingContainer}
          />
          <SummaryCard
            label="Paid Out"
            value={`₹${(dashboardStats.paidCommission / 1000).toFixed(1)}K`}
            iconName={Icons.paid}
            accentColor={colors.success}
            containerColor={colors.successContainer}
          />
        </View>

        {/* Recent Sales */}
        <View style={s.card}>
          <SectionHeader
            title="Recent Sales"
            actionLabel="See All"
            onAction={() => navigation.navigate('SalesHistory')}
          />
          {recentSales.map((item, i) => (
            <View key={item.id}>
              <RecentSaleRow item={item} onPress={() => navigation.navigate('SaleDetail', { sale: item })} />
              {i < recentSales.length - 1 && <Divider />}
            </View>
          ))}
        </View>

        {/* Recent Commission */}
        <View style={s.card}>
          <SectionHeader
            title="Recent Commission"
            actionLabel="See All"
            onAction={() => navigation.navigate('CommissionHistory')}
          />
          {recentCommissions.map((item, i) => (
            <View key={item.id}>
              <RecentCommRow item={item} />
              {i < recentCommissions.length - 1 && <Divider />}
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
  },
  menuBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  topLogoWrap: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  topLogoImg: { width: 38, height: 38 },
  greeting: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  userName: { ...typography.headlineSmall, color: colors.white, marginTop: 2 },
  userId:   { ...typography.bodySmall, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  avatarBox:{
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.white },

  scroll:     { padding: spacing.lg },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: 12, ...elevation.level1,
  },
});
