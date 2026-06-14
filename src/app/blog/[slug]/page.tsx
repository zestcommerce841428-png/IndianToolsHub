import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container, Box, Typography, Paper, Breadcrumbs, Divider, Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import Grid from '@mui/material/Grid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BLOG_POSTS, BlogPost } from '@/data/blogs';
import { generateBlogSEO, generateStructuredData } from '@/utils/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Generate full SEO Metadata for blog post pages
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return { title: 'Article Not Found | IndianToolsHub' };
  }

  const seoData = generateBlogSEO(
    post.slug,
    post.title,
    post.description,
    post.publishDate,
    post.publishDate,
  );

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: post.tags.join(', '),
    authors: [{ name: seoData.author || 'IndianToolsHub Team' }],
    alternates: {
      canonical: seoData.canonical,
    },
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonical,
      siteName: 'IndianToolsHub',
      type: 'article',
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime,
      images: seoData.ogImage
        ? [{ url: seoData.ogImage, width: 1200, height: 630, alt: seoData.title }]
        : undefined,
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: seoData.ogImage ? [seoData.ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

// 2. Pre-generate static path parameters for build performance
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related articles in same category (excl current)
  const relatedPosts = BLOG_POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 4);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>
            Blog
          </Link>
          <Typography color="text.primary" noWrap sx={{ fontWeight: 600, maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {post.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Article Content */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mb: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  {post.category}
                </Typography>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: '"Poppins", sans-serif', mb: 2, lineHeight: 1.25 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Published: {post.publishDate} • {post.readTime}
                </Typography>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Render article markdown content sections */}
              <Box sx={{
                '& h2': { variant: 'h5', component: 'h2', fontWeight: 700, fontFamily: '"Poppins", sans-serif', mt: 4, mb: 2 },
                '& p': { mb: 2.5, lineHeight: 1.7 },
                '& ol': { pl: 3, mb: 2.5 },
                '& li': { mb: 1.2, lineHeight: 1.6 },
                '& ul': { pl: 3, mb: 2.5 }
              }}>
                {post.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('## ')) {
                    return <Typography key={i} variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, fontFamily: '"Poppins", sans-serif' }}>{para.replace('## ', '')}</Typography>;
                  }
                  if (para.startsWith('1. ') || para.startsWith('* ')) {
                    return (
                      <Box key={i} sx={{ pl: 2, mb: 2.5 }}>
                        {para.split('\n').map((line, li) => (
                          <Typography key={li} variant="body1" sx={{ mb: 1, display: 'list-item', ml: 2, lineHeight: 1.7 }}>
                            {line.replace(/^\d+\.\s+\*\*/, '').replace(/^\*\s+\*\*/, '').replace(/\*\*/g, '')}
                          </Typography>
                        ))}
                      </Box>
                    );
                  }
                  return <Typography key={i} variant="body1" sx={{ mb: 2.5, lineHeight: 1.7 }}>{para}</Typography>;
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Related Articles sidebar */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 90 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Poppins", sans-serif' }}>
                Related Articles
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        borderColor: 'primary.main',
                      }
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.5, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rp.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rp.publishDate}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
