import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomMenu, BottomMenuKey } from './bottom-menu';
import { TopMenu } from './top-menu';

import { ShopColors } from '@/constants/shop';
import { useCart } from '@/context/cart-context';

type ShopShellProps = PropsWithChildren<{
  active: BottomMenuKey | null;
}>;

export function ShopShell({ active, children }: ShopShellProps) {
  const { cartCount } = useCart();

  return (
    <View style={styles.root}>
      <TopMenu cartCount={cartCount} />
      <View style={styles.content}>{children}</View>
      <BottomMenu active={active} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ShopColors.cream,
  },
  content: {
    flex: 1,
  },
});
