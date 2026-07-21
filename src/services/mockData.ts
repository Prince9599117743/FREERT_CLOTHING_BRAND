import type { Product, Category, Collection } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Outerwear', slug: 'outerwear', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Tops', slug: 'tops', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Bottoms', slug: 'bottoms', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Dresses', slug: 'dresses', createdAt: new Date().toISOString() },
  { id: 'cat-5', name: 'Accessories', slug: 'accessories', createdAt: new Date().toISOString() },
  { id: 'cat-6', name: 'Perfumes', slug: 'perfumes', createdAt: new Date().toISOString() }
];

export const MOCK_COLLECTIONS: Collection[] = [
  { id: 'col-1', name: 'Staples Collection', slug: 'staples-collection', createdAt: new Date().toISOString() },
  { id: 'col-2', name: 'Drape & Structure', slug: 'drape-structure', createdAt: new Date().toISOString() }
];

// Reusable valid image assets list to guarantee zero broken/blank links
const PLACEHOLDER_IMAGES = [
  '/assets/tee_white.jpg',
  '/assets/trench_coat.jpg',
  '/assets/kimono_shirt.jpg',
  '/assets/silk_trouser.jpg',
  '/assets/knit_hoodie.jpg',
  '/assets/slip_dress.jpg',
  '/assets/cap_1784646670746.png',
  '/assets/sneakers_1784646656235.png',
  '/assets/cargo_pants_1784646641064.png',
  '/assets/hoodie_black_1784646596372.png',
  '/assets/jacket_neon_1784646612273.png'
];

// Helper to choose index
const getImage = (index: number) => PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

