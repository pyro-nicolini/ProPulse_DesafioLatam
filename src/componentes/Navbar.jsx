import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/img/logos/logo_color_w.png";
import CartWidget from "../componentes/CartWidget";
import { useAuth } from "../contexts/AuthContext";
// import { logout } from "../api/proPulseApi";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout: doLogout } = useAuth();

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar container">
        <Link className="nav-link" to="/profile-user" onClick={closeMenu}>
          <img className="navbar-brand" src={logo} alt="ProPulse" />
        </Link>

        <button
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
          className="nav-toggle"
        >
          &#9776;
        </button>

        {user ? <CartWidget /> : null}

        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-link">Hola, {user.nombre}</span>
              <button onClick={doLogout} className="nav-link btn-logout">
                Salir
              </button>
            </>
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
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          {user ? (
            <>
              <span className="nav-link">Hola, {user.nombre}</span>
              <button onClick={doLogout} className="nav-link btn-logout">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}

          <Link to="/productos" onClick={closeMenu}>
            Productos
          </Link>
          <Link to="/servicios" onClick={closeMenu}>
            Servicios
          </Link>
          <Link to="/contacto" onClick={closeMenu}>
            Contacto
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
