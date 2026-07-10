import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import '@/global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ShopColors } from '@/constants/shop';
import { CartProvider } from '@/context/cart-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ShopColors.cream } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="add" />
        <Stack.Screen name="products" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="cart" />
      </Stack>
    </CartProvider>
  );
}
