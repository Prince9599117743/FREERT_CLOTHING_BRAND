import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SocialProofPopup } from '@/components/SocialProofPopup';
import { CookieConsent } from '@/components/CookieConsent';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://freert.in'),
  title: {
    default: 'FREERT | Premium Minimalist Fashion & Clothing Brand',
    template: '%s | FREERT'
  },
  description: 'Discover FREERT – premium minimalist fashion with timeless oversized t-shirts, shirts, trousers and luxury essentials crafted for modern living. Shop online across India.',
  keywords: 'FREERT, premium minimalist fashion, clothing brand, linen shirts, oversized t-shirts, luxury streetwear, designer clothing India',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'FREERT | Premium Minimalist Fashion & Clothing Brand',
    description: 'Discover FREERT – premium minimalist fashion with timeless oversized t-shirts, shirts, trousers and luxury essentials crafted for modern living. Shop online across India.',
    type: 'website',
    url: 'https://freert.in',
    siteName: 'FREERT',
    locale: 'en_IN',
    images: [
      {
        url: '/assets/trench_coat.jpg',
        width: 1200,
        height: 1600,
        alt: 'FREERT Editorial Campaign - Luxury Minimalist Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FREERT | Premium Minimalist Fashion & Clothing Brand',
    description: 'Discover FREERT – premium minimalist fashion with timeless oversized t-shirts, shirts, trousers and luxury essentials.',
    images: ['/assets/trench_coat.jpg'],
  },
  icons: {
    icon: [
      { url: '/freert-logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/freert-logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: '/freert-logo.svg',
  },
  verification: {
    google: '8ZLo-97WUAnNtqH1R-FHP5bGUKrsWaCDiaycwHxZcWc',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'FREERT',
    'url': 'https://freert.in',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://freert.in/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'FREERT',
    'url': 'https://freert.in',
    'logo': 'https://freert.in/freert-logo.svg',
    'sameAs': [
      'https://www.instagram.com/freert.official',
      'https://www.facebook.com/freert.official'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-84680-17123',
      'contactType': 'customer service',
      'areaServed': 'IN',
      'availableLanguage': 'en'
    }
  };

  const clothingStoreJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    'name': 'FREERT',
    'image': 'https://freert.in/assets/trench_coat.jpg',
    '@id': 'https://freert.in/#clothingstore',
    'url': 'https://freert.in',
    'telephone': '+918468017123',
    'priceRange': '₹₹₹',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'New Delhi',
      'addressLocality': 'Delhi',
      'postalCode': '110001',
      'addressCountry': 'IN'
    }
  };

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/freert-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/freert-logo.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clothingStoreJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg-luxury text-fg-luxury font-sans-luxury">
        <AuthProvider>
          <ToastProvider>
            <SettingsProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <ToastContainer />
                  <SocialProofPopup />
                  <CookieConsent />
                </WishlistProvider>
              </CartProvider>
            </SettingsProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
