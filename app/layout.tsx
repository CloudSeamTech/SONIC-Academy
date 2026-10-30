import type { Metadata } from 'next';
import {
  Space_Grotesk,
  JetBrains_Mono,
  Chakra_Petch,
  Inter,
} from 'next/font/google';
import './globals.css';
import './sonic.css';
import { AcademyProvider } from './academy-provider';
const uiFont = Space_Grotesk({
  variable: '--font-academy-ui',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = JetBrains_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal'],
});

const headingFont = Chakra_Petch({
  variable: '--font-academy-heading',
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal'],
});
const readingFont = Inter({
  variable: '--font-academy-reading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SONIC-Academy | CloudSeamTech Training',
  icons: {
    icon: [
      { url: '/favicon.svg?v=zipper-2', type: 'image/svg+xml' },
      { url: '/cloudseam-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/cloudseam-icon-64.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=zipper-2',
    apple: [
      { url: '/cloudseam-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  description:
    'Practical Windows Server, Active Directory, SQL Server, Azure, migration, and Linux learning pathways.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${uiFont.variable} ${headingFont.variable} ${readingFont.variable} antialiased`}
      >
        <AcademyProvider>{children}</AcademyProvider>
      </body>
    </html>
  );
}

import './sonic-design-system.css';

import './terminal-typography.css';

import './academy-theme.css';
