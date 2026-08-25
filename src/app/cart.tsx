import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { CartItem } from '@/components/shop/cart-item';
import { ShopShell } from '@/components/shop/shop-shell';
import { formatPrice, ShopColors } from '@/constants/shop';
import { useCart } from '@/context/cart-context';

export default function CartScreen() {
  const { width } = useWindowDimensions();
  const { items, updateQuantity } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const isWide = width >= 820;

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;

    return {
      subtotal,
      discount,
      total: subtotal - discount,
    };
  }, [items, promoApplied]);

  const applyPromo = () => {
    setPromoApplied(promoCode.trim().toUpperCase() === 'STREET10');
  };

  return (
    <ShopShell active={null}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>YOUR STREET PICKS</Text>
              <Text style={styles.title}>SHOPPING BAG</Text>
            </View>
            <View style={styles.bagSticker}>
              <Text style={styles.bagStickerText}>{items.length} STYLES</Text>
            </View>
          </View>

          <View
            nativeID="cart-responsive-layout"
            style={[styles.layout, isWide && styles.layoutWide]}>
            <View style={styles.itemColumn}>
              {items.length > 0 ? (
                items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    product={item.product}
                    quantity={item.quantity}
                    onQuantityChange={(quantity) =>
                      updateQuantity(item.product.id, quantity)
                    }
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>YOUR BAG IS TOO QUIET.</Text>
                  <Text style={styles.emptyBody}>Add a loud piece from the latest drop.</Text>
                </View>
              )}

              <View style={styles.promo}>
                <View style={styles.promoHeadingRow}>
                  <Text style={styles.promoTitle}>GOT A PROMO?</Text>
                  <Text style={styles.promoHint}>TRY STREET10</Text>
                </View>
                <View style={styles.promoRow}>
                  <TextInput
                    accessibilityLabel="Promo code"
                    autoCapitalize="characters"
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="ENTER CODE"
                    placeholderTextColor={ShopColors.muted}
                    style={styles.promoInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={applyPromo}
                    style={({ pressed }) => [
                      styles.promoButton,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={styles.promoButtonText}>APPLY</Text>
                  </Pressable>
                </View>
                {promoCode.length > 0 && (
                  <Text
                    style={[
                      styles.promoMessage,
                      promoApplied ? styles.promoSuccess : styles.promoNeutral,
                    ]}>
                    {promoApplied
                      ? 'NICE — 10% DISCOUNT APPLIED.'
                      : 'ENTER STREET10 AND TAP APPLY.'}
                  </Text>
                )}
              </View>
            </View>

            <View
              nativeID="cart-order-summary"
              style={[styles.summary, isWide && styles.summaryWide]}>
              <View style={styles.summaryTag}>
                <Text style={styles.summaryTagText}>ORDER CHECK</Text>
              </View>
              <Text style={styles.summaryTitle}>THE TOTAL</Text>

              <View style={styles.summaryRows}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatPrice(totals.subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.freeText}>FREE</Text>
                </View>
                {promoApplied && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Street discount</Text>
                    <Text style={styles.discountText}>
                      -{formatPrice(totals.discount)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
              </View>

              <View style={styles.catalogNote}>
                <Text style={styles.catalogNoteTitle}>BAG PREVIEW ONLY</Text>
                <Text style={styles.catalogNoteBody}>Ordering is not enabled in this release.</Text>
              </View>
            </View>
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
    paddingBottom: 34,
  },
  page: {
    width: '100%',
    maxWidth: 1060,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
    marginBottom: 18,
  },
  kicker: {
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: ShopColors.ink,
    fontSize: 37,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1.8,
    marginTop: 3,
  },
  bagSticker: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: ShopColors.neon,
    borderWidth: 2,
    borderColor: ShopColors.line,
    transform: [{ rotate: '3deg' }],
  },
  bagStickerText: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  layout: {
    gap: 20,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemColumn: {
    flex: 1.55,
    gap: 12,
  },
  promo: {
    marginTop: 5,
    padding: 16,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 16,
    backgroundColor: '#E9DCFF',
  },
  promoHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  promoTitle: {
    color: ShopColors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  promoHint: {
    color: ShopColors.purple,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: ShopColors.ink,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 10,
    backgroundColor: ShopColors.white,
  },
  promoButton: {
    minWidth: 92,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.ink,
  },
  promoButtonText: {
    color: ShopColors.neon,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  promoMessage: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 9,
  },
  promoSuccess: {
    color: '#397000',
  },
  promoNeutral: {
    color: ShopColors.muted,
  },
  summary: {
    flex: 1,
    padding: 20,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 18,
    backgroundColor: ShopColors.paper,
  },
  summaryWide: {
    minWidth: 330,
  },
  summaryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: ShopColors.orange,
    borderWidth: 2,
    borderColor: ShopColors.line,
    transform: [{ rotate: '-2deg' }],
  },
  summaryTagText: {
    color: ShopColors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  summaryTitle: {
    color: ShopColors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 13,
  },
  summaryRows: {
    gap: 12,
    paddingVertical: 18,
    marginTop: 4,
    borderBottomWidth: 2,
    borderBottomColor: ShopColors.line,
    borderStyle: 'dashed',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: ShopColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: ShopColors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  freeText: {
    color: '#3F7A00',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  discountText: {
    color: ShopColors.purple,
    fontSize: 13,
    fontWeight: '900',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    paddingVertical: 18,
  },
  totalLabel: {
    color: ShopColors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  totalValue: {
    color: ShopColors.ink,
    fontSize: 29,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -1,
  },
  catalogNote: {
    padding: 13,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.neon,
  },
  catalogNoteTitle: {
    color: ShopColors.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  catalogNoteBody: {
    color: ShopColors.muted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
  },
  emptyState: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 16,
    borderStyle: 'dashed',
    backgroundColor: ShopColors.paper,
  },
  emptyTitle: {
    color: ShopColors.ink,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyBody: {
    color: ShopColors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
  },
  pressed: {
    opacity: 0.65,
  },
});
