import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/img/logos/logo_color_w.png";

import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <img className="navbar-brand" src={logo} alt="ProPulse" />

        <button
          aria-label="Abrir menú"
          onClick={() => setOpen((prev) => !prev)}
          className="nav-toggle"
        >
          &#9776;
        </button>

        <div className="nav-links">
          {user ? (
            <Link className="nav-link" to="/profile-user">
              Perfil
            </Link>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </>
          )}
          <Link className="nav-link" to="/">
            Home
          </Link>
          <Link className="nav-link plantilla" to="/plantilla">
            Plantilla
          </Link>
          <Link className="nav-link" to="/productos">
            Productos
          </Link>
          <Link className="nav-link" to="/servicios">
            Servicios
          </Link>
          <Link className="nav-link" to="/contacto">
            Contacto
          </Link>
          <Link className="nav-link" to="/cart">
            <i className="fas fa-shopping-cart"></i>
            Carrito
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          {user ? (
            <Link to="/profile-user" onClick={() => setOpen(false)}>
              Perfil
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                Register
              </Link>
            </>
          )}
          <Link to="/productos" onClick={() => setOpen(false)}>
            Productos
          </Link>
          <Link to="/servicios" onClick={() => setOpen(false)}>
            Servicios
          </Link>
          <Link to="/contacto" onClick={() => setOpen(false)}>
            Contacto
          </Link>
          <Link to="/cart" onClick={() => setOpen(false)}>
            <i className="fas fa-shopping-cart"></i>
            Carrito
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
