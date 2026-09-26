import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stocksense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('stocksense_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('stocksense_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // Keep current user state
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res?.data?.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('stocksense_token', res.data.token);
        localStorage.setItem('stocksense_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      throw new Error(res?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await authApi.signup({ name, email, password, role });
      if (res?.data?.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('stocksense_token', res.data.token);
        localStorage.setItem('stocksense_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      throw new Error(res?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('stocksense_token');
    localStorage.removeItem('stocksense_user');
  };

  const isAuthorized = (allowedRoles = []) => {
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
        isAuthorized,
        role: user?.role || 'WAREHOUSE_STAFF',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
