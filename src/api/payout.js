import { createAxiosInstance } from './apiConfig';

const payoutApi = createAxiosInstance('payout');

/**
 * GET /api/payout/my/:distributorId
 * Returns distributor's payout records
 */
export const getMyPayouts = async (distributorId, params = '') => {
  try {
    const response = await payoutApi.get(`/my/${distributorId}${params}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[PAYOUT] getMyPayouts error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
