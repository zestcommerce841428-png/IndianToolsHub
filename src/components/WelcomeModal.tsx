'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Link from 'next/link';

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if we already showed the welcome modal
    const hasSeenWelcome = localStorage.getItem('welcome_modal_seen');
    if (!hasSeenWelcome) {
      // Delay showing the modal slightly for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('welcome_modal_seen', 'true');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 4, overflow: 'hidden' } }}
    >
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 4, textAlign: 'center', position: 'relative' }}>
        <IconButton 
          onClick={handleClose} 
          sx={{ position: 'absolute', top: 8, right: 8, color: 'inherit', opacity: 0.8, '&:hover': { opacity: 1 } }}
        >
          <CloseIcon />
        </IconButton>
        <RocketLaunchIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Poppins", sans-serif' }}>
          Welcome to IndianToolsHub!
        </Typography>
      </Box>
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', mb: 2 }}>
          Discover over 120+ advanced, secure, and 100% client-side utilities designed for developers, creators, and everyday heroes.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create a free account to unlock premium features, save your preferences, and access advanced workflows.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>
          Explore Tools
        </Button>
        <Link href="/auth/register" passHref style={{ textDecoration: 'none' }}>
          <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#FF9933', '&:hover': { bgcolor: '#e68a2e' }, fontWeight: 600, px: 4, py: 1.5, borderRadius: 2 }}>
            Create Free Account
          </Button>
        </Link>
      </DialogActions>
    </Dialog>
  );
}
