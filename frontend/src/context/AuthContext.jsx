/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useMemo,
} from "react";


const AuthContext = createContext({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
});


function readUser() {

  try {

    return JSON.parse(
      localStorage.getItem("user") || "null"
    );

  } catch {

    return null;

  }
}


export function AuthProvider({ children }) {

  const value = useMemo(() => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const user =
      readUser();

    return {
      token,
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(token),
    };

  }, []);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  return useContext(
    AuthContext
  );

}


export default AuthContext;