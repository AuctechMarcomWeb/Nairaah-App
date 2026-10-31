import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, Divider, PickerModal } from '../../components';
import { customers, products } from '../../data/mockData';

const GST_RATE = 18;

export default function CreateSaleScreen({ navigation, route }) {
  const preProduct = route?.params?.preselectedProduct || null;

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cartItems, setCartItems] = useState(preProduct ? [{ product: preProduct, qty: 1 }] : []);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((s, i) => s + i.product.sellingPrice * i.qty, 0);
  const gstAmt = Math.round(subtotal * GST_RATE / 100);
  const total = subtotal + gstAmt;

  const addProduct = (product) => {
    const existing = cartItems.find(i => i.product.id === product.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCartItems([...cartItems, { product, qty: 1 }]);
    }
    setShowProductPicker(false);
  };

  const updateQty = (productId, delta) => {
    setCartItems(prev =>
      prev
        .map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0),
    );
  };

  const handleSubmit = () => {
    if (!selectedCustomer) { Alert.alert('Required', 'Please select a customer / distributor.'); return; }
    if (cartItems.length === 0) { Alert.alert('Required', 'Please add at least one product.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Sale Created ✅',
        `Bill created for ${selectedCustomer.name}\nTotal: ₹${total.toLocaleString()}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }, 1200);
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Create Sale" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Select Customer */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Select Customer / Distributor</Text>
          <TouchableOpacity
            style={[s.selectorBox, selectedCustomer && s.selectorBoxFilled]}
            onPress={() => setShowCustomerPicker(true)}>
            {selectedCustomer ? (
              <View style={s.selectorFilled}>
                <View style={s.selectorAvatar}>
                  <Text style={s.selectorAvatarText}>{selectedCustomer.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={s.selectorName}>{selectedCustomer.name}</Text>
                  <Text style={s.selectorSub}>{selectedCustomer.id} · {selectedCustomer.mobile}</Text>
                </View>
                <Text style={s.selectorChange}>Change</Text>
              </View>
            ) : (
              <View style={s.selectorEmpty}>
                <Text style={s.selectorIcon}>👤</Text>
                <Text style={s.selectorPlaceholder}>Tap to select customer</Text>
                <Text style={s.selectorArrow}>›</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Products Cart */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>Products</Text>
            <TouchableOpacity style={s.addProdBtn} onPress={() => setShowProductPicker(true)}>
              <Text style={s.addProdBtnText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          {cartItems.length === 0 ? (
            <View style={s.emptyCart}>
              <Text style={s.emptyCartIcon}>🛒</Text>
              <Text style={s.emptyCartText}>No products added</Text>
            </View>
          ) : (
            <>
              {/* Table Header */}
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 3 }]}>Product</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Amount</Text>
              </View>
              {cartItems.map((item, idx) => (
                <View key={item.product.id}>
                  <View style={s.tableRow}>
                    <View style={{ flex: 3 }}>
                      <Text style={s.tdName}>{item.product.name}</Text>
                      <Text style={s.tdPrice}>₹{item.product.sellingPrice.toLocaleString()}</Text>
                    </View>
                    <View style={[s.qtyControl, { flex: 1 }]}>
                      <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, -1)}>
                        <Text style={s.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.qtyVal}>{item.qty}</Text>
                      <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, 1)}>
                        <Text style={s.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[s.tdTotal, { flex: 2 }]}>
                      ₹{(item.product.sellingPrice * item.qty).toLocaleString()}
                    </Text>
                  </View>
                  {idx < cartItems.length - 1 && <Divider />}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Bill Summary */}
        {cartItems.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Bill Summary</Text>
            <View style={s.billRow}><Text style={s.billLabel}>Subtotal</Text><Text style={s.billVal}>₹{subtotal.toLocaleString()}</Text></View>
            <View style={s.billRow}><Text style={s.billLabel}>GST ({GST_RATE}%)</Text><Text style={s.billVal}>₹{gstAmt.toLocaleString()}</Text></View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={s.billRow}>
              <Text style={s.billTotalLabel}>Total Amount</Text>
              <Text style={s.billTotalVal}>₹{total.toLocaleString()}</Text>
            </View>
          </View>
        )}

        <PrimaryButton
          label="Submit Sale"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedCustomer || cartItems.length === 0}
          style={s.submitBtn}
        />

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Customer Picker Modal */}
      <PickerModal
        visible={showCustomerPicker}
        title="Select Customer / Distributor"
        items={customers}
        onSelect={(c) => { setSelectedCustomer(c); setShowCustomerPicker(false); }}
        onClose={() => setShowCustomerPicker(false)}
        renderItem={(item, onSelect) => (
          <TouchableOpacity style={s.pickerRow} onPress={onSelect}>
            <View style={s.pickerAvatar}><Text style={s.pickerAvatarText}>{item.name.charAt(0)}</Text></View>
            <View>
              <Text style={s.pickerName}>{item.name}</Text>
              <Text style={s.pickerSub}>{item.id} · {item.mobile}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Product Picker Modal */}
      <PickerModal
        visible={showProductPicker}
        title="Select Product"
        items={products.filter(p => p.inStock)}
        onSelect={addProduct}
        onClose={() => setShowProductPicker(false)}
        renderItem={(item, onSelect) => (
          <TouchableOpacity style={s.pickerRow} onPress={onSelect}>
            <View style={[s.pickerAvatar, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={{ fontSize: 22 }}>
                {item.category === 'Health' ? '💊' : item.category === 'Beauty' ? '✨' : '🥤'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.pickerName}>{item.name}</Text>
              <Text style={s.pickerSub}>₹{item.sellingPrice.toLocaleString()} · {item.unit}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface, marginBottom: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  addProdBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  addProdBtnText: { ...typography.labelLarge, color: colors.primary },

  selectorBox: {
    borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md,
    minHeight: 52, justifyContent: 'center', backgroundColor: colors.background,
  },
  selectorBoxFilled: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  selectorEmpty: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10 },
  selectorIcon: { fontSize: 20 },
  selectorPlaceholder: { ...typography.bodyLarge, color: colors.onSurfaceMuted, flex: 1 },
  selectorArrow: { fontSize: 22, color: colors.outline },
  selectorFilled: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10 },
  selectorAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  selectorAvatarText: { ...typography.titleMedium, color: colors.white },
  selectorName: { ...typography.titleSmall, color: colors.primaryDark },
  selectorSub: { ...typography.bodySmall, color: colors.primaryDark, marginTop: 2 },
  selectorChange: { ...typography.labelLarge, color: colors.primary, marginLeft: 'auto' },

  emptyCart: { alignItems: 'center', paddingVertical: 24 },
  emptyCartIcon: { fontSize: 36, marginBottom: 6 },
  emptyCartText: { ...typography.bodyMedium, color: colors.onSurfaceMuted },

  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: 4 },
  th: { ...typography.labelMedium, color: colors.onSurfaceMuted },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  tdName: { ...typography.titleSmall, color: colors.onSurface },
  tdPrice: { ...typography.bodySmall, color: colors.onSurfaceMuted },
  qtyControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: radius.sm,
    backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  qtyVal: { ...typography.titleSmall, color: colors.onSurface, minWidth: 18, textAlign: 'center' },
  tdTotal: { ...typography.titleSmall, color: colors.primary, textAlign: 'right' },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  billLabel: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  billVal: { ...typography.bodyMedium, color: colors.onSurface },
  billTotalLabel: { ...typography.titleMedium, color: colors.onSurface },
  billTotalVal: { ...typography.headlineSmall, color: colors.primary },

  submitBtn: { marginTop: 4 },

  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pickerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center',
  },
  pickerAvatarText: { ...typography.titleLarge, color: colors.primary },
  pickerName: { ...typography.titleSmall, color: colors.onSurface },
  pickerSub: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
});
