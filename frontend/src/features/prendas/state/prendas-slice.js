import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetch_prendas_for_user_from_backend } from '../api/prendas-api';

export const fetch_prendas_for_user = createAsyncThunk(
  'prendas/fetch_prendas_for_user',
  async (user_id, { rejectWithValue }) => {
    try {
      const normalized_user_id = String(user_id ?? '').trim();
      const prendas = await fetch_prendas_for_user_from_backend(normalized_user_id);
      return {
        user_id: normalized_user_id,
        prendas,
      };
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudieron cargar las prendas');
    }
  }
);

const initial_state = {
  items: [],
  status: 'idle',
  error: null,
  loaded_user_id: null,
};

const prendas_slice = createSlice({
  name: 'prendas',
  initialState: initial_state,
  reducers: {
    clear_prendas_state: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.loaded_user_id = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch_prendas_for_user.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch_prendas_for_user.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload.prendas;
        state.loaded_user_id = action.payload.user_id;
      })
      .addCase(fetch_prendas_for_user.rejected, (state, action) => {
        state.status = 'failed';
        state.items = [];
        state.loaded_user_id = null;
        state.error = action.payload ?? 'No se pudieron cargar las prendas';
      });
  },
});

export const { clear_prendas_state } = prendas_slice.actions;
export const prendas_reducer = prendas_slice.reducer;
