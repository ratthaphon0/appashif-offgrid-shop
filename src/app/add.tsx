import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PageHeading } from '@/components/shop/page-heading';
import { ShopShell } from '@/components/shop/shop-shell';
import { Product, ShopColors } from '@/constants/shop';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { ApiError, Category, ProductInput } from '@/lib/api';

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'url' | 'email-address';
  secureTextEntry?: boolean;
  multiline?: boolean;
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry,
  multiline,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={ShopColors.muted}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

type CategoryFieldProps = {
  categories: Category[];
  value: string;
  onChangeText: (value: string) => void;
};

function CategoryField({ categories, value, onChangeText }: CategoryFieldProps) {
  const [open, setOpen] = useState(false);
  const query = value.trim().toLowerCase();
  const options = categories.filter((item) => !query || item.name.toLowerCase().includes(query));

  return (
    <View style={styles.field}>
      <Text style={styles.label}>CATEGORY</Text>
      <View style={styles.categoryInputRow}>
        <TextInput
          value={value}
          onChangeText={(nextValue) => {
            onChangeText(nextValue);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Choose or type a new category"
          placeholderTextColor={ShopColors.muted}
          style={styles.categoryInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show category options"
          onPress={() => setOpen((current) => !current)}
          style={({ pressed }) => [styles.categoryToggle, pressed && styles.saveButtonPressed]}>
          <Text style={styles.categoryToggleText}>{open ? '⌃' : '⌄'}</Text>
        </Pressable>
      </View>
      {open && (
        <View style={styles.categoryDropdown}>
          {options.map((item) => (
            <Pressable
              key={item.slug}
              accessibilityRole="button"
              onPress={() => {
                onChangeText(item.name);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.categoryOption, pressed && styles.categoryOptionPressed]}>
              <Text style={styles.categoryOptionText}>{item.name}</Text>
              <Text style={styles.categoryCount}>{item.productCount} ITEMS</Text>
            </Pressable>
          ))}
          {Boolean(value.trim()) && !categories.some((item) => item.name.toLowerCase() === query) && (
            <Text style={styles.categoryCreateHint}>SAVE WILL CREATE “{value.trim()}”</Text>
          )}
          {!options.length && !value.trim() && (
            <Text style={styles.categoryCreateHint}>TYPE TO CREATE A NEW CATEGORY</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function AddProductScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { token, adminLabel, isLoggingIn, error: authError, login, logout } = useAuth();
  const { products, categories, getProductById, createCategory, createProduct, updateProduct } =
    useProducts();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [badge, setBadge] = useState('NEW');
  const [isSaving, setIsSaving] = useState(false);
  const loadedProductFromMemory = useMemo(() => {
    if (!edit) return null;
    return products.find((product) => product.id === edit) ?? null;
  }, [edit, products]);

  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const loadedProduct = loadedProductFromMemory ?? fetchedProduct;
  const [lastHydratedId, setLastHydratedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Direct Edit Hydration logic for fallback API fetch
  useEffect(() => {
    if (!edit || loadedProductFromMemory) return;
    let isSubscribed = true;
    void getProductById(edit, true)
      .then((fetched) => {
        if (isSubscribed) setFetchedProduct(fetched);
      })
      .catch((caught) => {
        if (isSubscribed) setFormError(caught instanceof Error ? caught.message : 'Failed to load product details');
      });
    return () => {
      isSubscribed = false;
    };
  }, [edit, getProductById, loadedProductFromMemory]);

  if (loadedProduct && loadedProduct.id !== lastHydratedId) {
    setLastHydratedId(loadedProduct.id);
    setName(loadedProduct.name);
    setCategory(loadedProduct.category);
    setDescription(loadedProduct.description);
    setPrice(String(loadedProduct.price));
    setOriginalPrice(loadedProduct.originalPrice ? String(loadedProduct.originalPrice) : '');
    setStock(String(loadedProduct.stock));
    setImageUri(loadedProduct.images[0]?.uri ?? '');
    setBadge(loadedProduct.badge);
  }

  const saveProduct = async () => {
    setFormError(null);
    setMessage(null);
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericOriginalPrice = originalPrice ? Number(originalPrice) : undefined;
    let selectedCategory = categories.find(
      (item) => item.name.toLowerCase() === category.trim().toLowerCase(),
    );
    if (!name.trim() || !category.trim() || !description.trim() || !imageUri.trim()) {
      setFormError('Name, category, description, and image URL are required.');
      return;
    }
    if (name.trim().length < 2) {
      setFormError('Product Name must be at least 2 characters.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) {
      setFormError('Price must be positive and stock must be a whole number.');
      return;
    }
    if (
      numericOriginalPrice !== undefined &&
      (!Number.isFinite(numericOriginalPrice) || numericOriginalPrice < numericPrice)
    ) {
      setFormError('Original price must be a valid number greater than or equal to price.');
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(imageUri.trim())) {
      setFormError('Image URL must start with http:// or https://.');
      return;
    }

    setIsSaving(true);
    try {
      if (!selectedCategory) {
        selectedCategory = await createCategory(category.trim());
      }
      const input: ProductInput = {
        name: name.trim(),
        categorySlug: selectedCategory.slug,
        description: description.trim(),
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        stock: numericStock,
        badge: badge.trim() || 'NEW',
        badgeColor: loadedProduct?.badgeColor ?? ShopColors.neon,
        imageColor: loadedProduct?.imageColor ?? '#E8DCFF',
        accentColor: loadedProduct?.accentColor ?? ShopColors.purple,
        edition: loadedProduct?.edition ?? 'NEW',
        images: [{ label: 'FRONT', uri: imageUri.trim() }],
      };
      if (loadedProduct) {
        await updateProduct(loadedProduct.id, input);
        setMessage('PRODUCT UPDATED ON THE CLOUD API.');
      } else {
        await createProduct(input);
        setMessage('PRODUCT CREATED ON THE CLOUD API.');
        setName('');
        setCategory('');
        setDescription('');
        setPrice('');
        setOriginalPrice('');
        setStock('');
        setImageUri('');
        setBadge('NEW');
      }
    } catch (caught) {
      if (caught instanceof ApiError && Array.isArray(caught.details) && caught.details.length > 0) {
        const issues = caught.details
          .map((item: unknown) => {
            const rec = item as { field?: string; message?: string };
            return `${rec.field || 'field'}: ${rec.message || 'invalid'}`;
          })
          .join(', ');
        setFormError(`Validation failed: ${issues}`);
      } else {
        setFormError(caught instanceof Error ? caught.message : 'Save failed');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ShopShell active="add">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <PageHeading
            eyebrow={loadedProduct ? 'UPDATE THE LIVE CATALOG' : 'BUILD YOUR NEXT DROP'}
            title={loadedProduct ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
            badge={token ? 'ADMIN' : 'SIGN IN'}
            badgeColor={token ? ShopColors.neon : ShopColors.orange}
          />

          {!token ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>ADMIN ACCESS</Text>
              <Text style={styles.panelBody}>
                Sign in to create, edit, and delete cloud catalog data. The access token stays in memory and is cleared when the app reloads.
              </Text>
              <Field
                label="EMAIL OR USERNAME"
                placeholder="admin@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Field
                label="PASSWORD"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Pressable
                disabled={isLoggingIn || !email.trim() || !password}
                onPress={() => void login(email, password).catch(() => undefined)}
                style={({ pressed }) => [
                  styles.saveButton,
                  (pressed || isLoggingIn) && styles.saveButtonPressed,
                ]}>
                <Text style={styles.saveButtonText}>
                  {isLoggingIn ? 'SIGNING IN…' : 'SIGN IN →'}
                </Text>
              </Pressable>
              {authError && <Text style={styles.errorText}>{authError}</Text>}
            </View>
          ) : (
            <View style={styles.formCard}>
              <View style={styles.adminBar}>
                <Text style={styles.adminText}>SIGNED IN: {adminLabel?.toUpperCase() || 'ADMIN'}</Text>
                <Text accessibilityRole="button" onPress={logout} style={styles.logoutText}>LOG OUT</Text>
              </View>

              <View style={styles.form}>
                <Field label="PRODUCT NAME" placeholder="Neon City Tee" value={name} onChangeText={setName} />
                <CategoryField categories={categories} value={category} onChangeText={setCategory} />
                <Field
                  label="DESCRIPTION"
                  placeholder="Describe the material, fit, and details."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
                <View style={styles.fieldRow}>
                  <View style={styles.halfField}>
                    <Field label="PRICE (฿)" placeholder="1290" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
                  </View>
                  <View style={styles.halfField}>
                    <Field label="STOCK" placeholder="20" value={stock} onChangeText={setStock} keyboardType="numeric" />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <View style={styles.halfField}>
                    <Field label="ORIGINAL PRICE" placeholder="Optional" value={originalPrice} onChangeText={setOriginalPrice} keyboardType="decimal-pad" />
                  </View>
                  <View style={styles.halfField}>
                    <Field label="BADGE" placeholder="NEW" value={badge} onChangeText={setBadge} />
                  </View>
                </View>
                <Field label="IMAGE URL" placeholder="https://…" value={imageUri} onChangeText={setImageUri} keyboardType="url" />

                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => void saveProduct()}
                  style={({ pressed }) => [styles.saveButton, (pressed || isSaving) && styles.saveButtonPressed]}>
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'SAVING…' : loadedProduct ? 'UPDATE PRODUCT →' : 'CREATE PRODUCT →'}
                  </Text>
                </Pressable>
                {loadedProduct && (
                  <Text
                    accessibilityRole="button"
                    onPress={() => {
                      setName('');
                      setCategory('');
                      setDescription('');
                      setPrice('');
                      setOriginalPrice('');
                      setStock('');
                      setImageUri('');
                      setBadge('NEW');
                      router.replace('/add');
                    }}
                    style={styles.cancelEdit}>
                    CANCEL EDIT
                  </Text>
                )}
                {formError && <Text style={styles.errorText}>{formError}</Text>}
                {message && <Text style={styles.successText}>{message}</Text>}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16 },
  panel: {
    padding: 18,
    gap: 14,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 18,
    backgroundColor: ShopColors.paper,
  },
  panelTitle: { color: ShopColors.ink, fontSize: 24, fontWeight: '900' },
  panelBody: { color: ShopColors.muted, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  formCard: {
    padding: 14,
    gap: 16,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 18,
    backgroundColor: ShopColors.paper,
  },
  adminBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.neon,
  },
  adminText: { flex: 1, color: ShopColors.ink, fontSize: 9, fontWeight: '900' },
  logoutText: { color: ShopColors.purple, fontSize: 9, fontWeight: '900', textDecorationLine: 'underline' },
  form: { gap: 13 },
  field: { gap: 6 },
  label: { color: ShopColors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    color: ShopColors.ink,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderRadius: 11,
    backgroundColor: ShopColors.white,
  },
  categoryInputRow: { flexDirection: 'row', alignItems: 'stretch' },
  categoryInput: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 14,
    color: ShopColors.ink,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: ShopColors.line,
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
    backgroundColor: ShopColors.white,
  },
  categoryToggle: {
    width: 52,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ShopColors.line,
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
    backgroundColor: ShopColors.neon,
  },
  categoryToggleText: { color: ShopColors.ink, fontSize: 22, fontWeight: '900' },
  categoryDropdown: {
    maxHeight: 190,
    overflow: 'scroll',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.white,
  },
  categoryOption: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#D7D0C4',
  },
  categoryOptionPressed: { backgroundColor: ShopColors.neon },
  categoryOptionText: { color: ShopColors.ink, fontSize: 12, fontWeight: '900' },
  categoryCount: { color: ShopColors.muted, fontSize: 9, fontWeight: '800' },
  categoryCreateHint: {
    padding: 10,
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
  },
  textarea: { minHeight: 92, paddingTop: 13, textAlignVertical: 'top' },
  fieldRow: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  saveButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 12,
    backgroundColor: ShopColors.ink,
  },
  saveButtonPressed: { opacity: 0.65, transform: [{ translateY: 2 }] },
  saveButtonText: { color: ShopColors.neon, fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },
  errorText: {
    padding: 10,
    color: '#9C1C49',
    fontSize: 11,
    fontWeight: '800',
    borderWidth: 2,
    borderColor: '#9C1C49',
    backgroundColor: '#FFE4EF',
  },
  successText: {
    padding: 11,
    color: ShopColors.ink,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.neon,
  },
  cancelEdit: {
    alignSelf: 'center',
    color: ShopColors.purple,
    fontSize: 10,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
});
