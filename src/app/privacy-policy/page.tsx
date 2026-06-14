import React from 'react';
import { Metadata } from 'next';
import { Container, Box, Typography, Paper, Divider } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateSEO } from '@/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = generateSEO('privacy', {
    title: 'Privacy Policy | IndianToolsHub',
    description: 'Read the IndianToolsHub Privacy Policy. All tools operate 100% client-side in your browser. Your files, documents and data never leave your device.',
    keywords: 'IndianToolsHub privacy policy, client-side tools, data privacy, no data upload, secure tools',
    canonical: 'https://indian-tools-hub.vercel.app/privacy-policy',
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

export default function PrivacyPolicy() {
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
            Privacy Policy
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 4 }}>
            Welcome to <strong>IndianToolsHub</strong>. Your privacy is of paramount importance to us. This Privacy Policy outlines the types of information we collect, how we use it, and the security measures we employ to protect your data.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            1. 100% Client-Side Processing (No Data Uploads)
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            Unlike other utilities, IndianToolsHub is designed so that almost all tools operate **100% client-side**. This means when you upload an image for compression, paste code for minification, or signature a PDF, all processing is performed inside your browser. No files, documents, passwords, or text content are ever sent to our servers.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            2. Information We Collect
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            We do not require any user registration or accounts. You are free to use all tools anonymously. The only data we collect falls into:
          </Typography>
          <Typography variant="body1" component="div" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            <ul>
              <li><strong>Non-Personal Site Usage Data:</strong> Anonymized statistics such as browser type, operating system, pages visited, and timestamps. This is gathered to improve our layout and optimize performance.</li>
              <li><strong>Voluntarily Submitted Information:</strong> For instance, if you contact us directly via email, we will retain your email address solely to reply to your inquiry.</li>
            </ul>
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            3. Cookies and Tracking Technologies
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            We may use cookies to remember preferences, analyze traffic flow, and ensure seamless navigation. You can disable cookies at any time by configuring your browser settings.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            4. Third-Party Services
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            We integrate third-party services (such as Google Analytics) to help us analyze overall utility usage. These service providers may collect non-identifiable usage statistics governed by their respective privacy policies.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            5. Changes to This Policy
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            We reserve the right to modify this Privacy Policy at any time. Any revisions will be instantly reflected on this page with an updated date.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.primary' }}>
            6. Contact Us
          </Typography>
          <Typography variant="body1" component="p" sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
            If you have questions regarding this Privacy Policy or any client-side operation, feel free to email us at <strong>contact@zestcommerce.in</strong>.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
