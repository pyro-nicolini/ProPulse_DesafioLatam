// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, me as apiMe, logout as apiLogout } from "../api/proPulseApi";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // Carga usuario si hay token
  const refreshMe = async () => {
    try {
      const { data } = await apiMe();
      setUser(data ?? null);
    } catch {
      setUser(null);
    } finally {
      setBooting(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  // === Acciones ===
  const doLogin = async (credentials) => {
    const { data } = await apiLogin(credentials); // { token, user }
    if (data?.token) {
      window.sessionStorage.setItem("token", data.token);
      setUser(data.user);
    }
    return data;
  };

  const doLogout = async () => {
    try {
      await apiLogout();
    } catch {}
    window.sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, booting, doLogin, doLogout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}
