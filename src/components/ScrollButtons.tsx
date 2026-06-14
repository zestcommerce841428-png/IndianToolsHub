'use client';

import React, { useState, useEffect } from 'react';
import { Box, Fab, Zoom, Tooltip } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function ScrollButtons() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showBottomBtn, setShowBottomBtn] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show "Scroll to Top" button if scrolled down 300px
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }

      // Hide "Scroll to Bottom" button if close to the bottom
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (scrolledToBottom) {
        setShowBottomBtn(false);
      } else {
        setShowBottomBtn(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.offsetHeight,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999997,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Zoom in={showTopBtn}>
        <Tooltip title="Scroll to Top" placement="left">
          <Fab
            onClick={scrollToTop}
            size="medium"
            aria-label="scroll to top"
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: '#FF9933',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 20px rgba(255, 153, 51, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Tooltip>
      </Zoom>

      <Zoom in={showBottomBtn}>
        <Tooltip title="Scroll to Bottom" placement="left">
          <Fab
            onClick={scrollToBottom}
            size="medium"
            aria-label="scroll to bottom"
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: '#128807',
                transform: 'translateY(3px)',
                boxShadow: '0 8px 20px rgba(18, 136, 7, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <KeyboardArrowDownIcon />
          </Fab>
        </Tooltip>
      </Zoom>
    </Box>
  );
}
