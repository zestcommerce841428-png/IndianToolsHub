'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper, Box, Typography, Button, CircularProgress, Alert, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel,
  List, ListItem, ListItemText, IconButton, Chip
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import Image from 'next/image';
import { db, auth } from '@/config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface TwoFactorSectionProps {
  isEnabled?: boolean;
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
}

export default function TwoFactorSection({
  isEnabled = false,
  userId,
  userEmail,
  onSuccess
}: TwoFactorSectionProps) {
  const [enabled, setEnabled] = useState(isEnabled);
  const [loading, setLoading] = useState(false);

  // Sync local state with prop changes
  useEffect(() => {
    setEnabled(isEnabled);
  }, [isEnabled]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Setup state
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [viewBackupCodes, setViewBackupCodes] = useState<string[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);

  const handleToggle2FA = async () => {
    if (enabled) {
      // Disable 2FA with confirmation
      if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        return;
      }
      
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            backupCodes: [],
            backupCodesUsed: []
          });
          setEnabled(false);
          setSuccess('Two-factor authentication disabled');
          if (onSuccess) onSuccess();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      } finally {
        setLoading(false);
      }
    } else {
      // Enable 2FA - show setup dialog
      await handleSetup2FA();
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup 2FA');
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setShowSetupDialog(true);
      setSetupStep('qr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: verificationCode,
          secret,
          backupCodes: []
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      // Save to Firestore
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
          backupCodes: backupCodes,
          backupCodesUsed: []
        });
      }

      setSetupStep('backup');
      setSuccess('2FA enabled successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setSuccess('Secret key copied to clipboard!');
  };

  const handleDownloadBackupCodes = () => {
    const text = `IndianToolsHub - Two-Factor Authentication Backup Codes

IMPORTANT: Save these codes in a secure place!
Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Generated: ${new Date().toLocaleString()}
Account: ${userEmail}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSuccess('Backup codes downloaded!');
  };

  const handleFinishSetup = () => {
    setEnabled(true);
    setShowSetupDialog(false);
    setSetupStep('qr');
    setVerificationCode('');
    if (onSuccess) onSuccess();
  };

  const handleViewBackupCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setViewBackupCodes(userData.backupCodes || []);
          setUsedCodes(userData.backupCodesUsed || []);
          setShowBackupCodesDialog(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backup codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid', borderColor: enabled ? 'success.main' : 'divider', bgcolor: enabled ? 'success.lighter' : 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SecurityIcon color={enabled ? 'success' : 'action'} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Two-Factor Authentication (2FA)
            </Typography>
            {enabled && (
              <Chip 
                icon={<VerifiedIcon />} 
                label="Enabled" 
                color="success" 
                size="small" 
              />
            )}
          </Box>
          
          <FormControlLabel
            control={
              <Switch 
                checked={enabled} 
                onChange={handleToggle2FA}
                disabled={loading}
              />
            }
            label=""
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Typography color="text.secondary">
          {enabled 
            ? 'Two-factor authentication is enabled. Your account is protected with an additional security layer.'
            : 'Add an extra layer of security by requiring a code from your authenticator app when signing in.'
          }
        </Typography>

        {enabled && (
          <Button
            variant="outlined"
            startIcon={<QrCode2Icon />}
            onClick={handleViewBackupCodes}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'View Backup Codes'}
          </Button>
        )}
      </Paper>

      {/* Setup Dialog */}
      <Dialog 
        open={showSetupDialog} 
        onClose={() => !loading && setShowSetupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {setupStep === 'qr' && 'Set Up Two-Factor Authentication'}
          {setupStep === 'verify' && 'Verify Your Setup'}
          {setupStep === 'backup' && 'Save Your Backup Codes'}
        </DialogTitle>
        
        <DialogContent>
          {setupStep === 'qr' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
              </Typography>
              
              {qrCode && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Image src={qrCode} alt="QR Code" width={250} height={250} />
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Or enter this code manually:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                  {secret}
                </Typography>
                <IconButton onClick={handleCopySecret} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          {setupStep === 'verify' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the 6-digit code from your authenticator app to verify the setup.
              </Typography>
              
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'monospace'
                }}
                placeholder="000000"
              />
            </Box>
          )}

          {setupStep === 'backup' && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Important: Save these backup codes!
                </Typography>
                <Typography variant="body2">
                  Each code can be used once if you lose access to your authenticator app.
                </Typography>
              </Alert>
              
              <List sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                {backupCodes.map((code, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={code}
                      primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '16px' }}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadBackupCodes}
              >
                Download Backup Codes
              </Button>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          {setupStep !== 'backup' && (
            <Button onClick={() => setShowSetupDialog(false)} disabled={loading}>
              Cancel
            </Button>
          )}
          
          {setupStep === 'qr' && (
            <Button 
              onClick={() => setSetupStep('verify')} 
              variant="contained"
            >
              Next
            </Button>
          )}
          
          {setupStep === 'verify' && (
            <Button 
              onClick={handleVerifySetup} 
              variant="contained"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? <CircularProgress size={20} /> : 'Verify'}
            </Button>
          )}
          
          {setupStep === 'backup' && (
            <Button 
              onClick={handleFinishSetup} 
              variant="contained"
              color="success"
            >
              Finish Setup
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* View Backup Codes Dialog */}
      <Dialog
        open={showBackupCodesDialog}
        onClose={() => setShowBackupCodesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2Icon color="primary" />
          Your Backup Codes
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Important: Keep these codes safe!
            </Typography>
            <Typography variant="body2">
              Each code can be used once if you lose access to your authenticator app. Used codes are marked below.
            </Typography>
          </Alert>
          
          <List sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
            {viewBackupCodes.map((code, index) => {
              const isUsed = usedCodes.includes(code);
              return (
                <ListItem
                  key={index}
                  sx={{
                    opacity: isUsed ? 0.5 : 1,
                    textDecoration: isUsed ? 'line-through' : 'none'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '16px', flex: 1 }}>
                          {code}
                        </Typography>
                        {isUsed && (
                          <Chip
                            label="Used"
                            size="small"
                            color="error"
                            icon={<WarningIcon />}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const text = `IndianToolsHub - Two-Factor Authentication Backup Codes\n\nIMPORTANT: Save these codes in a secure place!\nEach code can only be used once.\n\n${viewBackupCodes.map((code, i) => `${i + 1}. ${code}${usedCodes.includes(code) ? ' (USED)' : ''}`).join('\n')}\n\nGenerated: ${new Date().toLocaleString()}\nAccount: ${userEmail}`;
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup-codes-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
              setSuccess('Backup codes downloaded!');
            }}
          >
            Download Backup Codes
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            {usedCodes.length} of {viewBackupCodes.length} codes used
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowBackupCodesDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
