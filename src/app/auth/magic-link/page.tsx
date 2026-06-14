'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, width: '100%', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <EmailIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 800, mb: 1, fontFamily: '"Poppins", sans-serif' }}
            >
              Magic Link Login
            </Typography>
            <Typography color="text.secondary">
              No password needed! We&apos;ll send you a secure login link via email.
            </Typography>
          </Box>

          {!success ? (
            <>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  autoComplete="email"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Magic Link'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Prefer traditional login?
                </Typography>
                <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    Back to Login
                  </Button>
                </Link>
              </Box>
            </>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                <strong>Magic link sent!</strong> Check your email inbox.
              </Alert>

              <Box
                sx={{
                  bgcolor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                  <strong>What&apos;s next?</strong>
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2, color: 'text.secondary', '& li': { mb: 1 } }}>
                  <li>Check your email inbox for: <strong>{email}</strong></li>
                  <li>Click the magic link in the email</li>
                  <li>You&apos;ll be automatically logged in</li>
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: 'rgba(251, 191, 36, 0.05)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  ⏰ <strong>The link expires in 15 minutes</strong> for security reasons.
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                  📧 Don&apos;t see it? Check your spam folder.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  Send Another
                </Button>
                <Link href="/auth/login" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button variant="text" fullWidth sx={{ fontWeight: 600 }}>
                    Back to Login
                  </Button>
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
