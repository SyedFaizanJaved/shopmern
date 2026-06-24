import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

// Gate for routes that require a logged-in user. If there's no user in the
// store, redirect to /login. Used for checkout (Milestone 5) and admin pages.
export function ProtectedRoute() {
  const user = useAppSelector((s) => s.auth.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
