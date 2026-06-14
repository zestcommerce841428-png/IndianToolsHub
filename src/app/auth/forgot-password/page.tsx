'use client';

import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setMessage('OTP sent to your email! Please check your inbox.');
      setStep('otp');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setMessage('Password reset link sent to your email! Check your inbox to set a new password.');
      setStep('success');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setMessage('OTP resent successfully! Check your email.');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setEmail('');
    setOtp('');
    setStep('email');
    setError('');
    setMessage('');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, width: '100%', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: '"Poppins", sans-serif', textAlign: 'center' }}>
            Reset Password
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            {step === 'email' && 'Enter your email and we\'ll send you a secure OTP to reset your password.'}
            {step === 'otp' && 'Enter the 6-digit OTP sent to your email.'}
            {step === 'success' && 'Check your email for the password reset link.'}
          </Typography>

          {/* Progress Stepper */}
          <Stepper activeStep={step === 'email' ? 0 : step === 'otp' ? 1 : 2} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Enter Email</StepLabel>
            </Step>
            <Step>
              <StepLabel>Verify OTP</StepLabel>
            </Step>
            <Step>
              <StepLabel>Reset Link Sent</StepLabel>
            </Step>
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                autoComplete="email"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <TextField
                label="6-Digit OTP"
                type="text"
                fullWidth
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                sx={{ mb: 2 }}
                autoComplete="one-time-code"
                slotProps={{
                  htmlInput: { maxLength: 6, pattern: '[0-9]{6}' }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Sent to: {email}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || otp.length !== 6}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={handleResendOTP}
                disabled={loading}
                sx={{ fontWeight: 600 }}
              >
                Resend OTP
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={resetFlow}
                disabled={loading}
                sx={{ fontWeight: 600, mt: 1 }}
              >
                Change Email
              </Button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <Box sx={{ textAlign: 'center' }}>
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
                <Typography variant="h3" sx={{ color: 'success.main' }}>✓</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to set your new password.
              </Typography>
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                <Button variant="contained" fullWidth sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}>
                  Go to Login
                </Button>
              </Link>
              <Button
                variant="text"
                fullWidth
                onClick={resetFlow}
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Reset Another Account
              </Button>
            </Box>
          )}

          {(step === 'email' || step === 'otp') && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link href="/auth/login" style={{ color: '#FF9933', textDecoration: 'none', fontWeight: 600 }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
