import { createContext, useReducer, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// ── Purge stale mock/demo sessions on startup ─────────────────────
// If localStorage still holds the old demo data that the mock interceptor
// injected, clear it so the real login flow takes over.
(() => {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser  = JSON.parse(localStorage.getItem('user') || 'null');
    const isMockToken = storedToken === 'mock-jwt-token';
    const isDemoUser  = storedUser?.email === 'demo@meditrack.local' || storedUser?._id === '1';
    if (isMockToken || isDemoUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  } catch (_) {
    // JSON parse can fail on corrupt data — just clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
})();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'AUTH_ERROR':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
  });

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    return res.data.user;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });
  /** Clear session and local credentials (same as logout; use for sign-out buttons). */
  const signOut = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);