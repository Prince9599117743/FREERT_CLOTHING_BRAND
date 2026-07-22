import { MetadataRoute } from 'next';
import { getProducts } from '@/services/database';
import type { Product } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freert.net';

  // Base routes list
  const routes = ['', '/checkout', '/dashboard', '/support'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  let productsList: Product[] = [];
  try {
    productsList = await getProducts();
  } catch (e) {}

  // Dynamic products list paths
  const productRoutes = productsList.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt ? product.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 0.9
  }));

  return [...routes, ...productRoutes];
}
