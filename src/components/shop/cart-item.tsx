import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrice, Product, ShopColors } from '@/constants/shop';

import { ProductPlaceholder } from './product-placeholder';
import { ShopIcon } from './shop-icon';

type CartItemProps = {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function CartItem({ product, quantity, onQuantityChange }: CartItemProps) {
  return (
    <View style={styles.card}>
      <ProductPlaceholder product={product} compact />
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.name}>{product.name}</Text>
          </View>
          <Pressable
            accessibilityLabel={`Remove ${product.name}`}
            onPress={() => onQuantityChange(0)}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
            <ShopIcon
              name={{ ios: 'trash', android: 'delete', web: 'delete' }}
              color={ShopColors.muted}
              size={19}
            />
          </Pressable>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.quantity}>
            <Pressable
              accessibilityLabel={`Decrease ${product.name} quantity`}
              onPress={() => onQuantityChange(quantity - 1)}
              style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}>
              <ShopIcon
                name={{ ios: 'minus', android: 'remove', web: 'remove' }}
                size={17}
              />
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              accessibilityLabel={`Increase ${product.name} quantity`}
              onPress={() => onQuantityChange(quantity + 1)}
              style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}>
              <ShopIcon
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={17}
              />
            </Pressable>
          </View>
          <Text style={styles.price}>{formatPrice(product.price * quantity)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 16,
    backgroundColor: ShopColors.paper,
  },
  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
  },
  category: {
    color: ShopColors.muted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    color: ShopColors.ink,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  quantity: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: ShopColors.white,
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    minWidth: 24,
    color: ShopColors.ink,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '900',
  },
  price: {
    color: ShopColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.45,
  },
});
