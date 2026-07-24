import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SocialProofPopup } from '@/components/SocialProofPopup';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://freert.in'),
  title: 'FREERT | Luxury Minimalist Fashion eCommerce',
  description: 'BE YOU. BE BOLD. BE FREERT. Explore premium minimalist linens, structured outerwear, and contemporary streetwear curated for editorial fashion standards.',
  keywords: 'FREERT, luxury fashion, minimalist clothing, premium ecommerce, editorial design, contemporary streetwear, linen',
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
  openGraph: {
    title: 'FREERT | Luxury Minimalist Fashion eCommerce',
    description: 'BE YOU. BE BOLD. BE FREERT. Explore premium minimalist linens, structured outerwear, and contemporary streetwear curated for editorial fashion standards.',
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
    title: 'FREERT | Luxury Minimalist Fashion eCommerce',
    description: 'BE YOU. BE BOLD. BE FREERT.',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-bg-luxury text-fg-luxury font-sans-luxury">
        <AuthProvider>
          <ToastProvider>
            <SettingsProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <ToastContainer />
                  <SocialProofPopup />
                </WishlistProvider>
              </CartProvider>
            </SettingsProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
