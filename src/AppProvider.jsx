import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import InactividadManager from "./InactividadManager";

const AppContext = createContext();

export function useUser() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(
    localStorage.getItem("user") ? localStorage.getItem("user") : ""
  );

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user")
  };

  useEffect(() => {
    // Verificar si el usuario está presente en localStorage al cargar la aplicación
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Si no hay usuario en localStorage, cerrar sesión
      logout();
      <Navigate to="/login" />;
    }
  }, []);

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      <InactividadManager onInactividad={logout}/>
      {children}
    </AppContext.Provider>
  );
}
