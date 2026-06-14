import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';
import '@/styles/accessibility-v3.css';

import { LanguageProvider } from '@/context/LanguageContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { AccessibilityProviderV3 } from '@/context/AccessibilityContextV3';
import { AccessibilityProviderV4 } from '@/context/AccessibilityContextV4';
import { CustomThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import CookieConsent from '@/components/CookieConsent';
import AccessibilityPanelV4 from '@/components/accessibility/AccessibilityPanelV4';
import AccessibilityCSSApplierV4 from '@/components/accessibility/AccessibilityCSSApplierV4';
import ScrollButtons from '@/components/ScrollButtons';
import RecaptchaWrapper from '@/components/RecaptchaWrapper';
import GoogleAnalytics from '@/components/GoogleAnalytics';

import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'IndianToolsHub | Professional All-in-One Tool Suite',
  description: 'Fast, secure, and client-side web utility tools for images, documents, calculators, developers, and designers.',
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: 'index, follow',
  openGraph: {
    title: 'IndianToolsHub | Professional All-in-One Tool Suite',
    description: 'Fast, secure, and client-side web utility tools for images, documents, calculators, developers, and designers.',
    url: 'https://indian-tools-hub.vercel.app/',
    siteName: 'IndianToolsHub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IndianToolsHub | Professional All-in-One Tool Suite',
    description: 'Fast, secure, and client-side web utility tools for images, documents, calculators, developers, and designers.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const providers = (
    <AuthProvider>
      <FavoritesProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <AccessibilityProviderV3>
              <AccessibilityProviderV4>
                <CustomThemeProvider>
                  <CssBaseline />
                  {/* New V4 Accessibility System - 49 Advanced Features */}
                  <AccessibilityPanelV4 />
                  <AccessibilityCSSApplierV4 />
                  
                  {/* Other components */}
                  <ScrollButtons />
                  {children}
                  <CookieConsent />
                </CustomThemeProvider>
              </AccessibilityProviderV4>
            </AccessibilityProviderV3>
          </AccessibilityProvider>
        </LanguageProvider>
      </FavoritesProvider>
    </AuthProvider>
  );

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "IndianToolsHub",
              "url": "https://indian-tools-hub.vercel.app/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://indian-tools-hub.vercel.app/?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "IndianToolsHub",
              "operatingSystem": "All",
              "applicationCategory": "UtilityApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "description": "Fast, secure, and client-side web utility tools for images, documents, calculators, developers, and designers."
            }),
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AppRouterCacheProvider>
          <RecaptchaWrapper reCaptchaKey={reCaptchaKey}>
            {providers}
          </RecaptchaWrapper>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

