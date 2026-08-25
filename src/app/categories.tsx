import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PageHeading } from '@/components/shop/page-heading';
import { ShopIcon } from '@/components/shop/shop-icon';
import { ShopShell } from '@/components/shop/shop-shell';
import { ShopColors } from '@/constants/shop';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { Category } from '@/lib/api';

const colors = [ShopColors.neon, '#B8A0FF', '#FF9D73', '#8DE4FF', ShopColors.pink, ShopColors.orange];
const icons = [
  { ios: 'tshirt.fill', android: 'checkroom', web: 'checkroom' },
  { ios: 'cloud.fill', android: 'styler', web: 'styler' },
  { ios: 'figure.walk', android: 'steps', web: 'steps' },
  { ios: 'shoe.fill', android: 'footprint', web: 'footprint' },
  { ios: 'star.fill', android: 'stars_2', web: 'stars_2' },
  { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
] as const;

export default function CategoriesScreen() {
  const { token } = useAuth();
  const {
    products,
    categories,
    isLoading,
    error,
    refreshCatalog,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useProducts();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const visibleCategories = useMemo(() => {
    if (categories.length) return categories;
    const counts = new Map<string, number>();
    products.forEach((product) => counts.set(product.category, (counts.get(product.category) ?? 0) + 1));
    return [...counts.entries()].map(([categoryName, productCount]) => ({
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount,
    }));
  }, [categories, products]);

  const saveCategory = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setActionError(null);
    try {
      if (editing) await updateCategory(editing.slug, name.trim());
      else await createCategory(name.trim());
      setName('');
      setEditing(null);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Category save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (category: Category) => {
    const deleteNow = () => {
      setActionError(null);
      void deleteCategory(category.slug).catch((caught) =>
        setActionError(caught instanceof Error ? caught.message : 'Category delete failed'),
      );
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm(`${category.name} can only be deleted when no products reference it.`)
        : false;
      if (confirmed) deleteNow();
      return;
    }

    Alert.alert(
      'Delete category?',
      `${category.name} can only be deleted when no products reference it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteNow,
        },
      ],
    );
  };

  return (
    <ShopShell active="categories">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <PageHeading
            eyebrow="FIND YOUR FIT"
            title="CATEGORIES"
            badge={isLoading ? 'LOADING…' : `${visibleCategories.length} GROUPS`}
            badgeColor={ShopColors.neon}
          />

          {(error || actionError) && (
            <View style={styles.errorBar}>
              <Text style={styles.errorText}>{actionError || `Cloud unavailable: ${error}`}</Text>
              <Text accessibilityRole="button" onPress={() => void refreshCatalog()} style={styles.retryText}>RETRY</Text>
            </View>
          )}

          {token && (
            <View style={styles.categoryForm}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={editing ? `Rename ${editing.name}` : 'NEW CATEGORY NAME'}
                placeholderTextColor={ShopColors.muted}
                style={styles.input}
              />
              <Pressable
                disabled={!name.trim() || isSaving}
                onPress={() => void saveCategory()}
                style={({ pressed }) => [styles.saveButton, (pressed || isSaving) && styles.pressed]}>
                <Text style={styles.saveButtonText}>{isSaving ? '…' : editing ? 'SAVE' : 'ADD'}</Text>
              </Pressable>
              {editing && (
                <Text
                  accessibilityRole="button"
                  onPress={() => {
                    setEditing(null);
                    setName('');
                  }}
                  style={styles.cancelText}>
                  CANCEL
                </Text>
              )}
            </View>
          )}

          <View style={styles.grid}>
            {visibleCategories.map((category, index) => (
              <View
                key={category.slug}
                style={[
                  styles.card,
                  { backgroundColor: colors[index % colors.length] },
                  index % 2 === 0 ? styles.rotateLeft : styles.rotateRight,
                ]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${category.name} products`}
                  onPress={() => router.push({ pathname: '/products', params: { category: category.name } })}
                  style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}>
                  <View style={styles.iconCircle}>
                    <ShopIcon name={icons[index % icons.length]} size={27} />
                  </View>
                  <Text style={styles.cardName}>{category.name.toUpperCase()}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardCount}>{category.productCount} ITEMS</Text>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </Pressable>
                {token && categories.length > 0 && (
                  <View style={styles.adminActions}>
                    <Text
                      accessibilityRole="button"
                      onPress={() => {
                        setEditing(category);
                        setName(category.name);
                      }}
                      style={styles.adminText}>
                      EDIT
                    </Text>
                    <Text accessibilityRole="button" onPress={() => confirmDelete(category)} style={styles.adminText}>
                      DELETE
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  page: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 16 },
  errorBar: {
    marginBottom: 14,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 2,
    borderColor: '#9C1C49',
    backgroundColor: '#FFE4EF',
  },
  errorText: { flex: 1, color: '#9C1C49', fontSize: 10, fontWeight: '800' },
  retryText: { color: ShopColors.purple, fontSize: 10, fontWeight: '900', textDecorationLine: 'underline' },
  categoryForm: {
    marginBottom: 18,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.paper,
  },
  input: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: ShopColors.line,
    color: ShopColors.ink,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: ShopColors.white,
  },
  saveButton: {
    minWidth: 62,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ShopColors.ink,
  },
  saveButtonText: { color: ShopColors.neon, fontSize: 10, fontWeight: '900' },
  cancelText: { color: ShopColors.purple, fontSize: 9, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 15 },
  card: {
    width: '47.8%',
    minHeight: 150,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 16,
  },
  cardMain: { flex: 1, justifyContent: 'space-between' },
  rotateLeft: { transform: [{ rotate: '-1deg' }] },
  rotateRight: { transform: [{ rotate: '1deg' }] },
  pressed: { opacity: 0.65 },
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
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, marginTop: 8 },
  cardCount: { color: ShopColors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  arrow: { color: ShopColors.ink, fontSize: 22, lineHeight: 22, fontWeight: '900' },
  adminActions: {
    marginTop: 9,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: ShopColors.line,
  },
  adminText: { color: ShopColors.ink, fontSize: 9, fontWeight: '900', textDecorationLine: 'underline' },
});
