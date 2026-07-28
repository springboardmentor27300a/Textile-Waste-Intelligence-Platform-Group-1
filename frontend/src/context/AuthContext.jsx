import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Auth & Theme
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Theme Configuration
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }

      // 2. Authentication check
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch (err) {
          console.error("Session restoration failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Theme Toggle
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // Sign In Action
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        username: email,
        password,
        remember_me: rememberMe,
      });

      const { access_token, refresh_token } = res.data;

      if (rememberMe) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('remember_me', 'true');
      } else {
        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('remember_me', 'false');
      }

      // Fetch User Details
      const userRes = await api.get('/users/me');
      setUser(userRes.data);
      setLoading(false);
      return userRes.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Sign Up Action
  const register = async (email, fullName, password, roleName, organizationName, contactDetails) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        email,
        full_name: fullName,
        password,
        role_name: roleName,
        organization_name: organizationName || null,
        contact_details: contactDetails || null,
      });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Log Out Action
  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (err) {
        console.error("Revoke session failed on server:", err);
      }
    }

    // Clear local states
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/users/me', profileData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    loading,
    darkMode,
    login,
    register,
    logout,
    updateProfile,
    toggleDarkMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
