'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  Paper,
  Slider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorFormats {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
}

function hexToRgba(hex: string): RGBA | null {
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((char) => char + char).join('');
  }

  if (cleanHex.length === 6) {
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1.0,
    };
  } else if (cleanHex.length === 8) {
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: parseFloat(((num & 255) / 255).toFixed(2)),
    };
  }

  return null;
}

function parseRgb(rgbStr: string): RGBA | null {
  const match = rgbStr.match(/rgba?\(?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)?/i);
  if (!match) return null;

  return {
    r: Math.max(0, Math.min(255, parseInt(match[1]))),
    g: Math.max(0, Math.min(255, parseInt(match[2]))),
    b: Math.max(0, Math.min(255, parseInt(match[3]))),
    a: match[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(match[4]))) : 1.0,
  };
}

function rgbaToHex(rgba: RGBA): string {
  const r = rgba.r.toString(16).padStart(2, '0');
  const g = rgba.g.toString(16).padStart(2, '0');
  const b = rgba.b.toString(16).padStart(2, '0');
  const a = rgba.a === 1.0 ? '' : Math.round(rgba.a * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}${a}`.toUpperCase();
}

function rgbaToHsl(rgba: RGBA): { h: number; s: number; l: number; a: number } {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgba.a,
  };
}

function generateFormats(rgba: RGBA): ColorFormats {
  const { r, g, b, a } = rgba;
  const hex = rgbaToHex(rgba);
  const { h, s, l } = rgbaToHsl(rgba);

  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    hsla: `hsla(${h}, ${s}%, ${l}%, ${a})`,
  };
}

export default function ColorPickerConverter() {
  const [rgba, setRgba] = useState<RGBA>({ r: 59, g: 130, b: 246, a: 1.0 });
  const [formats, setFormats] = useState<ColorFormats>({
    hex: '#3B82F6',
    rgb: 'rgb(59, 130, 246)',
    rgba: 'rgba(59, 130, 246, 1)',
    hsl: 'hsl(217, 91%, 60%)',
    hsla: 'hsla(217, 91%, 60%, 1)',
  });
  const [inputVal, setInputVal] = useState('#3B82F6');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setFormats(generateFormats(rgba));
  }, [rgba]);

  const handleSliderChange = (key: keyof RGBA) => (_: Event, value: number | number[]) => {
    setRgba((prev) => {
      const next = { ...prev, [key]: value as number };
      const nextFormats = generateFormats(next);
      setInputVal(nextFormats.hex);
      return next;
    });
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    let parsed: RGBA | null = null;
    if (val.trim().startsWith('#') || val.trim().length === 3 || val.trim().length === 6 || val.trim().length === 8) {
      parsed = hexToRgba(val);
    } else if (val.trim().toLowerCase().startsWith('rgb')) {
      parsed = parseRgb(val);
    }

    if (parsed) {
      setRgba(parsed);
      setAlertInfo(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlertInfo({ type: 'info', message: `Copied "${text}" to clipboard!` });
  };

  const handleRandomColor = () => {
    const random = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
      a: 1.0,
    };
    setRgba(random);
    const nextFormats = generateFormats(random);
    setInputVal(nextFormats.hex);
    setAlertInfo(null);
  };

  const handleClear = () => {
    const defaultColor = { r: 59, g: 130, b: 246, a: 1.0 };
    setRgba(defaultColor);
    setInputVal('#3B82F6');
    setAlertInfo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Main color block and picker layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left column: Visual Color display & Sliders */}
        <Box sx={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Color Preview Block */}
          <Paper
            variant="outlined"
            sx={{
              height: 140,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: formats.rgba,
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1)',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                zIndex: 1,
                color: rgba.r * 0.299 + rgba.g * 0.587 + rgba.b * 0.114 > 150 ? '#000' : '#fff',
                fontWeight: 800,
                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                letterSpacing: 1,
              }}
            >
              {formats.hex}
            </Typography>
          </Paper>

          {/* Sliders */}
          <Box sx={{ px: 1 }}>
            {/* Red Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Red (R)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {rgba.r}
                </Typography>
              </Box>
              <Slider
                value={rgba.r}
                min={0}
                max={255}
                onChange={handleSliderChange('r')}
                color="error"
                size="small"
              />
            </Box>

            {/* Green Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Green (G)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {rgba.g}
                </Typography>
              </Box>
              <Slider
                value={rgba.g}
                min={0}
                max={255}
                onChange={handleSliderChange('g')}
                color="success"
                size="small"
              />
            </Box>

            {/* Blue Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Blue (B)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {rgba.b}
                </Typography>
              </Box>
              <Slider
                value={rgba.b}
                min={0}
                max={255}
                onChange={handleSliderChange('b')}
                color="primary"
                size="small"
              />
            </Box>

            {/* Alpha Slider */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Alpha (Opacity)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {rgba.a}
                </Typography>
              </Box>
              <Slider
                value={rgba.a}
                min={0}
                max={1}
                step={0.01}
                onChange={handleSliderChange('a')}
                color="secondary"
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Right column: Format text conversions */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Input Value / Type Color
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. #3B82F6 or rgb(59, 130, 246)"
              value={inputVal}
              onChange={handleTextInput}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Enter any HEX or RGB color format above.
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Conversions Output list */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* HEX format */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                HEX CODE
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                    },
                  }}
                  value={formats.hex}
                />
                <Button variant="outlined" size="small" onClick={() => handleCopy(formats.hex)}>
                  <ContentCopyIcon fontSize="small" />
                </Button>
              </Box>
            </Box>

            {/* RGB format */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                RGB
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                    },
                  }}
                  value={formats.rgb}
                />
                <Button variant="outlined" size="small" onClick={() => handleCopy(formats.rgb)}>
                  <ContentCopyIcon fontSize="small" />
                </Button>
              </Box>
            </Box>

            {/* RGBA format */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                RGBA
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                    },
                  }}
                  value={formats.rgba}
                />
                <Button variant="outlined" size="small" onClick={() => handleCopy(formats.rgba)}>
                  <ContentCopyIcon fontSize="small" />
                </Button>
              </Box>
            </Box>

            {/* HSL/HSLA format */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                HSLA
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                    },
                  }}
                  value={formats.hsla}
                />
                <Button variant="outlined" size="small" onClick={() => handleCopy(formats.hsla)}>
                  <ContentCopyIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Footer controls */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear}>
          Reset
        </Button>
        <Button variant="contained" color="primary" onClick={handleRandomColor}>
          Random Color
        </Button>
      </Box>
    </Box>
  );
}
