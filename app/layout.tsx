import type { Metadata, Viewport } from 'next';
import { Josefin_Sans, Syne, DM_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import './tailwind.css';
import './globals.css';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TravelLoop | Aetherius',
  description: 'AI-Powered Travel Planning Application',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${josefin.variable} ${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-white font-josefin text-aetherius-heading antialiased selection:bg-aetherius-gold/30">
        <Providers>
          <Toaster position="bottom-right" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}
