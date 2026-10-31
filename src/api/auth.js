import { createAxiosInstance } from './apiConfig';

const authApi = createAxiosInstance('auth');

/**
 * Login with userId and password
 * Returns: { success, token, user, message }
 */
export const loginWithPassword = async (userId, password) => {
  try {
    const response = await authApi.post('/loginWithPassword', {
      userId,
      password,
    });

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
    console.error('Login error:', error);
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
 * Returns: { success, message }
 */
export const logout = async () => {
  try {
    const response = await authApi.post('/logout');
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Update profile
 * Returns: { success, user, message }
 */
export const updateProfile = async (userData) => {
  try {
    const response = await authApi.put('/profile', userData);

    if (response.data.success) {
      return {
        success: true,
        user: response.data.data,
        message: response.data.message,
      };
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
