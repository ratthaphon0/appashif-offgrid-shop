# AppAshif OFF//GRID Shop

React Native / Expo Router shopping interface for an OFF//GRID streetwear shop.

## Assignment Coverage

- Displays a top navigation menu with brand, menu, search, cart badge, and category buttons.
- Displays a bottom tab navigation menu with Home, Add, Products, and Categories.
- Displays at least 3 products. The current Home screen renders 4 products from shared product data.
- Product cards include image, badge, category, product name, price, sale price when available, and add-to-cart action.

## Main Source Files

- `src/components/shop/top-menu.tsx` - top navigation menu
- `src/components/shop/bottom-menu.tsx` - bottom tab navigation menu
- `src/app/index.tsx` - Home screen and product grid
- `src/components/shop/product-card.tsx` - reusable product card UI
- `src/constants/shop.ts` - product data and shop color tokens

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the web app

   ```bash
   npm run web
   ```

3. Open the local URL from Expo, usually:

   ```text
   http://localhost:8081
   ```

## Scripts

- `npm run web` - start Expo for web
- `npm run ios` - start Expo for iOS
- `npm run android` - start Expo for Android
- `npm run lint` - run Expo lint

## Tech Stack

- Expo 57
- Expo Router
- React 19
- React Native 0.86
- React Native Web
