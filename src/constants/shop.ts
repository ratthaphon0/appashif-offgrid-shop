export const ShopColors = {
  cream: '#F6F0E4',
  paper: '#FFFCF5',
  ink: '#111111',
  muted: '#6E685F',
  line: '#1C1C1C',
  neon: '#C8FF35',
  pink: '#FF4FA3',
  orange: '#FF6B2C',
  purple: '#8B5CF6',
  blue: '#5DD6FF',
  white: '#FFFFFF',
} as const;

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  badge: string;
  badgeColor: string;
  imageColor: string;
  accentColor: string;
  edition: string;
  images: {
    label: string;
    uri: string;
  }[];
};

export const fallbackProducts: Product[] = [
  {
    id: 'acid-grid-tee',
    name: 'Acid Grid Tee',
    category: 'Oversized T-shirt',
    description: 'Acid-wash cotton tee with a relaxed streetwear fit.',
    price: 890,
    originalPrice: 1190,
    stock: 18,
    badge: 'SALE -25%',
    badgeColor: ShopColors.pink,
    imageColor: '#D9FF74',
    accentColor: ShopColors.purple,
    edition: 'DROP 01',
    images: [
      {
        label: 'BACK',
        uri: 'https://www.jnorss.in/cdn/shop/files/alice_in_chains_GREEN_ACId_WASH_BACK_DR_SLEVESS_copy_3_8b286dcf-306d-4bfd-86db-3f63e55a36d3.jpg?v=1782756090&width=3840',
      },
      {
        label: 'FRONT',
        uri: 'https://www.jnorss.in/cdn/shop/files/alice_in_chains_front_green_acid_wash_dr._sleeves_tees_copy_5f1c7429-427b-407f-b67e-542b55ede982.jpg?v=1782756091&width=3840',
      },
    ],
  },
  {
    id: 'signal-cargo',
    name: 'Signal Cargo',
    category: 'Utility Pants',
    description: 'Multi-pocket cargo pants built for everyday movement.',
    price: 1590,
    stock: 42,
    badge: 'LIMITED',
    badgeColor: ShopColors.orange,
    imageColor: '#FF9D73',
    accentColor: ShopColors.neon,
    edition: '42 LEFT',
    images: [
      {
        label: 'FRONT',
        uri: 'https://underarmour.scene7.com/is/image/Underarmour/PS1366201-001_HF?rp=standard-0pad|pdpfull&qlt=85&bgc=f0f0f0&wid=1200&hei=1500&op_usm=1.75,0.3,2,0',
      },
      {
        label: 'BACK',
        uri: 'https://underarmour.scene7.com/is/image/Underarmour/PS1366201-001_HB?rp=standard-0pad|pdpfull&qlt=85&bgc=f0f0f0&wid=1200&hei=1500&op_usm=1.75,0.3,2,0',
      },
    ],
  },
  {
    id: 'pixel-rush-hoodie',
    name: 'Pixel Rush Hoodie',
    category: 'Heavyweight Hoodie',
    description: 'Warm heavyweight hoodie with an oversized silhouette.',
    price: 1890,
    originalPrice: 2290,
    stock: 9,
    badge: 'HOT DROP',
    badgeColor: ShopColors.neon,
    imageColor: '#B8A0FF',
    accentColor: ShopColors.pink,
    edition: 'NEW',
    images: [
      {
        label: 'FRONT',
        uri: 'https://media.lotsthailand.com/media/catalog/product/cache/115fac86e6b61ded262cffd864631a46/8/b/8by8jk3-b_1_1.jpg',
      },
      {
        label: 'BACK',
        uri: 'https://media.lotsthailand.com/media/catalog/product/cache/115fac86e6b61ded262cffd864631a46/8/b/8by8jk3-a_2_1.jpg',
      },
    ],
  },
  {
    id: 'static-runner',
    name: 'Switch Move Runner',
    category: 'Unisex Sneakers',
    description: 'Lightweight everyday runners for a fast city pace.',
    price: 2190,
    stock: 14,
    badge: 'EXCLUSIVE',
    badgeColor: ShopColors.purple,
    imageColor: '#8DE4FF',
    accentColor: ShopColors.orange,
    edition: 'WEB ONLY',
    images: [
      {
        label: 'ANGLE 1',
        uri: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/94188f555c1e4e7bb7de858a1b41e769_9366/Switch_Move_Running_Shoes_White_IG1761_01_standard.jpg',
      },
      {
        label: 'ANGLE 2',
        uri: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/16bbbca344344786a2e8c514f2056b5b_9366/Switch_Move_Running_Shoes_White_IG1761_02_standard_hover.jpg',
      },
      {
        label: 'ANGLE 3',
        uri: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/8544a026f55840669aeed1bc042516eb_9366/Switch_Move_Running_Shoes_White_IG1761_04_standard.jpg',
      },
    ],
  },
];

export const formatPrice = (value: number) => `฿${value.toLocaleString('en-US')}`;
