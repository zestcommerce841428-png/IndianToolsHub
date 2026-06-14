'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { auth } from '@/config/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No token provided. Please request a new magic link.');
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(`/api/auth/magic-link?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid magic link');
        }

        // If we got a custom token, sign in with it
        if (data.customToken) {
          try {
            await signInWithCustomToken(auth, data.customToken);
            
            setStatus('success');
            setMessage(`Welcome back! You're now logged in as ${data.email}`);

            // Redirect to home after successful login
            setTimeout(() => {
              router.push('/');
            }, 1500);
          } catch (authError) {
            console.error('Firebase auth error:', authError);
            throw new Error('Failed to complete authentication');
          }
        } else if (data.fallback) {
          // Fallback: redirect to login page
          setStatus('success');
          setMessage(`Magic link verified for ${data.email}! Redirecting to login...`);

          setTimeout(() => {
            router.push('/auth/login?email=' + encodeURIComponent(data.email));
          }, 2000);
        } else {
          throw new Error('Invalid response from server');
        }

      } catch (err: unknown) {
        setStatus('error');
        setMessage((err as Error).message || 'Failed to verify magic link');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, width: '100%', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Verifying Magic Link...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we verify your login link.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50, color: 'success.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
              ✅ Verification Successful!
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography color="text.secondary">
              You will be redirected automatically...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ErrorIcon sx={{ fontSize: 50, color: 'error.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Link href="/auth/magic-link" style={{ textDecoration: 'none', width: '100%' }}>
                <Button variant="contained" fullWidth sx={{ fontWeight: 600 }}>
                  Request New Link
                </Button>
              </Link>
              <Link href="/auth/login" style={{ textDecoration: 'none', width: '100%' }}>
                <Button variant="outlined" fullWidth sx={{ fontWeight: 600 }}>
                  Back to Login
                </Button>
              </Link>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Suspense fallback={
        <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      }>
        <VerificationContent />
      </Suspense>
      <Footer />
    </Box>
  );
}
