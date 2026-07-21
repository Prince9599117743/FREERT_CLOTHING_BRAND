import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastContainer } from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'FREERT | Luxury Minimalist Fashion eCommerce',
  description: 'BE YOU. BE BOLD. BE FREERT. Explore premium minimalist linens, structured outerwear, and contemporary streetwear curated for editorial fashion standards.',
  keywords: 'FREERT, luxury fashion, minimalist clothing, premium ecommerce, editorial design, contemporary streetwear, linen',
  openGraph: {
    title: 'FREERT | Luxury Minimalist Fashion eCommerce',
    description: 'BE YOU. BE BOLD. BE FREERT.',
    type: 'website',
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
            <CartProvider>
              <WishlistProvider>
                {children}
                <ToastContainer />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
