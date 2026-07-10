import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShopColors } from '@/constants/shop';

import { ShopIcon } from './shop-icon';

export type BottomMenuKey = 'home' | 'add' | 'products' | 'categories';

type BottomMenuProps = {
  active: BottomMenuKey | null;
};

const menuItems = [
  {
    key: 'home',
    label: 'Home',
    href: '/' as const,
    icon: { ios: 'house.fill', android: 'home', web: 'home' } as const,
  },
  {
    key: 'add',
    label: 'Add',
    href: '/add' as const,
    icon: {
      ios: 'plus.square.fill',
      android: 'add_box',
      web: 'add_box',
    } as const,
  },
  {
    key: 'products',
    label: 'Products',
    href: '/products' as const,
    icon: {
      ios: 'shippingbox.fill',
      android: 'inventory_2',
      web: 'inventory_2',
    } as const,
  },
  {
    key: 'categories',
    label: 'Categories',
    href: '/categories' as const,
    icon: {
      ios: 'folder.fill',
      android: 'folder',
      web: 'folder',
    } as const,
  },
] satisfies {
  key: BottomMenuKey;
  label: string;
  href: '/' | '/add' | '/products' | '/categories';
  icon: Parameters<typeof ShopIcon>[0]['name'];
}[];

export function BottomMenu({ active }: BottomMenuProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.inner}>
        {menuItems.map((item) => {
          const isActive = item.key === active;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.replace(item.href)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <View style={styles.iconWrap}>
                <ShopIcon
                  name={item.icon}
                  color={isActive ? ShopColors.purple : ShopColors.ink}
                  size={22}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: ShopColors.white,
    borderTopWidth: 1,
    borderTopColor: '#E8E4DC',
  },
  inner: {
    width: '100%',
    maxWidth: 560,
    minHeight: 62,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 3,
  },
  item: {
    flex: 1,
    minWidth: 66,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 38,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: ShopColors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  labelActive: {
    color: ShopColors.purple,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.55,
  },
});
