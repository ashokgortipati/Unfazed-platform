import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session on application boot
  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await authApi.getCurrentSession();
      if (res.data.authenticated && res.data.user) {
        setUser(res.data.user);
        setRole(res.data.user.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      console.warn('Session verification error:', err.message);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const loginTherapist = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.loginTherapist({ email, password });
      setUser(res.data.user);
      setRole('therapist');
      return { success: true, user: res.data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const loginClient = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.loginClient({ email, password });
      setUser(res.data.user);
      setRole('client');
      return { success: true, user: res.data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const registerTherapist = async (formData) => {
    setAuthError(null);
    try {
      const res = await authApi.registerTherapist(formData);
      setUser(res.data.user);
      setRole('therapist');
      return { success: true, user: res.data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        authError,
        setAuthError,
        loginTherapist,
        loginClient,
        registerTherapist,
        logout,
        checkSession,
        isAuthenticated: !!user,
        isTherapist: role === 'therapist',
        isClient: role === 'client',
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
