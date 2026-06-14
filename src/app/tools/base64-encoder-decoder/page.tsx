'use client';

import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Paper, Button, Alert,
  Card, CardContent, Divider, Tabs, Tab, IconButton, Tooltip
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Base64Tool() {
  const [tabValue, setTabValue] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [fileOutput, setFileOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');

  // Encode text to Base64
  const handleEncode = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(textInput)));
      setTextOutput(encoded);
    } catch (err) {
      setError('Failed to encode. Please check your input.');
    }
  };

  // Decode Base64 to text
  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(textInput)));
      setTextOutput(decoded);
    } catch (err) {
      setError('Invalid Base64 string. Please check your input.');
    }
  };

  // Handle file upload and encode
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1]; // Remove data URL prefix
        setFileOutput(base64);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
    }
  };

  // Download decoded file
  const handleDownloadFile = () => {
    try {
      setError('');
      const byteCharacters = atob(textInput);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded-file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to decode file. Invalid Base64 string.');
    }
  };

  // Handle copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  // Clear all
  const handleClear = () => {
    setTextInput('');
    setTextOutput('');
    setFileOutput('');
    setFileName('');
    setError('');
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockOpenIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Base64 Encoder / Decoder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Encode and decode text or files to/from Base64 format
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
            <Tab label="Text Encoding" />
            <Tab label="File Encoding" />
          </Tabs>
        </Paper>

        {/* Text Encoding Tab */}
        {tabValue === 0 && (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Input</Typography>
                <Button size="small" onClick={handleClear}>
                  Clear All
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to encode or Base64 string to decode..."
                error={!!error}
                helperText={error}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleEncode}
                  disabled={!textInput}
                  fullWidth
                >
                  Encode to Base64
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleDecode}
                  disabled={!textInput}
                  fullWidth
                >
                  Decode from Base64
                </Button>
              </Box>
            </Paper>

            {textOutput && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Output</Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton onClick={() => handleCopy(textOutput, 'Output')}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={textOutput}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </Paper>
            )}
          </>
        )}

        {/* File Encoding Tab */}
        {tabValue === 1 && (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Encode File to Base64
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a file to convert it to Base64 format
              </Typography>

              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>

              {fileName && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  File: <strong>{fileName}</strong>
                </Typography>
              )}

              {fileOutput && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Base64 Output:</Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton onClick={() => handleCopy(fileOutput, 'Base64')}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={fileOutput}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        wordBreak: 'break-all',
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Decode Base64 to File
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Paste Base64 string and download the decoded file
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste Base64 string here..."
                error={!!error}
                helperText={error}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadFile}
                disabled={!textInput}
              >
                Download Decoded File
              </Button>
            </Paper>
          </>
        )}

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {copySuccess} copied to clipboard!
          </Alert>
        )}

        {/* Information Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              About Base64 Encoding
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
              It&apos;s commonly used to encode data that needs to be stored and transferred over media designed to deal with text.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Common Uses:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Email attachments (MIME encoding)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Embedding images in HTML/CSS (Data URLs)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Storing complex data in URLs or cookies
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              • API data transfer and JSON payloads
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Note: Base64 encoding increases data size by approximately 33%. It&apos;s not encryption and should not be used for security purposes.
            </Typography>
          </CardContent>
        </Card>
        </Container>
        <Footer />
      </Box>
    </ProtectedRoute>
  );
}
