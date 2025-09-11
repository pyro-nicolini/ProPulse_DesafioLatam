import { createContext, useContext, useState } from "react";
import { mockCart } from "../mocks/mockCart";

const CartContext = createContext();




export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(mockCart);

  // Agregar producto
  const addToCart = (product, cantidad = 1) => {
    setCart((prev) => {
      const existingItem = prev.items.find((i) => i.productId === product.id);

      let updatedItems;
      if (existingItem) {
        updatedItems = prev.items.map((i) =>
          i.productId === product.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            productId: product.id,
            nombre: product.nombre,
            cantidad,
            precioUnitario: product.precio,
          },
        ];
      }

      const newTotal = updatedItems.reduce(
        (acc, i) => acc + i.cantidad * i.precioUnitario,
        0
      );

      return { items: updatedItems, total: newTotal };
    });
  };

  // Quitar producto
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((i) => i.productId !== productId);
      const newTotal = updatedItems.reduce(
        (acc, i) => acc + i.cantidad * i.precioUnitario,
        0
      );
      return { items: updatedItems, total: newTotal };
    });
  };

  // Vaciar carrito
  const clearCart = () => setCart(mockCart);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
