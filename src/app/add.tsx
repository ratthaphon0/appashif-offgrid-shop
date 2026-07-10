import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PageHeading } from '@/components/shop/page-heading';
import { ShopIcon } from '@/components/shop/shop-icon';
import { ShopShell } from '@/components/shop/shop-shell';
import { ShopColors } from '@/constants/shop';

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={ShopColors.muted}
        style={styles.input}
      />
    </View>
  );
}

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [photoReady, setPhotoReady] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProduct = () => {
    setSaved(true);
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
            eyebrow="BUILD YOUR NEXT DROP"
            title="ADD PRODUCT"
            badge="NEW ITEM"
            badgeColor={ShopColors.orange}
          />

          <View style={styles.formCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add a product image"
              onPress={() => setPhotoReady((current) => !current)}
              style={({ pressed }) => [
                styles.photoBox,
                photoReady && styles.photoBoxReady,
                pressed && styles.pressed,
              ]}>
              <ShopIcon
                name={{
                  ios: photoReady ? 'checkmark.circle.fill' : 'camera.fill',
                  android: photoReady ? 'check_circle' : 'photo_camera',
                  web: photoReady ? 'check_circle' : 'photo_camera',
                }}
                color={ShopColors.ink}
                size={34}
              />
              <Text style={styles.photoTitle}>
                {photoReady ? 'PHOTO SLOT READY' : 'ADD PRODUCT PHOTO'}
              </Text>
              <Text style={styles.photoHint}>
                {photoReady
                  ? 'Replace this placeholder with your image later.'
                  : 'Tap to prepare the product image slot.'}
              </Text>
            </Pressable>

            <View style={styles.form}>
              <Field
                label="PRODUCT NAME"
                placeholder="Example: Neon City Tee"
                value={name}
                onChangeText={setName}
              />
              <Field
                label="CATEGORY"
                placeholder="T-shirts, Shoes, Accessories..."
                value={category}
                onChangeText={setCategory}
              />
              <View style={styles.fieldRow}>
                <View style={styles.halfField}>
                  <Field
                    label="PRICE (฿)"
                    placeholder="1290"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <Field
                    label="STOCK"
                    placeholder="20"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={saveProduct}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                ]}>
                <Text style={styles.saveButtonText}>SAVE PRODUCT →</Text>
              </Pressable>

              {saved && (
                <View style={styles.success}>
                  <Text style={styles.successText}>
                    PRODUCT DRAFT SAVED — READY FOR YOUR CLASS DEMO.
                  </Text>
                </View>
              )}
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
    paddingBottom: 28,
  },
  page: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    padding: 14,
    gap: 16,
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 18,
    backgroundColor: ShopColors.paper,
  },
  photoBox: {
    minHeight: 160,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#E8DCFF',
  },
  photoBoxReady: {
    backgroundColor: ShopColors.neon,
  },
  photoTitle: {
    color: ShopColors.ink,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  photoHint: {
    color: ShopColors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    gap: 13,
  },
  field: {
    gap: 6,
  },
  label: {
    color: ShopColors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
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
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ShopColors.line,
    borderRadius: 12,
    backgroundColor: ShopColors.ink,
  },
  saveButtonPressed: {
    backgroundColor: ShopColors.purple,
    transform: [{ translateY: 2 }],
  },
  saveButtonText: {
    color: ShopColors.neon,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  success: {
    padding: 11,
    borderWidth: 2,
    borderColor: ShopColors.line,
    backgroundColor: ShopColors.neon,
  },
  successText: {
    color: ShopColors.ink,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});
