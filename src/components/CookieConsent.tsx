'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Slide } from '@mui/material';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setShowBanner(false);
  };

  return (
    <Slide direction="up" in={showBanner} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24, md: 'auto' },
          right: { xs: 16, sm: 24 },
          zIndex: 9999,
          p: 3,
          maxWidth: { md: 500 },
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          🍪 We value your privacy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleReject} sx={{ borderRadius: 2 }}>
            Reject All
          </Button>
          <Button variant="contained" onClick={handleAccept} sx={{ borderRadius: 2, bgcolor: '#FF9933', '&:hover': { bgcolor: '#e68a2e' } }}>
            Accept All
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
}
