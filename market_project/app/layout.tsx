import Header from '../components/Header';
import Providers from './providers';
import './globals.css';
import CartDrawer from '@/components/CartDrawer';
import Footer from '../components/Footer';
import type { Metadata, Viewport } from 'next';

// ⚠️ Once deployed, add NEXT_PUBLIC_SITE_URL to your environment variables
// (Vercel → Settings → Environment Variables), e.g. https://mymarket.ge
// This makes the Open Graph image URL resolve correctly when links are
// shared on social media / messengers.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Without this, mobile browsers render the page as if it were a wide
// desktop layout and then shrink it to fit — which is exactly what caused
// the site to appear squeezed into the left portion of the screen on
// phones, with dead space on the right.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Marketologi — ბაზარი სერიოზული მყიდველებისთვის',
    template: '%s | Marketologi',
  },
  description:
    'იყიდე და გაყიდე პირდაპირ, შუამავლების გარეშე. ნათელი ფასები ლარებში, ნამდვილი ფოტოები და პირდაპირი კონტაქტი გამყიდველთან.',
  keywords: ['მარკეტპლეისი', 'ყიდვა', 'გაყიდვა', 'განცხადებები', 'საქართველო', 'Marketologi'],
  openGraph: {
    title: 'Marketologi — ბაზარი სერიოზული მყიდველებისთვის',
    description:
      'იყიდე და გაყიდე პირდაპირ, შუამავლების გარეშე. ნათელი ფასები ლარებში, ნამდვილი ფოტოები და პირდაპირი კონტაქტი გამყიდველთან.',
    url: siteUrl,
    siteName: 'Marketologi',
    locale: 'ka_GE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketologi — ბაზარი სერიოზული მყიდველებისთვის',
    description:
      'იყიდე და გაყიდე პირდაპირ, შუამავლების გარეშე. ნათელი ფასები ლარებში, ნამდვილი ფოტოები და პირდაპირი კონტაქტი გამყიდველთან.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}