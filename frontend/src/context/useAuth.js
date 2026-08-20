import { useContext } from "react";

import AuthContext from "./AuthContext";


export function useAuth() {
  return useContext(AuthContext);
}


export function readStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
}


export function getStoredAuth() {

  const token =
    localStorage.getItem("access_token");

  const user =
    readStoredUser();

  return {
    token,
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(token),
  };
}


export function clearAuth() {

  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user"
  );
}


export default useAuth;