import { configureStore } from '@reduxjs/toolkit';
import { auth_reducer } from '../features/auth/auth-slice';

export const store = configureStore({
  reducer: {
    auth: auth_reducer,
  },
});
