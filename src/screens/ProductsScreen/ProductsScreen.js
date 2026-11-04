import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, StatusChip, Divider, SearchBar } from '../../components';
import { getAllProducts } from '../../api/products';

const categories = ['All', 'Health', 'Beauty', 'Nutrition'];

function ProductCard({ item, onPress }) {
  const discount = Math.round(((item.mrp - item.sellingPrice) / item.mrp) * 100);
  return (
    <TouchableOpacity style={pc.card} onPress={onPress} activeOpacity={0.8}>
      <View style={pc.imageBox}>
        <Text style={pc.imageIcon}>
          {item.category === 'Health' ? '💊' : item.category === 'Beauty' ? '✨' : '🥤'}
        </Text>
        {!item.inStock && (
          <View style={pc.outOverlay}>
            <Text style={pc.outText}>Out of Stock</Text>
          </View>
        )}
        {discount > 0 && item.inStock && (
          <View style={pc.discountBadge}>
            <Text style={pc.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>
      <View style={pc.info}>
        <Text style={pc.category}>{item.category}</Text>
        <Text style={pc.name}>{item.name}</Text>
        <Text style={pc.desc} numberOfLines={1}>{item.description}</Text>
        <View style={pc.priceRow}>
          <Text style={pc.mrp}>MRP ₹{item.mrp.toLocaleString()}</Text>
          <Text style={pc.price}>₹{item.sellingPrice.toLocaleString()}</Text>
          <Text style={pc.unit}>/ {item.unit}</Text>
        </View>
        <StatusChip status={item.inStock ? 'Active' : 'Inactive'} />
      </View>
    </TouchableOpacity>
  );
}

const pc = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', marginBottom: 10, overflow: 'hidden',
    ...elevation.level1,
  },
  imageBox: {
    width: 90, backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  imageIcon: { fontSize: 38 },
  outOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  outText: { color: colors.white, ...typography.labelMedium },
  discountBadge: {
    position: 'absolute', top: 6, left: 0,
    backgroundColor: colors.error, paddingHorizontal: 6, paddingVertical: 2,
    borderTopRightRadius: 6, borderBottomRightRadius: 6,
  },
  discountText: { ...typography.labelSmall, color: colors.white },
  info: { flex: 1, padding: spacing.md },
  category: { ...typography.labelSmall, color: colors.primaryLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  name: { ...typography.titleSmall, color: colors.onSurface },
  desc: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 6 },
  mrp: { ...typography.bodySmall, color: colors.onSurfaceMuted, textDecorationLine: 'line-through' },
  price: { ...typography.titleSmall, color: colors.primary },
  unit: { ...typography.bodySmall, color: colors.onSurfaceMuted },
});

function DetailModal({ visible, product, onClose, onCreateSale }) {
  if (!product) return null;
  const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />
          <View style={dm.imageArea}>
            <Text style={dm.bigIcon}>
              {product.category === 'Health' ? '💊' : product.category === 'Beauty' ? '✨' : '🥤'}
            </Text>
            {discount > 0 && (
              <View style={dm.discountBig}>
                <Text style={dm.discountBigText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          <Text style={dm.category}>{product.category}</Text>
          <Text style={dm.name}>{product.name}</Text>
          <Text style={dm.desc}>{product.description}</Text>

          <Divider style={{ marginVertical: 14 }} />

          <View style={dm.priceRow}>
            <View style={dm.priceItem}>
              <Text style={dm.priceLabel}>MRP</Text>
              <Text style={dm.priceValMRP}>₹{product.mrp.toLocaleString()}</Text>
            </View>
            <View style={dm.priceDivider} />
            <View style={dm.priceItem}>
              <Text style={dm.priceLabel}>Selling Price</Text>
              <Text style={dm.priceVal}>₹{product.sellingPrice.toLocaleString()}</Text>
            </View>
            <View style={dm.priceDivider} />
            <View style={dm.priceItem}>
              <Text style={dm.priceLabel}>Saving</Text>
              <Text style={[dm.priceVal, { color: colors.success }]}>
                ₹{(product.mrp - product.sellingPrice).toLocaleString()}
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 14 }} />

          <View style={dm.metaRow}>
            <Text style={dm.metaLabel}>Product ID</Text>
            <Text style={dm.metaVal}>{product.id}</Text>
          </View>
          <View style={dm.metaRow}>
            <Text style={dm.metaLabel}>Unit</Text>
            <Text style={dm.metaVal}>Per {product.unit}</Text>
          </View>
          <View style={dm.metaRow}>
            <Text style={dm.metaLabel}>Status</Text>
            <StatusChip status={product.inStock ? 'Active' : 'Inactive'} />
          </View>

          <Divider style={{ marginVertical: 14 }} />

          {product.inStock && (
            <TouchableOpacity
              style={dm.saleBtn}
              onPress={() => { onClose(); onCreateSale(product); }}>
              <Text style={dm.saleBtnText}>➕  Create Sale with this Product</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={dm.closeBtn} onPress={onClose}>
            <Text style={dm.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.xl, paddingBottom: 40,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 16 },
  imageArea: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg, height: 100, marginBottom: 14, position: 'relative',
  },
  bigIcon: { fontSize: 52 },
  discountBig: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: colors.error, borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  discountBigText: { ...typography.labelSmall, color: colors.white },
  category: { ...typography.labelMedium, color: colors.primaryLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { ...typography.headlineMedium, color: colors.onSurface, marginTop: 2 },
  desc: { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginTop: 4, lineHeight: 20 },

  priceRow: { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: radius.lg, padding: spacing.lg },
  priceItem: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: colors.divider },
  priceLabel: { ...typography.labelSmall, color: colors.onSurfaceMuted },
  priceValMRP: { ...typography.titleSmall, color: colors.onSurfaceMuted, textDecorationLine: 'line-through', marginTop: 4 },
  priceVal: { ...typography.titleSmall, color: colors.primary, marginTop: 4 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  metaLabel: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  metaVal: { ...typography.titleSmall, color: colors.onSurface },

  saleBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  saleBtnText: { ...typography.titleSmall, color: colors.white },
  closeBtn: {
    height: 48, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.outline,
  },
  closeBtnText: { ...typography.titleSmall, color: colors.onSurfaceVariant },
});

export default function ProductsScreen({ navigation }) {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getAllProducts();
      if (res.success) {
        const list = (res.data?.products || res.data || []).map(p => ({
          ...p,
          id: p._id,
          name: p.name || p.productName || '',
          category: p.category?.name || p.categoryName || p.category || 'General',
          description: p.description || p.desc || '',
          mrp: p.mrp || p.MRP || 0,
          sellingPrice: p.sellingPrice || p.price || p.distributorPrice || 0,
          unit: p.unit || p.unitType || 'pc',
          inStock: p.inStock ?? (p.stock > 0) ?? true,
        }));
        setProductList(list);
        // Auto-build category filter from products
        const cats = ['All', ...new Set(list.map(p => p.category))];
        setCategories(cats);
      }
    } catch (e) {
      console.error('[PRODUCTS SCREEN] fetch error:', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    })();
  }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filtered = productList.filter(p => {
    const catOk = activeCategory === 'All' || p.category === activeCategory;
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Products" subtitle={`${productList.length} products`} />

      <View style={s.body}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." style={s.searchBox} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, activeCategory === cat && s.catChipActive]}
              onPress={() => setActiveCategory(cat)}>
              <Text style={[s.catChipText, activeCategory === cat && s.catChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {filtered.map(p => (
              <ProductCard key={p.id} item={p} onPress={() => { setSelected(p); setShowDetail(true); }} />
            ))}
            {filtered.length === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>📦</Text>
                <Text style={s.emptyText}>No products found</Text>
              </View>
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>

      <DetailModal
        visible={showDetail}
        product={selected}
        onClose={() => setShowDetail(false)}
        onCreateSale={(p) => navigation.navigate('CreateSale', { preselectedProduct: p })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg },
  searchBox: { marginBottom: 12 },
  catScroll: { marginBottom: 12, flexGrow: 0 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7, marginRight: 8,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { ...typography.labelLarge, color: colors.onSurfaceMuted },
  catChipTextActive: { color: colors.white },
  scroll: {},
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});
