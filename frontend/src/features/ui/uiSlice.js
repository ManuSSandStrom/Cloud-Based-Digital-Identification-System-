import { createSlice } from '@reduxjs/toolkit';

const THEME_STORAGE_KEY = 'digital-id-theme';

const getInitialTheme = () =>
  typeof window !== 'undefined' && localStorage.getItem(THEME_STORAGE_KEY)
    ? localStorage.getItem(THEME_STORAGE_KEY)
    : 'light';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    toast: null,
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const { toggleTheme, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
