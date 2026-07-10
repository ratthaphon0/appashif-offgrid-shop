import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ProductCard } from '@/components/shop/product-card';
import { ShopShell } from '@/components/shop/shop-shell';
import { products, ShopColors } from '@/constants/shop';
import { useCart } from '@/context/cart-context';

export default function ShopScreen() {
  const { width } = useWindowDimensions();
  const { addItem } = useCart();
  const cardWidth: `${number}%` = width >= 940 ? '31.7%' : width >= 480 ? '48.2%' : '47.5%';

  return (
    <ShopShell active="home">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <View style={styles.eyebrow}>
                <Text style={styles.eyebrowText}>EST. BKK / 2026</Text>
              </View>
              <Text style={styles.heroTitle}>WEAR THE{'\n'}LOUD SIDE.</Text>
              <Text style={styles.heroBody}>
                Street-built layers, oversized shapes, and zero quiet energy.
              </Text>
            </View>

            <View style={styles.heroArt}>
              <View style={styles.heroCircle} />
              <Text style={styles.heroDrop}>DROP{'\n'}01</Text>
              <View style={styles.heroSticker}>
                <Text style={styles.heroStickerText}>FRESH{'\n'}OUT NOW!</Text>
              </View>
            </View>
          </View>

          <View style={styles.marquee}>
            <Text numberOfLines={1} style={styles.marqueeText}>
              ✦ FREE SHIPPING OVER ฿2,500 ✦ NEW DROP EVERY FRIDAY ✦ LIMITED RUNS ONLY ✦
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>CURATED FOR THE STREET</Text>
              <Text style={styles.sectionTitle}>TRENDING NOW</Text>
            </View>
            <View style={styles.countSticker}>
              <Text style={styles.countStickerText}>04 PIECES</Text>
            </View>
          </View>

          <View nativeID="product-grid" style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                width={cardWidth}
                onAdd={() => addItem(product.id)}
              />
            ))}
          </View>

          <View style={styles.classNote}>
            <Text style={styles.classNoteTitle}>DESIGNED TO STAND OUT.</Text>
            <Text style={styles.classNoteBody}>
              Replace each colorful placeholder with your own product photography when ready.
            </Text>
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
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  hero: {
    minHeight: 268,
    marginTop: 18,
    padding: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 20,
    backgroundColor: ShopColors.neon,
  },
  heroCopy: {
    zIndex: 2,
    flex: 1.25,
    justifyContent: 'center',
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: ShopColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    transform: [{ rotate: '-2deg' }],
  },
  eyebrowText: {
    color: ShopColors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: ShopColors.ink,
    fontSize: 48,
    lineHeight: 44,
    fontWeight: '900',
    letterSpacing: -2.4,
    marginTop: 14,
  },
  heroBody: {
    maxWidth: 430,
    color: ShopColors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 13,
  },
  heroArt: {
    flex: 0.75,
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: ShopColors.purple,
    borderWidth: 3,
    borderColor: ShopColors.line,
  },
  heroDrop: {
    zIndex: 1,
    color: ShopColors.white,
    fontSize: 48,
    lineHeight: 41,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -2,
    transform: [{ rotate: '7deg' }],
  },
  heroSticker: {
    position: 'absolute',
    right: -14,
    bottom: 2,
    zIndex: 2,
    padding: 11,
    borderWidth: 3,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.pink,
    transform: [{ rotate: '-8deg' }],
  },
  heroStickerText: {
    color: ShopColors.ink,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  marquee: {
    height: 38,
    marginTop: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: ShopColors.ink,
    borderRadius: 5,
  },
  marqueeText: {
    color: ShopColors.neon,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionKicker: {
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: ShopColors.ink,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 3,
  },
  countSticker: {
    backgroundColor: ShopColors.orange,
    borderWidth: 2,
    borderColor: ShopColors.line,
    paddingHorizontal: 10,
    paddingVertical: 7,
    transform: [{ rotate: '3deg' }],
  },
  countStickerText: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  classNote: {
    marginTop: 30,
    padding: 22,
    borderWidth: 3,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.pink,
    transform: [{ rotate: '-0.5deg' }],
  },
  classNoteTitle: {
    color: ShopColors.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  classNoteBody: {
    color: ShopColors.ink,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 5,
  },
});
