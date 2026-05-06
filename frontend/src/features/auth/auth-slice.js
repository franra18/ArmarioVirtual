import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetch_user_profile_from_backend,
  resolve_user_profile_from_firebase_user,
  sign_in_with_email_password,
  sign_out_from_firebase,
  sign_up_with_email_password,
  update_user_name_in_backend,
} from './auth-api';

export const sign_in_with_email = createAsyncThunk(
  'auth/sign_in_with_email',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const firebase_user = await sign_in_with_email_password(email, password);
      return await resolve_user_profile_from_firebase_user(firebase_user);
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo iniciar sesion');
    }
  }
);

export const sign_up_with_email = createAsyncThunk(
  'auth/sign_up_with_email',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const firebase_user = await sign_up_with_email_password(email, password);
      return await resolve_user_profile_from_firebase_user(firebase_user);
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo crear la cuenta');
    }
  }
);

export const load_firebase_user_profile = createAsyncThunk(
  'auth/load_firebase_user_profile',
  async (firebase_user, { rejectWithValue }) => {
    try {
      return await resolve_user_profile_from_firebase_user(firebase_user);
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo restaurar la sesion');
    }
  }
);

export const sign_out_session = createAsyncThunk(
  'auth/sign_out_session',
  async (_, { rejectWithValue }) => {
    try {
      await sign_out_from_firebase();
      return true;
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo cerrar la sesion');
    }
  }
);

export const update_user_profile_name = createAsyncThunk(
  'auth/update_user_profile_name',
  async ({ user_id, nombre }, { rejectWithValue }) => {
    try {
      await update_user_name_in_backend(user_id, nombre);
      return await fetch_user_profile_from_backend(user_id);
    } catch (error) {
      return rejectWithValue(error?.message ?? 'No se pudo actualizar el perfil');
    }
  }
);

const initial_state = {
  user_id: null,
  profile: null,
  firebase_uid: null,
  firebase_email: null,
  status: 'idle',
  error: null,
  update_status: 'idle',
  update_error: null,
};

const apply_user_session = (state, payload) => {
  state.status = 'succeeded';
  state.error = null;
  state.profile = payload.profile;
  state.user_id = payload.user_id;
  state.firebase_uid = payload.firebase_uid;
  state.firebase_email = payload.firebase_email;
};

const auth_slice = createSlice({
  name: 'auth',
  initialState: initial_state,
  reducers: {
    clear_user_session: (state) => {
      state.user_id = null;
      state.profile = null;
      state.firebase_uid = null;
      state.firebase_email = null;
      state.status = 'idle';
      state.error = null;
      state.update_status = 'idle';
      state.update_error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sign_in_with_email.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sign_in_with_email.fulfilled, (state, action) => {
        apply_user_session(state, action.payload);
      })
      .addCase(sign_in_with_email.rejected, (state, action) => {
        state.status = 'failed';
        state.profile = null;
        state.user_id = null;
        state.firebase_uid = null;
        state.firebase_email = null;
        state.error = action.payload ?? 'No se pudo iniciar sesion';
      });
    builder
      .addCase(sign_up_with_email.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sign_up_with_email.fulfilled, (state, action) => {
        apply_user_session(state, action.payload);
      })
      .addCase(sign_up_with_email.rejected, (state, action) => {
        state.status = 'failed';
        state.profile = null;
        state.user_id = null;
        state.firebase_uid = null;
        state.firebase_email = null;
        state.error = action.payload ?? 'No se pudo crear la cuenta';
      });
    builder
      .addCase(load_firebase_user_profile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(load_firebase_user_profile.fulfilled, (state, action) => {
        apply_user_session(state, action.payload);
      })
      .addCase(load_firebase_user_profile.rejected, (state, action) => {
        state.status = 'failed';
        state.profile = null;
        state.user_id = null;
        state.firebase_uid = null;
        state.firebase_email = null;
        state.error = action.payload ?? 'No se pudo restaurar la sesion';
      });
    builder
      .addCase(sign_out_session.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sign_out_session.fulfilled, (state) => {
        state.user_id = null;
        state.profile = null;
        state.firebase_uid = null;
        state.firebase_email = null;
        state.status = 'idle';
        state.error = null;
        state.update_status = 'idle';
        state.update_error = null;
      })
      .addCase(sign_out_session.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'No se pudo cerrar la sesion';
      });
    builder
      .addCase(update_user_profile_name.pending, (state) => {
        state.update_status = 'loading';
        state.update_error = null;
      })
      .addCase(update_user_profile_name.fulfilled, (state, action) => {
        state.update_status = 'succeeded';
        state.update_error = null;
        state.profile = action.payload;
        state.user_id = action.payload.id;
      })
      .addCase(update_user_profile_name.rejected, (state, action) => {
        state.update_status = 'failed';
        state.update_error = action.payload ?? 'No se pudo actualizar el perfil';
      });
  },
});

export const { clear_user_session } = auth_slice.actions;
export const auth_reducer = auth_slice.reducer;
