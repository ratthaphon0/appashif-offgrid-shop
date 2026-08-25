import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrice, Product, ShopColors } from '@/constants/shop';

import { ProductPlaceholder } from './product-placeholder';
import { ShopIcon } from './shop-icon';

type ProductCardProps = {
  product: Product;
  width: `${number}%`;
  onAdd: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  isDeleting?: boolean;
};

export function ProductCard({
  product,
  width,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting = false,
}: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const activeImage = product.images[imageIndex] ?? product.images[0];
  const canSwitchImages = product.images.length > 1;

  const handleAdd = () => {
    onAdd();
    setIsAdded(true);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 110, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  const isArchived = product.isActive === false;

  return (
    <View nativeID={`product-card-${product.id}`} style={[styles.cardShadow, { width }]}>
      <View style={[styles.card, isArchived && styles.cardArchived, isDeleting && styles.cardDeleting]}>
        <View
          style={[
            styles.badge,
            isArchived
              ? { backgroundColor: ShopColors.muted, borderColor: ShopColors.line }
              : { backgroundColor: product.badgeColor },
          ]}>
          <Text style={[styles.badgeText, isArchived && styles.archivedBadgeText]}>
            {isArchived ? 'ARCHIVED' : product.badge}
          </Text>
        </View>

        {canSwitchImages && (
          <Pressable
            accessibilityLabel={`Switch ${product.name} view`}
            onPress={() => setImageIndex((current) => (current + 1) % product.images.length)}
            style={({ pressed }) => [styles.viewToggle, pressed && styles.viewTogglePressed]}>
            <Text style={styles.viewToggleText}>{activeImage.label}</Text>
          </Pressable>
        )}

        <Pressable accessibilityLabel={`View ${product.name}`}>
          <ProductPlaceholder imageUri={activeImage?.uri} product={product} />
        </Pressable>

        <View style={styles.info}>
          <Text style={styles.category}>{product.category}</Text>
          <Text numberOfLines={2} style={[styles.name, isArchived && styles.archivedText]}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, isArchived && styles.archivedText]}>
                {formatPrice(product.price)}
              </Text>
              {product.originalPrice && (
                <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text>
              )}
            </View>

            {!isArchived && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  accessibilityLabel={`Add ${product.name} to cart`}
                  onPress={handleAdd}
                  style={({ pressed }) => [
                    styles.addButton,
                    isAdded && styles.addButtonSuccess,
                    pressed && styles.addButtonPressed,
                  ]}>
                  {isAdded ? (
                    <Text style={styles.addedBadgeText}>✓ ADDED</Text>
                  ) : (
                    <ShopIcon
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      color={ShopColors.white}
                      size={24}
                    />
                  )}
                </Pressable>
              </Animated.View>
            )}
          </View>
          {(onEdit || onDelete || onToggleActive) && (
            <View style={styles.adminActions}>
              {onEdit && (
                <Pressable
                  accessibilityRole="button"
                  disabled={isDeleting}
                  onPress={onEdit}
                  style={[styles.adminButton, isDeleting && styles.disabledButton]}>
                  <Text style={styles.adminButtonText}>EDIT</Text>
                </Pressable>
              )}
              {onToggleActive && (
                <Pressable
                  accessibilityRole="button"
                  disabled={isDeleting}
                  onPress={onToggleActive}
                  style={[
                    styles.adminButton,
                    isArchived ? styles.restoreButton : styles.archiveButton,
                    isDeleting && styles.disabledButton,
                  ]}>
                  <Text style={styles.adminButtonText}>
                    {isArchived ? 'RESTORE' : 'ARCHIVE'}
                  </Text>
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  accessibilityRole="button"
                  disabled={isDeleting}
                  onPress={onDelete}
                  style={[styles.adminButton, styles.deleteButton, isDeleting && styles.disabledButton]}>
                  <Text style={styles.adminButtonText}>
                    {isDeleting ? 'DELETING…' : 'DELETE'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    minWidth: 0,
    backgroundColor: ShopColors.ink,
    borderRadius: 17,
    transform: [{ translateX: 3 }, { translateY: 4 }],
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: ShopColors.paper,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 15,
    transform: [{ translateX: -3 }, { translateY: -4 }],
  },
  badge: {
    position: 'absolute',
    zIndex: 2,
    top: 10,
    right: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: ShopColors.line,
    transform: [{ rotate: '4deg' }],
  },
  badgeText: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  viewToggle: {
    position: 'absolute',
    zIndex: 2,
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 999,
    backgroundColor: ShopColors.white,
  },
  viewTogglePressed: {
    backgroundColor: ShopColors.neon,
  },
  viewToggleText: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  info: {
    padding: 10,
  },
  category: {
    color: ShopColors.muted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    minHeight: 38,
    color: ShopColors.ink,
    fontSize: 18,
    lineHeight: 19,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  price: {
    color: ShopColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  oldPrice: {
    color: ShopColors.muted,
    fontSize: 10,
    fontWeight: '700',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ShopColors.ink,
    borderWidth: 2,
    borderColor: ShopColors.ink,
  },
  addButtonPressed: {
    backgroundColor: ShopColors.purple,
    transform: [{ scale: 0.94 }],
  },
  addButtonSuccess: {
    paddingHorizontal: 8,
    width: 'auto',
    backgroundColor: ShopColors.neon,
    borderColor: ShopColors.ink,
  },
  addedBadgeText: {
    color: ShopColors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },
  adminButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 7,
    backgroundColor: ShopColors.neon,
  },
  deleteButton: {
    backgroundColor: ShopColors.pink,
  },
  archiveButton: {
    backgroundColor: ShopColors.orange,
  },
  restoreButton: {
    backgroundColor: ShopColors.neon,
  },
  cardArchived: {
    opacity: 0.6,
    backgroundColor: '#EBE8E0',
  },
  archivedBadgeText: {
    color: ShopColors.paper,
  },
  archivedText: {
    color: ShopColors.muted,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cardDeleting: {
    opacity: 0.6,
  },
  adminButtonText: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
});
