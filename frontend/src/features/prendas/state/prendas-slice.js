import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  create_prenda_from_image_ia_in_backend,
  create_prenda_manual_in_backend,
  delete_prenda_from_backend,
  fetch_prendas_for_user_from_backend,
  update_prenda_manual_in_backend,
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

export const update_prenda_manual = createAsyncThunk(
  'prendas/update_prenda_manual',
  async (payload, { rejectWithValue }) => {
    try {
      const prenda = await update_prenda_manual_in_backend(payload?.prenda_id, payload);
      return prenda;
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo actualizar la prenda');
    }
  }
);

export const create_prenda_from_image_ia = createAsyncThunk(
  'prendas/create_prenda_from_image_ia',
  async (payload, { rejectWithValue }) => {
    try {
      const prenda = await create_prenda_from_image_ia_in_backend(payload);
      return prenda;
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo crear la prenda con IA');
    }
  }
);

const initial_state = {
  items: [],
  favorite_ids: [],
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
    toggle_prenda_favorite: (state, action) => {
      const normalized_prenda_id = String(action.payload ?? '').trim();
      if (!normalized_prenda_id) {
        return;
      }

      const is_currently_favorite = state.favorite_ids.some(
        (favorite_id) => String(favorite_id) === normalized_prenda_id
      );

      state.favorite_ids = is_currently_favorite
        ? state.favorite_ids.filter((favorite_id) => String(favorite_id) !== normalized_prenda_id)
        : [...state.favorite_ids, normalized_prenda_id];
    },
    clear_prendas_state: (state) => {
      state.items = [];
      state.favorite_ids = [];
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
        state.favorite_ids = state.favorite_ids.filter(
          (favorite_id) => String(favorite_id) !== String(action.payload.prenda_id)
        );
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
      .addCase(update_prenda_manual.pending, (state) => {
        state.create_status = 'loading';
        state.create_error = null;
      })
      .addCase(update_prenda_manual.fulfilled, (state, action) => {
        state.create_status = 'succeeded';
        state.create_error = null;
        state.items = state.items.map((prenda) => (
          String(prenda?.id) === String(action.payload?.id)
            ? action.payload
            : prenda
        ));
      })
      .addCase(update_prenda_manual.rejected, (state, action) => {
        state.create_status = 'failed';
        state.create_error = action.payload ?? 'No se pudo actualizar la prenda';
      })
      .addCase(create_prenda_from_image_ia.pending, (state) => {
        state.create_status = 'loading';
        state.create_error = null;
      })
      .addCase(create_prenda_from_image_ia.fulfilled, (state, action) => {
        state.create_status = 'succeeded';
        state.create_error = null;
        state.items = [action.payload, ...state.items];
      })
      .addCase(create_prenda_from_image_ia.rejected, (state, action) => {
        state.create_status = 'failed';
        state.create_error = action.payload ?? 'No se pudo crear la prenda con IA';
      })
      .addCase(create_prenda_manual.rejected, (state, action) => {
        state.create_status = 'failed';
        state.create_error = action.payload ?? 'No se pudo crear la prenda';
      });
  },
});

export const { clear_prendas_state, toggle_prenda_favorite } = prendas_slice.actions;
export const prendas_reducer = prendas_slice.reducer;
