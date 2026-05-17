// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('eventaura_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('eventaura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.vendorId === item.vendorId && i.packageName === item.packageName);
      if (exists) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (vendorId, packageName) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.vendorId === vendorId && i.packageName === packageName))
    );
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalAmount, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
