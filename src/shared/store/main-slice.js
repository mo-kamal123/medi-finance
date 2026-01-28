import { createSlice } from '@reduxjs/toolkit';

const mainSlice = createSlice({
  name: 'main',
  initialState: {
    sidebar: true,
  },
  reducers: {
    openSidebar: (state) => {
      state.sidebar = true;
    },
    closeSidebar: (state) => {
      state.sidebar = false;
    },
    toggleSidebar: (state) => {
      state.sidebar = !state.sidebar;
    },
  },
});

export const { openSidebar, closeSidebar, toggleSidebar } = mainSlice.actions;

export default mainSlice.reducer;
