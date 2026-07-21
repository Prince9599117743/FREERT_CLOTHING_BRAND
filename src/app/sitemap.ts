import { MetadataRoute } from 'next';
import { MOCK_PRODUCTS } from '@/services/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freert.net';

  // Base routes list
  const routes = ['', '/checkout', '/dashboard', '/support'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  // Dynamic products list paths
  const productRoutes = MOCK_PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt ? product.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 0.9
  }));

  return [...routes, ...productRoutes];
}
