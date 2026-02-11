import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(product, quantity = 1) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setCart(prev => {
      const item = prev.find(p => p.id === product.id);

      if (item) {
        return prev.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + qty }
            : p
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
