import type { Metadata } from 'next';
import { IBM_Plex_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './sonic.css';
import { AcademyProvider } from './academy-provider';
const uiFont = IBM_Plex_Mono({
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

export const metadata: Metadata = {
  title: 'SONIC-Academy | CloudSeamTech Training',
  icons: { icon: '/favicon.svg' },
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
      <body className={`${geistMono.variable} ${uiFont.variable} antialiased`}>
        <AcademyProvider>{children}</AcademyProvider>
      </body>
    </html>
  );
}

import './sonic-design-system.css';

import './terminal-typography.css';

import './academy-theme.css';
