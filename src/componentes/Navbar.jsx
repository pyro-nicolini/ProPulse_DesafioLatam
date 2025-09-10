import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/userContext";


const Navbar = () => {
  const { user, isAuthenticated } = useUser();

  return (
    <nav style={{ padding: "1rem", background: "#f5f5f5", display: "flex", gap: "1rem" }}>
      <Link to="/"><img src="/path/to/logo.png" alt="Logo"/></Link>
      <Link to="/galeria">Productos</Link>
      <Link to="/servicios">Contacto</Link>
      {isAuthenticated ? (
        <Link to="/profile-user">Perfil</Link>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;