import { createAxiosInstance } from './apiConfig';

const milestoneApi = createAxiosInstance('milestone');

/**
 * GET /api/milestone/progress/:userId
 * Returns milestone progress for a distributor
 */
export const getMilestoneProgress = async (userId) => {
  try {
    const response = await milestoneApi.get(`/progress/${userId}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[MILESTONE] getMilestoneProgress error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
