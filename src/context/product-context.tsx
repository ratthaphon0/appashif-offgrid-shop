import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { fallbackProducts, Product } from '@/constants/shop';
import { useAuth } from '@/context/auth-context';
import {
  Category,
  createCategory as createCategoryRequest,
  createProduct as createProductRequest,
  deleteCategory as deleteCategoryRequest,
  deleteProduct as deleteProductRequest,
  getCategories,
  getProductById as getProductByIdRequest,
  getProducts,
  ProductInput,
  updateCategory as updateCategoryRequest,
  updateProduct as updateProductRequest,
} from '@/lib/api';

type ProductContextValue = {
  products: Product[];
  categories: Category[];
  source: 'api' | 'fallback';
  isLoading: boolean;
  error: string | null;
  refreshCatalog: (params?: { search?: string }) => Promise<void>;
  getProductById: (id: string, includeInactive?: boolean) => Promise<Product>;
  createProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, input: Partial<ProductInput> & { isActive?: boolean }) => Promise<Product>;
  toggleProductActive: (id: string, isActive: boolean) => Promise<Product>;
  deleteProduct: (id: string, options?: { permanent?: boolean }) => Promise<void>;
  restoreProduct: (product: Product) => Promise<Product>;
  createCategory: (name: string) => Promise<Category>;
  updateCategory: (slug: string, name: string) => Promise<Category>;
  deleteCategory: (slug: string) => Promise<void>;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [source, setSource] = useState<'api' | 'fallback'>('fallback');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  const refreshCatalog = async (params?: { search?: string }) => {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    setIsLoading(true);
    try {
      const [nextProducts, nextCategories] = await Promise.all([
        getProducts(params, controller.signal),
        getCategories(controller.signal),
      ]);
      if (activeRequestRef.current !== controller) return;
      setProducts(nextProducts);
      setCategories(nextCategories);
      setSource('api');
      setError(null);
    } catch (caught) {
      if (controller.signal.aborted || activeRequestRef.current !== controller) return;
      setProducts(fallbackProducts);
      setCategories([]);
      setSource('fallback');
      setError(caught instanceof Error ? caught.message : 'Unable to load the catalog API');
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const requestId = setTimeout(() => void refreshCatalog(), 0);
    return () => {
      clearTimeout(requestId);
      activeRequestRef.current?.abort();
    };
  }, []);

  const value = useMemo<ProductContextValue>(
    () => {
      const requireToken = () => {
        if (!token) throw new Error('Admin sign-in is required for this action');
        return token;
      };

      return {
        products,
        categories,
        source,
        isLoading,
        error,
        refreshCatalog,
        getProductById: async (id: string, includeInactive = true) => {
          const found = products.find((p) => p.id === id);
          if (found && source === 'fallback') return found;
          try {
            return await getProductByIdRequest(id, includeInactive);
          } catch (caught) {
            if (found) return found;
            throw caught;
          }
        },
        createProduct: async (input) => {
          const product = await createProductRequest(input, requireToken());
          setProducts((current) => [product, ...current.filter((item) => item.id !== product.id)]);
          setSource('api');
          return product;
        },
        updateProduct: async (id, input) => {
          const product = await updateProductRequest(id, input, requireToken());
          setProducts((current) => current.map((item) => (item.id === id ? product : item)));
          return product;
        },
        toggleProductActive: async (id, isActive) => {
          const product = await updateProductRequest(id, { isActive }, requireToken());
          setProducts((current) => current.map((item) => (item.id === id ? product : item)));
          return product;
        },
        deleteProduct: async (id, options) => {
          await deleteProductRequest(id, requireToken(), options?.permanent);
          if (options?.permanent) {
            setProducts((current) => current.filter((item) => item.id !== id));
          } else {
            // Soft delete: remove from active list in memory
            setProducts((current) => current.filter((item) => item.id !== id));
          }
        },
        restoreProduct: async (product) => {
          const restored = await updateProductRequest(product.id, { isActive: true }, requireToken());
          setProducts((current) => [restored, ...current.filter((item) => item.id !== restored.id)]);
          return restored;
        },
        createCategory: async (name) => {
          const category = await createCategoryRequest(name, requireToken());
          setCategories((current) => [...current, category]);
          return category;
        },
        updateCategory: async (slug, name) => {
          const category = await updateCategoryRequest(slug, name, requireToken());
          setCategories((current) => current.map((item) => (item.slug === slug ? category : item)));
          return category;
        },
        deleteCategory: async (slug) => {
          await deleteCategoryRequest(slug, requireToken());
          setCategories((current) => current.filter((item) => item.slug !== slug));
        },
      };
    },
    [categories, error, isLoading, products, source, token],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const value = useContext(ProductContext);
  if (!value) throw new Error('useProducts must be used inside ProductProvider');
  return value;
}
