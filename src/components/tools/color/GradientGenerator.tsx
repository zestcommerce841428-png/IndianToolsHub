'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const PRESET_GRADIENTS = [
  { name: 'Ocean Breeze', color1: '#00c6ff', color2: '#0072ff', type: 'linear', angle: 90 },
  { name: 'Sunset Glow', color1: '#f12711', color2: '#f5af19', type: 'linear', angle: 90 },
  { name: 'Neon Lights', color1: '#f857a6', color2: '#ff5858', type: 'linear', angle: 45 },
  { name: 'Emerald Isle', color1: '#34e89e', color2: '#0f3443', type: 'linear', angle: 135 },
  { name: 'Royal Velvet', color1: '#1565C0', color2: '#b92b27', type: 'linear', angle: 90 },
  { name: 'Peach Perfect', color1: '#EDECE9', color2: '#FF8A80', type: 'linear', angle: 45 },
];

export default function GradientGenerator() {
  const [gradientType, setGradientType] = useState<string>('linear');
  const [color1, setColor1] = useState<string>('#ff7f50');
  const [color2, setColor2] = useState<string>('#1e90ff');
  const [stop1, setStop1] = useState<number>(0);
  const [stop2, setStop2] = useState<number>(100);
  const [angle, setAngle] = useState<number>(90);
  const [radialShape, setRadialShape] = useState<string>('circle at center');
  const [generatedCSS, setGeneratedCSS] = useState<string>('');

  useEffect(() => {
    let css = '';
    if (gradientType === 'linear') {
      css = `linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    } else {
      css = `radial-gradient(${radialShape}, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    }
    setGeneratedCSS(css);
  }, [gradientType, color1, color2, stop1, stop2, angle, radialShape]);

  const handleSwap = () => {
    const tempColor = color1;
    setColor1(color2);
    setColor2(tempColor);
    const tempStop = stop1;
    setStop1(stop2);
    setStop2(tempStop);
  };

  const copyToClipboard = () => {
    const textToCopy = `background: ${generatedCSS};`;
    navigator.clipboard.writeText(textToCopy);
  };

  const applyPreset = (preset: typeof PRESET_GRADIENTS[0]) => {
    setColor1(preset.color1);
    setColor2(preset.color2);
    setGradientType(preset.type);
    setStop1(0);
    setStop2(100);
    if (preset.angle !== undefined) {
      setAngle(preset.angle);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        {/* Left Side: Controls */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Gradient Options
              </Typography>

              {/* Type selection */}
              <FormControl fullWidth size="small">
                <InputLabel id="gradient-type-label">Gradient Type</InputLabel>
                <Select
                  labelId="gradient-type-label"
                  value={gradientType}
                  label="Gradient Type"
                  onChange={(e) => setGradientType(e.target.value)}
                >
                  <MenuItem value="linear">Linear</MenuItem>
                  <MenuItem value="radial">Radial</MenuItem>
                </Select>
              </FormControl>

              {/* Colors pickers and hex inputs */}
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Color 1
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
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
                      value={color1}
                      onChange={(e) => {
                        if (e.target.value.startsWith('#')) {
                          setColor1(e.target.value);
                        }
                      }}
                      slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
                    />
                  </Stack>
                </Box>

                <IconButton onClick={handleSwap} sx={{ mt: 2 }} title="Swap colors">
                  <SwapHorizIcon />
                </IconButton>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Color 2
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
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
                      value={color2}
                      onChange={(e) => {
                        if (e.target.value.startsWith('#')) {
                          setColor2(e.target.value);
                        }
                      }}
                      slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
                    />
                  </Stack>
                </Box>
              </Stack>

              {/* Stops slider */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Color Stops (Positions)
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    Stop 1: {stop1}%
                  </Typography>
                  <Slider
                    value={stop1}
                    min={0}
                    max={100}
                    onChange={(_, val) => setStop1(val as number)}
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ mt: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    Stop 2: {stop2}%
                  </Typography>
                  <Slider
                    value={stop2}
                    min={0}
                    max={100}
                    onChange={(_, val) => setStop2(val as number)}
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>
              </Box>

              {/* Linear Angle or Radial Shape */}
              {gradientType === 'linear' ? (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Angle: {angle}°
                  </Typography>
                  <Slider
                    value={angle}
                    min={0}
                    max={360}
                    onChange={(_, val) => setAngle(val as number)}
                  />
                </Box>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel id="radial-position-label">Radial Position</InputLabel>
                  <Select
                    labelId="radial-position-label"
                    value={radialShape}
                    label="Radial Position"
                    onChange={(e) => setRadialShape(e.target.value)}
                  >
                    <MenuItem value="circle at center">Center</MenuItem>
                    <MenuItem value="circle at top">Top</MenuItem>
                    <MenuItem value="circle at bottom">Bottom</MenuItem>
                    <MenuItem value="circle at left">Left</MenuItem>
                    <MenuItem value="circle at right">Right</MenuItem>
                    <MenuItem value="circle at top left">Top Left</MenuItem>
                    <MenuItem value="circle at bottom right">Bottom Right</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Divider />

              {/* Presets */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Popular Presets
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {PRESET_GRADIENTS.map((preset, idx) => (
                    <Chip
                      key={idx}
                      label={preset.name}
                      onClick={() => applyPreset(preset)}
                      clickable
                      sx={{
                        background: `linear-gradient(90deg, ${preset.color1}, ${preset.color2})`,
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0px 1px 2px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Preview & Output */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Live Preview
              </Typography>

              {/* Gradient Preview Area */}
              <Box
                sx={{
                  width: '100%',
                  height: 250,
                  borderRadius: 2,
                  background: generatedCSS,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />

              {/* CSS Code output */}
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Generated CSS Code
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={`background: ${generatedCSS};`}
                    slotProps={{
                      input: {
                        readOnly: true,
                        sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
                      }
                    }}
                  />
                  <Tooltip title="Copy Background CSS">
                    <Button
                      variant="contained"
                      onClick={copyToClipboard}
                      sx={{ height: 56, minWidth: 56, px: 1 }}
                    >
                      <ContentCopyIcon />
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

