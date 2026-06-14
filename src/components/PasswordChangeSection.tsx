'use client';

import React, { useState } from 'react';
import {
  Paper, Box, Typography, TextField, Button, CircularProgress, Alert,
  InputAdornment, IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { auth } from '@/config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface PasswordChangeSectionProps {
  userEmail: string;
  onSuccess?: () => void;
}

export default function PasswordChangeSection({ 
  userEmail,
  onSuccess 
}: PasswordChangeSectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('For security, please log out and log back in before changing your password');
      } else {
        setError(err.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength: 20, label: 'Weak', color: '#f44336' };
    if (strength <= 4) return { strength: 50, label: 'Medium', color: '#ff9800' };
    return { strength: 100, label: 'Strong', color: '#4caf50' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <LockIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Change Password
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Update your password to keep your account secure. Your password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          type={showCurrentPassword ? 'text' : 'password'}
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type={showNewPassword ? 'text' : 'password'}
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={
            newPassword && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Box
                  sx={{
                    flex: 1,
                    height: 4,
                    bgcolor: 'grey.300',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${passwordStrength.strength}%`,
                      height: '100%',
                      bgcolor: passwordStrength.color,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600, minWidth: 60 }}>
                  {passwordStrength.label}
                </Typography>
              </Box>
            )
          }
        />

        <TextField
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          error={confirmPassword !== '' && newPassword !== confirmPassword}
          helperText={confirmPassword !== '' && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            sx={{ minWidth: 150 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setError('');
              setSuccess('');
            }}
            disabled={loading}
          >
            Clear
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.main' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'info.dark' }}>
          Password Requirements:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
          <Typography component="li" variant="caption" sx={{ mb: 0.5 }}>At least 8 characters long</Typography>
          <Typography component="li" variant="caption" sx={{ mb: 0.5 }}>Contains uppercase and lowercase letters</Typography>
          <Typography component="li" variant="caption" sx={{ mb: 0.5 }}>Contains at least one number</Typography>
          <Typography component="li" variant="caption">Contains at least one special character (!@#$%^&*)</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
