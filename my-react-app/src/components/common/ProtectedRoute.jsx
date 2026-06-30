import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * Optionally restricts access to specific roles.
 * allowedRoles: e.g. ['STUDENT'] | ['PROFESSOR'] | ['PROFESSOR','HOD'] | ['MANAGEMENT']
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const effectiveRole = user.isHod ? 'HOD' : user.role;
    if (!allowedRoles.includes(effectiveRole) && !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
