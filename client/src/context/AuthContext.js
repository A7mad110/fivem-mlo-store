import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const logoutRef = useRef();

  const apiRef = useRef(null);
  if (!apiRef.current) {
    apiRef.current = axios.create({ baseURL: API });
  }
  const api = apiRef.current;

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      const t = localStorage.getItem('token');
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    const resInterceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && logoutRef.current) {
          logoutRef.current();
        }
        return Promise.reject(err);
      }
    );
    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [api]);

  const fetchUser = useCallback(async () => {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) { setLoading(false); return true; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return true;
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  logoutRef.current = logout;

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const setAuthToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const verifyEmail = async (code) => {
    const { data } = await api.post('/auth/verify', { code });
    setUser(data.user);
    return data;
  };

  const resendVerification = async () => {
    const { data } = await api.post('/auth/resend-verification');
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { email, code, newPassword });
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, token, api,
      login, register, logout, verifyEmail, setAuthToken,
      resendVerification, forgotPassword, resetPassword, fetchUser, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
