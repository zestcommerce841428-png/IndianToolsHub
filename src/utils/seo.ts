// SEO Metadata utilities for dynamic meta tags
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const baseUrl = 'https://indian-tools-hub.vercel.app';
const siteName = 'IndianToolsHub';
const defaultImage = `${baseUrl}/og-image.png`;
const defaultAuthor = 'IndianToolsHub Team';

/**
 * Generate SEO metadata for different pages
 */
export function generateSEO(page: string, customData?: Partial<SEOData>): SEOData {
  const defaults: Record<string, SEOData> = {
    home: {
      title: 'IndianToolsHub - Free Online Tools for India 🇮🇳',
      description: 'Access 105+ free online tools including image converters, PDF tools, QR generators, and more. Built for India, empowering digital transformation.',
      keywords: 'online tools, free tools India, image converter, PDF tools, QR generator, online utilities',
      ogImage: defaultImage,
      ogType: 'website',
      canonical: baseUrl,
      author: defaultAuthor,
    },
    
    tools: {
      title: 'Online Tools Collection - IndianToolsHub',
      description: 'Browse our complete collection of 105+ free online tools. Image editing, PDF management, QR codes, and much more.',
      keywords: 'online tools, productivity tools, image tools, PDF tools, utilities',
      ogImage: defaultImage,
      ogType: 'website',
      canonical: `${baseUrl}/tools`,
      author: defaultAuthor,
    },
    
    blog: {
      title: 'Blog & Guides - IndianToolsHub',
      description: 'Learn how to use online tools effectively with our comprehensive guides and tutorials.',
      keywords: 'online tools tutorials, how to guides, tool tips',
      ogImage: defaultImage,
      ogType: 'website',
      canonical: `${baseUrl}/blog`,
      author: defaultAuthor,
    },
    
    profile: {
      title: 'My Profile - IndianToolsHub',
      description: 'Manage your IndianToolsHub profile, settings, and preferences.',
      ogType: 'profile',
      canonical: `${baseUrl}/profile`,
      author: defaultAuthor,
    },
    
    login: {
      title: 'Login - IndianToolsHub',
      description: 'Sign in to access your IndianToolsHub account and saved tools.',
      ogType: 'website',
      canonical: `${baseUrl}/auth/login`,
      author: defaultAuthor,
    },
    
    register: {
      title: 'Create Account - IndianToolsHub',
      description: 'Join IndianToolsHub to save your favorite tools and access premium features.',
      ogType: 'website',
      canonical: `${baseUrl}/auth/register`,
      author: defaultAuthor,
    },

    about: {
      title: 'About Us | IndianToolsHub — Free Online Tools for India',
      description: 'Learn about IndianToolsHub — our mission to provide 105+ free, private, and client-side web utility tools for developers, designers, students, and professionals across India.',
      keywords: 'about IndianToolsHub, free online tools India, privacy-first tools, web utilities, about us',
      ogImage: defaultImage,
      ogType: 'website',
      canonical: `${baseUrl}/about`,
      author: defaultAuthor,
    },

    privacy: {
      title: 'Privacy Policy | IndianToolsHub',
      description: 'Read the IndianToolsHub Privacy Policy. All tools operate 100% client-side in your browser. Your files, documents and data never leave your device.',
      keywords: 'IndianToolsHub privacy policy, client-side tools, data privacy, no data upload, secure tools',
      ogType: 'website',
      canonical: `${baseUrl}/privacy-policy`,
      author: defaultAuthor,
    },

    terms: {
      title: 'Terms of Use | IndianToolsHub',
      description: 'Read the IndianToolsHub Terms of Use. Understand how to use our 105+ free online tools responsibly and legally.',
      keywords: 'IndianToolsHub terms of use, terms and conditions, usage policy, free tools legal',
      ogType: 'website',
      canonical: `${baseUrl}/term-conditions`,
      author: defaultAuthor,
    },
  };

  const baseSEO = defaults[page] || defaults.home;
  return { ...baseSEO, ...customData };
}

/**
 * Generate tool-specific SEO
 */
export function generateToolSEO(toolSlug: string, toolName: string, toolDescription: string): SEOData {
  return {
    title: `${toolName} - Free Online Tool | IndianToolsHub`,
    description: toolDescription,
    keywords: `${toolName.toLowerCase()}, online ${toolName.toLowerCase()}, free ${toolName.toLowerCase()}`,
    ogImage: defaultImage,
    ogType: 'website',
    canonical: `${baseUrl}/tools/${toolSlug}`,
    author: defaultAuthor,
  };
}

/**
 * Generate blog post SEO
 */
export function generateBlogSEO(
  slug: string, 
  title: string, 
  excerpt: string,
  publishedDate?: string,
  modifiedDate?: string,
  featuredImage?: string
): SEOData {
  return {
    title: `${title} | IndianToolsHub Blog`,
    description: excerpt,
    keywords: `${title.toLowerCase()}, blog, tutorial`,
    ogImage: featuredImage || defaultImage,
    ogType: 'article',
    canonical: `${baseUrl}/blog/${slug}`,
    author: defaultAuthor,
    publishedTime: publishedDate,
    modifiedTime: modifiedDate,
  };
}

/**
 * Generate JSON-LD structured data
 */
export function generateStructuredData(type: 'website' | 'article' | 'organization', data?: any) {
  const structuredData: Record<string, any> = {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl,
      description: 'Free online tools for India',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/tools?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        // Add social media links
      ],
    },
    
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data?.title || '',
      description: data?.description || '',
      image: data?.image || defaultImage,
      datePublished: data?.publishedTime || new Date().toISOString(),
      dateModified: data?.modifiedTime || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: siteName,
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
    },
  };

  return structuredData[type];
}
