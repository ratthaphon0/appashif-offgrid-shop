import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Product, ShopColors } from '@/constants/shop';

type ProductPlaceholderProps = {
  product: Product;
  compact?: boolean;
  imageUri?: string;
};

export function ProductPlaceholder({ product, compact = false, imageUri }: ProductPlaceholderProps) {
  const [erroredImage, setErroredImage] = useState<string | null>(null);
  const resolvedImage = imageUri ?? product.images[0]?.uri;
  const canShowImage = resolvedImage && erroredImage !== resolvedImage;

  return (
    <View
      accessibilityLabel={`Product image for ${product.name}`}
      style={[
        styles.container,
        compact && styles.compact,
        { backgroundColor: product.imageColor },
      ]}>
      {canShowImage ? (
        <Image
          accessibilityLabel={product.name}
          alt={product.name}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: resolvedImage }}
          style={styles.image}
          transition={220}
          onError={() => setErroredImage(resolvedImage)}
        />
      ) : (
        <>
          <View style={[styles.orbit, { borderColor: product.accentColor }]} />
          <View style={[styles.spark, { backgroundColor: product.accentColor }]} />
          <View style={styles.imageLabel}>
            <Text style={[styles.imageLabelText, compact && styles.compactLabel]}>IMAGE OFFLINE</Text>
            {!compact && <Text style={styles.imageHint}>CHECK SOURCE OR REPLACE URL</Text>}
          </View>
        </>
      )}

      {!compact && (
        <View style={styles.numberTag}>
          <Text style={styles.numberTagText}>{product.edition}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.04,
    minHeight: 154,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: ShopColors.line,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compact: {
    width: 84,
    height: 96,
    minHeight: 0,
    aspectRatio: undefined,
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 12,
  },
  orbit: {
    position: 'absolute',
    width: '72%',
    aspectRatio: 1,
    borderWidth: 16,
    borderRadius: 999,
    opacity: 0.28,
    transform: [{ rotate: '-14deg' }],
  },
  spark: {
    position: 'absolute',
    width: 58,
    height: 120,
    top: -28,
    right: 20,
    opacity: 0.74,
    transform: [{ rotate: '35deg' }],
  },
  imageLabel: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 2,
    borderColor: ShopColors.line,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  imageLabelText: {
    color: ShopColors.ink,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  compactLabel: {
    fontSize: 10,
  },
  imageHint: {
    color: ShopColors.ink,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  numberTag: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: ShopColors.ink,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  numberTagText: {
    color: ShopColors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
