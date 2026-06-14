'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';

interface ColorItem {
  hex: string;
  locked: boolean;
}

export default function PaletteGenerator() {
  const [numColors, setNumColors] = useState<number>(5);
  const [generationMode, setGenerationMode] = useState<string>('random');
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Conversions helper functions
  const hexToHsl = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
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
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    const toHex = (n: number) => {
      const hexVal = Math.round((n + m) * 255).toString(16);
      return hexVal.length === 1 ? '0' + hexVal : hexVal;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const getRandomHexColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generatePalette = () => {
    // Determine base HSL from first available locked color or generate new random
    const firstLocked = colors.find((c) => c.locked);
    const baseHsl = firstLocked
      ? hexToHsl(firstLocked.hex)
      : { h: Math.random() * 360, s: 60 + Math.random() * 30, l: 40 + Math.random() * 20 };

    const newColors: ColorItem[] = [];

    for (let i = 0; i < numColors; i++) {
      // Check if old color exists at index and is locked
      if (colors[i] && colors[i].locked) {
        newColors.push(colors[i]);
        continue;
      }

      let hex = '';
      if (generationMode === 'random') {
        hex = getRandomHexColor();
      } else if (generationMode === 'monochromatic') {
        // Vary lightness
        const step = 60 / numColors;
        const newL = Math.max(10, Math.min(90, baseHsl.l - 30 + i * step));
        hex = hslToHex(baseHsl.h, baseHsl.s, newL);
      } else if (generationMode === 'analogous') {
        // Vary hue by offsets of 30deg
        const offset = 30 * (i - Math.floor(numColors / 2));
        const newH = (baseHsl.h + offset + 360) % 360;
        hex = hslToHex(newH, baseHsl.s, baseHsl.l);
      } else if (generationMode === 'complementary') {
        // Half color from original, half from complement (hue + 180)
        const isComplement = i >= numColors / 2;
        const hueVal = isComplement ? (baseHsl.h + 180) % 360 : baseHsl.h;
        const step = 40 / Math.ceil(numColors / 2);
        const localIdx = i % Math.ceil(numColors / 2);
        const newL = Math.max(15, Math.min(85, baseHsl.l - 20 + localIdx * step));
        hex = hslToHex(hueVal, baseHsl.s, newL);
      } else if (generationMode === 'triadic') {
        // Standard triadic is h, h+120, h+240. Map them into the spots
        const hOffset = (i % 3) * 120;
        const newH = (baseHsl.h + hOffset) % 360;
        const step = 30 / Math.ceil(numColors / 3);
        const localIdx = Math.floor(i / 3);
        const newL = Math.max(20, Math.min(80, baseHsl.l - 15 + localIdx * step));
        hex = hslToHex(newH, baseHsl.s, newL);
      }

      newColors.push({ hex, locked: false });
    }

    setColors(newColors);
  };

  // Run on mount or when count changes
  useEffect(() => {
    generatePalette();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numColors]);

  const toggleLock = (index: number) => {
    const updated = [...colors];
    updated[index].locked = !updated[index].locked;
    setColors(updated);
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setToastMessage(`Copied: ${hex}`);
  };

  const copyAllColors = () => {
    const hexList = colors.map((c) => c.hex).join(', ');
    navigator.clipboard.writeText(hexList);
    setToastMessage(`Copied all colors: ${hexList}`);
  };

  // Determine ideal text color (dark vs light) based on luminance
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Controls Card */}
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
          >
            <Stack direction="row" spacing={2} sx={{ minWidth: 280, flexGrow: 1 }}>
              {/* Number of Colors */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="num-colors-label">Palette Size</InputLabel>
                <Select
                  labelId="num-colors-label"
                  value={numColors}
                  label="Palette Size"
                  onChange={(e) => setNumColors(Number(e.target.value))}
                >
                  <MenuItem value={4}>4 Colors</MenuItem>
                  <MenuItem value={5}>5 Colors</MenuItem>
                  <MenuItem value={6}>6 Colors</MenuItem>
                </Select>
              </FormControl>

              {/* Mode Selection */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="gen-mode-label">Harmony Mode</InputLabel>
                <Select
                  labelId="gen-mode-label"
                  value={generationMode}
                  label="Harmony Mode"
                  onChange={(e) => setGenerationMode(e.target.value)}
                >
                  <MenuItem value="random">Random</MenuItem>
                  <MenuItem value="monochromatic">Monochromatic</MenuItem>
                  <MenuItem value="analogous">Analogous</MenuItem>
                  <MenuItem value="complementary">Complementary</MenuItem>
                  <MenuItem value="triadic">Triadic</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyAllColors}>
                Copy All
              </Button>
              <Button variant="contained" startIcon={<AutorenewIcon />} onClick={generatePalette}>
                Generate
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Visual Palette Output */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 2,
          minHeight: 350,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {colors.map((colorItem, idx) => {
          const contrastColor = getContrastColor(colorItem.hex);
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                bgcolor: colorItem.hex,
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 2, md: 4 },
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              {/* Lock Toggle */}
              <Tooltip title={colorItem.locked ? 'Unlock Color' : 'Lock Color'}>
                <IconButton
                  onClick={() => toggleLock(idx)}
                  sx={{
                    color: contrastColor,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {colorItem.locked ? <LockIcon /> : <LockOpenIcon />}
                </IconButton>
              </Tooltip>

              {/* Color Hex Value */}
              <Box sx={{ textAlign: 'center', my: { xs: 0, md: 'auto' } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: contrastColor,
                    letterSpacing: 1,
                  }}
                >
                  {colorItem.hex}
                </Typography>
              </Box>

              {/* Copy Hex Button */}
              <Tooltip title="Copy Hex Code">
                <IconButton
                  onClick={() => copyColor(colorItem.hex)}
                  sx={{
                    color: contrastColor,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* Helper prompt */}
      <Typography variant="body2" color="text.secondary" align="center">
        Tip: Lock colors you like, then click "Generate" to generate harmonies around them!
      </Typography>

      {/* Toast Notification */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={2000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
}
