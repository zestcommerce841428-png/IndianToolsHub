import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container, Box, Typography, Paper, Breadcrumbs } from '@mui/material';
import Grid from '@mui/material/Grid';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolIcon from '@/components/ToolIcon';
import { TOOLS } from '@/data/tools';
import Link from 'next/link';
import ToolRenderer from './ToolRenderer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { generateToolSEO } from '@/utils/seo';

// Generate metadata dynamically on the server
type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) {
    return { title: 'Tool Not Found - IndianToolsHub' };
  }
  const seoData = generateToolSEO(tool.slug, tool.title, tool.description);
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: tool.keywords.join(', '),
    alternates: { canonical: seoData.canonical },
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonical,
      siteName: 'IndianToolsHub',
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

// Pre-generate static routes for all slugs at build time
export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  // Get related tools in the same category (excluding current tool)
  const relatedTools = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 5);

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
          <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {tool.category} Tools
          </Typography>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {tool.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Tool Area */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 4 }}>
              {/* Header Box */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                >
                  <ToolIcon name={tool.icon} sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontFamily: '"Poppins", sans-serif',
                      color: 'text.primary',
                    }}
                  >
                    {tool.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {tool.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                {/* Client-side dynamic rendering wrapper secured by Firebase */}
                <ProtectedRoute>
                  <ToolRenderer slug={slug} />
                </ProtectedRoute>
              </Box>
            </Paper>
          </Grid>

          {/* Related Tools Sidebar */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 90 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Poppins", sans-serif' }}>
                Related Tools
              </Typography>
              {relatedTools.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {relatedTools.map((rt) => (
                    <Link key={rt.slug} href={`/tools/${rt.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.02)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(37, 99, 235, 0.05)',
                            color: 'primary.main',
                          }}
                        >
                          <ToolIcon name={rt.icon} sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {rt.title}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No other tools in this category.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
