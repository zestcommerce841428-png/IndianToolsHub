'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#FF9933' }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Verifying secure access...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', maxWidth: 500 }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'error.light', color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <LockIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Poppins", sans-serif' }}>
            Access Denied
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            You need to be securely logged in to access this advanced utility. Redirecting to the secure login page...
          </Typography>
          <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
}
