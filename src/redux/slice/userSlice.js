import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Login success
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
    },

    // Login error
    loginError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isAuthenticated = false;
    },

    // Set user data
    setUser: (state, action) => {
      state.user = action.payload;
    },

    // Set token
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Update profile
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Logout
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  loginError,
  setUser,
  setToken,
  updateProfile,
  clearError,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
