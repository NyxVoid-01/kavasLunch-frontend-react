import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageSkeleton from '@/components/PageSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (!user) {
    // Hay un token pero aún no se pudo leer al usuario: esqueleto en lugar de un spinner
    if (isLoading) return <PageSkeleton />;
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
