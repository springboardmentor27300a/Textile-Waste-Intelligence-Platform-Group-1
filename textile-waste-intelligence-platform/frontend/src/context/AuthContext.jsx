import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('twip_user');
    const storedAdmin = localStorage.getItem('twip_admin_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('twip_user');
      }
    }
    
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        localStorage.removeItem('twip_admin_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Standard user login action
  const loginUser = useCallback((userData, token) => {
    localStorage.setItem('twip_token', token);
    localStorage.setItem('twip_user', JSON.stringify(userData));
    setUser(userData);
    if (userData?.role === 'Administrator' || userData?.role === 'admin') {
      localStorage.setItem('twip_admin_token', token);
      localStorage.setItem('twip_admin_user', JSON.stringify(userData));
      setAdmin(userData);
    }
  }, []);

  // Standard user logout action
  const logoutUser = useCallback(() => {
    localStorage.removeItem('twip_token');
    localStorage.removeItem('twip_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  // Admin login action
  const loginAdmin = useCallback((adminData, token) => {
    const adminUser = {
      id: adminData.admin_id,
      name: adminData.name,
      email: adminData.admin_id,
      role: adminData.role || 'Administrator',
      isActive: true
    };
    localStorage.setItem('twip_admin_token', token);
    localStorage.setItem('twip_admin_user', JSON.stringify(adminData));
    localStorage.setItem('twip_token', token);
    localStorage.setItem('twip_user', JSON.stringify(adminUser));
    setAdmin(adminData);
    setUser(adminUser);
  }, []);

  // Admin logout action
  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('twip_admin_token');
    localStorage.removeItem('twip_admin_user');
    localStorage.removeItem('twip_token');
    localStorage.removeItem('twip_user');
    setAdmin(null);
    setUser(null);
    toast.success('Admin logged out successfully');
  }, []);

  // Unified logout action (called by Sidebar.jsx)
  const logout = useCallback(() => {
    localStorage.removeItem('twip_token');
    localStorage.removeItem('twip_user');
    localStorage.removeItem('twip_admin_token');
    localStorage.removeItem('twip_admin_user');
    setUser(null);
    setAdmin(null);
    toast.success('Logged out successfully');
  }, []);

  // Update user profile in local state
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('twip_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isLoading,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
