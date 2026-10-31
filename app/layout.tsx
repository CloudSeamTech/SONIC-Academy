import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';
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

const readingFont = Inter({
  variable: '--font-academy-reading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SONIC-Academy | CloudSeamTech Training',
  icons: {
    icon: { url: '/quiet-cloud-icon.svg', type: 'image/svg+xml' },
    shortcut: '/quiet-cloud-icon.svg',
    apple: '/quiet-cloud-icon-180.png',
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
        className={`${geistMono.variable} ${uiFont.variable} ${readingFont.variable} antialiased`}
      >
        <AcademyProvider>{children}</AcademyProvider>
      </body>
    </html>
  );
}

import './sonic-design-system.css';

import './terminal-typography.css';

import './academy-theme.css';
