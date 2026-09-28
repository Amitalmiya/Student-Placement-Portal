import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import endpoints from '../api/endpoints.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pp_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pp_user');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    const res = await api.post(endpoints.auth.login, { email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('pp_token', token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post(endpoints.auth.register, payload);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(endpoints.auth.logout);
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
  }, []);

  const value = { user, setUser, login, register, logout, loading, setLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
