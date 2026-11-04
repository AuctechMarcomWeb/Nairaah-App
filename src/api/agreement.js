import { createAxiosInstance } from './apiConfig';

const agreementApi = createAxiosInstance('agreement');

export const getAllAgreements = async () => {
  try {
    const res = await agreementApi.get('/all');
    if (res.data.success) return { success: true, data: res.data.data };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

export const getAgreementById = async (id) => {
  try {
    const res = await agreementApi.get(`/${id}`);
    if (res.data.success) return { success: true, data: res.data.data };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

export const acceptAgreement = async (signature) => {
  try {
    const res = await agreementApi.post('/accept', { signature });
    if (res.data.success) return { success: true, data: res.data.data };
    return { success: false, message: res.data.message };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};
