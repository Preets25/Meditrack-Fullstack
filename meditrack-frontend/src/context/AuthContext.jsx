import { createContext, useReducer, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

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