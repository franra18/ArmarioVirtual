import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  create_prenda_manual_in_backend,
  delete_prenda_from_backend,
  fetch_prendas_for_user_from_backend,
} from '../api/prendas-api';

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

export const delete_prenda_by_id = createAsyncThunk(
  'prendas/delete_prenda_by_id',
  async (prenda_id, { rejectWithValue }) => {
    try {
      const normalized_prenda_id = String(prenda_id ?? '').trim();
      await delete_prenda_from_backend(normalized_prenda_id);
      return {
        prenda_id: normalized_prenda_id,
      };
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo eliminar la prenda');
    }
  }
);

export const create_prenda_manual = createAsyncThunk(
  'prendas/create_prenda_manual',
  async (payload, { rejectWithValue }) => {
    try {
      const prenda = await create_prenda_manual_in_backend(payload);
      return prenda;
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo crear la prenda');
    }
  }
);

const initial_state = {
  items: [],
  status: 'idle',
  error: null,
  loaded_user_id: null,
  delete_status: 'idle',
  delete_error: null,
  create_status: 'idle',
  create_error: null,
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
      state.delete_status = 'idle';
      state.delete_error = null;
      state.create_status = 'idle';
      state.create_error = null;
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
      })
      .addCase(delete_prenda_by_id.pending, (state) => {
        state.delete_status = 'loading';
        state.delete_error = null;
      })
      .addCase(delete_prenda_by_id.fulfilled, (state, action) => {
        state.delete_status = 'succeeded';
        state.delete_error = null;
        state.items = state.items.filter(
          (prenda) => String(prenda?.id) !== String(action.payload.prenda_id)
        );
      })
      .addCase(delete_prenda_by_id.rejected, (state, action) => {
        state.delete_status = 'failed';
        state.delete_error = action.payload ?? 'No se pudo eliminar la prenda';
      })
      .addCase(create_prenda_manual.pending, (state) => {
        state.create_status = 'loading';
        state.create_error = null;
      })
      .addCase(create_prenda_manual.fulfilled, (state, action) => {
        state.create_status = 'succeeded';
        state.create_error = null;
        state.items = [action.payload, ...state.items];
      })
      .addCase(create_prenda_manual.rejected, (state, action) => {
        state.create_status = 'failed';
        state.create_error = action.payload ?? 'No se pudo crear la prenda';
      });
  },
});

export const { clear_prendas_state } = prendas_slice.actions;
export const prendas_reducer = prendas_slice.reducer;
