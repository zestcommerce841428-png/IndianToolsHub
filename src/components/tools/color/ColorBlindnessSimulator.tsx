'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewStreamIcon from '@mui/icons-material/ViewStream';

const SIMULATIONS = [
  { key: 'normal', label: 'Normal Vision', filter: 'none', desc: 'Typical color perception.' },
  { key: 'deuteranopia', label: 'Deuteranopia (Red-Green)', filter: 'contrast(100%) saturate(150%) hue-rotate(50deg)', desc: 'Insensitivity to green light, causing red-green confusion.' },
  { key: 'protanopia', label: 'Protanopia (Red-Green)', filter: 'contrast(100%) saturate(150%) hue-rotate(-50deg)', desc: 'Insensitivity to red light, causing red-green confusion.' },
  { key: 'tritanopia', label: 'Tritanopia (Blue-Yellow)', filter: 'contrast(100%) saturate(150%) hue-rotate(170deg)', desc: 'Insensitivity to blue light, causing blue-yellow confusion.' },
  { key: 'achromatopsia', label: 'Achromatopsia (Total)', filter: 'grayscale(100%)', desc: 'Complete lack of color perception, seeing only shades of grey.' },
];

export default function ColorBlindnessSimulator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [activeSimulation, setActiveSimulation] = useState<string>('deuteranopia');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
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

  const handleDownload = (simKey: string) => {
    const sim = SIMULATIONS.find((s) => s.key === simKey);
    if (!sim || !imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Apply CSS filter directly in Canvas 2D context
      ctx.filter = sim.filter;
      ctx.drawImage(img, 0, 0);

      try {
        const link = document.createElement('a');
        link.download = `${sim.key}-simulation.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        setError('Failed to download image. CORS restrictions may apply if using external images.');
      }
    }
  };

  const clearImage = () => {
    setImageSrc(null);
    setError(null);
  };

  const getFilterStyle = (simKey: string) => {
    const sim = SIMULATIONS.find((s) => s.key === simKey);
    return sim ? sim.filter : 'none';
  };

  const currentSim = SIMULATIONS.find((s) => s.key === activeSimulation);

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
            Click here to preview it under different color blindness simulations.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Controls Bar */}
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                useFlexGap
                sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, val) => val && setViewMode(val)}
                    size="small"
                  >
                    <ToggleButton value="single" title="Single Simulation View">
                      <ViewStreamIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Single
                    </ToggleButton>
                    <ToggleButton value="grid" title="Simulations Grid View">
                      <GridViewIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Grid
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {viewMode === 'single' && (
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <InputLabel id="sim-select-label">Simulation Type</InputLabel>
                      <Select
                        labelId="sim-select-label"
                        value={activeSimulation}
                        label="Simulation Type"
                        onChange={(e) => setActiveSimulation(e.target.value)}
                      >
                        {SIMULATIONS.map((sim) => (
                          <MenuItem key={sim.key} value={sim.key}>
                            {sim.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Stack>

                <Stack direction="row" spacing={2}>
                  {viewMode === 'single' && (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(activeSimulation)}
                    >
                      Download Simulated
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={clearImage}
                  >
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Hidden reference img for canvas extraction */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Reference"
            style={{ display: 'none' }}
            crossOrigin="anonymous"
          />

          {/* View Modes */}
          {viewMode === 'single' ? (
            <Grid container spacing={3}>
              {/* Simulation Description */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {currentSim?.desc}
                </Typography>
              </Grid>

              {/* Large side-by-side or single layout */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Original Image (Normal Vision)
                </Typography>
                <Card variant="outlined">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      p: 1,
                      maxHeight: 450,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Normal vision preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '430px',
                        objectFit: 'contain',
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Simulated View ({currentSim?.label})
                </Typography>
                <Card variant="outlined">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      p: 1,
                      maxHeight: 450,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Color blind simulated vision preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '430px',
                        objectFit: 'contain',
                        borderRadius: 4,
                        filter: getFilterStyle(activeSimulation),
                        transition: 'filter 0.3s ease',
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          ) : (
            // Grid view showing all 5 states
            <Grid container spacing={3}>
              {SIMULATIONS.map((sim) => (
                <Grid key={sim.key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    {sim.label}
                  </Typography>
                  <Card variant="outlined">
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'grey.100',
                        p: 1,
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={imageSrc}
                          alt={sim.label}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 4,
                            filter: sim.filter,
                          }}
                        />
                      </Box>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon fontSize="small" />}
                        sx={{ mt: 1, alignSelf: 'flex-end' }}
                        onClick={() => handleDownload(sim.key)}
                      >
                        Download
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}

