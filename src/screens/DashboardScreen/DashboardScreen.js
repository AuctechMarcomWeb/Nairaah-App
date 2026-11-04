import React, { useState, useEffect, useCallback } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { colors, spacing, radius, elevation, typography } from '../../themes';

import {
  SummaryCard,
  SectionHeader,
  StatusChip,
  Divider,
} from '../../components';

import Icon, { Icons } from '../../components/Icon';
import { useDrawer } from '../../navigation/DrawerContext';
import { getDistributorDashboard } from '../../api/dashboard';
import { getMyOrders } from '../../api/orders';
import { getMyCommissionSummary } from '../../api/commission';

// ==============================
// Recent Sale Row
// ==============================

function RecentSaleRow({ item, onPress }) {
  const isDistributor = item.buyerType === 'Distributor' || item.buyerRole === 'Distributor';
  const buyerName = item.buyerName || item.buyerId?.name || 'Unknown';
  const amount = item.totalAmount || item.grandTotal || 0;
  const status = item.paymentStatus || item.status || 'Pending';
  const dateStr = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '');

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
        <Text style={saleRow.name}>{buyerName}</Text>
        <Text style={saleRow.sub}>
          {item.billNo || item.orderNumber || item._id?.slice(-6)} · {dateStr}
        </Text>
      </View>

      <View style={saleRow.right}>
        <Text style={saleRow.amount}>
          ₹{Number(amount).toLocaleString('en-IN')}
        </Text>
        <StatusChip status={status} />
      </View>
    </TouchableOpacity>
  );
}

const saleRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },

  sub: {
    ...typography.bodySmall,
    color: colors.onSurfaceMuted,
    marginTop: 2,
  },

  right: {
    alignItems: 'flex-end',
    gap: 4,
  },

  amount: {
    ...typography.titleSmall,
    color: colors.primary,
  },
});

// ==============================
// Recent Commission Row
// ==============================

function RecentCommRow({ item }) {
  const fromName = item.fromName || item.fromDistributorId?.name || 'Unknown';
  const level = item.level || item.levelLabel || '';
  const percentage = item.percentage || item.commissionPct || 0;
  const amount = item.amount || item.commissionAmount || 0;
  const status = item.status || 'Pending';
  const dateStr = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '');

  return (
    <View style={commRow.row}>
      <View style={commRow.iconBox}>
        <Icon name={Icons.commission} size={20} color={colors.success} />
      </View>

      <View style={commRow.info}>
        <Text style={commRow.name}>{fromName}</Text>
        <Text style={commRow.sub}>
          {level} · {percentage}% · {dateStr}
        </Text>
      </View>

      <View style={commRow.right}>
        <Text style={commRow.amount}>
          ₹{Number(amount).toLocaleString('en-IN')}
        </Text>
        <StatusChip status={status} />
      </View>
    </View>
  );
}

const commRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },

  sub: {
    ...typography.bodySmall,
    color: colors.onSurfaceMuted,
    marginTop: 2,
  },

  right: {
    alignItems: 'flex-end',
    gap: 4,
  },

  amount: {
    ...typography.titleSmall,
    color: colors.success,
  },
});

// ==============================
// Dashboard Screen
// ==============================

