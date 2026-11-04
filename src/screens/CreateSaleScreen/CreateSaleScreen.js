import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, Divider, PickerModal } from '../../components';
import { getAllProducts } from '../../api/products';
import { getMySponsoredUsers } from '../../api/team';
import { placeOrder } from '../../api/orders';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = ['COD', 'Online', 'UPI', 'Wallet'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtMoney = (v) => `₹${(Number(v) || 0).toLocaleString('en-IN')}`;

function derivePaymentStatus(paid, total) {
  if (paid <= 0)         return 'Pending';
  if (paid >= total)     return 'Paid';
  return 'Partial';
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <View style={sc.card}>
      <Text style={sc.title}>{title}</Text>
      {children}
    </View>
  );
}
const sc = StyleSheet.create({
  card:  { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  title: { ...typography.titleMedium, color: colors.onSurface, marginBottom: spacing.md },
});

// ─── Labeled Input ────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fld.wrap}>
      <Text style={fld.label}>{label}{required ? <Text style={{ color: colors.error }}> *</Text> : ''}</Text>
      <TextInput
        style={[fld.input, focused && fld.focused, multiline && fld.multi]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={colors.onSurfaceMuted}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}
const fld = StyleSheet.create({
  wrap:   { marginBottom: spacing.md },
  label:  { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 5 },
  input:  { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48, ...typography.bodyLarge, color: colors.onSurface, backgroundColor: colors.background },
  focused:{ borderColor: colors.primary, backgroundColor: colors.surface },
  multi:  { height: 72, paddingTop: 12 },
});

// ─── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ visible, order, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={succ.overlay}>
        <View style={succ.card}>
          <Text style={succ.icon}>✅</Text>
          <Text style={succ.title}>Order Placed!</Text>
          {order ? (
            <>
              <Text style={succ.sub}>{order.orderNumber || 'Order created successfully'}</Text>
              <Text style={succ.amt}>{fmtMoney(order.totalAmount)}</Text>
            </>
          ) : null}
          <TouchableOpacity style={succ.btn} onPress={onClose}>
            <Text style={succ.btnTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const succ = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  card:    { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 32, alignItems: 'center', width: '80%', ...elevation.level3 },
  icon:    { fontSize: 52, marginBottom: 8 },
  title:   { ...typography.headlineSmall, color: colors.onSurface, marginBottom: 6 },
  sub:     { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginBottom: 4 },
  amt:     { ...typography.headlineMedium, color: colors.primary, fontWeight: '800', marginBottom: 20 },
  btn:     { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: 40, paddingVertical: 13 },
  btnTxt:  { ...typography.titleMedium, color: colors.white },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function CreateSaleScreen({ navigation, route }) {
  const { user } = useSelector(state => state.user);
  const preProduct = route?.params?.preselectedProduct || null;

  // Data
  const [productList,   setProductList]   = useState([]);
  const [customerList,  setCustomerList]  = useState([]);
  const [dataLoading,   setDataLoading]   = useState(true);

  // Buyer
  const [buyerType,     setBuyerType]     = useState('Customer');   // Customer | Distributor
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  // Cart
  const [cartItems,     setCartItems]     = useState(
    preProduct ? [{ product: { ...preProduct, id: preProduct._id || preProduct.id }, qty: 1 }] : []
  );

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paidAmount,    setPaidAmount]    = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Shipping address
  const [shippingName,    setShippingName]    = useState('');
  const [shippingPhone,   setShippingPhone]   = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity,    setShippingCity]    = useState('');
  const [shippingState,   setShippingState]   = useState('');
  const [shippingPincode, setShippingPincode] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  // UI
  const [showBuyerPicker,   setShowBuyerPicker]   = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [successModal,      setSuccessModal]       = useState({ open: false, order: null });

  // ── Fetch products + sponsored users ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const sponsorId = user?._id || user?.userId;
    try {
      const [prodRes, custRes] = await Promise.all([
        getAllProducts(),
        getMySponsoredUsers(sponsorId, buyerType),
      ]);
      if (prodRes.success) {
        setProductList(
          (prodRes.data?.products || prodRes.data || []).map(p => ({
            ...p,
            id: p._id,
            name: p.name || p.productName || '',
            category: p.category?.name || p.category || 'General',
            sellingPrice:     p.sellingPrice     || p.price || 0,
            distributorPrice: p.distributorPrice || p.sellingPrice || p.price || 0,
            unit:    p.unit    || 'pc',
            inStock: p.inStock ?? (p.stock > 0) ?? true,
          }))
        );
      }
      if (custRes.success) {
        setCustomerList(
          (custRes.data?.users || custRes.data || []).map(c => ({
            ...c,
            id: c._id,
            name:   c.name   || c.fullName || c.userId || 'Unknown',
            mobile: c.mobile || c.phone    || '-',
          }))
        );
      }
    } catch (e) {
      console.error('[CREATE SALE] fetch error:', e);
    } finally {
      setDataLoading(false);
    }
  }, [user, buyerType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When buyer type changes, re-fetch customer list and reset selection
  useEffect(() => {
    setSelectedBuyer(null);
    setCustomerList([]);
    setDataLoading(true);
    fetchData();
  }, [buyerType]);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const unitPrice = (product) =>
    buyerType === 'Distributor' ? product.distributorPrice : product.sellingPrice;

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
      prev.map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    );
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((s, i) => s + unitPrice(i.product) * i.qty, 0);
  const total    = subtotal;   // No GST — same as admin (admin uses subtotal = totalAmount)
  const paid     = Number(paidAmount) || 0;
  const due      = Math.max(0, total - paid);
  const payStatus = derivePaymentStatus(paid, total);

  // Auto-fill paid amount when cart changes (user can edit down)
  useEffect(() => {
    setPaidAmount(String(total));
  }, [total]);

  // Auto-fill shipping from buyer
  const fillShippingFromBuyer = () => {
    if (!selectedBuyer) return;
    setShippingName(selectedBuyer.name || '');
    setShippingPhone(selectedBuyer.mobile || '');
    setShippingAddress(selectedBuyer.address || '');
    setShippingCity(selectedBuyer.city || '');
    setShippingState(selectedBuyer.state || '');
    setShippingPincode(selectedBuyer.pincode || '');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedBuyer)          { Alert.alert('Required', 'Please select a buyer.'); return; }
    if (cartItems.length === 0)  { Alert.alert('Required', 'Please add at least one product.'); return; }
    if (paymentMethod === 'Online' || paymentMethod === 'UPI') {
      if (!transactionId.trim()) { Alert.alert('Required', 'Please enter Transaction ID for online payment.'); return; }
    }

    setLoading(true);
    try {
      const itemsPayload = cartItems.map(i => ({
        productId:  i.product._id || i.product.id,
        quantity:   i.qty,
        unitPrice:  unitPrice(i.product),
        totalPrice: unitPrice(i.product) * i.qty,
      }));

      const payload = {
        buyer:         selectedBuyer._id || selectedBuyer.id,
        buyerType,
        items:         itemsPayload,
        subtotal,
        discount:      0,
        totalAmount:   total,
        paidAmount:    paid,
        paymentStatus: payStatus,
        paymentMethod,
        ...(transactionId.trim() && { transactionId: transactionId.trim(), paymentId: transactionId.trim() }),
        notes: notes.trim() || '',
        shippingAddress: {
          name:    shippingName.trim()    || selectedBuyer.name  || '',
          phone:   shippingPhone.trim()   || selectedBuyer.mobile || '',
          address: shippingAddress.trim() || '',
          city:    shippingCity.trim()    || '',
          state:   shippingState.trim()   || '',
          pincode: shippingPincode.trim() || '',
          country: 'India',
        },
      };

      const res = await placeOrder(payload);
      if (res.success) {
        setSuccessModal({ open: true, order: res.data });
      } else {
        Alert.alert('Error', res.message || 'Failed to place order');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBuyer(null);
    setCartItems([]);
    setPaymentMethod('COD');
    setPaidAmount('');
    setTransactionId('');
    setShippingName(''); setShippingPhone(''); setShippingAddress('');
    setShippingCity(''); setShippingState(''); setShippingPincode('');
    setNotes('');
  };

  // ── Filtered products ───────────────────────────────────────────────────────
  const availableProducts = productList.filter(p => p.inStock);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
        <AppHeader title="Create Sale" onBack={() => navigation.goBack()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled">

          {/* ── Buyer Type ─────────────────────────────────────────────────── */}
          <SectionCard title="Buyer Type">
            <View style={s.toggleRow}>
              {['Customer', 'Distributor'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.toggleBtn, buyerType === t && s.toggleBtnActive]}
                  onPress={() => setBuyerType(t)}>
                  <Text style={[s.toggleTxt, buyerType === t && s.toggleTxtActive]}>
                    {t === 'Customer' ? '👤' : '🤝'}  {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* ── Select Buyer ──────────────────────────────────────────────── */}
          <SectionCard title={`Select ${buyerType}`}>
            {dataLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <TouchableOpacity
                style={[s.selectorBox, selectedBuyer && s.selectorBoxFilled]}
                onPress={() => setShowBuyerPicker(true)}>
                {selectedBuyer ? (
                  <View style={s.selectorFilled}>
                    <View style={s.selectorAvatar}>
                      <Text style={s.selectorAvatarTxt}>{selectedBuyer.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.selectorName}>{selectedBuyer.name}</Text>
                      <Text style={s.selectorSub}>{selectedBuyer.userId || selectedBuyer.id}  ·  {selectedBuyer.mobile}</Text>
                    </View>
                    <Text style={s.changeBtn}>Change</Text>
                  </View>
                ) : (
                  <View style={s.selectorEmpty}>
                    <Text style={s.selectorIcon}>👤</Text>
                    <Text style={s.selectorPlaceholder}>Tap to select {buyerType.toLowerCase()}</Text>
                    <Text style={s.selectorArrow}>›</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </SectionCard>

          {/* ── Products ──────────────────────────────────────────────────── */}
          <SectionCard title="Products">
            <View style={s.cardHeaderRow}>
              <View />
              <TouchableOpacity style={s.addProdBtn} onPress={() => setShowProductPicker(true)}>
                <Text style={s.addProdTxt}>+ Add Product</Text>
              </TouchableOpacity>
            </View>
            {cartItems.length === 0 ? (
              <View style={s.emptyCart}>
                <Text style={s.emptyCartIcon}>🛒</Text>
                <Text style={s.emptyCartTxt}>No products added</Text>
              </View>
            ) : (
              <>
                <View style={s.tableHeader}>
                  <Text style={[s.th, { flex: 3 }]}>Product</Text>
                  <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                  <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Amount</Text>
                </View>
                {cartItems.map((item, idx) => (
                  <View key={item.product.id}>
                    <View style={s.tableRow}>
                      <View style={{ flex: 3 }}>
                        <Text style={s.tdName} numberOfLines={2}>{item.product.name}</Text>
                        <Text style={s.tdPrice}>{fmtMoney(unitPrice(item.product))}</Text>
                      </View>
                      <View style={[s.qtyControl, { flex: 1 }]}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, -1)}>
                          <Text style={s.qtyBtnTxt}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.qtyVal}>{item.qty}</Text>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, 1)}>
                          <Text style={s.qtyBtnTxt}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[s.tdTotal, { flex: 2 }]}>
                        {fmtMoney(unitPrice(item.product) * item.qty)}
                      </Text>
                    </View>
                    {idx < cartItems.length - 1 && <Divider />}
                  </View>
                ))}
              </>
            )}
          </SectionCard>

          {/* ── Bill Summary ──────────────────────────────────────────────── */}
          {cartItems.length > 0 && (
            <SectionCard title="Bill Summary">
              <View style={s.billRow}>
                <Text style={s.billLabel}>Subtotal</Text>
                <Text style={s.billVal}>{fmtMoney(subtotal)}</Text>
              </View>
              <Divider style={{ marginVertical: 8 }} />
              <View style={s.billRow}>
                <Text style={s.billTotalLabel}>Total Amount</Text>
                <Text style={s.billTotalVal}>{fmtMoney(total)}</Text>
              </View>
            </SectionCard>
          )}

          {/* ── Payment ───────────────────────────────────────────────────── */}
          <SectionCard title="Payment">
            {/* Payment method */}
            <Text style={s.fieldLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <View style={s.pmRow}>
                {PAYMENT_METHODS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[s.pmBtn, paymentMethod === m && s.pmBtnActive]}
                    onPress={() => setPaymentMethod(m)}>
                    <Text style={[s.pmTxt, paymentMethod === m && s.pmTxtActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Paid amount */}
            <View style={s.fieldLabel && { marginBottom: 4 }}>
              <Text style={s.fieldLabel}>Paid Amount</Text>
            </View>
            <TextInput
              style={s.amtInput}
              value={paidAmount}
              onChangeText={(v) => setPaidAmount(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder={`Max: ${fmtMoney(total)}`}
              placeholderTextColor={colors.onSurfaceMuted}
            />
            {/* Payment status preview */}
            <View style={[s.payStatusRow]}>
              <Text style={s.payStatusLabel}>Payment Status:</Text>
              <View style={[s.payStatusChip, {
                backgroundColor:
                  payStatus === 'Paid'    ? colors.successContainer :
                  payStatus === 'Partial' ? colors.warningContainer :
                  colors.pendingContainer,
              }]}>
                <Text style={[s.payStatusTxt, {
                  color:
                    payStatus === 'Paid'    ? colors.success :
                    payStatus === 'Partial' ? colors.warning :
                    colors.pending,
                }]}>{payStatus}</Text>
              </View>
              {due > 0 && <Text style={s.dueLabel}>Due: {fmtMoney(due)}</Text>}
            </View>

            {/* Transaction ID (Online / UPI) */}
            {(paymentMethod === 'Online' || paymentMethod === 'UPI') && (
              <Field
                label="Transaction ID"
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Enter transaction ID"
                required
              />
            )}
          </SectionCard>

          {/* ── Shipping Address ──────────────────────────────────────────── */}
          <SectionCard title="Shipping Address">
            <View style={s.sameAsBuyerRow}>
              <TouchableOpacity style={s.sameBtn} onPress={fillShippingFromBuyer} disabled={!selectedBuyer}>
                <Text style={[s.sameBtnTxt, !selectedBuyer && { opacity: 0.4 }]}>↪ Same as Buyer Details</Text>
              </TouchableOpacity>
            </View>
            <View style={s.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="Name"  value={shippingName}  onChangeText={setShippingName}  placeholder="Recipient name" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="Phone" value={shippingPhone} onChangeText={setShippingPhone} placeholder="Mobile no." keyboardType="phone-pad" />
              </View>
            </View>
            <Field label="Address" value={shippingAddress} onChangeText={setShippingAddress} placeholder="House no., Street, Locality" multiline />
            <View style={s.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="City"    value={shippingCity}    onChangeText={setShippingCity}    placeholder="City" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="State"   value={shippingState}   onChangeText={setShippingState}   placeholder="State" />
              </View>
            </View>
            <Field label="Pincode" value={shippingPincode} onChangeText={setShippingPincode} placeholder="6-digit pincode" keyboardType="numeric" />
          </SectionCard>

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <SectionCard title="Notes (Optional)">
            <Field
              label=""
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any order notes..."
              multiline
            />
          </SectionCard>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <PrimaryButton
            label="Place Order"
            onPress={handleSubmit}
            loading={loading}
            disabled={!selectedBuyer || cartItems.length === 0}
            style={{ marginTop: 4 }}
          />
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── Buyer Picker Modal ─────────────────────────────────────────── */}
        <PickerModal
          visible={showBuyerPicker}
          title={`Select ${buyerType}`}
          items={customerList}
          onSelect={(c) => { setSelectedBuyer(c); setShowBuyerPicker(false); }}
          onClose={() => setShowBuyerPicker(false)}
          renderItem={(item, onSelect) => (
            <TouchableOpacity style={s.pickerRow} onPress={onSelect}>
              <View style={s.pickerAvatar}>
                <Text style={s.pickerAvatarTxt}>{(item.name || 'U').charAt(0)}</Text>
              </View>
              <View>
                <Text style={s.pickerName}>{item.name}</Text>
                <Text style={s.pickerSub}>{item.userId || item.id}  ·  {item.mobile}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* ── Product Picker Modal ───────────────────────────────────────── */}
        <PickerModal
          visible={showProductPicker}
          title="Select Product"
          items={availableProducts}
          onSelect={addProduct}
          onClose={() => setShowProductPicker(false)}
          renderItem={(item, onSelect) => (
            <TouchableOpacity style={s.pickerRow} onPress={onSelect}>
              <View style={[s.pickerAvatar, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={{ fontSize: 22 }}>🛍️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.pickerName}>{item.name}</Text>
                <Text style={s.pickerSub}>
                  {buyerType === 'Distributor' ? fmtMoney(item.distributorPrice) : fmtMoney(item.sellingPrice)}  ·  {item.unit}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* ── Success Modal ──────────────────────────────────────────────── */}
        <SuccessModal
          visible={successModal.open}
          order={successModal.order}
          onClose={() => {
            setSuccessModal({ open: false, order: null });
            resetForm();
            navigation.goBack();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.lg },

  toggleRow:     { flexDirection: 'row', gap: spacing.md },
  toggleBtn:     { flex: 1, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', backgroundColor: colors.background },
  toggleBtnActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  toggleTxt:     { ...typography.labelLarge, color: colors.onSurfaceMuted },
  toggleTxtActive: { color: colors.primary, fontWeight: '700' },

  selectorBox:   { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, minHeight: 52, justifyContent: 'center', backgroundColor: colors.background },
  selectorBoxFilled: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  selectorEmpty: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10 },
  selectorIcon:  { fontSize: 20 },
  selectorPlaceholder: { ...typography.bodyLarge, color: colors.onSurfaceMuted, flex: 1 },
  selectorArrow: { fontSize: 22, color: colors.outline },
  selectorFilled:{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10 },
  selectorAvatar:{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  selectorAvatarTxt: { ...typography.titleMedium, color: colors.white },
  selectorName:  { ...typography.titleSmall, color: colors.primaryDark },
  selectorSub:   { ...typography.bodySmall,  color: colors.primaryDark, marginTop: 2 },
  changeBtn:     { ...typography.labelLarge, color: colors.primary, marginLeft: 'auto' },

  cardHeaderRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm },
  addProdBtn:    { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  addProdTxt:    { ...typography.labelLarge, color: colors.primary },

  emptyCart:    { alignItems: 'center', paddingVertical: 20 },
  emptyCartIcon:{ fontSize: 36, marginBottom: 4 },
  emptyCartTxt: { ...typography.bodyMedium, color: colors.onSurfaceMuted },

  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: 4 },
  th:          { ...typography.labelMedium, color: colors.onSurfaceMuted },
  tableRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  tdName:      { ...typography.titleSmall, color: colors.onSurface },
  tdPrice:     { ...typography.bodySmall, color: colors.onSurfaceMuted },
  qtyControl:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  qtyBtn:      { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt:   { fontSize: 16, fontWeight: '700', color: colors.primary },
  qtyVal:      { ...typography.titleSmall, color: colors.onSurface, minWidth: 20, textAlign: 'center' },
  tdTotal:     { ...typography.titleSmall, color: colors.primary, textAlign: 'right' },

  billRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  billLabel:     { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  billVal:       { ...typography.bodyMedium, color: colors.onSurface },
  billTotalLabel:{ ...typography.titleMedium, color: colors.onSurface },
  billTotalVal:  { ...typography.headlineSmall, color: colors.primary, fontWeight: '800' },

  fieldLabel: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 6 },
  pmRow:      { flexDirection: 'row', gap: spacing.sm },
  pmBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.background },
  pmBtnActive:{ backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  pmTxt:      { ...typography.labelLarge, color: colors.onSurfaceMuted },
  pmTxtActive:{ color: colors.primary, fontWeight: '700' },

  amtInput:   { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, ...typography.headlineSmall, color: colors.onSurface, backgroundColor: colors.background, marginBottom: spacing.sm },
  payStatusRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  payStatusLabel:{ ...typography.bodyMedium, color: colors.onSurfaceMuted },
  payStatusChip: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  payStatusTxt:  { ...typography.labelMedium, fontWeight: '700' },
  dueLabel:      { ...typography.bodySmall, color: colors.error, marginLeft: 'auto' },

  sameAsBuyerRow:{ marginBottom: spacing.sm },
  sameBtn:       { alignSelf: 'flex-start', borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6 },
  sameBtnTxt:    { ...typography.labelMedium, color: colors.primary },
  twoCol:        { flexDirection: 'row' },

  pickerRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pickerAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  pickerAvatarTxt: { ...typography.titleLarge, color: colors.primary },
  pickerName:    { ...typography.titleSmall, color: colors.onSurface },
  pickerSub:     { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
});
