'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ImageResizer() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [resizedUrl, setResizedUrl] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [resizing, setResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResizedUrl('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));

      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    setResizedUrl('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setOriginalFile(file);
        setOriginalUrl(URL.createObjectURL(file));

        const img = new Image();
        img.onload = () => {
          setOriginalWidth(img.width);
          setOriginalHeight(img.height);
          setWidth(img.width.toString());
          setHeight(img.height.toString());
        };
        img.src = URL.createObjectURL(file);
      } else {
        setError('Please drop an image file.');
      }
    }
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    setResizedUrl('');
    const w = parseInt(val);
    if (lockAspect && originalWidth && originalHeight && !isNaN(w) && w > 0) {
      const h = Math.round((w / originalWidth) * originalHeight);
      setHeight(h.toString());
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    setResizedUrl('');
    const h = parseInt(val);
    if (lockAspect && originalWidth && originalHeight && !isNaN(h) && h > 0) {
      const w = Math.round((h / originalHeight) * originalWidth);
      setWidth(w.toString());
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleResize = () => {
    const w = parseInt(width);
    const h = parseInt(height);

    if (!originalFile) {
      setError('Please upload an image first.');
      return;
    }
    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setError('Please enter a valid width and height.');
      return;
    }

    setResizing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not get canvas context.');
          setResizing(false);
          return;
        }

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);

        try {
          const resizedData = canvas.toDataURL(originalFile.type);
          setResizedUrl(resizedData);
        } catch (err) {
          // fallback to png if mime type is unsupported
          const resizedData = canvas.toDataURL('image/png');
          setResizedUrl(resizedData);
        }
        setResizing(false);
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setResizing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(originalFile);
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalUrl('');
    setResizedUrl('');
    setWidth('');
    setHeight('');
    setOriginalWidth(0);
    setOriginalHeight(0);
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
            {/* Left Column: Original Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Original Preview
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
                  minHeight: 200,
                  maxHeight: 350,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 330,
                    objectFit: 'contain',
                    borderRadius: 4,
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Dimensions: {originalWidth} x {originalHeight} px | Size: {formatSize(originalFile.size)}
              </Typography>
            </Grid>

            {/* Right Column: Resized Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Resized Preview
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
                  minHeight: 200,
                  maxHeight: 350,
                  overflow: 'hidden',
                }}
              >
                {resizedUrl ? (
                  <img
                    src={resizedUrl}
                    alt="Resized"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 330,
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No resized image yet. Set target dimensions and click Resize.
                  </Typography>
                )}
              </Box>
              {resizedUrl && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Target Dimensions: {width} x {height} px
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Resize Controls */}
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Width (px)"
                  type="number"
                  size="small"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Height (px)"
                  type="number"
                  size="small"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={lockAspect}
                      onChange={(e) => {
                        setLockAspect(e.target.checked);
                        if (e.target.checked && originalWidth && originalHeight && width) {
                          const w = parseInt(width);
                          if (!isNaN(w) && w > 0) {
                            const h = Math.round((w / originalWidth) * originalHeight);
                            setHeight(h.toString());
                          }
                        }
                      }}
                    />
                  }
                  label="Lock Aspect Ratio"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear}>
                Clear
              </Button>
              {resizedUrl ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  href={resizedUrl}
                  download={`resized-${width}x${height}-${originalFile.name}`}
                >
                  Download Resized
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResize}
                  disabled={resizing}
                  startIcon={resizing && <CircularProgress size={20} color="inherit" />}
                >
                  {resizing ? 'Resizing...' : 'Resize Image'}
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

