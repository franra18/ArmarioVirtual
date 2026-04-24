import { configureStore } from '@reduxjs/toolkit';
import { auth_reducer } from '../features/auth/auth-slice';
import { prendas_reducer } from '../features/prendas/state/prendas-slice';

export const store = configureStore({
  reducer: {
    auth: auth_reducer,
    prendas: prendas_reducer,
  },
});
