'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Stack,
  Slider,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';

export default function ImageRotator() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0); // Angle in degrees (-180 to 180)
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setOriginalFile(file);
        setOriginalUrl(URL.createObjectURL(file));
      } else {
        setError('Please drop an image file.');
      }
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => {
      let next = prev - 90;
      if (next < -180) next += 360;
      return next;
    });
  };

  const handleRotateRight = () => {
    setRotation((prev) => {
      let next = prev + 90;
      if (next > 180) next -= 360;
      return next;
    });
  };

  const handleFlipHorizontal = () => {
    setFlipH((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFlipV((prev) => !prev);
  };

  const handleDownload = () => {
    if (!originalFile) return;
    setProcessing(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not get canvas context.');
        setProcessing(false);
        return;
      }

      const w = img.width;
      const h = img.height;

      // Calculate bounding box size for rotated image
      const angleRad = (rotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(angleRad));
      const absSin = Math.abs(Math.sin(angleRad));
      const newW = w * absCos + h * absSin;
      const newH = w * absSin + h * absCos;

      canvas.width = newW;
      canvas.height = newH;

      // Position, rotate and flip
      ctx.translate(newW / 2, newH / 2);
      ctx.rotate(angleRad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -w / 2, -h / 2);

      // Download
      try {
        const link = document.createElement('a');
        link.href = canvas.toDataURL(originalFile.type);
        link.download = `edited-${originalFile.name}`;
        link.click();
      } catch (err) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `edited-${originalFile.name}.png`;
        link.click();
      }
      setProcessing(false);
    };
    img.onerror = () => {
      setError('Failed to load image.');
      setProcessing(false);
    };
    img.src = originalUrl;
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalUrl('');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* File Upload Zone */}
      {!originalFile ? (
        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: 'primary.light',
            borderRadius: 3,
            p: 4,
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
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Drag and drop your image here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse from your device
          </Typography>
        </Box>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {/* Left Column: Visual Editor Preview */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Visual Preview
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  minHeight: 300,
                  maxHeight: 450,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    transition: 'transform 0.2s ease-out',
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={originalUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 380,
                      objectFit: 'contain',
                      borderRadius: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Actions and Fine-tuning Sliders */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Rotation & Flip Controls
              </Typography>

              <Stack spacing={3.5}>
                {/* 90 degree buttons */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Step Rotation
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RotateLeftIcon />}
                        onClick={handleRotateLeft}
                      >
                        Rotate -90°
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RotateRightIcon />}
                        onClick={handleRotateRight}
                      >
                        Rotate +90°
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Flip Buttons */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Mirror / Flip
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant={flipH ? 'contained' : 'outlined'}
                        color={flipH ? 'primary' : 'inherit'}
                        startIcon={<FlipIcon />}
                        onClick={handleFlipHorizontal}
                      >
                        Horizontal
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant={flipV ? 'contained' : 'outlined'}
                        color={flipV ? 'primary' : 'inherit'}
                        startIcon={<FlipIcon sx={{ transform: 'rotate(90deg)' }} />}
                        onClick={handleFlipVertical}
                      >
                        Vertical
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Custom Rotation Slider */}
                <Box>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Custom Rotation Angle
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                      {rotation}°
                    </Typography>
                  </Stack>
                  <Slider
                    value={rotation}
                    onChange={(_, val) => setRotation(val as number)}
                    min={-180}
                    max={180}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Use slider for fine angle corrections.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleClear}
                    disabled={processing}
                    sx={{ flex: 1 }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    onClick={handleDownload}
                    disabled={processing}
                    sx={{ flex: 1.5 }}
                  >
                    Download Image
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
