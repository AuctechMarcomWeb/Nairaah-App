import { createAxiosInstance } from './apiConfig';
import { Platform } from 'react-native';

const bankApi  = createAxiosInstance('bank');
const uploadApi = createAxiosInstance('upload');

/* ─── GET active banks ───────────────────────────────────────────────────── */
export const getBanks = async () => {
  try {
    const res = await bankApi.get('?isActive=true&isPagination=false');
    const raw = res.data?.data ?? res.data ?? [];
    return { success: true, data: Array.isArray(raw) ? raw : [] };
  } catch (e) {
    return { success: false, data: [], message: e.response?.data?.message || e.message };
  }
};

/* ─── POST upload image (payment screenshot) ─────────────────────────────── */
export const uploadImage = async (fileUri, fileName = 'screenshot.jpg', mimeType = 'image/jpeg') => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
      name: fileName,
      type: mimeType,
    });
    const res = await uploadApi.post('/uploadImage', formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data, // axios ko FormData as-is bhejo, serialize mat karo
    });
    const url = res.data?.data?.imageUrl ?? res.data?.imageUrl ?? '';
    return { success: true, url };
  } catch (e) {
    console.log('uploadImage error:', e?.response?.data || e.message);
    return { success: false, url: '', message: e.response?.data?.message || e.message };
  }
};
