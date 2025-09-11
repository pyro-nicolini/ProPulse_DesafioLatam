import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppProviders from "./AppProviders";
import { PrivateRoute } from "./routes/PrivateRoute";
import Navbar from "./componentes/Navbar";

// Public routes
import Plantilla from "./vistas/publico/Plantilla";
import Home from "./vistas/publico/Home";
import Login from "./vistas/publico/Login";
import Register from "./vistas/publico/Register";
import Productos from "./vistas/publico/GaleriaProductos";
import Servicios from "./vistas/publico/GaleriaServicios";
import Producto from "./vistas/publico/Producto";
import Planes from "./vistas/publico/Planes";
import Servicio from "./vistas/publico/Servicios";
import Contacto from "./vistas/publico/Contacto";

// Client private routes
import ResumenOrden from "./vistas/client/ResumenOrden";
import ResenaForm from "./vistas/client/ResenaForm";
import ProfileUser from "./vistas/client/ProfileUser";
import Pedido from "./vistas/client/Pedido";
import Favorite from "./vistas/client/Favorite";
import CarritoPreOrden from "./vistas/client/CarritoPreOrden";

// Admin private routes
import AdminShop from "./vistas/admin/AdminShop";
import AdminVentas from "./vistas/admin/AdminVentas";
import AdminProductosForm from "./vistas/admin/AdminProductosForm";
import AdminProductos from "./vistas/admin/AdminProductos";

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/plantilla" element={<Plantilla />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<Producto />} /> {/* con param */}
          <Route path="/planes" element={<Planes />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicios/:id" element={<Servicio />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* Client private routes */}
          <Route
            path="/resumen-orden"
            element={
              <PrivateRoute roles={["admin", "cliente"]}>
                <ResumenOrden />
              </PrivateRoute>
            }
          />
          <Route
            path="/resena-form"
            element={
              <PrivateRoute roles={["admin", "cliente"]}>
                <ResenaForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile-user"
            element={
              <PrivateRoute roles={["admin", "cliente"]}>
                <ProfileUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/pedidos/:id"
            element={
              <PrivateRoute roles={["admin", "cliente"]}>
                <Pedido />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorite"
            element={
              <PrivateRoute roles={["admin", "cliente"]}>
                <Favorite />
              </PrivateRoute>
            }
          />
          <Route
            path="/carrito-preorden"
            element={
              <PrivateRoute roles={["admin", "cliente"]}>
                <CarritoPreOrden />
              </PrivateRoute>
            }
          />

          {/* Admin private routes */}
          <Route
            path="/admin-shop"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminShop />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-ventas"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminVentas />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-productos-form"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminProductosForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-productos"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminProductos />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
