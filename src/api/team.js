import { createAxiosInstance } from './apiConfig';

const authApi  = createAxiosInstance('auth');
const teamApi  = createAxiosInstance('team');

/**
 * GET /api/auth/my-team/:sponsorId
 * Returns direct downline members
 */
export const getMyTeam = async (sponsorId) => {
  try {
    const response = await authApi.get(`/my-team/${sponsorId}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[TEAM] getMyTeam error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/auth/downline/:id
 * Returns full downline tree for a distributor
 */
export const getDownlineUsers = async (id) => {
  try {
    const response = await authApi.get(`/downline/${id}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[TEAM] getDownlineUsers error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/auth/getMySponsoredUsers/:sponsorId
 * Returns users created/sponsored by this distributor (customers + distributors)
 */
export const getMySponsoredUsers = async (sponsorId, userType = '') => {
  try {
    let url = `/getMySponsoredUsers/${sponsorId}`;
    if (userType) url += `?userType=${userType}`;
    const response = await authApi.get(url);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[TEAM] getMySponsoredUsers error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/team/my-team-business/:sponsorId
 * Returns team business summary with level-wise breakdown
 */
export const getMyTeamBusiness = async (sponsorId) => {
  try {
    const response = await teamApi.get(`/my-team-business/${sponsorId}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[TEAM] getMyTeamBusiness error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/team/level-summary/:distributorId
 * Returns level-wise summary
 */
export const getLevelSummary = async (distributorId) => {
  try {
    const response = await teamApi.get(`/level-summary/${distributorId}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[TEAM] getLevelSummary error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
