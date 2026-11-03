import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import SmoothScrollProvider from '@/components/smooth-scroll';
import SplashScreen from '@/components/splash-screen';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'PMW POLSRI STORE | Marketplace Kewirausahaan Mahasiswa Politeknik Negeri Sriwijaya',
  description:
    'Platform e-commerce resmi produk inovasi, kuliner Palembang, merchandise kriya, dan teknologi mahasiswa Politeknik Negeri Sriwijaya.',
  keywords: [
    'Polsri',
    'Politeknik Negeri Sriwijaya',
    'PMW Polsri',
    'Marketplace Mahasiswa',
    'Wirausaha Mahasiswa',
    'Palembang',
    'Pempek Tenggiri',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo';
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapUrl = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <html lang="id">
      <head>
        {/* Midtrans Snap JS Script */}
        <Script
          src={snapUrl}
          data-client-key={midtransClientKey}
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-polsri-500 selection:text-white">
        <SplashScreen />
        <SmoothScrollProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
