'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Slider,
  Typography,
  Alert,
  Grid,
  Stack,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(70);
  const [scale, setScale] = useState<number>(80);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCompressedUrl('');
    setCompressedSize(0);
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
    setCompressedUrl('');
    setCompressedSize(0);
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompress = () => {
    if (!originalFile) {
      setError('Please upload an image first.');
      return;
    }
    setCompressing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not get canvas context.');
          setCompressing(false);
          return;
        }

        const width = img.width * (scale / 100);
        const height = img.height * (scale / 100);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedUrl(URL.createObjectURL(blob));
              setCompressedSize(blob.size);
            } else {
              setError('Failed to compress image.');
            }
            setCompressing(false);
          },
          'image/jpeg',
          quality / 100
        );
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(originalFile);
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalUrl('');
    setCompressedUrl('');
    setCompressedSize(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const savings =
    originalFile && compressedSize
      ? Math.round(((originalFile.size - compressedSize) / originalFile.size) * 100)
      : 0;

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
                Original Size: {formatSize(originalFile.size)}
              </Typography>
            </Grid>

            {/* Right Column: Compressed Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Compressed Preview
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
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 330,
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No compressed image yet. Adjust settings and click Compress.
                  </Typography>
                )}
              </Box>
              {compressedSize > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Compressed Size: {formatSize(compressedSize)}{' '}
                  {savings > 0 ? (
                    <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold', ml: 1 }}>
                      ({savings}% smaller)
                    </Box>
                  ) : savings < 0 ? (
                    <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold', ml: 1 }}>
                      ({Math.abs(savings)}% larger)
                    </Box>
                  ) : null}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Compress Controls Slider */}
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
            <Grid container spacing={4} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography id="quality-slider" gutterBottom sx={{ fontWeight: 600 }}>
                  Quality: {quality}%
                </Typography>
                <Slider
                  value={quality}
                  onChange={(_, val) => {
                    setQuality(val as number);
                    setCompressedUrl('');
                  }}
                  min={1}
                  max={100}
                  aria-labelledby="quality-slider"
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Lower quality results in smaller file sizes.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography id="scale-slider" gutterBottom sx={{ fontWeight: 600 }}>
                  Dimensions: {scale}% ({scale === 100 ? 'Original Size' : `${scale}% scale`})
                </Typography>
                <Slider
                  value={scale}
                  onChange={(_, val) => {
                    setScale(val as number);
                    setCompressedUrl('');
                  }}
                  min={10}
                  max={100}
                  aria-labelledby="scale-slider"
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Resizing the image dimensions decreases file size significantly.
                </Typography>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear}>
                Clear
              </Button>
              {compressedUrl ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  href={compressedUrl}
                  download={`compressed-${originalFile.name}`}
                >
                  Download Compressed
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCompress}
                  disabled={compressing}
                  startIcon={compressing && <CircularProgress size={20} color="inherit" />}
                >
                  {compressing ? 'Compressing...' : 'Compress Image'}
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
