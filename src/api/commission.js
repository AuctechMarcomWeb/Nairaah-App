import { createAxiosInstance } from './apiConfig';

const commissionApi = createAxiosInstance('commission');

/**
 * GET /api/commission/my/:distributorId
 * Returns distributor's commission summary with optional date range
 */
export const getMyCommissionSummary = async (distributorId, fromDate = '', toDate = '') => {
  try {
    let url = `/my/${distributorId}`;
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length) url += `?${params.join('&')}`;

    const response = await commissionApi.get(url);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[COMMISSION] getMyCommissionSummary error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/commission/level-summary/:distributorId
 * Returns level-wise commission breakdown
 */
export const getLevelCommissionSummary = async (distributorId, fromDate = '', toDate = '') => {
  try {
    let url = `/level-summary/${distributorId}`;
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length) url += `?${params.join('&')}`;

    const response = await commissionApi.get(url);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[COMMISSION] getLevelCommissionSummary error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/commission/level-members/:distributorId
 * Returns members at a specific level with commission
 */
export const getLevelMembersCommission = async (distributorId, level = '', fromDate = '', toDate = '') => {
  try {
    let url = `/level-members/${distributorId}`;
    const params = [];
    if (level) params.push(`level=${level}`);
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length) url += `?${params.join('&')}`;

    const response = await commissionApi.get(url);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[COMMISSION] getLevelMembersCommission error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/commission/orders/:distributorId
 * Returns order-wise commission breakdown
 */
export const getOrderCommissionBreakdown = async (distributorId, fromDate = '', toDate = '') => {
  try {
    let url = `/orders/${distributorId}`;
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length) url += `?${params.join('&')}`;

    const response = await commissionApi.get(url);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[COMMISSION] getOrderCommissionBreakdown error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
