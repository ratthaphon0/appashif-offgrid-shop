import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { fallbackProducts, Product } from '@/constants/shop';

export const PRODUCT_JSON_URL =
  'https://raw.githubusercontent.com/ratthaphon0/appashif-offgrid-shop/main/assets/data/products.json';

type ProductContextValue = {
  products: Product[];
  source: 'github' | 'fallback';
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductContextValue | null>(null);

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const product = value as Partial<Product>;
  return (
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    typeof product.description === 'string' &&
    typeof product.price === 'number' &&
    typeof product.stock === 'number' &&
    Array.isArray(product.images) &&
    product.images.length > 0
  );
}

export function ProductProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [source, setSource] = useState<'github' | 'fallback'>('fallback');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(PRODUCT_JSON_URL);
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isProduct)) {
        throw new Error('GitHub JSON does not match the product schema');
      }
      setProducts(data);
      setSource('github');
      setError(null);
    } catch (caught) {
      setProducts(fallbackProducts);
      setSource('fallback');
      setError(caught instanceof Error ? caught.message : 'Unable to load GitHub products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const requestId = setTimeout(() => {
      void refreshProducts();
    }, 0);
    return () => clearTimeout(requestId);
  }, []);

  const value = useMemo(
    () => ({ products, source, isLoading, error, refreshProducts }),
    [products, source, isLoading, error],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const value = useContext(ProductContext);
  if (!value) throw new Error('useProducts must be used inside ProductProvider');
  return value;
}
