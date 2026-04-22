import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetch_user_profile_from_backend } from './auth-api';

export const fetch_user_session = createAsyncThunk(
  'auth/fetch_user_session',
  async (user_id, { rejectWithValue }) => {
    try {
      return await fetch_user_profile_from_backend(user_id);
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo iniciar sesion');
    }
  }
);

const initial_state = {
  user_id: null,
  profile: null,
  status: 'idle',
  error: null,
};

const auth_slice = createSlice({
  name: 'auth',
  initialState: initial_state,
  reducers: {
    clear_user_session: (state) => {
      state.user_id = null;
      state.profile = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch_user_session.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch_user_session.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.profile = action.payload;
        state.user_id = action.payload.id;
      })
      .addCase(fetch_user_session.rejected, (state, action) => {
        state.status = 'failed';
        state.profile = null;
        state.user_id = null;
        state.error = action.payload ?? 'No se pudo iniciar sesion';
      });
  },
});

export const { clear_user_session } = auth_slice.actions;
export const auth_reducer = auth_slice.reducer;
