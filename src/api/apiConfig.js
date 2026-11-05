import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── API BASE URL ─────────────────────────────────────────────────────────────
// Agar machine ka IP change ho to sirf LOCAL_IP update karo
// Current machine IP: 192.168.1.24  |  Backend port: 5002
//
// const BASE_URL = 'https://api.nairaah.in/api';   // ← production
const BASE_URL = 'http://192.168.1.24:5002/api';    // ← local dev

let _cachedToken = null;

export const setCachedToken = token => {
  _cachedToken = token;
};

export const clearCachedToken = () => {
  _cachedToken = null;
};

// Pre-warm token on app start (call this in App.js)
export const preloadToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    _cachedToken = token;
  } catch (_) {}
};

export const createAxiosInstance = (endpoint = '') => {
  const instance = axios.create({
    baseURL: `${BASE_URL}/${endpoint}`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Attach token
  instance.interceptors.request.use(
    async config => {
      try {
        if (!_cachedToken) {
          _cachedToken = await AsyncStorage.getItem('authToken');
        }
        if (_cachedToken) {
          config.headers.Authorization = `Bearer ${_cachedToken}`;
        }
      } catch (err) {
        console.log('Token fetch error:', err);
      }
      return config;
    },
    error => Promise.reject(error),
  );

  // Handle 401 — clear everything including Redux state
  instance.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        clearCachedToken();
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');

        // Dispatch logout to Redux so RootNavigation switches to login
        try {
          const { default: store } = await import('../redux/store');
          const { logout } = await import('../redux/slice/userSlice');
          store.dispatch(logout());
        } catch (e) {
          console.log('Redux dispatch error on 401:', e);
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};
