'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Stack,
  CircularProgress,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import Tesseract from 'tesseract.js';

export default function ImageToText() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');
  const [language, setLanguage] = useState<string>('eng');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setOcrText('');
    setProgress(0);
    setStatusText('');
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
    setOcrText('');
    setProgress(0);
    setStatusText('');
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

  const handleOcr = async () => {
    if (!originalFile) {
      setError('Please upload an image first.');
      return;
    }

    setProcessing(true);
    setError(null);
    setOcrText('');
    setProgress(0);
    setStatusText('Loading OCR engine...');

    try {
      const result = await Tesseract.recognize(
        originalUrl,
        language,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setStatusText(`Extracting text...`);
              setProgress(Math.round(m.progress * 100));
            } else {
              setStatusText(m.status);
            }
          },
        }
      );

      if (result.data && result.data.text) {
        setOcrText(result.data.text);
      } else {
        setOcrText('No text found in the image.');
      }
    } catch (err: any) {
      setError(`OCR Processing Error: ${err.message || err}`);
      console.error(err);
    } finally {
      setProcessing(false);
      setProgress(0);
      setStatusText('');
    }
  };

  const handleCopy = () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText);
      setCopied(true);
    }
  };

  const handleDownloadTxt = () => {
    if (!ocrText) return;
    const element = document.createElement('a');
    const file = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `extracted-text-${originalFile?.name || 'ocr'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClear = () => {
    setOriginalFile(null);
    setOriginalUrl('');
    setOcrText('');
    setProgress(0);
    setStatusText('');
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
            {/* Left Column: Image Preview & Lang Selection */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Uploaded Image
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
                  alt="OCR Target"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 330,
                    objectFit: 'contain',
                    borderRadius: 4,
                  }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="ocr-lang-label">OCR Language</InputLabel>
                  <Select
                    labelId="ocr-lang-label"
                    value={language}
                    label="OCR Language"
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={processing}
                  >
                    <MenuItem value="eng">English (ENG)</MenuItem>
                    <MenuItem value="spa">Spanish (SPA)</MenuItem>
                    <MenuItem value="fra">French (FRA)</MenuItem>
                    <MenuItem value="deu">German (DEU)</MenuItem>
                    <MenuItem value="chi_sim">Chinese Simplified (CHI)</MenuItem>
                    <MenuItem value="jpn">Japanese (JPN)</MenuItem>
                  </Select>
                </FormControl>
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
                  color="primary"
                  onClick={handleOcr}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <ImageSearchIcon />}
                  sx={{ flex: 1 }}
                >
                  {processing ? 'Processing...' : 'Extract Text'}
                </Button>
              </Stack>
            </Grid>

            {/* Right Column: OCR Results */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Extracted Text Result
              </Typography>
              <TextField
                multiline
                rows={12}
                fullWidth
                placeholder="Extracted text will appear here..."
                value={ocrText}
                slotProps={{
                  input: {
                    readOnly: true,
                    sx: { fontFamily: 'inherit', fontSize: '0.95rem', bgcolor: 'rgba(0, 0, 0, 0.01)' }
                  }
                }}
              />

              {ocrText && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadTxt}
                  >
                    Download .TXT
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopy}
                  >
                    Copy Text
                  </Button>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Progress Bars */}
      {processing && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {statusText}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Copy feedback */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Text copied to clipboard!"
      />
    </Box>
  );
}
