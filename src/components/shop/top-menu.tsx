import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShopColors } from '@/constants/shop';
import { useProducts } from '@/context/product-context';

import { ShopIcon } from './shop-icon';

type TopMenuProps = {
  cartCount: number;
};

const defaultCategories = ['TEES', 'LAYERS', 'BOTTOMS', 'ACCESSORIES'];

type MenuItem = {
  key: string;
  label: string;
  type: 'drop' | 'category';
  value: string;
};

export function TopMenu({ cartCount }: TopMenuProps) {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ category?: string; drop?: string }>();
  const productState = useProducts();
  const [badgeScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (cartCount > 0) {
      Animated.sequence([
        Animated.timing(badgeScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
        Animated.spring(badgeScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [cartCount, badgeScale]);

  const dbCategories = productState?.categories ?? [];
  const categoryList =
    dbCategories.length > 0
      ? dbCategories.map((c) => c.name)
      : defaultCategories;

  const items: MenuItem[] = [
    { key: 'NEW DROP', label: 'NEW DROP', type: 'drop', value: 'NEW' },
    ...categoryList.map((catName) => ({
      key: catName,
      label: catName.toUpperCase(),
      type: 'category' as const,
      value: catName,
    })),
  ];

  const isProductsPage = pathname === '/products';

  const isItemActive = (item: MenuItem) => {
    if (!isProductsPage) {
      return item.key === 'NEW DROP';
    }
    if (item.type === 'drop') {
      return params.drop === 'NEW';
    }
    if (item.type === 'category') {
      if (params.drop === 'NEW') return false;
      if (!params.category || params.category === 'ALL') {
        return false;
      }
      return params.category.toLowerCase() === item.value.toLowerCase();
    }
    return false;
  };

  const handlePress = (item: MenuItem) => {
    if (item.type === 'drop') {
      router.push({ pathname: '/products', params: { drop: 'NEW', category: 'ALL' } });
    } else {
      router.push({ pathname: '/products', params: { category: item.value, drop: 'ALL' } });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.inner}>
        <View style={styles.mainRow}>
          <Pressable
            accessibilityLabel="Open menu"
            onPress={() => router.push('/categories')}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <ShopIcon
              name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
              size={24}
            />
          </Pressable>

          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Go to shop"
            onPress={() => router.replace('/')}
            style={styles.brandWrap}>
            <View style={styles.brandSticker}>
              <Text style={styles.brand}>OFF//GRID</Text>
            </View>
            <Text style={styles.brandSub}>BANGKOK STREET DEPT.</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Search products"
              onPress={() => router.push('/products')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <ShopIcon
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                size={23}
              />
            </Pressable>
            <Pressable
              accessibilityLabel={`Open cart with ${cartCount} items`}
              onPress={() => router.push('/cart')}
              style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}>
              <ShopIcon
                name={{
                  ios: 'bag.fill',
                  android: 'shopping_bag',
                  web: 'shopping_bag',
                }}
                size={21}
              />
              <Animated.View style={[styles.cartBadge, { transform: [{ scale: badgeScale }] }]}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}>
          {items.map((item) => {
            const active = isItemActive(item);
            return (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item)}
                style={({ pressed }) => [
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: ShopColors.cream,
    borderBottomWidth: 3,
    borderBottomColor: ShopColors.line,
  },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  mainRow: {
    minHeight: 62,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.paper,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cartButton: {
    width: 48,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.neon,
  },
  cartBadge: {
    position: 'absolute',
    right: -4,
    top: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ShopColors.pink,
    borderWidth: 2,
    borderColor: ShopColors.line,
  },
  cartBadgeText: {
    color: ShopColors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  brandWrap: {
    flex: 1,
    alignItems: 'center',
  },
  brandSticker: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    backgroundColor: ShopColors.ink,
    transform: [{ rotate: '-1.5deg' }],
  },
  brand: {
    color: ShopColors.neon,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandSub: {
    color: ShopColors.ink,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginTop: 5,
  },
  categoryRow: {
    paddingHorizontal: 12,
    paddingBottom: 9,
    gap: 8,
  },
  categoryButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.paper,
  },
  categoryButtonActive: {
    backgroundColor: ShopColors.purple,
  },
  categoryText: {
    color: ShopColors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  categoryTextActive: {
    color: ShopColors.white,
  },
  pressed: {
    opacity: 0.66,
    transform: [{ translateY: 1 }],
  },
});
