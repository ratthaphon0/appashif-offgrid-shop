import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { Product, products } from '@/constants/shop';

type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  cartCount: number;
  addItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const initialQuantities: Record<string, number> = {
  'acid-grid-tee': 1,
  'pixel-rush-hoodie': 1,
};

export function CartProvider({ children }: PropsWithChildren) {
  const [quantities, setQuantities] = useState(initialQuantities);

  const value = useMemo<CartContextValue>(() => {
    const items = products
      .filter((product) => (quantities[product.id] ?? 0) > 0)
      .map((product) => ({ product, quantity: quantities[product.id] }));

    return {
      items,
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem: (productId) => {
        setQuantities((current) => ({
          ...current,
          [productId]: (current[productId] ?? 0) + 1,
        }));
      },
      updateQuantity: (productId, quantity) => {
        setQuantities((current) => ({
          ...current,
          [productId]: Math.max(0, quantity),
        }));
      },
    };
  }, [quantities]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return value;
}
