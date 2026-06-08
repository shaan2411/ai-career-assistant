/**
 * AuthContext.js
 * Manages authentication state, login, register, logout, and user updates.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Verify token with the server ──
  const verifyToken = useCallback(async (storedToken) => {
    try {
      const res = await axiosInstance.get('/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setUser(res.data.user || res.data);
      setIsAuthenticated(true);
    } catch {
      // Token invalid – clean up
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  }, []);

  // ── On Mount: restore session from localStorage ──
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        // Silently verify in background
        await verifyToken(storedToken);
      }
      setLoading(false);
    };
    init();
  }, [verifyToken]);

  // ── Login ──
  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    return newUser;
  };

  // ── Register ──
  const register = async (name, email, password) => {
    const res = await axiosInstance.post('/auth/register', { name, email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    return newUser;
  };

  // ── Logout ──
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  // ── Update User ──
  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
