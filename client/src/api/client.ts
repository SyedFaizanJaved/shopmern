import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { store } from '../app/store';
import { setAccessToken, clearCredentials } from '../features/auth/authSlice';

// One shared Axios instance. withCredentials: true makes the browser send and
// receive the httpOnly refresh cookie on cross-origin requests.
export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

// REQUEST interceptor: attach the in-memory access token to every request.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Dedupe concurrent refreshes: if many requests 401 at once, only ONE hits
// /auth/refresh; the rest await the same promise.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Use bare axios (not `api`) so this call skips the interceptors below.
    const res = await axios.post<{ accessToken: string }>(
      `${env.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    store.dispatch(setAccessToken(res.data.accessToken));
    return res.data.accessToken;
  } catch {
    store.dispatch(clearCredentials()); // refresh failed → log the user out
    return null;
  }
}

// RESPONSE interceptor: on a 401, try ONE refresh then replay the request.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true; // mark so we never loop
      refreshing ??= refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // retry the original request with the fresh token
      }
    }

    return Promise.reject(error);
  },
);
