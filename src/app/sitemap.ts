import { MetadataRoute } from 'next';
import { TOOLS } from '@/data/tools';
import { BLOG_POSTS } from '@/data/blogs';

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours

/**
 * Enhanced Dynamic Sitemap with Advanced Features
 * - Automatic priority calculation based on page type
 * - Dynamic change frequency based on content freshness
 * - Tool categorization for better indexing
 * - Blog post date-based priorities
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indian-tools-hub.vercel.app';
  const currentDate = new Date();

  // Helper: Calculate days since publication
  const daysSince = (dateString: string) => {
    const publishDate = new Date(dateString);
    const diff = currentDate.getTime() - publishDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Helper: Dynamic change frequency based on content age
  const getChangeFrequency = (days: number): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' => {
    if (days < 7) return 'daily';
    if (days < 30) return 'weekly';
    if (days < 180) return 'monthly';
    return 'yearly';
  };

  // Core Pages with Strategic Priorities
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0, // Homepage - Highest priority
    },
    {
      url: `${baseUrl}/sitemap-page`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7, // Sitemap page for users
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8, // About page - High priority
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7, // Contact page
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3, // Legal pages - Lower priority
    },
    {
      url: `${baseUrl}/term-conditions`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9, // Blog index - Very high priority
    },
  ];

  // Auth Pages - Lower priority but still indexed
  const authPages = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/magic-link',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));

  // Dynamic Tool Pages with Category-Based Priority
  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => {
    // Higher priority for popular tool categories
    let priority = 0.85; // Default tool priority
    
    const popularCategories = ['Image Tools', 'PDF Tools', 'Converter Tools'];
    if (tool.category && popularCategories.includes(tool.category)) {
      priority = 0.95;
    }

    return {
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority,
    };
  });

  // Dynamic Blog Post Pages with Freshness-Based Priority
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => {
    const days = daysSince(post.publishDate);
    
    // Newer posts get higher priority
    let priority = 0.7;
    if (days < 7) priority = 0.95; // Very new posts
    else if (days < 30) priority = 0.85; // Recent posts
    else if (days < 90) priority = 0.75; // Moderately recent

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: getChangeFrequency(days),
      priority,
    };
  });

  // Combine all routes
  return [
    ...routes,
    ...authPages,
    ...toolRoutes,
    ...blogRoutes,
  ];
}

