import { api } from '../../api/client';
import type { AuthUser } from './authSlice';

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export async function registerRequest(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', input);
  return res.data;
}

export async function loginRequest(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', input);
  return res.data;
}

export async function refreshRequest(): Promise<{ accessToken: string }> {
  const res = await api.post<{ accessToken: string }>('/auth/refresh');
  return res.data;
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await api.get<{ user: AuthUser }>('/auth/me');
  return res.data.user;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}
