import React from 'react';
import { Metadata } from 'next';
import { Container, Box, Typography, Paper, Divider } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateSEO } from '@/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = generateSEO('about', {
    title: 'About Us | IndianToolsHub — Free Online Tools for India',
    description: 'Learn about IndianToolsHub — our mission to provide 105+ free, private, and client-side web utility tools for developers, designers, students, and professionals across India.',
    keywords: 'about IndianToolsHub, free online tools India, privacy-first tools, web utilities, about us',
    canonical: 'https://indian-tools-hub.vercel.app/about',
    ogType: 'website',
  });
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
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

export default function About() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 8, flexGrow: 1 }}>
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 3 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              fontFamily: '"Poppins", sans-serif',
              mb: 3,
            }}
          >
            About Us
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="body1" component="p" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
            Welcome to <strong>IndianToolsHub</strong>, a free online utility platform built to help developers, designers, writers, students, and professionals execute daily digital tasks quickly, easily, and securely.
          </Typography>

          <Typography variant="body1" component="p" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
            Our mission is simple: to make web utilities accessible to everyone without requiring complex software installations, account signups, or subscription fees. We focus on delivering high-performance, mobile-responsive tools with an elegant, modern interface.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            Our Core Pillars
          </Typography>

          <Typography variant="body1" component="div" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            <ul>
              <li><strong>Privacy First:</strong> 100% of our operations happen client-side in your browser. Your images, documents, and texts never leave your computer. We do not upload your data to our servers.</li>
              <li><strong>Zero Cost:</strong> All tools are completely free to use with no usage limit restrictions or hidden gates.</li>
              <li><strong>Aesthetic & Simple:</strong> We design clean, clutter-free interfaces powered by Material Design to optimize your workspace.</li>
              <li><strong>Speed:</strong> Instantaneous outputs. No servers to wait on, no queues.</li>
            </ul>
          </Typography>

          <Typography variant="body1" component="p" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
            IndianToolsHub is continuously expanding. We constantly monitor performance, fix bugs, and implement new utilities suggested by our community of users. 
          </Typography>

          <Typography variant="body1" component="p" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Thank you for choosing <strong>IndianToolsHub</strong> as your smart digital utility toolbox!
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
