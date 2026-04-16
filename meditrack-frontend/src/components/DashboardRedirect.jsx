import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPostLoginPath } from '../lib/authRedirect';

/** Sends /dashboard to the correct role home. */
export default function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getPostLoginPath(user?.role)} replace />;
}
