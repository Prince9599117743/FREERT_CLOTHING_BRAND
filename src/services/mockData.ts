import type { Product, Category, Collection } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Outerwear', slug: 'outerwear', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Tops', slug: 'tops', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Bottoms', slug: 'bottoms', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Dresses', slug: 'dresses', createdAt: new Date().toISOString() }
];

export const MOCK_COLLECTIONS: Collection[] = [
  { id: 'col-1', name: 'Linens Edit', slug: 'linens-edit', createdAt: new Date().toISOString() },
  { id: 'col-2', name: 'Minimal Staples', slug: 'minimal-staples', createdAt: new Date().toISOString() }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    collectionId: 'col-1',
    name: 'Linen Trench Coat',
    slug: 'linen-trench-coat',
    description: 'A fluid, double-breasted trench coat tailored from mid-weight organic Belgian linen. Designed with an asymmetric storm flap, classical shoulder epaulets, custom horn buttons, and a matching waist sash tie belt. Unlined for breathable, relaxed drape throughout summer season.',
    basePrice: 14500.00,
    isPublished: true,
    images: ['/assets/trench_coat.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: MOCK_CATEGORIES[0],
    collection: MOCK_COLLECTIONS[0],
    variants: [
      { id: 'v-1-s', productId: 'prod-1', size: 'S', color: 'Natural Flax', sku: 'FR-TC-LN-S', stockQty: 12, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-1-m', productId: 'prod-1', size: 'M', color: 'Natural Flax', sku: 'FR-TC-LN-M', stockQty: 18, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-1-l', productId: 'prod-1', size: 'L', color: 'Natural Flax', sku: 'FR-TC-LN-L', stockQty: 8, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'prod-2',
    categoryId: 'cat-2',
    collectionId: 'col-1',
    name: 'Structured Kimono Shirt',
    slug: 'structured-kimono-shirt',
    description: 'Drawing inspiration from traditional Japanese wear, this short-sleeve shirt is tailored from crisp linen-cotton twill. Crafted with wide elbow-length kimono sleeves, a minimalist band collar, structural front welt pockets, and secure belt closures.',
    basePrice: 5800.00,
    isPublished: true,
    images: ['/assets/kimono_shirt.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: MOCK_CATEGORIES[1],
    collection: MOCK_COLLECTIONS[0],
    variants: [
      { id: 'v-2-s', productId: 'prod-2', size: 'S', color: 'Ivory Cream', sku: 'FR-KS-LN-S', stockQty: 20, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-2-m', productId: 'prod-2', size: 'M', color: 'Ivory Cream', sku: 'FR-KS-LN-M', stockQty: 25, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-2-l', productId: 'prod-2', size: 'L', color: 'Ivory Cream', sku: 'FR-KS-LN-L', stockQty: 15, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'prod-3',
    categoryId: 'cat-3',
    collectionId: 'col-2',
    name: 'Raw Silk Utility Trouser',
    slug: 'raw-silk-utility-trouser',
    description: 'Tailored for a relaxed, straight-leg profile, these utility trousers are constructed from a heavy slubbed raw silk weave. Structured with custom cargo side button-down compartments, a comfortable elasticated drawcord waist, and custom adjustable ankle tabs for fit modulation.',
    basePrice: 8900.00,
    isPublished: true,
    images: ['/assets/silk_trouser.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: MOCK_CATEGORIES[2],
    collection: MOCK_COLLECTIONS[1],
    variants: [
      { id: 'v-3-s', productId: 'prod-3', size: 'S', color: 'Sand Beige', sku: 'FR-UT-SK-S', stockQty: 8, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-3-m', productId: 'prod-3', size: 'M', color: 'Sand Beige', sku: 'FR-UT-SK-M', stockQty: 14, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-3-l', productId: 'prod-3', size: 'L', color: 'Sand Beige', sku: 'FR-UT-SK-L', stockQty: 10, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'prod-4',
    categoryId: 'cat-2',
    collectionId: 'col-2',
    name: 'Premium Knit Shroud Hoodie',
    slug: 'premium-knit-shroud-hoodie',
    description: 'An architectural interpretation of lounge essentials, this hoodie is knitted from dense merino wool and extra-long-staple cotton yarns. Features a seamless overlapping collar shroud hood, custom ribbed side panels, and inset side slit pockets.',
    basePrice: 7200.00,
    isPublished: true,
    images: ['/assets/knit_hoodie.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: MOCK_CATEGORIES[1],
    collection: MOCK_COLLECTIONS[1],
    variants: [
      { id: 'v-4-s', productId: 'prod-4', size: 'S', color: 'Oatmeal Melange', sku: 'FR-SH-KN-S', stockQty: 15, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-4-m', productId: 'prod-4', size: 'M', color: 'Oatmeal Melange', sku: 'FR-SH-KN-M', stockQty: 22, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-4-l', productId: 'prod-4', size: 'L', color: 'Oatmeal Melange', sku: 'FR-SH-KN-L', stockQty: 12, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'prod-5',
    categoryId: 'cat-4',
    collectionId: 'col-2',
    name: 'Monolithic Slip Dress',
    slug: 'monolithic-slip-dress',
    description: 'A study in quiet luxury, this floor-length slip dress is crafted from heavy satin that drapes fluidly against the silhouette. Details include a delicate square neck, thin adjustable spaghetti straps, and clean double-stitched side leg slits.',
    basePrice: 11000.00,
    isPublished: true,
    images: ['/assets/slip_dress.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: MOCK_CATEGORIES[3],
    collection: MOCK_COLLECTIONS[1],
    variants: [
      { id: 'v-5-s', productId: 'prod-5', size: 'S', color: 'Taupe Gold', sku: 'FR-MD-ST-S', stockQty: 10, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-5-m', productId: 'prod-5', size: 'M', color: 'Taupe Gold', sku: 'FR-MD-ST-M', stockQty: 12, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-5-l', productId: 'prod-5', size: 'L', color: 'Taupe Gold', sku: 'FR-MD-ST-L', stockQty: 6, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'prod-6',
    categoryId: 'cat-1',
    collectionId: 'col-1',
    name: 'Modular Linen Blazer',
    slug: 'modular-linen-blazer',
    description: 'A tailored unstructured single-breasted blazer constructed from premium organic Belgian linen. Tailored with neat notch lapels, classic patch pockets, horn buttons, and a double vented rear hemline.',
    basePrice: 12500.00,
    isPublished: true,
    images: ['/assets/linen_blazer.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: MOCK_CATEGORIES[0],
    collection: MOCK_COLLECTIONS[0],
    variants: [
      { id: 'v-6-s', productId: 'prod-6', size: 'S', color: 'Ivory Flax', sku: 'FR-MB-LN-S', stockQty: 6, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-6-m', productId: 'prod-6', size: 'M', color: 'Ivory Flax', sku: 'FR-MB-LN-M', stockQty: 10, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'v-6-l', productId: 'prod-6', size: 'L', color: 'Ivory Flax', sku: 'FR-MB-LN-L', stockQty: 8, additionalPrice: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  }
];
