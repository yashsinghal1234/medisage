import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Server-verified bootstrap instead of trusting localStorage: an expired
    // session is rotated once, an invalid one is cleared, and offline mode
    // gracefully keeps the cached profile.
    const initAuth = async () => {
      try {
        const currentUser = await authService.bootstrapAuth();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const loginDemo = async () => {
    const data = await authService.loginDemo();
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async (googleData) => {
    const data = await authService.googleAuth(googleData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Server-persisted profile edits with optimistic local merge (offline-safe)
  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    if (updated) setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        loginDemo,
        loginWithGoogle,
        logout,
        updateProfile,
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