// Define complete target catalog list structures
const MEN_SUBCATS = [
  { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', catId: 'cat-2', prefix: 'FR Boxy Heavyweight', noun: 'Oversized Tee', basePrice: 3200 },
  { name: 'Regular T-Shirts', slug: 'regular-t-shirts', catId: 'cat-2', prefix: 'Essential Comfort', noun: 'Regular Tee', basePrice: 2200 },
  { name: 'Graphic T-Shirts', slug: 'graphic-t-shirts', catId: 'cat-2', prefix: 'Editorial Serigraph', noun: 'Graphic Tee', basePrice: 3500 },
  { name: 'Shirts', slug: 'shirts', catId: 'cat-2', prefix: 'Structured Linen-Cotton', noun: 'Band Collar Shirt', basePrice: 5800 },
  { name: 'Hoodies', slug: 'hoodies', catId: 'cat-2', prefix: 'Bouclé French Terry', noun: 'Boxy Hoodie', basePrice: 6500 },
  { name: 'Sweatshirts', slug: 'sweatshirts', catId: 'cat-2', prefix: 'Loopback Melange', noun: 'Crewneck Sweatshirt', basePrice: 5200 },
  { name: 'Jackets', slug: 'jackets', catId: 'cat-1', prefix: 'Washed Canvas Raw', noun: 'Utility Jacket', basePrice: 9500 },
  { name: 'Jeans', slug: 'jeans', catId: 'cat-3', prefix: '14oz Raw Japanese Selvedge', noun: 'Denim Jeans', basePrice: 7800 },
  { name: 'Cargo Pants', slug: 'cargo-pants', catId: 'cat-3', prefix: 'Relaxed Gabardine', noun: 'Cargo Trouser', basePrice: 5800 },
  { name: 'Joggers', slug: 'joggers', catId: 'cat-3', prefix: 'Double-Knit Interlock', noun: 'Heavy Jogger', basePrice: 4800 },
  { name: 'Shorts', slug: 'shorts', catId: 'cat-3', prefix: 'Structured Fleece-Knit', noun: 'Relaxed Shorts', basePrice: 3800 }
];

const WOMEN_SUBCATS = [
  { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', catId: 'cat-2', prefix: 'FR Slub-Cotton', noun: 'Oversized Tee', basePrice: 2800 },
  { name: 'Crop Tops', slug: 'crop-tops', catId: 'cat-2', prefix: 'Fine Rib Knit', noun: 'Crop Top', basePrice: 2600 },
  { name: 'Basic Tops', slug: 'basic-tops', catId: 'cat-2', prefix: 'Organic Cotton Ribbed', noun: 'Tank Top', basePrice: 2200 },
  { name: 'Shirts', slug: 'shirts', catId: 'cat-2', prefix: 'Fluid Satin Drape', noun: 'Oversized Shirt', basePrice: 5500 },
  { name: 'Hoodies', slug: 'hoodies', catId: 'cat-2', prefix: 'Heavy Knit Melange', noun: 'Crop Hoodie', basePrice: 6200 },
  { name: 'Dresses', slug: 'dresses', catId: 'cat-4', prefix: 'Sandwashed Cowl Mulberry', noun: 'Slip Dress', basePrice: 12500 },
  { name: 'Skirts', slug: 'skirts', catId: 'cat-3', prefix: 'Structured Linen Pocket', noun: 'A-Line Skirt', basePrice: 4800 },
  { name: 'Jeans', slug: 'jeans', catId: 'cat-3', prefix: 'Wide-Leg Pleated Lyocell', noun: 'Denim Jeans', basePrice: 6800 },
  { name: 'Cargo Pants', slug: 'cargo-pants', catId: 'cat-3', prefix: 'Cotton Gabardine Tab', noun: 'Utility Cargo', basePrice: 5500 },
  { name: 'Co-ords', slug: 'co-ords', catId: 'cat-4', prefix: 'Ivory Flax Linen Double', noun: 'Co-ord Set', basePrice: 8800 }
];

const ACCESSORIES_SUBCATS = [
  { name: 'Caps', slug: 'caps', catId: 'cat-5', prefix: 'Minimalist Six-Panel', noun: 'Twill Cap', basePrice: 2200 },
  { name: 'Bags', slug: 'bags', catId: 'cat-5', prefix: 'Structured Suede Leather', noun: 'Crossbody Bag', basePrice: 8500 },
  { name: 'Wallets', slug: 'wallets', catId: 'cat-5', prefix: 'Vegetable-Tanned Bridle', noun: 'Cardholder Wallet', basePrice: 2900 },
  { name: 'Belts', slug: 'belts', catId: 'cat-5', prefix: 'Full-Grain Brass Buckle', noun: 'Leather Belt', basePrice: 3500 },
  { name: 'Chains', slug: 'chains', catId: 'cat-5', prefix: 'Recycled Sterling Silver', noun: 'Link Chain', basePrice: 4500 },
  { name: 'Bracelets', slug: 'bracelets', catId: 'cat-5', prefix: 'Minimal Solid Raw Brass', noun: 'Cuff Bracelet', basePrice: 3200 },
  { name: 'Rings', slug: 'rings', catId: 'cat-5', prefix: 'Brushed Satin Signet', noun: 'Brass Ring', basePrice: 3800 },
  { name: 'Sunglasses', slug: 'sunglasses', catId: 'cat-5', prefix: 'Premium Acetate D-Frame', noun: 'Sunglasses', basePrice: 6800 }
];

const PERFUMES_SUBCATS = [
  { name: 'Men Perfumes', slug: 'men', catId: 'cat-6', prefix: 'Santal Ethereal Intense', noun: 'EDP (Men)', basePrice: 7500 },
  { name: 'Women Perfumes', slug: 'women', catId: 'cat-6', prefix: 'Soleil D\'Or Neroli Citrus', noun: 'EDP (Women)', basePrice: 5800 },
  { name: 'Unisex Perfumes', slug: 'unisex', catId: 'cat-6', prefix: 'Nuit Noire Smoky Vetiver', noun: 'EDP (Unisex)', basePrice: 6800 },
  { name: 'Gift Sets', slug: 'gift-sets', catId: 'cat-6', prefix: 'Santal & Nuit Ethereal Travel', noun: 'Gift Set', basePrice: 9200 }
];

// Procedural high-volume database builder
const buildProducts = (): Product[] => {
  const productsList: Product[] = [];
  let indexCounter = 1;

  const processList = (subcats: any[], gender: 'men' | 'women' | 'unisex', parent: string) => {
    subcats.forEach((sub) => {
      // Create exactly 2 premium products for each subcategory
      for (let i = 1; i <= 2; i++) {
        const id = `prod-${indexCounter}`;
        const name = `${sub.prefix} ${sub.noun} 0${i}`;
        const slug = `${sub.prefix.toLowerCase().replace(/ /g, '-')}-${sub.noun.toLowerCase().replace(/ /g, '-')}-0${i}`;
        const category = MOCK_CATEGORIES.find(c => c.id === sub.catId) || MOCK_CATEGORIES[0];
        const collection = i === 1 ? MOCK_COLLECTIONS[0] : MOCK_COLLECTIONS[1];

        // Unique prices & ratings parameters
        const basePrice = sub.basePrice + (i * 300);
        const discountPrice = i === 2 ? basePrice - 500 : undefined;
        const rating = Number((4.5 + (indexCounter % 5) * 0.1).toFixed(1));
        const reviewsCount = 10 + (indexCounter % 8) * 9;

        // Front, Back, and Lifestyle image arrays
        const frontImage = getImage(indexCounter);
        const backImage = getImage(indexCounter + 1);
        const lifestyleImage = getImage(indexCounter + 2);

        // Standard sizes allocation
        const sizes = parent === 'perfumes' ? ['50ml', '100ml'] : (parent === 'accessories' ? ['One Size'] : ['S', 'M', 'L']);

        productsList.push({
          id,
          categoryId: sub.catId,
          collectionId: collection.id,
          name,
          slug,
          description: `A masterfully crafted luxury staple. Tailored with care from high-end fabrics, this piece is cut for a clean profile and premium texture that retains shape. Woven in small, ethical batches of 50 units.`,
          basePrice,
          discountPrice,
          isPublished: true,
          images: [frontImage, backImage, lifestyleImage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category,
          collection,
          rating,
          reviewsCount,
          tags: i === 1 ? ['new-arrivals', 'best-sellers'] : ['trending', 'featured-collection'],
          parentCategory: parent,
          subCategory: sub.slug,
          gender,
          material: parent === 'perfumes' ? 'Premium Oils Extract Base' : (parent === 'accessories' ? 'Full-Grain Bridle / Pure Brass' : '100% Fine Long-Staple Cotton Weave'),
          fit: parent === 'perfumes' ? 'Long-Lasting (8-10h)' : (parent === 'accessories' ? 'Adjustable Universal Comfort' : 'Relaxed Boxy Fit'),
          careInstructions: parent === 'perfumes' ? 'Store upright in dark cool drawers.' : 'Professional clean recommended to protect drape.',
          variants: sizes.map((s, idx) => ({
            id: `v-${indexCounter}-${s.toLowerCase()}`,
            productId: id,
            size: s,
            color: i === 1 ? 'Ivory Cream' : 'Carbon Black',
            sku: `FR-${sub.noun.substring(0,2).toUpperCase()}-${indexCounter}-${idx}`,
            stockQty: 15,
            additionalPrice: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        });

        indexCounter++;
      }
    });
  };

  processList(MEN_SUBCATS, 'men', 'men');
  processList(WOMEN_SUBCATS, 'women', 'women');
  processList(ACCESSORIES_SUBCATS, 'unisex', 'accessories');
  processList(PERFUMES_SUBCATS, 'unisex', 'perfumes');

  return productsList;
};

// Export static lists with exactly 66 products procedurally generated
export const MOCK_PRODUCTS: Product[] = buildProducts();
