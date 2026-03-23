/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_CHANGED_EVENT = "auth:changed";

const parseStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const getStoredAuth = () => ({
  token: localStorage.getItem("token"),
  user: parseStoredUser(),
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredAuth().token);
  const [user, setUser] = useState(() => getStoredAuth().user);

  const syncFromStorage = () => {
    const stored = getStoredAuth();
    setToken(stored.token);
    setUser(stored.user);
  };

  const login = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  };

  useEffect(() => {
    const handleStorage = () => syncFromStorage();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
