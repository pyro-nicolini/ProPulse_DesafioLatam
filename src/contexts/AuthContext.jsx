// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  me as apiMe,
  logout as apiLogout,
} from "../api/proPulseApi";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const IS_REAL_API = (import.meta.env.VITE_API_BASE_URL || "").includes("/api");

function normalizeUser(u) {
  if (!u || typeof u !== "object") return null;
  const id_usuario = u.id_usuario ?? u.id ?? null;
  return { ...u, id_usuario, id: id_usuario ?? u.id };
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // MVP: hidratar desde sessionStorage; si hay token y es real, intentar /auth/me (silencioso)
  useEffect(() => {
    const raw = sessionStorage.getItem("loggedUser");
    if (raw) setUser(normalizeUser(JSON.parse(raw)));

    (async () => {
      if (!IS_REAL_API) return;
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const { data } = await apiMe();
        const u = normalizeUser(data);
        if (u) {
          setUser(u);
          sessionStorage.setItem("loggedUser", JSON.stringify(u));
        }
      } catch {
        // token inválido: limpiar sesión
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("loggedUser");
        setUser(null);
      }
    })();
  }, []);

  const login = async (payload) => {
    const { data } = await apiLogin(payload); // { token, user }
    const u = normalizeUser(data?.user);
    if (!u) throw new Error("Respuesta de login inválida");
    // Guardar token siempre (mock: id_usuario como string, real: token real)
    if (data?.token) sessionStorage.setItem("token", String(data.token));
    sessionStorage.setItem("loggedUser", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const { data } = await apiRegister(payload); // { token, user }
    const u = normalizeUser(data?.user);
    if (!u) throw new Error("Respuesta de registro inválida");
    // Guardar token siempre (mock: id_usuario como string, real: token real)
    if (data?.token) sessionStorage.setItem("token", String(data.token));
    sessionStorage.setItem("loggedUser", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {} // tolerante en mock
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("loggedUser");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuth: !!user, login, register, logout }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
