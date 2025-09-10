import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

const mockUser = {
  nombre: "Giordan",
  email: "giordan@giordan.com",
  password: "giordan23",
  rol: "admin",
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
