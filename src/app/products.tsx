import { router, useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { PageHeading } from '@/components/shop/page-heading';
import { ProductCard } from '@/components/shop/product-card';
import { ProductSkeleton } from '@/components/shop/product-skeleton';
import { ShopShell } from '@/components/shop/shop-shell';
import { Product, ShopColors } from '@/constants/shop';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useProducts } from '@/context/product-context';
import { CLOUD_DEPLOYMENT_LABEL } from '@/lib/api';

type DropFilter = 'ALL' | 'NEW' | 'SALE' | 'LIMITED' | 'ARCHIVED';
type SortOption = 'FEATURED' | 'PRICE LOW' | 'PRICE HIGH' | 'NAME';

const allFilters: DropFilter[] = ['ALL', 'NEW', 'SALE', 'LIMITED', 'ARCHIVED'];
const publicFilters: DropFilter[] = ['ALL', 'NEW', 'SALE', 'LIMITED'];
const sorts: SortOption[] = ['FEATURED', 'PRICE LOW', 'PRICE HIGH', 'NAME'];

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ category?: string; drop?: string }>();
  const { width } = useWindowDimensions();
  const { addItem } = useCart();
  const { token } = useAuth();

  const filters = token ? allFilters : publicFilters;
  const {
    products,
    categories,
    source,
    isLoading,
    error,
    refreshCatalog,
    deleteProduct,
    restoreProduct,
    toggleProductActive,
  } = useProducts();
  const [search, setSearch] = useState('');
  const [dropFilterState, setDropFilterState] = useState<DropFilter>('ALL');
  const [categoryState, setCategoryState] = useState('ALL');
  const [sort, setSort] = useState<SortOption>('FEATURED');
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dropFilter =
    params.drop && filters.includes(params.drop as DropFilter)
      ? (params.drop as DropFilter)
      : dropFilterState;
  const category = params.category ?? categoryState;

  const setCategory = (cat: string) => {
    setCategoryState(cat);
    setDropFilterState('ALL');
    router.setParams({ category: cat, drop: 'ALL' });
  };

  const setDropFilter = (drop: DropFilter) => {
    setDropFilterState(drop);
    if (drop === 'NEW') {
      setCategoryState('ALL');
      router.setParams({ drop, category: 'ALL' });
    } else {
      router.setParams({ drop });
    }
  };

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const cardWidth: `${number}%` = width >= 940 ? '31.7%' : '47.5%';

  const visibleProducts = useMemo(() => {
    const matching = products.filter((product) => {
      const isArchived = product.isActive === false;
      if (isArchived) {
        if (!token) return false;
        if (dropFilter !== 'ALL' && dropFilter !== 'ARCHIVED') return false;
      } else if (dropFilter === 'ARCHIVED') {
        return false;
      }

      const matchesSearch =
        !deferredSearch ||
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(deferredSearch);
      const matchesCategory =
        category === 'ALL' ||
        product.category.toLowerCase() === category.toLowerCase() ||
        (product.categorySlug && product.categorySlug.toLowerCase() === category.toLowerCase()) ||
        product.category.toLowerCase().includes(category.toLowerCase());
      const label = `${product.badge} ${product.edition}`.toUpperCase();
      const matchesDrop =
        dropFilter === 'ALL' ||
        dropFilter === 'ARCHIVED' ||
        (dropFilter === 'SALE' && product.originalPrice != null) ||
        (dropFilter === 'LIMITED' && label.includes('LIMITED')) ||
        (dropFilter === 'NEW' && (label.includes('NEW') || label.includes('DROP')));
      return matchesSearch && matchesCategory && matchesDrop;
    });

    return [...matching].sort((left, right) => {
      if (sort === 'PRICE LOW') return left.price - right.price;
      if (sort === 'PRICE HIGH') return right.price - left.price;
      if (sort === 'NAME') return left.name.localeCompare(right.name);
      return 0;
    });
  }, [category, deferredSearch, dropFilter, products, sort, token]);

  const confirmDelete = (product: Product) => {
    if (deletingIds.has(product.id)) return; // Double-submit guard

    const deleteNow = async () => {
      setActionError(null);
      setDeletingIds((prev) => new Set(prev).add(product.id));
      try {
        await deleteProduct(product.id);
        // Show Toast with Undo for 5 seconds
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastProduct(product);
        toastTimerRef.current = setTimeout(() => {
          setToastProduct(null);
        }, 5000);
      } catch (caught) {
        setActionError(caught instanceof Error ? caught.message : 'Delete failed');
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm(`${product.name} will be archived/removed from the live catalog.`)
          : false;
      if (confirmed) void deleteNow();
      return;
    }

    Alert.alert('Archive product?', `${product.name} will be archived/removed from the live catalog.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void deleteNow(),
      },
    ]);
  };

  const handleUndo = async () => {
    if (!toastProduct) return;
    const target = toastProduct;
    setToastProduct(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    try {
      await restoreProduct(target);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Undo failed');
    }
  };

  const handleToggleActive = async (product: Product) => {
    setActionError(null);
    const isCurrentlyArchived = product.isActive === false;
    const nextActiveState = isCurrentlyArchived;
    try {
      await toggleProductActive(product.id, nextActiveState);
      if (!isCurrentlyArchived) {
        setToastProduct(product);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToastProduct(null), 5000);
      } else {
        setToastProduct(null);
      }
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Toggle archive failed');
    }
  };

  return (
    <ShopShell active="products">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <PageHeading
            eyebrow="THE FULL COLLECTION"
            title="PRODUCTS"
            badge={isLoading ? 'SYNCING…' : `${visibleProducts.length} ITEMS`}
            badgeColor={ShopColors.pink}
          />

          <View style={styles.catalogStatus}>
            <Text style={styles.catalogStatusText}>
              {source === 'api' ? `LIVE: ${CLOUD_DEPLOYMENT_LABEL}` : 'SAFE MODE: 4 LOCAL PRODUCTS'}
            </Text>
            <Text
              accessibilityRole="button"
              onPress={() => void refreshCatalog({ search: search.trim() })}
              style={styles.refreshText}>
              RETRY / REFRESH
            </Text>
          </View>
          {(error || actionError) && (
            <Text style={styles.errorText}>{actionError || `Cloud unavailable: ${error}`}</Text>
          )}

          {toastProduct && (
            <View style={styles.toastContainer}>
              <Text style={styles.toastText}>
                “{toastProduct.name}” WAS ARCHIVED / DELETED.
              </Text>
              <Pressable accessibilityRole="button" onPress={() => void handleUndo()} style={styles.undoButton}>
                <Text style={styles.undoButtonText}>↺ UNDO</Text>
              </Pressable>
            </View>
          )}

          <TextInput
            accessibilityLabel="Search products"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
            }}
            placeholder="SEARCH NAME, CATEGORY OR DESCRIPTION"
            placeholderTextColor={ShopColors.muted}
            style={styles.search}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {filters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setDropFilter(filter)}
                style={[styles.filter, dropFilter === filter && styles.filterActive]}>
                <Text style={[styles.filterText, dropFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <Pressable
              onPress={() => setCategory('ALL')}
              style={[styles.categoryFilter, category === 'ALL' && styles.categoryFilterActive]}>
              <Text style={styles.categoryFilterText}>ALL CATEGORIES</Text>
            </Pressable>
            {categories.map((item) => (
              <Pressable
                key={item.slug}
                onPress={() => setCategory(item.name)}
                style={[styles.categoryFilter, category === item.name && styles.categoryFilterActive]}>
                <Text style={styles.categoryFilterText}>{item.name.toUpperCase()}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>SORT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sorts}>
              {sorts.map((option) => (
                <Text
                  key={option}
                  accessibilityRole="button"
                  onPress={() => setSort(option)}
                  style={[styles.sortText, option === sort && styles.sortTextActive]}>
                  {option}
                </Text>
              ))}
            </ScrollView>
          </View>

          <View nativeID="product-grid" style={styles.grid}>
            {isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <ProductSkeleton key={index} width={cardWidth} />
                ))
              : visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    width={cardWidth}
                    isDeleting={deletingIds.has(product.id)}
                    onAdd={() => addItem(product.id)}
                    onEdit={token ? () => router.push({ pathname: '/add', params: { edit: product.id } }) : undefined}
                    onDelete={token ? () => confirmDelete(product) : undefined}
                    onToggleActive={token ? () => void handleToggleActive(product) : undefined}
                  />
                ))}
          </View>

          {!isLoading && visibleProducts.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>NO MATCHES</Text>
              <Text style={styles.emptyBody}>Try another search, category, or drop filter.</Text>
              <Text
                accessibilityRole="button"
                onPress={() => {
                  setSearch('');
                  setDropFilter('ALL');
                  setCategory('ALL');
                }}
                style={styles.emptyReset}>
                RESET FILTERS
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  page: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  filters: { gap: 8, paddingBottom: 12 },
  catalogStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.neon,
  },
  catalogStatusText: { color: ShopColors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  refreshText: {
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#9C1C49',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 12,
  },
  search: {
    minHeight: 48,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 12,
    backgroundColor: ShopColors.white,
    color: ShopColors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  filter: {
    minWidth: 72,
    minHeight: 38,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 20,
    backgroundColor: ShopColors.paper,
  },
  filterActive: { backgroundColor: ShopColors.ink },
  filterText: { color: ShopColors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  filterTextActive: { color: ShopColors.neon },
  categoryFilter: {
    minHeight: 32,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.white,
  },
  categoryFilterActive: { backgroundColor: ShopColors.orange },
  categoryFilterText: { color: ShopColors.ink, fontSize: 9, fontWeight: '900' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sortLabel: { color: ShopColors.muted, fontSize: 9, fontWeight: '900' },
  sorts: { gap: 12 },
  sortText: { color: ShopColors.muted, fontSize: 9, fontWeight: '800' },
  sortTextActive: { color: ShopColors.purple, textDecorationLine: 'underline' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  empty: {
    marginTop: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.paper,
  },
  emptyTitle: { color: ShopColors.ink, fontSize: 22, fontWeight: '900' },
  emptyBody: { color: ShopColors.muted, fontSize: 11, fontWeight: '700', marginTop: 5 },
  emptyReset: {
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 14,
    textDecorationLine: 'underline',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: ShopColors.ink,
    borderWidth: 2,
    borderColor: ShopColors.neon,
    borderRadius: 8,
  },
  toastText: {
    color: ShopColors.paper,
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  undoButton: {
    backgroundColor: ShopColors.neon,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 8,
  },
  undoButtonText: {
    color: ShopColors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
});
