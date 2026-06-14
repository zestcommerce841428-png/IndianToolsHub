import React from 'react';
import { Metadata } from 'next';
import { Container, Box, Typography, Paper, Divider } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateSEO } from '@/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = generateSEO('terms', {
    title: 'Terms of Use | IndianToolsHub',
    description: 'Read the IndianToolsHub Terms of Use. Understand how to use our 105+ free online tools responsibly and legally. No registration required for most tools.',
    keywords: 'IndianToolsHub terms of use, terms and conditions, usage policy, free tools legal, web tools terms',
    canonical: 'https://indian-tools-hub.vercel.app/term-conditions',
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
      card: 'summary',
      title: seoData.title,
      description: seoData.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default function TermsOfUse() {
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
            Terms of Use
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 4 }}>
            Welcome to <strong>IndianToolsHub</strong>. By accessing or using our website, you agree to comply with and be bound by the following Terms of Use. If you do not agree to these terms, please do not use our services.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            1. Use of Services
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            IndianToolsHub provides free, web-based utility tools for personal and commercial usage. You agree to use the site and tools only for lawful purposes. You must not attempt to hack, overload, or disrupt the operation of this website or bypass any security features.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            2. Intellectual Property
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            All source code, layouts, design elements, texts, and graphics on IndianToolsHub are our property or the property of our licensors, protected by copyright and intellectual property laws. You may not copy, scrape, replicate, or resell the design or functionality of these tools without our express written consent.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            3. Disclaimer of Warranties
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            All tools and services on IndianToolsHub are provided on an **"as is"** and **"as available"** basis, without warranties of any kind, whether express or implied. We do not guarantee that the tools will be 100% accurate, error-free, uninterrupted, or compatible with all devices. You use the tools and their output entirely at your own risk.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            4. Limitation of Liability
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            In no event shall IndianToolsHub or its contributors be liable for any direct, indirect, incidental, special, or consequential damages (including, but not limited to, loss of data, loss of profits, or business interruption) arising out of the use or inability to use this website.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            5. Third-Party Links
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            IndianToolsHub may link to external, third-party sites. We are not responsible for the contents, safety, or privacy practices of any third-party links.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            6. Revisions to Terms
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            We reserve the right to update or modify these Terms of Use at any time without prior notice. Your continued use of the website following any changes constitutes your agreement to the new Terms.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            7. Contact Information
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
            For any inquiries regarding these Terms of Use, please contact us at <strong>contact@zestcommerce.in</strong>.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
