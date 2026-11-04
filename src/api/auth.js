import { createAxiosInstance } from './apiConfig';

const authApi = createAxiosInstance('auth');

/**
 * Login with userId and password
 * Returns: { success, token, user, message }
 */
export const loginWithPassword = async (userId, password) => {
  try {
    console.log('[AUTH] loginWithPassword called');
    console.log('[AUTH] Payload:', { userId, password: '***' });
    const response = await authApi.post('/loginWithPassword', {
      userId,
      password,
    });

    console.log('[AUTH] Response status:', response.status);
    console.log('[AUTH] Response data:', JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.data) {
      return {
        success: true,
        token: response.data.data.authToken,
        user: response.data.data,
        message: response.data.message,
      };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    console.error('[AUTH] Error code:', error.code);
    console.error('[AUTH] Error response:', error.response?.status, JSON.stringify(error.response?.data));
    if (error.code === 'ECONNABORTED') {
      return { success: false, message: 'Request timed out — check if backend is running' };
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return { success: false, message: 'Network error — check IP/port in apiConfig.js' };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Get user profile
 * Returns: { success, user, message }
 */
export const getProfile = async () => {
  try {
    const response = await authApi.get('/profile');

    if (response.data.success && response.data.data?.user) {
      return {
        success: true,
        user: response.data.data.user,
        message: response.data.message,
      };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('Profile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Logout
 * Note: Backend does not have a /logout endpoint — local cleanup only
 */
export const logout = async () => {
  // Backend has no logout endpoint — just return success for local cleanup
  return { success: true, message: 'Logged out' };
};

/**
 * Update profile — delegates to users.js updateUserProfile (PATCH /api/auth/update/:id)
 * Kept for backward compatibility
 */
export const updateProfile = async (id, userData) => {
  try {
    const response = await authApi.patch(`/update/${id}`, userData);
    if (response.data.success) {
      return { success: true, user: response.data.data, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
