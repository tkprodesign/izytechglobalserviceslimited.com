import { Navigate, useLocation } from 'react-router';
import { getUser, loginPathForRoute } from '../../lib/auth';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'developer';
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const user = getUser();
  const location = useLocation();

  if (!user) return <Navigate to={loginPathForRoute(location.pathname)} replace />;

  // developer can access everything; admin can only access admin areas
  if (requiredRole === 'developer' && user.role !== 'developer') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
