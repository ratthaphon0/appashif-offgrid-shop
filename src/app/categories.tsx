import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PageHeading } from '@/components/shop/page-heading';
import { ShopIcon } from '@/components/shop/shop-icon';
import { ShopShell } from '@/components/shop/shop-shell';
import { ShopColors } from '@/constants/shop';

const categories = [
  {
    name: 'T-SHIRTS',
    count: 12,
    color: ShopColors.neon,
    icon: { ios: 'tshirt.fill', android: 'checkroom', web: 'checkroom' } as const,
  },
  {
    name: 'OUTERWEAR',
    count: 8,
    color: '#B8A0FF',
    icon: { ios: 'cloud.fill', android: 'styler', web: 'styler' } as const,
  },
  {
    name: 'BOTTOMS',
    count: 9,
    color: '#FF9D73',
    icon: { ios: 'figure.walk', android: 'steps', web: 'steps' } as const,
  },
  {
    name: 'SNEAKERS',
    count: 6,
    color: '#8DE4FF',
    icon: { ios: 'shoe.fill', android: 'footprint', web: 'footprint' } as const,
  },
  {
    name: 'ACCESSORIES',
    count: 15,
    color: ShopColors.pink,
    icon: { ios: 'star.fill', android: 'stars_2', web: 'stars_2' } as const,
  },
  {
    name: 'LIMITED DROP',
    count: 4,
    color: ShopColors.orange,
    icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' } as const,
  },
];

export default function CategoriesScreen() {
  return (
    <ShopShell active="categories">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <PageHeading
            eyebrow="FIND YOUR FIT"
            title="CATEGORIES"
            badge="6 GROUPS"
            badgeColor={ShopColors.neon}
          />

          <View style={styles.grid}>
            {categories.map((category, index) => (
              <Pressable
                key={category.name}
                accessibilityRole="button"
                accessibilityLabel={`Open ${category.name} products`}
                onPress={() => router.push('/products')}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: category.color },
                  index % 2 === 0 ? styles.rotateLeft : styles.rotateRight,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.iconCircle}>
                  <ShopIcon name={category.icon} size={27} />
                </View>
                <Text style={styles.cardName}>{category.name}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardCount}>{category.count} ITEMS</Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </Pressable>
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
    paddingBottom: 30,
  },
  page: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 15,
  },
  card: {
    width: '47.8%',
    minHeight: 150,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 16,
  },
  rotateLeft: {
    transform: [{ rotate: '-1deg' }],
  },
  rotateRight: {
    transform: [{ rotate: '1deg' }],
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  iconCircle: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 23,
    backgroundColor: ShopColors.paper,
  },
  cardName: {
    color: ShopColors.ink,
    fontSize: 16,
    lineHeight: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 8,
  },
  cardCount: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  arrow: {
    color: ShopColors.ink,
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '900',
  },
});
