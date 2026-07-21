import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freert.net';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/dashboard', '/admin'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
