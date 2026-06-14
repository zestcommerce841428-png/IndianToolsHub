'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ColorPickerFromImage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string>('#007BFF');
  const [rgbVal, setRgbVal] = useState<{ r: number; g: number; b: number }>({ r: 0, g: 123, b: 255 });
  const [hslVal, setHslVal] = useState<string>('hsl(211, 100%, 50%)');
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.onerror = () => {
      setError('Failed to load image.');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    try {
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const hex = rgbToHex(r, g, b);
      const hsl = rgbToHsl(r, g, b);

      setRgbVal({ r, g, b });
      setPickedColor(hex);
      setHslVal(hsl);

      if (history[0] !== hex) {
        setHistory((prev) => [hex, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      setError('Could not pick color. External images may cause security exceptions on Canvas.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearImage = () => {
    setImageSrc(null);
    setPickedColor('#007BFF');
    setRgbVal({ r: 0, g: 123, b: 255 });
    setHslVal('hsl(211, 100%, 50%)');
    setError(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      {!imageSrc ? (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: 5,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'action.hover',
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Upload or Drag an Image
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click here to upload an image and extract colors from it.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    overflow: 'hidden',
                    maxHeight: '500px',
                    position: 'relative',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasInteraction}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) {
                        handleCanvasInteraction(e);
                      }
                    }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '500px',
                      cursor: 'crosshair',
                      display: 'block',
                    }}
                  />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Tip: Click or drag on the image to pick colors.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={clearImage}
                  >
                    Clear Image
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: pickedColor,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Selected Color
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {pickedColor}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      HEX
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                        {pickedColor}
                      </Typography>
                      <Tooltip title="Copy HEX">
                        <IconButton size="small" onClick={() => copyToClipboard(pickedColor)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      RGB
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                        rgb({rgbVal.r}, {rgbVal.g}, {rgbVal.b})
                      </Typography>
                      <Tooltip title="Copy RGB">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      HSL
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                        {hslVal}
                      </Typography>
                      <Tooltip title="Copy HSL">
                        <IconButton size="small" onClick={() => copyToClipboard(hslVal)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    History
                  </Typography>
                  {history.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {history.map((hex, idx) => (
                        <Tooltip key={idx} title={hex}>
                          <Box
                            onClick={() => {
                              setPickedColor(hex);
                              const r = parseInt(hex.slice(1, 3), 16);
                              const g = parseInt(hex.slice(3, 5), 16);
                              const b = parseInt(hex.slice(5, 7), 16);
                              setRgbVal({ r, g, b });
                              setHslVal(rgbToHsl(r, g, b));
                            }}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              bgcolor: hex,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: 'divider',
                              transition: 'transform 0.1s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No colors picked yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

