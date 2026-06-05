import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Wait for session check before redirecting
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children || <Outlet />}</>;
}
