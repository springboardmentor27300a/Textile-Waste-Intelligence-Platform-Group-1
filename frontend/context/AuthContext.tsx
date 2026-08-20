"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  company?: string;
  phone?: string;
  theme: string;
  language: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSustainabilityManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("twip_token");
    const storedUser = localStorage.getItem("twip_user");
    const tokenTime = localStorage.getItem("twip_token_time");

    if (stored && storedUser) {
      // Check if token is within 1 year
      const TOKEN_VALID_MS = 365 * 24 * 60 * 60 * 1000; // 1 year
      const savedAt = tokenTime ? parseInt(tokenTime) : 0;
      const isExpired = Date.now() - savedAt > TOKEN_VALID_MS;

      if (isExpired) {
        // Token expired - clear everything
        localStorage.removeItem("twip_token");
        localStorage.removeItem("twip_user");
        localStorage.removeItem("twip_token_time");
      } else {
        // Token still valid - auto login
        setToken(stored);
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem("twip_token", access_token);
    localStorage.setItem("twip_user", JSON.stringify(userData));
    localStorage.setItem("twip_token_time", Date.now().toString());
    toast.success(`Welcome back, ${userData.full_name}!`);
    router.push("/dashboard");
  };

  const register = async (data: any) => {
    // Step 1: Create account
    await api.post("/auth/register", data);
    
    // Step 2: Auto sign-in immediately
    try {
      const loginRes = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const { access_token, user: userData } = loginRes.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("twip_token", access_token);
      localStorage.setItem("twip_user", JSON.stringify(userData));
      localStorage.setItem("twip_token_time", Date.now().toString());
      toast.success(`🎉 Welcome, ${userData.full_name}! Account created successfully.`);
      router.push("/dashboard");
    } catch {
      // If auto-login fails, go to login page
      toast.success("Account created! Please sign in.");
      router.push("/login");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("twip_token");
    localStorage.removeItem("twip_user");
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
        isSustainabilityManager: user?.role === "sustainability_manager",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
