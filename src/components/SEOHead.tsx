// SEO Metadata Component for Next.js App Router
import { Metadata } from 'next';
import { SEOData, generateStructuredData } from '@/utils/seo';

/**
 * Generate Next.js metadata from SEO data
 */
export function generateMetadata(seoData: SEOData): Metadata {
  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    authors: seoData.author ? [{ name: seoData.author }] : undefined,
    
    // Open Graph
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonical,
      siteName: 'IndianToolsHub',
      images: seoData.ogImage ? [
        {
          url: seoData.ogImage,
          width: 1200,
          height: 630,
          alt: seoData.title,
        }
      ] : undefined,
      locale: 'en_IN',
      type: (seoData.ogType as any) || 'website',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: seoData.ogImage ? [seoData.ogImage] : undefined,
    },
    
    // Additional
    alternates: {
      canonical: seoData.canonical,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return metadata;
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJSONLD(type: 'website' | 'article' | 'organization', data?: any): string {
  const structuredData = generateStructuredData(type, data);
  return JSON.stringify(structuredData);
}

/**
 * SEO Component for client-side rendered pages
 * Use this in Client Components
 */
export function SEOHead({ seoData }: { seoData: SEOData }) {
  return (
    <>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
      {seoData.canonical && <link rel="canonical" href={seoData.canonical} />}
      {seoData.author && <meta name="author" content={seoData.author} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}
      {seoData.ogType && <meta property="og:type" content={seoData.ogType} />}
      {seoData.canonical && <meta property="og:url" content={seoData.canonical} />}
      <meta property="og:site_name" content="IndianToolsHub" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      {seoData.ogImage && <meta name="twitter:image" content={seoData.ogImage} />}
      
      {/* Article specific */}
      {seoData.publishedTime && <meta property="article:published_time" content={seoData.publishedTime} />}
      {seoData.modifiedTime && <meta property="article:modified_time" content={seoData.modifiedTime} />}
    </>
  );
}
