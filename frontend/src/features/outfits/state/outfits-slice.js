import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { delete_outfit_from_backend, fetch_outfits_from_backend } from '../api/outfits-api';

export const fetch_outfits_for_user = createAsyncThunk(
  'outfits/fetch_outfits_for_user',
  async (user_id, { rejectWithValue }) => {
    try {
      const normalized_user_id = String(user_id ?? '').trim();
      const outfits = await fetch_outfits_from_backend(normalized_user_id);
      return {
        user_id: normalized_user_id,
        outfits,
      };
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudieron cargar los outfits');
    }
  }
);

export const delete_outfit_by_id = createAsyncThunk(
  'outfits/delete_outfit_by_id',
  async (outfit_id, { rejectWithValue }) => {
    try {
      const normalized_outfit_id = String(outfit_id ?? '').trim();
      await delete_outfit_from_backend(normalized_outfit_id);
      return {
        outfit_id: normalized_outfit_id,
      };
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo eliminar el outfit');
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
};

const outfits_slice = createSlice({
  name: 'outfits',
  initialState: initial_state,
  reducers: {
    toggle_outfit_favorite: (state, action) => {
      const normalized_outfit_id = String(action.payload ?? '').trim();
      if (!normalized_outfit_id) {
        return;
      }

      const is_currently_favorite = state.favorite_ids.some(
        (favorite_id) => String(favorite_id) === normalized_outfit_id
      );

      state.favorite_ids = is_currently_favorite
        ? state.favorite_ids.filter((favorite_id) => String(favorite_id) !== normalized_outfit_id)
        : [...state.favorite_ids, normalized_outfit_id];
    },
    clear_outfits_state: (state) => {
      state.items = [];
      state.favorite_ids = [];
      state.status = 'idle';
      state.error = null;
      state.loaded_user_id = null;
      state.delete_status = 'idle';
      state.delete_error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch_outfits_for_user.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch_outfits_for_user.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload.outfits;
        state.loaded_user_id = action.payload.user_id;
      })
      .addCase(fetch_outfits_for_user.rejected, (state, action) => {
        state.status = 'failed';
        state.items = [];
        state.loaded_user_id = null;
        state.error = action.payload ?? 'No se pudieron cargar los outfits';
      })
      .addCase(delete_outfit_by_id.pending, (state) => {
        state.delete_status = 'loading';
        state.delete_error = null;
      })
      .addCase(delete_outfit_by_id.fulfilled, (state, action) => {
        state.delete_status = 'succeeded';
        state.delete_error = null;
        state.favorite_ids = state.favorite_ids.filter(
          (favorite_id) => String(favorite_id) !== String(action.payload.outfit_id)
        );
        state.items = state.items.filter(
          (outfit) => String(outfit?.id) !== String(action.payload.outfit_id)
        );
      })
      .addCase(delete_outfit_by_id.rejected, (state, action) => {
        state.delete_status = 'failed';
        state.delete_error = action.payload ?? 'No se pudo eliminar el outfit';
      });
  },
});

export const { clear_outfits_state, toggle_outfit_favorite } = outfits_slice.actions;
export const outfits_reducer = outfits_slice.reducer;
