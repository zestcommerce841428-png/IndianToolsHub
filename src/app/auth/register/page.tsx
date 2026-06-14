'use client';

import React, { useState, useRef } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, MenuItem, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import GoogleIcon from '@mui/icons-material/Google';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    company: '',
    jobTitle: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    bio: '',
    expertiseArea: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    age: '',
    gender: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size should be less than 2MB.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, subject: 'Verify your Registration' })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || 'Error triggering OTP.');
    } finally {
      setLoading(false);
    }
  };

  const processRegistration = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      let finalPhotoURL = null;

      if (avatarFile) {
        const apiUrl = process.env.NEXT_PUBLIC_HOSTINGER_API_URL;
        const apiSecret = process.env.NEXT_PUBLIC_UPLOAD_SECRET;
        if (apiUrl && apiSecret) {
          const form = new FormData();
          form.append('avatar', avatarFile);
          form.append('uid', user.uid);
          
          const uploadRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiSecret}` },
            body: form
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok) {
            finalPhotoURL = uploadData.url;
            await updateProfile(user, { photoURL: finalPhotoURL });
          }
        }
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
        bio: formData.bio,
        expertiseArea: formData.expertiseArea,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        twitterUrl: formData.twitterUrl,
        age: formData.age,
        gender: formData.gender,
        photoURL: finalPhotoURL,
        createdAt: Date.now(),
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to finish registration.');
      setShowOtpModal(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setError('');
    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode })
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid OTP.');
      }

      // OTP Verified, create the user
      await processRegistration();
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: '"Poppins", sans-serif', textAlign: 'center' }}>
            Create Your Account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Join IndianToolsHub and access advanced client-side utilities.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{ py: 1.5, mb: 3, fontSize: '1rem', fontWeight: 600, borderRadius: 2, color: 'text.primary', borderColor: 'divider' }}
          >
            Sign up with Google
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ flexGrow: 1, borderBottom: '1px solid', borderColor: 'divider' }}></Box>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>OR REGISTER WITH EMAIL</Typography>
            <Box sx={{ flexGrow: 1, borderBottom: '1px solid', borderColor: 'divider' }}></Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, justifyContent: 'center' }}>
              <Avatar src={avatarPreview || undefined} sx={{ width: 80, height: 80 }} />
              <Box>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleAvatarSelect} />
                <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()}>
                  Upload Profile Picture
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Max size: 2MB (Optional)</Typography>
              </Box>
            </Box>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9933' }}>Account Security</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Email Address" name="email" type="email" fullWidth required value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Password" name="password" type="password" fullWidth required value={formData.password} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Confirm Password" name="confirmPassword" type="password" fullWidth required value={formData.confirmPassword} onChange={handleChange} />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#128807' }}>Personal details</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Full Name" name="fullName" fullWidth required value={formData.fullName} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Phone Number" name="phone" fullWidth value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Age" name="age" type="number" fullWidth value={formData.age} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select label="Gender" name="gender" fullWidth value={formData.gender} onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Expertise Area" name="expertiseArea" fullWidth placeholder="e.g. Developer, Designer" value={formData.expertiseArea} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Short Bio" name="bio" multiline rows={3} fullWidth value={formData.bio} onChange={handleChange} />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#000080' }}>Professional & Location</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Company" name="company" fullWidth value={formData.company} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Job Title" name="jobTitle" fullWidth value={formData.jobTitle} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Address" name="address" fullWidth value={formData.address} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="City" name="city" fullWidth value={formData.city} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Country" name="country" fullWidth value={formData.country} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Postal Code" name="postalCode" fullWidth value={formData.postalCode} onChange={handleChange} />
              </Grid>
            </Grid>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
              Protected by reCAPTCHA v3. By registering, you agree to our <Link href="/term-conditions" style={{ color: '#FF9933' }}>Terms of Service</Link>.
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Advanced Account'}
            </Button>
          </form>
        </Paper>
      </Container>
      <Footer />

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onClose={() => !otpLoading && setShowOtpModal(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Verify Your Email</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            We've sent a 6-digit one-time password (OTP) to <strong>{formData.email}</strong>. Please enter it below to finish your registration.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="6-Digit OTP"
            variant="outlined"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            disabled={otpLoading}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowOtpModal(false)} disabled={otpLoading} color="inherit">Cancel</Button>
          <Button onClick={handleVerifyOtp} variant="contained" disabled={otpLoading || otpCode.length < 5}>
            {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
