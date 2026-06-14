'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
import CropIcon from '@mui/icons-material/Crop';

export default function ImageCropper() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [croppedUrl, setCroppedUrl] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('free'); // 'free', '1', '16/9', '4/3', '3/2', '21/9'
  
  // Dimensions and coordinates on the rendered screen
  const [displayWidth, setDisplayWidth] = useState(0);
  const [displayHeight, setDisplayHeight] = useState(0);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // Crop box coordinates (in display pixels)
  const [cropX, setCropX] = useState(20);
  const [cropY, setCropY] = useState(20);
  const [cropW, setCropW] = useState(150);
  const [cropH, setCropH] = useState(150);

  const [cropperReady, setCropperReady] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; cropX: number; cropY: number } | null>(null);

  // Reset states on new file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCroppedUrl('');
    setCropperReady(false);
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
    setCroppedUrl('');
    setCropperReady(false);
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const dispW = img.clientWidth;
    const dispH = img.clientHeight;
    setDisplayWidth(dispW);
    setDisplayHeight(dispH);
    setNaturalWidth(img.naturalWidth);
    setNaturalHeight(img.naturalHeight);

    // Initial crop box (e.g. 80% of image size, centered)
    const initialW = Math.round(dispW * 0.7);
    const initialH = Math.round(dispH * 0.7);
    setCropW(initialW);
    setCropH(initialH);
    setCropX(Math.round((dispW - initialW) / 2));
    setCropY(Math.round((dispH - initialH) / 2));
    setCropperReady(true);
  };

  // Adjust crop box size and aspect ratios
  useEffect(() => {
    if (!cropperReady || displayWidth === 0 || displayHeight === 0) return;

    let targetW = cropW;
    let targetH = cropH;

    if (aspectRatio !== 'free') {
      const aspect = eval(aspectRatio) as number;
      // Fit within available space
      targetH = Math.round(targetW / aspect);
      if (targetH > displayHeight - cropY) {
        targetH = displayHeight - cropY;
        targetW = Math.round(targetH * aspect);
      }
      if (targetW > displayWidth - cropX) {
        targetW = displayWidth - cropX;
        targetH = Math.round(targetW / aspect);
      }
    }

    // Keep within bounds
    targetW = Math.min(targetW, displayWidth - cropX);
    targetH = Math.min(targetH, displayHeight - cropY);

    setCropW(targetW);
    setCropH(targetH);
  }, [aspectRatio, cropperReady]);

  // Handle Dragging
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      cropX: cropX,
      cropY: cropY,
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragStartRef.current) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.mouseX;
    const deltaY = clientY - dragStartRef.current.mouseY;

    let newX = dragStartRef.current.cropX + deltaX;
    let newY = dragStartRef.current.cropY + deltaY;

    // Bounds checking
    newX = Math.max(0, Math.min(newX, displayWidth - cropW));
    newY = Math.max(0, Math.min(newY, displayHeight - cropH));

    setCropX(newX);
    setCropY(newY);
  };

  const handleDragEnd = () => {
    dragStartRef.current = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  // Perform Crop using Canvas
  const handleCrop = () => {
    if (!originalFile || !imgRef.current) return;
    setCropping(true);
    setError(null);

    const img = imgRef.current;
    const scaleX = naturalWidth / displayWidth;
    const scaleY = naturalHeight / displayHeight;

    const sourceX = cropX * scaleX;
    const sourceY = cropY * scaleY;
    const sourceW = cropW * scaleX;
    const sourceH = cropH * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = sourceW;
    canvas.height = sourceH;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Could not access 2D canvas context.');
      setCropping(false);
      return;
    }

    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

    try {
      const dataUrl = canvas.toDataURL(originalFile.type);
      setCroppedUrl(dataUrl);
    } catch (err) {
      const dataUrl = canvas.toDataURL('image/png');
      setCroppedUrl(dataUrl);
    }
    setCropping(false);
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalUrl('');
    setCroppedUrl('');
    setCropperReady(false);
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
            {/* Left Column: Interactive Cropper View */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Drag the crop box to position
              </Typography>
              <Box
                ref={containerRef}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  minHeight: 250,
                  maxHeight: 450,
                  overflow: 'hidden',
                }}
              >
                {/* Crop container with relative placement */}
                <Box sx={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                  <img
                    ref={imgRef}
                    src={originalUrl}
                    alt="Source"
                    onLoad={handleImageLoad}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 430,
                      display: 'block',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />

                  {cropperReady && (
                    <Box
                      onMouseDown={handleDragStart}
                      onTouchStart={handleDragStart}
                      sx={{
                        position: 'absolute',
                        left: cropX,
                        top: cropY,
                        width: cropW,
                        height: cropH,
                        border: '2px dashed #2563eb',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        cursor: 'move',
                        zIndex: 10,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 8,
                          height: 8,
                          borderRadius: '55%',
                          backgroundColor: '#2563eb',
                        }
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Image resolution: {naturalWidth} x {naturalHeight} px
              </Typography>
            </Grid>

            {/* Right Column: Crop Preview / Export */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Cropped Result Preview
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  minHeight: 250,
                  maxHeight: 450,
                  overflow: 'hidden',
                }}
              >
                {croppedUrl ? (
                  <img
                    src={croppedUrl}
                    alt="Cropped Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 430,
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Adjust the crop box and options, then click Crop Image.
                  </Typography>
                )}
              </Box>
              {croppedUrl && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Ready to download.
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Controls */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
              bgcolor: 'action.hover',
            }}
          >
            <Grid container spacing={3} sx={{ mb: 3, alignItems: 'center' }}>
              {/* Aspect Ratio Selector */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="aspect-ratio-label">Aspect Ratio</InputLabel>
                  <Select
                    labelId="aspect-ratio-label"
                    value={aspectRatio}
                    label="Aspect Ratio"
                    onChange={(e) => {
                      setAspectRatio(e.target.value);
                      setCroppedUrl('');
                    }}
                  >
                    <MenuItem value="free">Freeform</MenuItem>
                    <MenuItem value="1">1:1 (Square)</MenuItem>
                    <MenuItem value="16/9">16:9 (Landscape)</MenuItem>
                    <MenuItem value="4/3">4:3 (Photo)</MenuItem>
                    <MenuItem value="3/2">3:2 (Classic)</MenuItem>
                    <MenuItem value="21/9">21:9 (Ultrawide)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Crop Box Width Slider */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography id="crop-width-slider" gutterBottom variant="body2" sx={{ fontWeight: 600 }}>
                  Crop Width
                </Typography>
                <Slider
                  value={cropW}
                  onChange={(_, val) => {
                    const w = val as number;
                    setCroppedUrl('');
                    if (aspectRatio !== 'free') {
                      const aspect = eval(aspectRatio) as number;
                      const h = Math.round(w / aspect);
                      if (h <= displayHeight - cropY) {
                        setCropW(w);
                        setCropH(h);
                      }
                    } else {
                      setCropW(w);
                    }
                  }}
                  min={20}
                  max={displayWidth - cropX}
                  disabled={!cropperReady}
                  aria-labelledby="crop-width-slider"
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Crop Box Height Slider */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography id="crop-height-slider" gutterBottom variant="body2" sx={{ fontWeight: 600 }}>
                  Crop Height
                </Typography>
                <Slider
                  value={cropH}
                  onChange={(_, val) => {
                    const h = val as number;
                    setCroppedUrl('');
                    if (aspectRatio !== 'free') {
                      const aspect = eval(aspectRatio) as number;
                      const w = Math.round(h * aspect);
                      if (w <= displayWidth - cropX) {
                        setCropW(w);
                        setCropH(h);
                      }
                    } else {
                      setCropH(h);
                    }
                  }}
                  min={20}
                  max={displayHeight - cropY}
                  disabled={!cropperReady || aspectRatio !== 'free'}
                  aria-labelledby="crop-height-slider"
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear}>
                Clear
              </Button>
              {croppedUrl ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  href={croppedUrl}
                  download={`cropped-${originalFile.name}`}
                >
                  Download Cropped
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCrop}
                  disabled={cropping || !cropperReady}
                  startIcon={cropping ? <CircularProgress size={20} color="inherit" /> : <CropIcon />}
                >
                  {cropping ? 'Cropping...' : 'Crop Image'}
                </Button>
              )}
            </Stack>
          </Box>
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

