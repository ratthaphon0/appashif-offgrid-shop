import { StyleSheet, Text, View } from 'react-native';

import { ShopColors } from '@/constants/shop';

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  badge?: string;
  badgeColor?: string;
};

export function PageHeading({
  eyebrow,
  title,
  badge,
  badgeColor = ShopColors.neon,
}: PageHeadingProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 22,
    marginBottom: 16,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: ShopColors.ink,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -1.6,
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: ShopColors.line,
    transform: [{ rotate: '3deg' }],
  },
  badgeText: {
    color: ShopColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
});
