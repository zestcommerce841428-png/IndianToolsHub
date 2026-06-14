'use client';

import React, { useState } from 'react';
import {
  Paper, Box, Typography, TextField, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from '@mui/icons-material/Delete';
import { db, auth } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface BackupEmailSectionProps {
  currentBackupEmail?: string;
  isVerified?: boolean;
  userEmail: string;
  onSuccess?: () => void;
}

export default function BackupEmailSection({ 
  currentBackupEmail, 
  isVerified = false,
  userEmail,
  onSuccess 
}: BackupEmailSectionProps) {
  const [backupEmail, setBackupEmail] = useState(currentBackupEmail || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // OTP verification state
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = async () => {
    if (!backupEmail || backupEmail === userEmail) {
      setError('Backup email must be different from your primary email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/send-backup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: backupEmail, 
          type: 'backup-email' 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setShowOtpDialog(true);
      setSuccess('OTP sent to your backup email!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: backupEmail,
          otp
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Save to Firestore
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          backupEmail,
          backupEmailVerified: true
        });
      }

      setSuccess('Backup email verified and saved successfully!');
      setShowOtpDialog(false);
      setIsEditing(false);
      setOtp('');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteBackupEmail = async () => {
    if (!confirm('Are you sure you want to remove your backup email?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          backupEmail: null,
          backupEmailVerified: false
        });
        
        setBackupEmail('');
        setSuccess('Backup email removed successfully!');
        
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove backup email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Backup Email
            </Typography>
            {isVerified && (
              <Chip 
                icon={<VerifiedIcon />} 
                label="Verified" 
                color="success" 
                size="small" 
              />
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Add a backup email for account recovery and important notifications.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label="Backup Email Address"
            type="email"
            value={backupEmail}
            onChange={(e) => setBackupEmail(e.target.value)}
            disabled={!isEditing && isVerified}
            helperText={isVerified ? 'Your backup email is verified' : 'Enter an email different from your primary email'}
          />
          
          {!isEditing && isVerified ? (
            <>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                sx={{ minWidth: 120, height: 56 }}
                disabled={loading}
              >
                Change
              </Button>
              <IconButton
                color="error"
                onClick={handleDeleteBackupEmail}
                disabled={loading}
                sx={{ height: 56, width: 56 }}
                title="Remove backup email"
              >
                {loading ? <CircularProgress size={24} /> : <DeleteIcon />}
              </IconButton>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleSendOtp}
              disabled={loading || !backupEmail}
              sx={{ minWidth: 120, height: 56 }}
            >
              {loading ? <CircularProgress size={24} /> : isVerified ? 'Update' : 'Verify'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onClose={() => !verifying && setShowOtpDialog(false)}>
        <DialogTitle>Verify Backup Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We&apos;ve sent a 6-digit OTP to <strong>{backupEmail}</strong>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={verifying}
            InputProps={{ style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowOtpDialog(false)} disabled={verifying}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyOtp} 
            variant="contained" 
            disabled={verifying || otp.length !== 6}
          >
            {verifying ? <CircularProgress size={20} /> : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
