import  AuthProvider from "./contexts/AuthContext";
import { CatalogProvider } from "./contexts/CatalogContext";
import  CartProvider  from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { AdminProductsProvider } from "./contexts/AdminProductsContext";
import { UIProvider } from "./contexts/UIContext"; // opcional


/* usar esto en cualquier ruta para usar  */

export default function AppProviders({ children }) {
  return (
    <UIProvider>
      <AuthProvider>
        <CatalogProvider>
          <FavoritesProvider>
            <CartProvider>
              <OrderProvider>
                <ReviewProvider>
                  <AdminProductsProvider>
                    {children}
                  </AdminProductsProvider>
                </ReviewProvider>
              </OrderProvider>
            </CartProvider>
          </FavoritesProvider>
        </CatalogProvider>
      </AuthProvider>
    </UIProvider>
  );
}
