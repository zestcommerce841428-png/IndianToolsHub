'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Typography,
  Slider,
  Button,
  Stack,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function HexToRgbConverter() {
  const [activeTab, setActiveTab] = useState<number>(0);

  // HEX to RGB states
  const [hexInput, setHexInput] = useState<string>('#ff5733');
  const [hexError, setHexError] = useState<string | null>(null);
  const [hexOutput, setHexOutput] = useState({
    rgb: 'rgb(255, 87, 51)',
    hsl: 'hsl(11, 100%, 60%)',
    hex: '#FF5733',
  });

  // RGB to HEX states
  const [rVal, setRVal] = useState<number>(255);
  const [gVal, setGVal] = useState<number>(87);
  const [bVal, setBVal] = useState<number>(51);
  const [rgbOutput, setRgbOutput] = useState({
    hex: '#FF5733',
    rgb: 'rgb(255, 87, 51)',
    hsl: 'hsl(11, 100%, 60%)',
  });

  // Conversions helper functions
  const hexToRgb = (hex: string) => {
    let cleanHex = hex.trim().replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return null;
    }
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (c: number) => {
      const hex = Math.max(0, Math.min(255, c)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // Handle HEX -> RGB conversion
  useEffect(() => {
    const rgb = hexToRgb(hexInput);
    if (rgb) {
      setHexError(null);
      const fullHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setHexOutput({
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
        hex: fullHex,
      });
    } else {
      setHexError('Invalid HEX code format');
    }
  }, [hexInput]);

  // Handle RGB -> HEX conversion
  useEffect(() => {
    const hex = rgbToHex(rVal, gVal, bVal);
    setRgbOutput({
      hex,
      rgb: `rgb(${rVal}, ${gVal}, ${bVal})`,
      hsl: rgbToHsl(rVal, gVal, bVal),
    });
  }, [rVal, gVal, bVal]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} aria-label="converter tabs">
          <Tab label="HEX to RGB" />
          <Tab label="RGB to HEX" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left panel: Input */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Convert HEX to RGB/HSL
                </Typography>
                <TextField
                  fullWidth
                  label="HEX Color Code"
                  placeholder="e.g. #ff5733"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  error={!!hexError}
                  helperText={hexError}
                />

                <Box
                  sx={{
                    width: '100%',
                    height: 120,
                    borderRadius: 2,
                    bgcolor: hexError ? '#cccccc' : hexOutput.hex,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {!hexError && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          (hexToRgb(hexInput)?.r ?? 0) * 0.299 +
                            (hexToRgb(hexInput)?.g ?? 0) * 0.587 +
                            (hexToRgb(hexInput)?.b ?? 0) * 0.114 >
                          186
                            ? 'black'
                            : 'white',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      Preview
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right panel: Results */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Results
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      RGB Output
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={hexOutput.rgb}
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title="Copy RGB">
                        <IconButton onClick={() => copyToClipboard(hexOutput.rgb)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      HSL Output
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={hexOutput.hsl}
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title="Copy HSL">
                        <IconButton onClick={() => copyToClipboard(hexOutput.hsl)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Normalized HEX
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={hexOutput.hex}
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title="Copy HEX">
                        <IconButton onClick={() => copyToClipboard(hexOutput.hex)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Left panel: Input Sliders */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Adjust RGB Sliders
                </Typography>

                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                      Red: {rVal}
                    </Typography>
                  </Stack>
                  <Slider
                    value={rVal}
                    min={0}
                    max={255}
                    color="error"
                    onChange={(_, val) => setRVal(val as number)}
                  />
                </Box>

                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Green: {gVal}
                    </Typography>
                  </Stack>
                  <Slider
                    value={gVal}
                    min={0}
                    max={255}
                    color="success"
                    onChange={(_, val) => setGVal(val as number)}
                  />
                </Box>

                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Blue: {bVal}
                    </Typography>
                  </Stack>
                  <Slider
                    value={bVal}
                    min={0}
                    max={255}
                    color="primary"
                    onChange={(_, val) => setBVal(val as number)}
                  />
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    height: 80,
                    borderRadius: 2,
                    bgcolor: rgbOutput.hex,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: rVal * 0.299 + gVal * 0.587 + bVal * 0.114 > 186 ? 'black' : 'white',
                      fontWeight: 'bold',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    Preview
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right panel: Results */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Results
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      HEX Output
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={rgbOutput.hex}
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title="Copy HEX">
                        <IconButton onClick={() => copyToClipboard(rgbOutput.hex)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      RGB Output
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={rgbOutput.rgb}
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title="Copy RGB">
                        <IconButton onClick={() => copyToClipboard(rgbOutput.rgb)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      HSL Output
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={rgbOutput.hsl}
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title="Copy HSL">
                        <IconButton onClick={() => copyToClipboard(rgbOutput.hsl)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

