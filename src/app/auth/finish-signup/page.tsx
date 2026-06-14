'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, CircularProgress, Alert, TextField, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function FinishSignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailForSignIn, setEmailForSignIn] = useState('');
  const [needsEmail, setNeedsEmail] = useState(false);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Check if the link is a valid Firebase Email Link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get the email if stored on the same device
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (storedEmail) {
        completeSignIn(storedEmail);
      } else {
        // If opened on a different device, we must ask the user for their email
        setNeedsEmail(true);
        setProcessing(false);
      }
    } else {
      setError("This sign-in link is invalid or has expired. Please request a new one.");
      setProcessing(false);
    }
  }, []);

  const completeSignIn = async (email: string) => {
    setProcessing(true);
    setError('');
    
    try {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      const user = result.user;
      
      // Verify if they exist in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create basic profile for passwordless signup
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.email?.split('@')[0] || 'User', // Use part of email as default name
          photoURL: null,
          role: 'user',
          createdAt: new Date().toISOString(),
          phone: '', age: '', gender: '', bio: '', company: '', jobTitle: '',
          expertiseArea: '', address: '', city: '', country: '', postalCode: '',
          githubUrl: '', linkedinUrl: '', twitterUrl: ''
        });
      }

      setSuccess("Successfully verified! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to sign in. The link may have expired or been used already.");
      setProcessing(false);
    }
  };

  const handleManualEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForSignIn) return;
    completeSignIn(emailForSignIn);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 4, width: '100%', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          
          <VerifiedUserIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: '"Poppins", sans-serif' }}>
            Verifying Magic Link
          </Typography>
          
          {error && <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 3, textAlign: 'left' }}>{success}</Alert>}

          {processing && !error && !success && (
            <Box sx={{ mt: 4 }}>
              <CircularProgress color="primary" />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Securely logging you in...
              </Typography>
            </Box>
          )}

          {needsEmail && !processing && (
            <Box component="form" onSubmit={handleManualEmailSubmit} sx={{ mt: 4, textAlign: 'left' }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                You opened this link on a different device or browser. For security, please confirm your email address to complete the sign-in.
              </Typography>
              <TextField
                label="Confirm Email Address"
                type="email"
                fullWidth
                required
                value={emailForSignIn}
                onChange={(e) => setEmailForSignIn(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, fontWeight: 600 }}>
                Complete Sign In
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
