import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/auth-provider';
import { NavBar } from '@/components/layout/nav-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expenses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <NavBar />
          <main className="mx-auto max-w-5xl px-3 pb-16 sm:px-4">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
