import { configureStore } from '@reduxjs/toolkit';
import mainSlice from '../../shared/store/main-slice';

export const store = configureStore({
  reducer: {
    main: mainSlice,
  },
});
