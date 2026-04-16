import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPostLoginPath } from '../lib/authRedirect';

// Basic Login Check
export const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

/** Legacy: allowedRoles uses backend role strings (patient, shop_owner, admin). */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  const ok = allowedRoles.includes(user?.role) || user?.role === 'admin';
  return ok ? <Outlet /> : <Navigate to={getPostLoginPath(user?.role)} replace />;
};

/**
 * Only users whose role is in `allow` (or admin) may access child routes.
 * Others are sent to `redirectTo`.
 */
export const RoleRoute = ({ allow, redirectTo }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = user?.role;
  if (allow.includes(r) || r === 'admin') return <Outlet />;
  return <Navigate to={redirectTo} replace />;
};