import { useAuth } from '../context/AuthContext';

/** Maps backend roles to display/API-style names (similar to NextAuth session.user.role). */
function toSessionRole(dbRole) {
  if (dbRole === 'shop_owner') return 'SHOP_OWNER';
  if (dbRole === 'admin') return 'ADMIN';
  return 'PATIENT';
}

/**
 * NextAuth-like hook for this Vite SPA: use `session.user.role` as PATIENT | SHOP_OWNER | ADMIN.
 * (NextAuth.js only works in Next.js; this app uses React Router + JWT.)
 */
export function useSession() {
  const { user, isAuthenticated, loading } = useAuth();
  const status = loading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated';
  const sessionUser = user
    ? {
        ...user,
        role: toSessionRole(user.role)
      }
    : null;
  return {
    data: { user: sessionUser },
    status,
    user: sessionUser
  };
}
