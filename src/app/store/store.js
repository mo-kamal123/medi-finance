import { configureStore } from '@reduxjs/toolkit';
import mainSlice from '../../shared/store/main-slice';
import authSlice from '../../features/auth/store/auth-slice';

export const store = configureStore({
  reducer: {
    main: mainSlice,
    auth: authSlice,
  },
});
