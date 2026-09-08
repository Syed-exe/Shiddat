import React from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

import '@/lib/utils/uuid';

export const viewport = {
  themeColor: '#EF233C',
};

export const metadata = {
  metadataBase: new URL('https://shiddat.me'),
  title: {
    default: 'Shiddat - Music Streaming Platform',
    template: '%s | Shiddat',
  },
  description: 'Shiddat is a modern music streaming platform to discover, listen to and enjoy music across your devices.',
  applicationName: 'Shiddat',
  authors: [{ name: 'Shiddat' }],
  keywords: [
    'Shiddat',
    'Shiddat',
    'shiddat.me',
    'music streaming',
    'free music streaming',
    'lossless audio',
    'listen to music online',
    'synced lyrics',
    'web music player',
    'Telugu music',
    'Hindi music',
    'English music'
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Shiddat - Music Streaming Platform',
    description: 'Shiddat is a modern music streaming platform to discover, listen to and enjoy music across your devices.',
    url: 'https://shiddat.me/',
    siteName: 'Shiddat',
    images: [
      {
        url: '/brand/shiddat-banner-logo.png',
        width: 1024,
        height: 341,
        alt: 'Shiddat - Music Streaming Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiddat - Music Streaming Platform',
    description: 'Shiddat is a modern music streaming platform to discover, listen to and enjoy music across your devices.',
    images: ['/brand/shiddat-banner-logo.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent' as const,
    title: 'Shiddat',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://shiddat.me/#website',
      url: 'https://shiddat.me/',
      name: 'Shiddat',
      description: 'Shiddat is a modern music streaming platform to discover, listen to and enjoy music across your devices.',
      inLanguage: 'en-US',
      publisher: {
        '@type': 'Organization',
        name: 'Shiddat',
        url: 'https://shiddat.me/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://shiddat.me/icon-512.png',
        },
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://shiddat.me/#webapp',
      url: 'https://shiddat.me/',
      name: 'Shiddat',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5 Audio.',
      description: 'Shiddat is a modern music streaming platform to discover, listen to and enjoy music across your devices.',
      image: 'https://shiddat.me/brand/shiddat-banner-logo.png',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Instant CDN Preconnects for 0ms artwork and stream resolution */}
        <link rel="preconnect" href="https://c.saavncdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://c.saavncdn.com" />
        <link rel="preconnect" href="https://aac.saavncdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://aac.saavncdn.com" />
        <link rel="preconnect" href="https://i.scdn.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.scdn.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('shiddat_theme_preference');
                  var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = isDark ? 'dark' : 'light';
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;

                  if (typeof window !== 'undefined') {
                    if (!window.crypto) {
                      window.crypto = {};
                    }
                    if (typeof window.crypto.randomUUID !== 'function') {
                      window.crypto.randomUUID = function() {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                          var r = Math.random() * 16 | 0;
                          var v = c === 'x' ? r : (r & 0x3 | 0x8);
                          return v.toString(16);
                        });
                      };
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-red-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
