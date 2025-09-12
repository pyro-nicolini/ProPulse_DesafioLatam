import AuthProvider from "./contexts/AuthContext";
import CartProvider from "./contexts/CartContext";
import { UIProvider } from "./contexts/UIContext"; // opcional

/* usar esto en cualquier ruta para usar  */

export default function AppProviders({ children }) {
  return (
    <UIProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </UIProvider>
  );
}
