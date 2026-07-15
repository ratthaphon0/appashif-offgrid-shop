# AppAshif OFF//GRID Shop

React Native / Expo Router shopping interface for an OFF//GRID streetwear shop.

## Assignment Coverage

- Displays a top navigation menu with brand, menu, search, cart badge, and category buttons.
- Displays a bottom tab navigation menu with Home, Add, Products, and Categories.
- Displays at least 3 products. The current Home screen renders 4 products from shared product data.
- Product cards include image, badge, category, product name, price, sale price when available, and add-to-cart action.
- The product catalogue is loaded from a versioned JSON file on GitHub. When the network is unavailable or the JSON is invalid, the app keeps working with a validated local fallback catalogue.

## Main Source Files

- `src/components/shop/top-menu.tsx` - top navigation menu
- `src/components/shop/bottom-menu.tsx` - bottom tab navigation menu
- `src/app/index.tsx` - Home screen and product grid
- `src/components/shop/product-card.tsx` - reusable product card UI
- `src/constants/shop.ts` - product data and shop color tokens
- `assets/data/products.json` - detailed product catalogue published to GitHub
- `src/context/product-context.tsx` - GitHub fetch, JSON validation, loading state, and offline fallback

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

## GitHub JSON lesson flow

1. Edit `assets/data/products.json` and commit it to the `main` branch.
2. The Products page requests the GitHub raw URL defined in `PRODUCT_JSON_URL`.
3. The JSON is checked before it is shown in the UI; a malformed response or a network failure displays the local fallback instead of breaking the app.
4. Use the **REFRESH** action on the Products page to fetch the latest committed catalogue.

## Tech Stack

- Expo 57
- Expo Router
- React 19
- React Native 0.86
- React Native Web
