'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Slider,
  Alert,
  Divider,
} from '@mui/material';
import JsBarcode from 'jsbarcode';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';

export default function BarcodeGenerator() {
  const [text, setText] = useState<string>('1234567890');
  const [format, setFormat] = useState<string>('CODE128');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [lineHeight, setLineHeight] = useState<number>(100);
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateBarcode = () => {
    setError(null);
    if (!text.trim()) {
      setError('Please enter text/numbers to encode.');
      return;
    }

    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, text, {
          format: format,
          lineColor: fgColor,
          background: bgColor,
          width: lineWidth,
          height: lineHeight,
          displayValue: displayValue,
          valid: (valid) => {
            if (!valid) {
              throw new Error(`Invalid characters/length for format ${format}`);
            }
          },
        });
      } catch (err: any) {
        setError(err.message || 'Error generating barcode. Make sure the input fits the format constraints (e.g., EAN13 needs exactly 13 digits, UPC needs exactly 12 digits, EAN8 needs 8 digits).');
        // Clear canvas on error
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  };

  // Automatically update barcode on config changes
  useEffect(() => {
    generateBarcode();
  }, [text, format, lineWidth, lineHeight, fgColor, bgColor, displayValue]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `omnitools-barcode-${format}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {/* Form Controls */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Barcode Configuration
              </Typography>

              <TextField
                label="Barcode Value / Data"
                placeholder="Enter numbers or alphanumeric characters..."
                fullWidth
                value={text}
                onChange={(e) => setText(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Barcode Format</InputLabel>
                <Select
                  value={format}
                  label="Barcode Format"
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <MenuItem value="CODE128">CODE128 (Standard Alphanumeric)</MenuItem>
                  <MenuItem value="CODE39">CODE39 (Alphanumeric)</MenuItem>
                  <MenuItem value="EAN13">EAN-13 (13-digit numbers)</MenuItem>
                  <MenuItem value="EAN8">EAN-8 (8-digit numbers)</MenuItem>
                  <MenuItem value="UPC">UPC-A (12-digit numbers)</MenuItem>
                  <MenuItem value="ITF14">ITF-14 (Interleaved 2 of 5)</MenuItem>
                  <MenuItem value="codabar">Codabar (Numeric + special letters)</MenuItem>
                  <MenuItem value="pharmacode">Pharmacode (Numeric)</MenuItem>
                </Select>
              </FormControl>

              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Styling Options
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Line Color"
                    type="color"
                    fullWidth
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Background Color"
                    type="color"
                    fullWidth
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography id="width-slider-label" variant="caption" color="text.secondary">
                    Bar Width: {lineWidth}px
                  </Typography>
                  <Slider
                    aria-labelledby="width-slider-label"
                    value={lineWidth}
                    min={1}
                    max={4}
                    step={1}
                    onChange={(_, val) => setLineWidth(val as number)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography id="height-slider-label" variant="caption" color="text.secondary">
                    Bar Height: {lineHeight}px
                  </Typography>
                  <Slider
                    aria-labelledby="height-slider-label"
                    value={lineHeight}
                    min={50}
                    max={200}
                    step={10}
                    onChange={(_, val) => setLineHeight(val as number)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={displayValue}
                        onChange={(e) => setDisplayValue(e.target.checked)}
                      />
                    }
                    label="Display Value Text below Barcode"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={3} sx={{ width: '100%', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  bgcolor: bgColor,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <canvas ref={canvasRef} />
              </Box>
              
              {!error && text.trim() && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download Barcode
                </Button>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
