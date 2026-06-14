'use client';

import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Divider, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  
  // 2FA verification state
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [usedBackupCodes, setUsedBackupCodes] = useState<string[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<'totp' | 'backup' | 'email'>('totp');
  const [tempUserId, setTempUserId] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setError("Firebase configuration is missing.");
      return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || '',
          photoURL: user.photoURL || null,
          role: 'user',
          createdAt: new Date().toISOString(),
          phone: '', age: '', gender: '', bio: '', company: '', jobTitle: '',
          expertiseArea: '', address: '', city: '', country: '', postalCode: '',
          githubUrl: '', linkedinUrl: '', twitterUrl: ''
        });
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setError("Firebase configuration is missing. Cannot log in.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has 2FA enabled
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.twoFactorEnabled && userData.twoFactorSecret) {
          // 2FA is enabled, show verification dialog
          setTempUserId(user.uid);
          setTwoFactorSecret(userData.twoFactorSecret);
          setBackupCodes(userData.backupCodes || []);
          setUsedBackupCodes(userData.backupCodesUsed || []);
          setShow2FADialog(true);
          
          // Sign out temporarily until 2FA is verified
          await auth.signOut();
          setLoading(false);
          return;
        }
      }
      
      // No 2FA, proceed to dashboard
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length < 6) {
      setError('Please enter a valid verification code');
      return;
    }

    setVerifying2FA(true);
    setError('');

    try {
      let verificationBody: any = {
        token: twoFactorCode,
        secret: twoFactorSecret,
        backupCodes: backupCodes,
        usedBackupCodes: usedBackupCodes
      };

      // If using email verification, send OTP first
      if (verificationMethod === 'email') {
        const userDoc = await getDoc(doc(db, 'users', tempUserId));
        const userData = userDoc.data();
        const backupEmail = userData?.backupEmail;
        
        if (!backupEmail) {
          setError('No backup email configured');
          setVerifying2FA(false);
          return;
        }

        // For email method, we need to verify via OTP
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: backupEmail, otp: twoFactorCode })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid code');
      } else {
        // Verify TOTP or backup code
        const response = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificationBody)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid code');

        // If backup code was used, update Firestore
        if (data.method === 'backup' && data.usedCode) {
          await updateDoc(doc(db, 'users', tempUserId), {
            backupCodesUsed: [...usedBackupCodes, data.usedCode]
          });
        }
      }

      // 2FA verified, sign in again
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Login successful!');
      setShow2FADialog(false);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleSendEmailOTP = async () => {
    setError('');
    setLoading(true);
    
    try {
      const userDoc = await getDoc(doc(db, 'users', tempUserId));
      const userData = userDoc.data();
      const backupEmail = userData?.backupEmail;
      
      if (!backupEmail) {
        throw new Error('No backup email configured');
      }

      const response = await fetch('/api/auth/send-backup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: backupEmail, type: 'login-2fa' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess(`OTP sent to ${backupEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const actionCodeSettings = {
      // Must exactly match your domain + the finish-signup route
      url: typeof window !== 'undefined' ? `${window.location.origin}/auth/finish-signup` : 'http://localhost:3000/auth/finish-signup',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setSuccess("Magic link sent! Check your email and click the link to sign in instantly.");
    } catch (err: any) {
      setError(err.message || "Failed to send magic link. Make sure Email Link is enabled in your Firebase Console.");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, width: '100%', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: '"Poppins", sans-serif', textAlign: 'center' }}>
            Welcome Back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Secure login to access all advanced tools.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{ py: 1.5, mb: 3, fontSize: '1rem', fontWeight: 600, borderRadius: 2, color: 'text.primary', borderColor: 'divider' }}
          >
            Sign in with Google
          </Button>

          <Divider sx={{ mb: 3, '&::before, &::after': { borderColor: 'divider' } }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>

          <Tabs 
            value={mode} 
            onChange={(_, newValue) => { setMode(newValue); setError(''); setSuccess(''); }} 
            variant="fullWidth" 
            sx={{ mb: 3 }}
          >
            <Tab value="password" label="Password Login" sx={{ fontWeight: 600 }} />
            <Tab value="magic" label="Magic Link (No Password)" sx={{ fontWeight: 600 }} />
          </Tabs>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordSubmit}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
                By logging in, you agree to our <Link href="/term-conditions" style={{ color: '#FF9933' }}>Terms of Service</Link> and <Link href="/privacy-policy" style={{ color: '#FF9933' }}>Privacy Policy</Link>.
              </Typography>

              <Box sx={{ mb: 3, textAlign: 'right' }}>
                <Link href="/auth/forgot-password" style={{ color: '#FF9933', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In securely'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your email and we'll send you a secure link to instantly log in without a password.
              </Typography>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<EmailIcon />}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2, bgcolor: '#128807', '&:hover': { bgcolor: '#0f7006' } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Magic Link'}
              </Button>
            </form>
          )}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href="/auth/register" style={{ color: '#FF9933', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
      <Footer />

      {/* 2FA Verification Dialog */}
      <Dialog
        open={show2FADialog}
        onClose={() => !verifying2FA && setShow2FADialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          Two-Factor Authentication
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your account is protected with 2FA. Please verify your identity to continue.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Choose verification method:
          </Typography>

          <RadioGroup
            value={verificationMethod}
            onChange={(e) => setVerificationMethod(e.target.value as 'totp' | 'backup' | 'email')}
            sx={{ mb: 3 }}
          >
            <FormControlLabel
              value="totp"
              control={<Radio />}
              label="Authenticator App (TOTP)"
            />
            <FormControlLabel
              value="backup"
              control={<Radio />}
              label="Backup Code"
            />
            <FormControlLabel
              value="email"
              control={<Radio />}
              label="Email Verification (Backup Email)"
            />
          </RadioGroup>

          {verificationMethod === 'totp' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the 6-digit code from your authenticator app:
            </Typography>
          )}

          {verificationMethod === 'backup' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter one of your 8-character backup codes:
            </Typography>
          )}

          {verificationMethod === 'email' && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                We'll send a verification code to your backup email:
              </Typography>
              <Button
                variant="outlined"
                onClick={handleSendEmailOTP}
                disabled={loading}
                sx={{ mb: 2 }}
                fullWidth
              >
                {loading ? <CircularProgress size={20} /> : 'Send OTP to Backup Email'}
              </Button>
            </>
          )}

          <TextField
            fullWidth
            label={verificationMethod === 'backup' ? 'Backup Code' : 'Verification Code'}
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
            disabled={verifying2FA}
            inputProps={{
              maxLength: verificationMethod === 'backup' ? 8 : 6,
              style: { textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontFamily: 'monospace' }
            }}
            placeholder={verificationMethod === 'backup' ? 'XXXXXXXX' : '000000'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShow2FADialog(false)} disabled={verifying2FA}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify2FA}
            variant="contained"
            disabled={verifying2FA || !twoFactorCode || (verificationMethod === 'totp' && twoFactorCode.length !== 6) || (verificationMethod === 'backup' && twoFactorCode.length !== 8)}
          >
            {verifying2FA ? <CircularProgress size={20} /> : 'Verify & Login'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
