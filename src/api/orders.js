import { createAxiosInstance } from './apiConfig';

const orderApi = createAxiosInstance('order');
const commApi  = createAxiosInstance('commission');

/* ─── GET my orders (distributor) ────────────────────────────────────────── */
export const getMyOrders = async (params = '') => {
  try {
    const res = await orderApi.get(`/my-orders${params}`);
    if (res.data.success) return { success: true, data: res.data.data, total: res.data.total };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── GET single order by id ──────────────────────────────────────────────── */
export const getOrderById = async (id) => {
  try {
    const res = await orderApi.get(`/${id}`);
    if (res.data.success) return { success: true, data: res.data.data };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── POST place order for self ───────────────────────────────────────────── */
export const placeOrder = async (orderData) => {
  try {
    const res = await orderApi.post('/place', orderData);
    if (res.data.success) return { success: true, data: res.data.data, message: res.data.message };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── POST place order for customer / another distributor ─────────────────── */
export const placeOrderForOthers = async (orderData) => {
  try {
    const res = await orderApi.post('/placeOthers', orderData);
    if (res.data.success) return { success: true, data: res.data.data, message: res.data.message };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── PATCH update order / payment status ─────────────────────────────────── */
export const updateOrderStatus = async (id, payload) => {
  try {
    const res = await orderApi.patch(`/${id}/status`, payload);
    if (res.data.success) return { success: true, data: res.data.data, message: res.data.message };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── PATCH cancel order ──────────────────────────────────────────────────── */
export const cancelOrder = async (id, payload = {}) => {
  try {
    const res = await orderApi.patch(`/${id}/cancel`, payload);
    if (res.data.success) return { success: true, data: res.data.data, message: res.data.message };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── PATCH record payment ────────────────────────────────────────────────── */
export const makePayment = async (id, payload) => {
  try {
    const res = await orderApi.patch(`/${id}/payment`, payload);
    if (res.data.success) return { success: true, data: res.data.data, message: res.data.message };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

/* ─── GET order logs / audit trail ───────────────────────────────────────── */
export const getOrderLogs = async (orderId) => {
  try {
    const res = await commApi.get(`/order-logs/${orderId}`);
    if (res.data.success) return { success: true, data: res.data.data };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};