export default function DashboardScreen({ navigation }) {
  const { openDrawer } = useDrawer();
  const { user } = useSelector(state => state.user);

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [commSummary, setCommSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.name || user?.fullName || user?.userId || 'User';
  const displayId   = user?.userId || '-';

  const fetchDashboard = useCallback(async () => {
    if (!user?._id && !user?.userId) return;
    const id = user._id || user.userId;
    try {
      const [dashRes, ordersRes, commRes] = await Promise.all([
        getDistributorDashboard(id),
        getMyOrders('?limit=5'),
        getMyCommissionSummary(id),
      ]);
      if (dashRes.success) setStats(dashRes.data);
      if (ordersRes.success) setRecentOrders(ordersRes.data?.orders || ordersRes.data || []);
      if (commRes.success) setCommSummary(commRes.data);
    } catch (e) {
      console.error('[DASHBOARD] fetch error:', e);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchDashboard();
      setLoading(false);
    })();
  }, [fetchDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  // Helper: get greeting by time
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
        translucent={false}
      />

      <View style={styles.container}>
        {/* Top Header */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => openDrawer()}
            activeOpacity={0.7}
          >
            <Icon name="menu" size={26} color={colors.white} />
          </TouchableOpacity>

          {/* Logo */}

          <View style={styles.topLogoWrap}>
            <Image
              source={require('../../assets/images/nairaah_logo.png')}
              style={styles.topLogoImg}
              resizeMode="contain"
            />
          </View>

          {/* User Information */}

          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userId}>ID: {displayId}</Text>
          </View>

          {/* Profile */}

          <TouchableOpacity
            style={styles.avatarBox}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Scroll */}

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Statistics Grid */}

            <View style={styles.statsGrid}>
              <SummaryCard
                label="Total Sales"
                value={stats?.totalSales != null ? `₹${(stats.totalSales / 1000).toFixed(0)}K` : '—'}
                iconName={Icons.sale}
                accentColor={colors.primary}
                containerColor={colors.primaryContainer}
              />

              <SummaryCard
                label="Total Commission"
                value={commSummary?.totalCommission != null ? `₹${(commSummary.totalCommission / 1000).toFixed(1)}K` : '—'}
                iconName={Icons.commission}
                accentColor={colors.success}
                containerColor={colors.successContainer}
              />

              <SummaryCard
                label="Total Downline"
                value={stats?.totalDownline ?? '—'}
                iconName={Icons.downline}
                accentColor={colors.primary}
                containerColor={colors.primaryContainer}
              />

              <SummaryCard
                label="Direct Members"
                value={stats?.directMembers ?? '—'}
                iconName={Icons.distributor}
                accentColor={colors.primaryLight}
                containerColor={colors.primaryContainer}
              />

              <SummaryCard
                label="Pending"
                value={commSummary?.pendingCommission != null ? `₹${commSummary.pendingCommission.toLocaleString('en-IN')}` : '—'}
                iconName={Icons.pending}
                accentColor={colors.pending}
                containerColor={colors.pendingContainer}
              />

              <SummaryCard
                label="Paid Out"
                value={commSummary?.paidCommission != null ? `₹${(commSummary.paidCommission / 1000).toFixed(1)}K` : '—'}
                iconName={Icons.paid}
                accentColor={colors.success}
                containerColor={colors.successContainer}
              />
            </View>

            {/* Recent Orders */}

            <View style={styles.card}>
              <SectionHeader
                title="Recent Orders"
                actionLabel="See All"
                onAction={() => navigation.navigate('SalesHistory')}
              />

              {recentOrders.length === 0 ? (
                <Text style={styles.emptyText}>No recent orders</Text>
              ) : (
                recentOrders.map((item, index) => (
                  <View key={item._id || index}>
                    <RecentSaleRow
                      item={item}
                      onPress={() => navigation.navigate('SalesHistory')}
                    />
                    {index < recentOrders.length - 1 && <Divider />}
                  </View>
                ))
              )}
            </View>

            {/* Recent Commission */}

            {commSummary?.recentCommissions?.length > 0 && (
              <View style={styles.card}>
                <SectionHeader
                  title="Recent Commission"
                  actionLabel="See All"
                  onAction={() => navigation.navigate('Commission')}
                />

                {commSummary.recentCommissions.map((item, index) => (
                  <View key={item._id || index}>
                    <RecentCommRow item={item} />
                    {index < commSummary.recentCommissions.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==============================
// Dashboard Styles
// ==============================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topLogoWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  topLogoImg: {
    width: 38,
    height: 38,
  },

  userInfo: {
    flex: 1,
    marginLeft: 2,
  },

  greeting: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },

  userName: {
    ...typography.headlineSmall,
    color: colors.white,
    marginTop: 2,
  },

  userId: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },

  scroll: {
    padding: spacing.lg,
    paddingBottom: 30,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: 12,
    ...elevation.level1,
  },

  emptyText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
