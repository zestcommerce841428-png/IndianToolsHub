'use client';

import React, { useState, useRef } from 'react';
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
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareIcon from '@mui/icons-material/Compare';

export default function ImageConverter() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [convertedSize, setConvertedSize] = useState<string>('');
  const [format, setFormat] = useState('png');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setConvertedUrl('');
    setConvertedSize('');
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
    setConvertedUrl('');
    setConvertedSize('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setOriginalFile(file);
        setOriginalUrl(URL.createObjectURL(file));
      } else {
        setError('Please drop an image file (PNG, JPG, etc.).');
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

  const handleConvert = () => {
    if (!originalFile) {
      setError('Please upload an image first.');
      return;
    }
    setConverting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not get canvas context.');
          setConverting(false);
          return;
        }
        ctx.drawImage(img, 0, 0);

        let mimeType = `image/${format}`;
        if (format === 'jpeg' || format === 'jpg') {
          mimeType = 'image/jpeg';
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setConvertedUrl(URL.createObjectURL(blob));
              setConvertedSize(formatSize(blob.size));
            } else {
              setError('Failed to convert image.');
            }
            setConverting(false);
          },
          mimeType,
          0.92
        );
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setConverting(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(originalFile);
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalUrl('');
    setConvertedUrl('');
    setConvertedSize('');
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
                  maxHeight: 400,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 380,
                    objectFit: 'contain',
                    borderRadius: 4,
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Name: {originalFile.name} | Size: {formatSize(originalFile.size)}
              </Typography>
            </Grid>

            {/* Right Column: Converted Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Converted Preview
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
                  maxHeight: 400,
                  overflow: 'hidden',
                }}
              >
                {convertedUrl ? (
                  <img
                    src={convertedUrl}
                    alt="Converted"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 380,
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No converted image yet. Choose settings below and click Convert.
                  </Typography>
                )}
              </Box>
              {convertedSize && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Format: {format.toUpperCase()} | Size: {convertedSize}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Controls */}
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
              bgcolor: 'action.hover',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel id="convert-format-label">Target Format</InputLabel>
                <Select
                  labelId="convert-format-label"
                  value={format}
                  label="Target Format"
                  onChange={(e) => {
                    setFormat(e.target.value);
                    setConvertedUrl('');
                    setConvertedSize('');
                  }}
                >
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="jpeg">JPG / JPEG</MenuItem>
                  <MenuItem value="webp">WebP</MenuItem>
                  <MenuItem value="gif">GIF</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClear}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Clear
                </Button>
                {convertedUrl ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    href={convertedUrl}
                    download={`converted-image.${format}`}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
                    Download
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={converting ? <CircularProgress size={20} color="inherit" /> : <CompareIcon />}
                    onClick={handleConvert}
                    disabled={converting}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
                    {converting ? 'Converting...' : 'Convert'}
                  </Button>
                )}
              </Stack>
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
