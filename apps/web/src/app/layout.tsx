import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MantineProvider } from '@mantine/core';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { NotificationsProvider } from '@mantine/notifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Voice-to-Docs SaaS',
  description: 'Speak structured documents into existence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>
          <NotificationsProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </NotificationsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
