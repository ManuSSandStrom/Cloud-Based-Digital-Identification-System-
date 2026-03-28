import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authService.js';

const AUTH_STORAGE_KEY = 'digital-id-auth';

const loadAuthState = () => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const persistAuthState = (state) => {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: state.token,
      accountType: state.accountType,
      user: state.user,
    }),
  );
};

const clearAuthState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const savedState = typeof window !== 'undefined' ? loadAuthState() : null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authService.login(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to log in right now.',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedState?.token || null,
    accountType: savedState?.accountType || null,
    user: savedState?.user || null,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.accountType = action.payload.accountType;
      state.user = action.payload.user;
      state.error = null;
      persistAuthState(state);
    },
    updateUser(state, action) {
      state.user = action.payload;
      persistAuthState(state);
    },
    logout(state) {
      state.token = null;
      state.accountType = null;
      state.user = null;
      state.error = null;
      clearAuthState();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.accountType = action.payload.accountType;
        state.user = action.payload.user;
        persistAuthState(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, updateUser, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
