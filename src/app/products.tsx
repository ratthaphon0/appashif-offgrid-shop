import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PageHeading } from '@/components/shop/page-heading';
import { ProductCard } from '@/components/shop/product-card';
import { ShopShell } from '@/components/shop/shop-shell';
import { products, ShopColors } from '@/constants/shop';
import { useCart } from '@/context/cart-context';

const filters = ['ALL', 'NEW', 'SALE', 'LIMITED'];

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const { addItem } = useCart();
  const cardWidth: `${number}%` = width >= 940 ? '31.7%' : '47.5%';

  return (
    <ShopShell active="products">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <PageHeading
            eyebrow="THE FULL COLLECTION"
            title="PRODUCTS"
            badge={`${products.length} ITEMS`}
            badgeColor={ShopColors.pink}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}>
            {filters.map((filter, index) => (
              <View
                key={filter}
                style={[styles.filter, index === 0 && styles.filterActive]}>
                <Text
                  style={[
                    styles.filterText,
                    index === 0 && styles.filterTextActive,
                  ]}>
                  {filter}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View nativeID="product-grid" style={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                width={cardWidth}
                onAdd={() => addItem(product.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  page: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  filters: {
    gap: 8,
    paddingBottom: 16,
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
  filterActive: {
    backgroundColor: ShopColors.ink,
  },
  filterText: {
    color: ShopColors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  filterTextActive: {
    color: ShopColors.neon,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
});
