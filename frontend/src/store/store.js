import { configureStore } from '@reduxjs/toolkit';
import { auth_reducer } from '../features/auth/auth-slice';
import { prendas_reducer } from '../features/prendas/state/prendas-slice';
import { outfits_reducer } from '../features/outfits/state/outfits-slice';

export const store = configureStore({
  reducer: {
    auth: auth_reducer,
    prendas: prendas_reducer,
    outfits: outfits_reducer,
  },
});
