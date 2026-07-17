import { Navigate } from 'react-router';
import { getUser } from '../../lib/auth';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'developer';
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const user = getUser();

  if (!user) return <Navigate to="/admin/login" replace />;

  // developer can access everything; admin can only access admin areas
  if (requiredRole === 'developer' && user.role !== 'developer') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
