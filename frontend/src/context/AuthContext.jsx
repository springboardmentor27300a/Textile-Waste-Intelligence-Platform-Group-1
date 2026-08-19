import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
        localStorage.setItem(
          "auth_user",
          JSON.stringify(currentUser)
        );
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const loginData = await loginUser(email, password);

    localStorage.setItem(
      "access_token",
      loginData.access_token
    );

    const currentUser = await getCurrentUser();

    const completeUser = {
      ...currentUser,
      role: loginData.role,
    };

    setUser(completeUser);

    localStorage.setItem(
      "auth_user",
      JSON.stringify(completeUser)
    );

    return completeUser;
  };

  const register = async (payload) => {
    return registerUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}