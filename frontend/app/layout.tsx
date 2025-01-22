import { Poppins  } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';
import { cn, constructMetadata } from '@/lib/metadata';
import LayoutProvider from '@/providers/layout-provider';
import Spinner from '@/components/common/spinner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className}`}>
        <Suspense fallback={<Spinner />}>
          <LayoutProvider>{children}</LayoutProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
