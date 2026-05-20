import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
let user = null;

try {
  user = storedUser ? JSON.parse(storedUser) : null;
} catch {
  user = null;
}

const initialState = {
  user,
  token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
