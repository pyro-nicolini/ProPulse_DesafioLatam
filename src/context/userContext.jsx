import { createContext, useContext, useState, useEffect } from "react";

const mockUser = {
  nombre: "Giordan",
  email: "giordan@giordan.com",
  rol: "admin",
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Genera un token falso dinámico
  const generateFakeToken = () => "fake-token-" + Date.now();

  const login = (userData = mockUser) => {
    const token = generateFakeToken();
    localStorage.setItem("token", token);
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Para saber si está logueado
  const isAuthenticated = !!user;

  // Mantener sesión al recargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ ...mockUser, token });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
