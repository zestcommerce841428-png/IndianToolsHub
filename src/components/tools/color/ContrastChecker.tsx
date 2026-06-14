'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ContrastChecker() {
  const [textColor, setTextColor] = useState<string>('#333333');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [contrastRatio, setContrastRatio] = useState<number>(1.0);
  const [textError, setTextError] = useState<string | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);

  // Luminance calculation
  const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getRGB = (hex: string) => {
    let cleanHex = hex.trim().replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return null;
    }
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };

  const calculateRatio = (color1: string, color2: string): number => {
    const rgb1 = getRGB(color1);
    const rgb2 = getRGB(color2);

    if (!rgb1 || !rgb2) return 1.0;

    const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  };

  useEffect(() => {
    const rgbText = getRGB(textColor);
    const rgbBg = getRGB(bgColor);

    if (!rgbText) {
      setTextError('Invalid text color');
    } else {
      setTextError(null);
    }

    if (!rgbBg) {
      setBgError('Invalid background color');
    } else {
      setBgError(null);
    }

    if (rgbText && rgbBg) {
      setContrastRatio(calculateRatio(textColor, bgColor));
    }
  }, [textColor, bgColor]);

  const handleSwap = () => {
    const temp = textColor;
    setTextColor(bgColor);
    setBgColor(temp);
  };

  // Status badges
  const checkStatus = (ratio: number, target: number) => {
    return ratio >= target ? (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'success.main' }}>
        <CheckCircleIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Pass
        </Typography>
      </Stack>
    ) : (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'error.main' }}>
        <CancelIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Fail
        </Typography>
      </Stack>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        {/* Colors Inputs & Results Summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Contrast Settings
              </Typography>

              {/* Text color input */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Text Color (Foreground)
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    error={!!textError}
                    helperText={textError}
                    slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
                  />
                </Stack>
              </Box>

              {/* Swap button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton onClick={handleSwap} title="Swap text and background">
                  <SwapHorizIcon />
                </IconButton>
              </Box>

              {/* Background color input */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Background Color
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    error={!!bgError}
                    helperText={bgError}
                    slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Large Ratio Display */}
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {contrastRatio.toFixed(1)}:1
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Contrast Ratio
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview & WCAG Checklist */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Live Accessibility Preview
              </Typography>

              {/* Visual Preview Box */}
              <Box
                sx={{
                  bgcolor: bgError ? '#ffffff' : bgColor,
                  color: textError ? '#000000' : textColor,
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'background-color 0.2s, color 0.2s',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, m: 0 }}>
                  Large Heading (e.g. 24px Bold)
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6, m: 0 }}>
                  This is a sample of normal/small text (e.g. 14px body text). The accessibility contrastchecker ensures your text is readable against the background for users with visual impairments.
                </Typography>
              </Box>

              <Divider />

              {/* WCAG Criteria Table */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  WCAG 2.0 Compliance Checklist
                </Typography>

                <Grid container spacing={2}>
                  {/* WCAG AA */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        WCAG AA (Standard)
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Normal Text (req. 4.5:1)
                          </Typography>
                          {checkStatus(contrastRatio, 4.5)}
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Large Text (req. 3.0:1)
                          </Typography>
                          {checkStatus(contrastRatio, 3.0)}
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>

                  {/* WCAG AAA */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        WCAG AAA (Enhanced)
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Normal Text (req. 7.0:1)
                          </Typography>
                          {checkStatus(contrastRatio, 7.0)}
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Large Text (req. 4.5:1)
                          </Typography>
                          {checkStatus(contrastRatio, 4.5)}
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

