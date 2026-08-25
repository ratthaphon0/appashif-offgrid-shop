import { StyleSheet, View } from 'react-native';

import { ShopColors } from '@/constants/shop';

type ProductSkeletonProps = {
  width: `${number}%`;
};

export function ProductSkeleton({ width }: ProductSkeletonProps) {
  return (
    <View accessibilityLabel="Loading product" style={[styles.card, { width }]}>
      <View style={styles.image} />
      <View style={styles.content}>
        <View style={styles.kicker} />
        <View style={styles.title} />
        <View style={styles.price} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 15,
    backgroundColor: ShopColors.paper,
    opacity: 0.6,
  },
  image: {
    width: '100%',
    aspectRatio: 1.04,
    minHeight: 154,
    borderBottomWidth: 3,
    borderBottomColor: ShopColors.line,
    backgroundColor: '#D8D1C5',
  },
  content: {
    padding: 12,
    gap: 8,
  },
  kicker: {
    width: '42%',
    height: 8,
    backgroundColor: '#C8C0B5',
  },
  title: {
    width: '78%',
    height: 18,
    backgroundColor: '#B8AFA2',
  },
  price: {
    width: '30%',
    height: 15,
    marginTop: 8,
    backgroundColor: '#C8C0B5',
  },
});
