import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const ROLE_LABELS = {
  administrator: "Administrator",
  recycling_facility_operator: "Recycling Facility Operator",
  sustainability_manager: "Sustainability Manager",
  textile_manufacturer: "Textile Manufacturer",
};

export const ROLE_COLORS = {
  administrator: "#8B5CF6", // Purple
  recycling_facility_operator: "#10B981", // Emerald
  sustainability_manager: "#06B6D4", // Cyan
  textile_manufacturer: "#F59E0B", // Amber
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.getMe()
        .then((u) => {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
