import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@app/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null; // kept in memory only — never localStorage
}

const initialState: AuthState = { user: null, accessToken: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set after login/register.
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    // Set after a silent refresh (user unchanged, new access token).
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    // Clear on logout / failed refresh.
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, setAccessToken, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
