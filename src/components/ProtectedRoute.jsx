import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles, allowGuest = false }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height:'60vh' }}>
      <div className="red-spinner"/>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  // Guest allowed on this route?
  if (user.isGuest && !allowGuest) return <Navigate to="/login" replace />;

  // Role check (skip for guest — they can only see allowGuest routes)
  if (roles && !user.isGuest && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
