import { createAxiosInstance } from './apiConfig';

const dashboardApi = createAxiosInstance('dashboard');

/**
 * GET /api/dashboard/distributor/:distributorId
 * Returns distributor dashboard summary stats
 */
export const getDistributorDashboard = async (distributorId, fromDate = '', toDate = '') => {
  try {
    let url = `/distributor/${distributorId}`;
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length) url += `?${params.join('&')}`;

    const response = await dashboardApi.get(url);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[DASHBOARD] Error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
