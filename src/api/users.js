import { createAxiosInstance } from './apiConfig';

const authApi = createAxiosInstance('auth');

/**
 * GET /api/auth/getAllUsers?role=Customer&createdBy=:id
 * Returns customers sponsored by this distributor
 */
export const getMyCustomers = async (sponsorId, params = '') => {
  try {
    const response = await authApi.get(
      `/getAllUsers?role=Customer&createdBy=${sponsorId}${params}`,
    );
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] getMyCustomers error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * POST /api/auth/create
 * Create a new customer or distributor
 * payload: { name, phone/mobile, email, role, address, city, state, pincode, sponsorId, level? }
 */
export const createUser = async (userData) => {
  try {
    const response = await authApi.post('/create', userData);
    if (response.data.success) {
      return { success: true, data: response.data.data, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] createUser error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * PATCH /api/auth/convert-distributor/:id
 * Convert a customer to distributor
 */
export const convertToDistributor = async (id, data = {}) => {
  try {
    const response = await authApi.patch(`/convert-distributor/${id}`, data);
    if (response.data.success) {
      return { success: true, data: response.data.data, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] convertToDistributor error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * PATCH /api/auth/update/:id
 * Update distributor/user profile
 */
export const updateUserProfile = async (id, data) => {
  try {
    const response = await authApi.patch(`/update/${id}`, data);
    if (response.data.success) {
      return { success: true, data: response.data.data, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] updateUserProfile error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * POST /api/auth/updatePassword
 * Change own password
 */
export const updatePassword = async (oldPassword, newPassword) => {
  try {
    const response = await authApi.post('/updatePassword', { oldPassword, newPassword });
    if (response.data.success) {
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] updatePassword error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/auth/getAllUsers?createdBy=:id
 * Returns all users created by this distributor (customers + distributors)
 */
export const getUsersCreatedBy = async (sponsorId, params = '') => {
  try {
    const response = await authApi.get(
      `/getAllUsers?createdBy=${sponsorId}&isPagination=false${params}`,
    );
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] getUsersCreatedBy error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/auth/:id
 * Returns full user profile by ID
 */
export const getUserById = async (id) => {
  try {
    const response = await authApi.get(`/${id}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[USERS] getUserById error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
