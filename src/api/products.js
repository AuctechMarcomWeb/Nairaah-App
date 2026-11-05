import { createAxiosInstance } from './apiConfig';

const productApi = createAxiosInstance('product');

/**
 * GET /api/product/
 * Returns all products
 */
export const getAllProducts = async () => {
  try {
    const response = await productApi.get('/?isActive=true');
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[PRODUCTS] getAllProducts error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

/**
 * GET /api/product/:id
 * Returns single product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await productApi.get(`/${id}`);
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error('[PRODUCTS] getProductById error:', error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
