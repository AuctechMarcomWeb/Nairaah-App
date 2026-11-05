/**
 * CreateSaleScreen — "New Order"
 * Exactly like MLM-Admin → /distributor/new-order
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader, PrimaryButton, Divider, PickerModal } from '../../components';
import Icon, { Icons } from '../../components/Icon';
import { getAllProducts } from '../../api/products';
import { getMySponsoredUsers } from '../../api/team';
import { placeOrderForOthers } from '../../api/orders';
import { createUser } from '../../api/users';

const PAYMENT_METHODS = ['COD', 'Online', 'UPI', 'Wallet'];
const fmtMoney = (v) => `\u20B9${(Number(v) || 0).toLocaleString('en-IN')}`;

function derivePaymentStatus(paid, total) {
  if (paid <= 0)     return 'Pending';
  if (paid >= total) return 'Paid';
  return 'Partial';
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, iconName, children }) {
  return (
    <View style={sc.card}>
      {title ? (
        <View style={sc.titleRow}>
          {iconName ? <Icon name={iconName} size={16} color={colors.primary} /> : null}
          <Text style={sc.title}>{title}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}
const sc = StyleSheet.create({
  card:     { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, ...elevation.level1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  title:    { ...typography.titleMedium, color: colors.onSurface, fontWeight: '700' },
});

// ─── Text Field ───────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fl.wrap}>
      {label ? (
        <Text style={fl.label}>{label}{required ? <Text style={{ color: colors.error }}> *</Text> : ''}</Text>
      ) : null}
      <TextInput
        style={[fl.input, focused && fl.focused, multiline && fl.multi]}
        value={value} onChangeText={onChangeText}
        placeholder={placeholder || ''} placeholderTextColor={colors.onSurfaceMuted}
        keyboardType={keyboardType || 'default'} multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoCapitalize="none"
      />
    </View>
  );
}
const fl = StyleSheet.create({
  wrap:    { marginBottom: spacing.md },
  label:   { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 5 },
  input:   { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, ...typography.bodyMedium, color: colors.onSurface, backgroundColor: colors.background },
  focused: { borderColor: colors.primary, backgroundColor: colors.surface },
  multi:   { height: 80, paddingTop: 12 },
});

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ visible, order, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={sm.overlay}>
        <View style={sm.card}>
          <Icon name={Icons.success} size={52} color={colors.success} style={{ marginBottom: 8 }} />
          <Text style={sm.title}>Order Placed!</Text>
          {order && (
            <>
              <Text style={sm.sub}>{order.orderNumber || 'Order created successfully'}</Text>
              <Text style={sm.amt}>{fmtMoney(order.totalAmount)}</Text>
            </>
          )}
          <TouchableOpacity style={sm.btn} onPress={onClose}>
            <Text style={sm.btnTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const sm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  card:    { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 32, alignItems: 'center', width: '80%', ...elevation.level3 },
  title:   { ...typography.headlineSmall, color: colors.onSurface, marginBottom: 6 },
  sub:     { ...typography.bodyMedium, color: colors.onSurfaceMuted, marginBottom: 4 },
  amt:     { ...typography.headlineMedium, color: colors.primary, fontWeight: '800', marginBottom: 20 },
  btn:     { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: 40, paddingVertical: 13 },
  btnTxt:  { ...typography.titleMedium, color: colors.white },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function CreateSaleScreen({ navigation, route }) {
  const { user } = useSelector(state => state.user);
  const sponsorId = user?._id || user?.userId;
  const preProduct = route?.params?.preselectedProduct || null;

  const [orderDate,     setOrderDate]     = useState(todayStr());
  const [buyerType,     setBuyerType]     = useState('Customer');
  const [buyerMode,     setBuyerMode]     = useState('existing');
  const [existingList,  setExistingList]  = useState([]);
  const [listLoading,   setListLoading]   = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [showBuyerPicker, setShowBuyerPicker] = useState(false);

  const [newName,    setNewName]    = useState('');
  const [newPhone,   setNewPhone]   = useState('');
  const [newEmail,   setNewEmail]   = useState('');
  const [newGender,  setNewGender]  = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newCity,    setNewCity]    = useState('');
  const [newState,   setNewState]   = useState('');
  const [newAddress, setNewAddress] = useState('');

  const [sameAsAbove, setSameAsAbove] = useState(false);
  const [shipName,    setShipName]    = useState('');
  const [shipPhone,   setShipPhone]   = useState('');
  const [shipPincode, setShipPincode] = useState('');
  const [shipCity,    setShipCity]    = useState('');
  const [shipState,   setShipState]   = useState('');
  const [shipAddress, setShipAddress] = useState('');

  const [productList,  setProductList]  = useState([]);
  const [cartItems,    setCartItems]    = useState(
    preProduct ? [{ product: { ...preProduct, id: preProduct._id || preProduct.id }, qty: 1 }] : []
  );
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paidAmount,    setPaidAmount]    = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes,         setNotes]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [successModal,  setSuccessModal]  = useState({ open: false, order: null });

  useEffect(() => {
    getAllProducts().then(res => {
      if (res.success) {
        setProductList(
          (res.data?.products || res.data || []).map(p => ({
            ...p, id: p._id, name: p.name || '',
            sellingPrice:     p.sellingPrice     || p.mrp || p.price || 0,
            distributorPrice: p.distributorPrice || p.sellingPrice || p.mrp || 0,
            unit: p.unit || 'pc',
          }))
        );
      }
    });
  }, []);

  const fetchBuyerList = useCallback(async () => {
    if (!sponsorId) return;
    setListLoading(true);
    const res = await getMySponsoredUsers(sponsorId, buyerType);
    if (res.success) {
      setExistingList(
        (res.data?.users || res.data || []).map(c => ({
          ...c, id: c._id,
          name:   c.name   || c.fullName || c.userId || 'Unknown',
          mobile: c.mobile || c.phone    || '-',
        }))
      );
    }
    setListLoading(false);
  }, [sponsorId, buyerType]);

  useEffect(() => {
    setSelectedBuyer(null); setExistingList([]);
    fetchBuyerList();
  }, [buyerType]);

  const handleSameAsAbove = (checked) => {
    setSameAsAbove(checked);
    if (checked) {
      if (buyerMode === 'existing' && selectedBuyer) {
        setShipName(selectedBuyer.name || ''); setShipPhone(selectedBuyer.mobile || '');
        setShipPincode(''); setShipCity(''); setShipState(''); setShipAddress('');
      } else if (buyerMode === 'new') {
        setShipName(newName); setShipPhone(newPhone); setShipPincode(newPincode);
        setShipCity(newCity); setShipState(newState); setShipAddress(newAddress);
      }
    } else {
      setShipName(''); setShipPhone(''); setShipPincode('');
      setShipCity(''); setShipState(''); setShipAddress('');
    }
  };

  const unitPrice = (p) => buyerType === 'Distributor' ? p.distributorPrice : p.sellingPrice;

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

  const subtotal  = cartItems.reduce((s, i) => s + unitPrice(i.product) * i.qty, 0);
  const total     = subtotal;
  const paid      = Number(paidAmount) || 0;
  const due       = Math.max(0, total - paid);
  const payStatus = derivePaymentStatus(paid, total);

  useEffect(() => {
    setPaidAmount(paymentMethod === 'COD' ? '0' : String(total));
  }, [total, paymentMethod]);

  const handleSubmit = async () => {
    if (cartItems.length === 0) { Alert.alert('Required', 'Kam se kam ek product add karo.'); return; }
    if (buyerMode === 'existing' && !selectedBuyer) { Alert.alert('Required', `Existing ${buyerType} select karo.`); return; }
    if (buyerMode === 'new') {
      if (!newName.trim()) { Alert.alert('Required', 'Buyer ka naam daalo.'); return; }
      if (!newPhone.trim() || newPhone.trim().length !== 10) { Alert.alert('Invalid', 'Valid 10-digit mobile number daalo.'); return; }
    }
    if ((paymentMethod === 'Online' || paymentMethod === 'UPI') && !transactionId.trim()) {
      Alert.alert('Required', 'Transaction ID daalo.'); return;
    }
    setLoading(true);
    try {
      const buyerId      = buyerMode === 'existing' ? (selectedBuyer._id || selectedBuyer.id) : null;
      const buyerDetails = buyerMode === 'new' ? {
        name: newName.trim(), phone: newPhone.trim(),
        email: newEmail.trim() || undefined, gender: newGender || undefined,
        pincode: newPincode.trim() || undefined, city: newCity.trim() || undefined,
        state: newState.trim() || undefined, address: newAddress.trim() || undefined,
        country: 'India',
      } : null;

      const itemsPayload = cartItems.map(i => ({
        productId: i.product._id || i.product.id,
        quantity:  i.qty,
        unitPrice: unitPrice(i.product),
        totalPrice: unitPrice(i.product) * i.qty,
      }));

      const payload = {
        ...(buyerId      ? { buyer: buyerId }   : {}),
        ...(buyerDetails ? { buyerDetails }     : {}),
        buyerType, orderDate,
        items: itemsPayload, subtotal, discount: 0, totalAmount: total,
        paidAmount: paid, paymentStatus: payStatus,
        paymentMethod: (paymentMethod === 'UPI' || paymentMethod === 'Wallet') ? 'Online' : paymentMethod,
        ...(transactionId.trim() ? { transactionId: transactionId.trim(), paymentId: transactionId.trim() } : {}),
        notes: notes.trim() || '',
        shippingAddress: {
          name:    shipName.trim()    || (buyerMode === 'existing' ? selectedBuyer?.name   : newName)  || '',
          phone:   shipPhone.trim()   || (buyerMode === 'existing' ? selectedBuyer?.mobile : newPhone) || '',
          address: shipAddress.trim() || '', city: shipCity.trim() || '',
          state:   shipState.trim()   || '', pincode: shipPincode.trim() || '', country: 'India',
        },
      };

      const res = await placeOrderForOthers(payload);
      if (res.success) {
        setSuccessModal({ open: true, order: res.data });
      } else {
        Alert.alert('Error', res.message || 'Order place nahi hua');
      }
    } catch (e) {
      Alert.alert('Error', 'Kuch galat hua. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOrderDate(todayStr()); setBuyerType('Customer'); setBuyerMode('existing');
    setSelectedBuyer(null); setNewName(''); setNewPhone(''); setNewEmail('');
    setNewGender(''); setNewPincode(''); setNewCity(''); setNewState(''); setNewAddress('');
    setSameAsAbove(false); setShipName(''); setShipPhone(''); setShipPincode('');
    setShipCity(''); setShipState(''); setShipAddress('');
    setCartItems([]); setPaymentMethod('COD'); setPaidAmount(''); setTransactionId(''); setNotes('');
  };

  const availableProducts = productList.filter(p => p.isActive !== false && p.isDelete !== true);
  const GENDERS = ['Male', 'Female', 'Other'];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
        <AppHeader title="New Order" onBack={() => navigation.goBack()} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── 1. Order Date ── */}
          <SectionCard>
            <View style={s.labelRow}>
              <Icon name={Icons.calendar} size={16} color={colors.primary} />
              <Text style={s.sectionLabel}>Order Date</Text>
            </View>
            <TextInput
              style={s.dateInput}
              value={orderDate} onChangeText={setOrderDate}
              placeholder="YYYY-MM-DD" placeholderTextColor={colors.onSurfaceMuted}
              keyboardType="numeric"
            />
            <Text style={s.dateHint}>Format: YYYY-MM-DD (e.g. {todayStr()})</Text>
          </SectionCard>

          {/* ── 2. Buyer Type ── */}
          <SectionCard>
            <View style={s.labelRow}>
              <Icon name={Icons.buyerType} size={16} color={colors.primary} />
              <Text style={s.sectionLabel}>Buyer Type</Text>
            </View>
            <View style={s.toggleRow}>
              {['Distributor', 'Customer'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.toggleBtn, buyerType === t && s.toggleBtnActive]}
                  onPress={() => { setBuyerType(t); setBuyerMode('existing'); setSelectedBuyer(null); }}>
                  <Icon
                    name={t === 'Customer' ? Icons.customer : Icons.distributor}
                    size={18}
                    color={buyerType === t ? colors.white : colors.onSurfaceMuted}
                  />
                  <Text style={[s.toggleTxt, buyerType === t && s.toggleTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* ── 3. Buyer Section ── */}
          <SectionCard>
            <View style={s.labelRow}>
              <Icon name={buyerType === 'Customer' ? Icons.customer : Icons.distributor} size={16} color={colors.primary} />
              <Text style={s.sectionLabel}>{buyerType}</Text>
            </View>

            {/* Existing / New radio */}
            <View style={s.radioRow}>
              {['existing', 'new'].map(m => (
                <TouchableOpacity key={m} style={s.radioItem} onPress={() => { setBuyerMode(m); setSelectedBuyer(null); }}>
                  <View style={[s.radioDot, buyerMode === m && s.radioDotActive]}>
                    {buyerMode === m && <View style={s.radioDotFill} />}
                  </View>
                  <Text style={[s.radioTxt, buyerMode === m && { color: colors.primary, fontWeight: '700' }]}>
                    {m === 'existing' ? `Existing ${buyerType}` : `New ${buyerType}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Existing buyer picker */}
            {buyerMode === 'existing' && (
              listLoading ? (
                <ActivityIndicator color={colors.primary} style={{ paddingVertical: 12 }} />
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
                      <Icon name={buyerType === 'Customer' ? Icons.customer : Icons.distributor} size={20} color={colors.onSurfaceMuted} />
                      <Text style={s.selectorPlaceholder}>Search existing {buyerType.toLowerCase()}</Text>
                      <Icon name={Icons.chevronRight} size={20} color={colors.outline} />
                    </View>
                  )}
                </TouchableOpacity>
              )
            )}

            {/* New buyer form */}
            {buyerMode === 'new' && (
              <View style={{ marginTop: 8 }}>
                <View style={s.newBuyerHeader}>
                  <Icon name={Icons.personal} size={14} color={colors.primary} />
                  <Text style={s.newBuyerTitle}>New {buyerType} Details</Text>
                </View>
                <View style={s.twoCol}>
                  <View style={{ flex: 1 }}><Field label="Name" value={newName} onChangeText={setNewName} placeholder="e.g. Priya Sharma" required /></View>
                  <View style={{ width: spacing.md }} />
                  <View style={{ flex: 1 }}><Field label="Mobile" value={newPhone} onChangeText={setNewPhone} placeholder="10-digit mobile" keyboardType="phone-pad" required /></View>
                </View>
                <View style={s.twoCol}>
                  <View style={{ flex: 1 }}><Field label="Email" value={newEmail} onChangeText={setNewEmail} placeholder="user@example.com" keyboardType="email-address" /></View>
                  <View style={{ width: spacing.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={fl.label}>Gender</Text>
                    <View style={s.genderRow}>
                      {GENDERS.map(g => (
                        <TouchableOpacity key={g} style={[s.genderBtn, newGender === g && s.genderBtnActive]} onPress={() => setNewGender(g)}>
                          <Text style={[s.genderTxt, newGender === g && s.genderTxtActive]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={s.threeCol}>
                  <View style={{ flex: 1.2 }}><Field label="Pincode" value={newPincode} onChangeText={setNewPincode} placeholder="6-digit" keyboardType="numeric" /></View>
                  <View style={{ width: spacing.sm }} />
                  <View style={{ flex: 1.5 }}><Field label="City" value={newCity} onChangeText={setNewCity} placeholder="e.g. Barabanki" /></View>
                  <View style={{ width: spacing.sm }} />
                  <View style={{ flex: 1.5 }}><Field label="State" value={newState} onChangeText={setNewState} placeholder="e.g. Uttar Pradesh" /></View>
                </View>
                <Field label="Address" value={newAddress} onChangeText={setNewAddress} placeholder="House no., Street, Locality..." multiline />
              </View>
            )}
          </SectionCard>

          {/* ── 4. Shipping Address ── */}
          <SectionCard iconName={Icons.shipping} title="Shipping Address">
            <TouchableOpacity style={s.checkRow} onPress={() => handleSameAsAbove(!sameAsAbove)}>
              <View style={[s.checkbox, sameAsAbove && s.checkboxActive]}>
                {sameAsAbove && <Icon name={Icons.check} size={12} color={colors.white} />}
              </View>
              <Text style={s.checkLabel}>Same as above details</Text>
            </TouchableOpacity>
            {!sameAsAbove && (
              <>
                <View style={s.twoCol}>
                  <View style={{ flex: 1 }}><Field label="Name"  value={shipName}  onChangeText={setShipName}  placeholder="Recipient name" /></View>
                  <View style={{ width: spacing.md }} />
                  <View style={{ flex: 1 }}><Field label="Phone" value={shipPhone} onChangeText={setShipPhone} placeholder="Mobile no." keyboardType="phone-pad" /></View>
                </View>
                <View style={s.threeCol}>
                  <View style={{ flex: 1.2 }}><Field label="Pincode" value={shipPincode} onChangeText={setShipPincode} placeholder="6-digit" keyboardType="numeric" /></View>
                  <View style={{ width: spacing.sm }} />
                  <View style={{ flex: 1.5 }}><Field label="City"  value={shipCity}  onChangeText={setShipCity}  placeholder="City" /></View>
                  <View style={{ width: spacing.sm }} />
                  <View style={{ flex: 1.5 }}><Field label="State" value={shipState} onChangeText={setShipState} placeholder="State" /></View>
                </View>
                <Field label="Address" value={shipAddress} onChangeText={setShipAddress} placeholder="House no., Street, Locality" multiline />
              </>
            )}
          </SectionCard>

          {/* ── 5. Products ── */}
          <SectionCard>
            <View style={s.prodHeader}>
              <View style={s.labelRow}>
                <Icon name={Icons.product} size={16} color={colors.primary} />
                <Text style={s.sectionLabel}>Products</Text>
              </View>
              <TouchableOpacity style={s.addProdBtn} onPress={() => setShowProductPicker(true)}>
                <Icon name={Icons.add} size={14} color={colors.primary} />
                <Text style={s.addProdTxt}>Add Product</Text>
              </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
              <View style={s.emptyCart}>
                <Icon name={Icons.cart} size={40} color={colors.onSurfaceMuted} style={{ opacity: 0.4, marginBottom: 6 }} />
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
                          <Text style={s.qtyBtnTxt}>-</Text>
                        </TouchableOpacity>
                        <Text style={s.qtyVal}>{item.qty}</Text>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, 1)}>
                          <Text style={s.qtyBtnTxt}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[s.tdTotal, { flex: 2 }]}>{fmtMoney(unitPrice(item.product) * item.qty)}</Text>
                    </View>
                    {idx < cartItems.length - 1 && <Divider />}
                  </View>
                ))}
                <Divider style={{ marginVertical: 10 }} />
                <View style={s.billRow}>
                  <Text style={s.billLabel}>Subtotal</Text>
                  <Text style={s.billVal}>{fmtMoney(subtotal)}</Text>
                </View>
                <View style={s.billRow}>
                  <Text style={[s.billLabel, { fontWeight: '700', color: colors.onSurface }]}>Total Payable</Text>
                  <Text style={[s.billVal, { fontWeight: '800', color: colors.primary, fontSize: 18 }]}>{fmtMoney(total)}</Text>
                </View>
              </>
            )}
          </SectionCard>

          {/* ── 6. Payment ── */}
          <SectionCard iconName={Icons.payment} title="Payment">
            <Text style={s.fieldLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {PAYMENT_METHODS.map(m => (
                  <TouchableOpacity key={m} style={[s.pmBtn, paymentMethod === m && s.pmBtnActive]} onPress={() => setPaymentMethod(m)}>
                    <Text style={[s.pmTxt, paymentMethod === m && s.pmTxtActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={s.fieldLabel}>Paid Amount</Text>
            <TextInput
              style={s.amtInput} value={paidAmount}
              onChangeText={v => setPaidAmount(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric" placeholder={`Max: ${fmtMoney(total)}`}
              placeholderTextColor={colors.onSurfaceMuted}
            />

            <View style={s.payStatusRow}>
              <Text style={s.payStatusLabel}>Payment Status:</Text>
              <View style={[s.payStatusChip, {
                backgroundColor: payStatus === 'Paid' ? colors.successContainer : payStatus === 'Partial' ? colors.warningContainer : colors.pendingContainer,
              }]}>
                <Text style={[s.payStatusTxt, {
                  color: payStatus === 'Paid' ? colors.success : payStatus === 'Partial' ? colors.warning : colors.pending,
                }]}>{payStatus}</Text>
              </View>
              {due > 0 && <Text style={s.dueLabel}>Due: {fmtMoney(due)}</Text>}
            </View>

            {(paymentMethod === 'Online' || paymentMethod === 'UPI') && (
              <Field label="Transaction ID *" value={transactionId} onChangeText={setTransactionId} placeholder="Enter transaction ID" />
            )}
          </SectionCard>

          {/* ── 7. Notes ── */}
          <SectionCard>
            <View style={s.labelRow}>
              <Icon name={Icons.notes} size={16} color={colors.primary} />
              <Text style={s.sectionLabel}>Notes (Optional)</Text>
            </View>
            <TextInput
              style={[fl.input, fl.multi, { height: 72 }]}
              value={notes} onChangeText={setNotes}
              placeholder="Any order notes..." placeholderTextColor={colors.onSurfaceMuted}
              multiline textAlignVertical="top"
            />
          </SectionCard>

          <PrimaryButton
            label="Place Order"
            onPress={handleSubmit}
            loading={loading}
            disabled={cartItems.length === 0}
            style={{ marginTop: 4 }}
          />
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Existing Buyer Picker */}
        <PickerModal
          visible={showBuyerPicker}
          title={`Select ${buyerType}`}
          items={existingList}
          searchable
          loading={listLoading}
          onSelect={(c) => { setSelectedBuyer(c); setShowBuyerPicker(false); }}
          onClose={() => setShowBuyerPicker(false)}
          renderItem={(item, onSelect) => (
            <TouchableOpacity style={s.pickerRow} onPress={onSelect}>
              <View style={s.pickerAvatar}>
                <Icon name={buyerType === 'Customer' ? Icons.customer : Icons.distributor} size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={s.pickerName}>{item.name}</Text>
                <Text style={s.pickerSub}>{item.userId || item.id}  ·  {item.mobile}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Product Picker */}
        <PickerModal
          visible={showProductPicker}
          title="Select Product"
          items={availableProducts}
          searchable
          onSelect={addProduct}
          onClose={() => setShowProductPicker(false)}
          renderItem={(item, onSelect) => (
            <TouchableOpacity style={s.pickerRow} onPress={onSelect}>
              <View style={[s.pickerAvatar, { backgroundColor: colors.surfaceVariant }]}>
                <Icon name={Icons.product} size={22} color={colors.primary} />
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

        <SuccessModal
          visible={successModal.open}
          order={successModal.order}
          onClose={() => { setSuccessModal({ open: false, order: null }); resetForm(); navigation.goBack(); }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  scroll:      { padding: spacing.lg },
  labelRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionLabel:{ ...typography.titleSmall, color: colors.onSurface, fontWeight: '700' },
  dateInput:   { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, ...typography.bodyLarge, color: colors.onSurface, backgroundColor: colors.background, width: 160 },
  dateHint:    { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 4 },
  toggleRow:   { flexDirection: 'row', gap: spacing.md },
  toggleBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.background },
  toggleBtnActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  toggleTxt:   { ...typography.labelLarge, color: colors.onSurfaceMuted },
  toggleTxtActive: { color: colors.white, fontWeight: '700' },
  radioRow:    { flexDirection: 'row', gap: spacing.xl, marginBottom: 12 },
  radioItem:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioDot:    { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  radioDotActive: { borderColor: colors.primary },
  radioDotFill:   { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.primary },
  radioTxt:    { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  selectorBox: { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, minHeight: 52, justifyContent: 'center', backgroundColor: colors.background },
  selectorBoxFilled: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  selectorEmpty: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10 },
  selectorPlaceholder: { ...typography.bodyLarge, color: colors.onSurfaceMuted, flex: 1 },
  selectorFilled: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10 },
  selectorAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  selectorAvatarTxt: { ...typography.titleMedium, color: colors.white },
  selectorName: { ...typography.titleSmall, color: colors.primaryDark },
  selectorSub:  { ...typography.bodySmall, color: colors.primaryDark, marginTop: 2 },
  changeBtn:    { ...typography.labelLarge, color: colors.primary, marginLeft: 'auto' },
  newBuyerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryContainer, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 8, marginBottom: spacing.md },
  newBuyerTitle:  { ...typography.titleSmall, color: colors.primary, fontWeight: '700' },
  twoCol:      { flexDirection: 'row' },
  threeCol:    { flexDirection: 'row' },
  genderRow:   { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  genderBtn:   { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.background },
  genderBtnActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  genderTxt:   { ...typography.labelSmall, color: colors.onSurfaceMuted },
  genderTxtActive: { color: colors.primary, fontWeight: '700' },
  checkRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox:    { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel:  { ...typography.titleSmall, color: colors.onSurface, fontWeight: '700' },
  prodHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  addProdBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  addProdTxt:  { ...typography.labelLarge, color: colors.primary },
  emptyCart:   { alignItems: 'center', paddingVertical: 20 },
  emptyCartTxt:{ ...typography.bodyMedium, color: colors.onSurfaceMuted },
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
  billRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel:   { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  billVal:     { ...typography.bodyMedium, color: colors.onSurface },
  fieldLabel:  { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 6 },
  pmBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.background },
  pmBtnActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  pmTxt:       { ...typography.labelLarge, color: colors.onSurfaceMuted },
  pmTxtActive: { color: colors.primary, fontWeight: '700' },
  amtInput:    { borderWidth: 1.5, borderColor: colors.outline, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, ...typography.headlineSmall, color: colors.onSurface, backgroundColor: colors.background, marginBottom: spacing.sm },
  payStatusRow:{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  payStatusLabel: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
  payStatusChip:  { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  payStatusTxt:   { ...typography.labelMedium, fontWeight: '700' },
  dueLabel:    { ...typography.bodySmall, color: colors.error, marginLeft: 'auto' },
  pickerRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pickerAvatar:{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  pickerName:  { ...typography.titleSmall, color: colors.onSurface },
  pickerSub:   { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 2 },
});
