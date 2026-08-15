import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('twip_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('twip_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem('twip_token', data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    await api.register(payload);
    return login(payload.email, payload.password);
  }

  async function oauth2Login(provider = 'google', role = 'recycling_facility_operator') {
    const data = await api.oauth2Login({ provider, role });
    localStorage.setItem('twip_token', data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('twip_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, oauth2Login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
