export type Role = 'user' | 'admin';

export interface ApiError {
  message: string;
  code?: string;
}
