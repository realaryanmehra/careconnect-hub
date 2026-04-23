// Auth context - manages login state
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = "careconnect_auth_token";
const STORAGE_USER_KEY = "careconnect_auth_user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const savedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

const persistAuth = (token, user) => {
  setToken(token);
  setUser(user);
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
};

const login = async ({ email, password }) => {
  const data = await apiRequest("/api/auth/login", {
    method: "POST", body: JSON.stringify({ email, password })
  });
  persistAuth(data.token, data.user);
  return data.user;
};

const loginWithGoogle = async (googleToken) => {
  const data = await apiRequest("/api/auth/google", {
    method: "POST", body: JSON.stringify({ token: googleToken })
  });
  persistAuth(data.token, data.user);
  return data.user;
};

const register = async ({ name, email, password }) => {
  const data = await apiRequest("/api/auth/register", {
    method: "POST", body: JSON.stringify({ name, email, password })
  });
  persistAuth(data.token, data.user);
  return data.user;
};

const logout = () => {
  setToken(null);
  setUser(null);
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
};

const value = { token, user, loading, isAuthenticated: Boolean(token), isAdmin: user?.role === 'admin', login, loginWithGoogle, register, logout };
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to access auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};



