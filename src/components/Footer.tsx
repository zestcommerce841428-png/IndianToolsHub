'use client';

import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import EmailIcon from '@mui/icons-material/Email';
import Link from 'next/link';

import { useLanguage } from '@/context/LanguageContext';
import BuildInfo from './BuildInfo';

const TricolorLogoFooter = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    <path d="M16 2C8.268 2 2 8.268 2 16C2 17.844 2.355 19.605 3 21.22L6.5 19.5C6.18 18.412 6 17.23 6 16C6 10.477 10.477 6 16 6C17.23 6 18.412 6.18 19.5 6.5L21.22 3C19.605 2.355 17.844 2 16 2Z" fill="#FF9933" />
    <circle cx="16" cy="16" r="5" fill="#FFFFFF" stroke="#000080" strokeWidth="1" />
    <path d="M16 11V21M11 16H21M12.46 12.46L19.54 19.54M12.46 19.54L19.54 12.46" stroke="#000080" strokeWidth="0.75" />
    <path d="M16 30C23.732 30 30 23.732 30 16C30 14.156 29.645 12.395 29 10.78L25.5 12.5C25.82 13.588 26 14.77 26 16C26 21.523 21.523 26 16 26C14.77 26 13.588 25.82 12.5 25.5L10.78 29C12.395 29.645 14.156 30 16 30Z" fill="#128807" />
  </svg>
);

const WhatsAppLogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
    <path d="M12.012 2c-5.523 0-10 4.477-10 10 0 1.777.465 3.504 1.35 5.025l-1.436 5.24 5.364-1.408c1.472.802 3.125 1.223 4.794 1.223 5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 1.75c4.549 0 8.25 3.701 8.25 8.25s-3.701 8.25-8.25 8.25c-1.547 0-3.056-.435-4.364-1.258l-.313-.19-3.238.85.865-3.155-.208-.332a8.21 8.21 0 0 1-1.242-4.165c0-4.549 3.701-8.25 8.25-8.25zm-3.614 4.887c-.198 0-.382.078-.523.22-.162.162-.48.47-.48 1.147 0 .678.493 1.332.562 1.424.069.093.971 1.482 2.352 2.08.328.142.585.227.784.29.33.105.63.09.868.055.265-.04.814-.333.929-.655.115-.322.115-.598.08-.655-.035-.058-.127-.093-.265-.162-.138-.069-.815-.403-.941-.448-.127-.046-.22-.069-.312.069-.092.138-.356.448-.436.54-.08.092-.161.103-.3.035-.137-.069-.581-.214-1.107-.684-.41-.365-.686-.816-.767-.954-.08-.138-.008-.213.06-.282.062-.061.138-.162.207-.242.069-.08.092-.138.138-.23.046-.092.023-.173-.012-.242-.034-.069-.312-.752-.427-1.03-.112-.27-.225-.233-.312-.238l-.265-.005z"/>
  </svg>
);

export default function Footer() {
  const { t } = useLanguage();

  const categories = [
    { title: t('allUtilities'), slug: '/' },
    { title: 'Image Tools', slug: '/#image' },
    { title: 'Document Tools', slug: '/#document' },
    { title: 'Calculator Tools', slug: '/#calculator' },
    { title: 'Developer Tools', slug: '/#developer' },
  ];

  const quickLinks = [
    { title: t('home'), href: '/' },
    { title: 'Blog', href: '/blog' },
    { title: 'Contact', href: '/contact' },
    { title: t('about'), href: '/about' },
    { title: t('privacy'), href: '/privacy-policy' },
    { title: t('terms'), href: '/term-conditions' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        pt: 8,
        pb: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #FF9933, #ffffff, #128807)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo & Description */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TricolorLogoFooter />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontFamily: '"Poppins", sans-serif',
                    color: '#ffffff',
                  }}
                >
                  Indian<span style={{ color: '#FF9933' }}>ToolsHub</span>
                </Typography>
              </Box>
            </Link>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.7 }}>
              {t('logoTitle')} – {t('heroSubtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                href="mailto:contact@zestcommerce.in"
                sx={{
                  color: '#38bdf8',
                  borderColor: '#38bdf8',
                  borderRadius: '20px',
                  '&:hover': {
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                  },
                }}
              >
                contact@zestcommerce.in
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<WhatsAppLogoIcon />}
                href="https://wa.me/917492068998"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: '20px',
                  '&:hover': {
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    backgroundColor: 'rgba(74, 188, 74, 0.05)',
                  },
                }}
              >
                Chat on WhatsApp
              </Button>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }} sx={{ ml: { md: '8.3333%' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  style={{
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => ((e.target as HTMLAnchorElement).style.color = '#FF9933')}
                  onMouseOut={(e) => ((e.target as HTMLAnchorElement).style.color = '#94a3b8')}
                >
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Categories */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {categories.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.slug}
                  style={{
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => ((e.target as HTMLAnchorElement).style.color = '#FF9933')}
                  onMouseOut={(e) => ((e.target as HTMLAnchorElement).style.color = '#94a3b8')}
                >
                  {cat.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Core Values */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}>
              100% Client-Side & Secure
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7 }}>
              Your data never leaves your device! All calculations, image compression, formatting, and file conversions occur directly inside your web browser. Privacy first.
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            pt: 4,
            borderTop: '1px solid #1e293b',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
              &copy; {new Date().getFullYear()} IndianToolsHub. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
              Made with ❤️ in India by Naushad. Assisted by Antigravity. Hosted on Vercel.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                display: { xs: 'none', sm: 'block' },
                mr: 1,
              }}
            >
              Latest:
            </Typography>
            <BuildInfo variant="full" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
