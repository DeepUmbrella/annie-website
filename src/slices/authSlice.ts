import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, login, register } from '../service/authService';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profile: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await login({
      email,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: { username: string; email: string; password: string }) => {
    const response = await register({
      username,
      email,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const response = await getCurrentUser();
    return response.data;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '注册失败';
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
