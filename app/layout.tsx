import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Until I hold you again',
  description: 'A countdown to closing the distance.',
};

export const viewport: Viewport = {
  themeColor: '#08050f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
