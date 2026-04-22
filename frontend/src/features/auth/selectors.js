export const select_auth_profile = (state) => state.auth.profile;
export const select_auth_user_id = (state) => state.auth.user_id;
export const select_is_authenticated = (state) => Boolean(state.auth.user_id);
export const select_auth_status = (state) => state.auth.status;
export const select_auth_error = (state) => state.auth.error;
