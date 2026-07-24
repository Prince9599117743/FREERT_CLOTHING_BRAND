import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Map database row to Product type matching src/services/database.ts
const mapProduct = (row: any) => ({
  ...row,
  basePrice: row.base_price ?? row.basePrice,
  mrp: row.mrp,
  isPublished: row.is_published ?? row.isPublished,
  stockQty: row.stock_qty ?? row.stockQty ?? 0,
  parentCategory: row.parent_category ?? row.parentCategory,
  subCategory: row.sub_category ?? row.subCategory,
  tags: row.tags || [],
  rating: row.rating || 0,
  reviewsCount: row.reviews_count ?? row.reviewsCount ?? 0,
  colors: row.colors || [],
  status: row.status || ((row.stock_qty ?? row.stockQty ?? 0) === 0 ? 'out-of-stock' : 'published'),
  trackQuantity: row.track_quantity ?? row.trackQuantity ?? true,
  createdAt: row.created_at ?? row.createdAt,
  updatedAt: row.updated_at ?? row.updatedAt,
});

export const revalidate = 60; // Revalidate cache every 60 seconds on Edge CDN

export async function GET() {
  try {
    // 1. Fetch products from Supabase
    const { data: rawProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        collection:collections(*),
        variants:product_variants(*),
        colors:product_colors(*)
      `)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    // 2. Fetch categories from Supabase
    const { data: rawCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) throw categoriesError;

    // Map rows to application schemas
    const products = (rawProducts || []).map(mapProduct);
    const categories = (rawCategories || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      imageUrl: item.image_url,
      parentCategory: item.parent_category,
      createdAt: item.created_at
    }));

    // Return with headers allowing Edge caching
    return new NextResponse(
      JSON.stringify({ products, categories }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error: any) {
    console.error('Catalog API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog data', details: error.message },
      { status: 500 }
    );
  }
}
