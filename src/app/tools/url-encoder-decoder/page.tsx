'use client';

import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Paper, Button, Alert,
  Card, CardContent, Divider, IconButton, Tooltip, Chip
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function URLEncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');

  // Encode URL
  const handleEncode = () => {
    try {
      setError('');
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode URL. Please check your input.');
    }
  };

  // Decode URL
  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (err) {
      setError('Invalid URL encoding. Please check your input.');
    }
  };

  // Encode full URL
  const handleEncodeURL = () => {
    try {
      setError('');
      const encoded = encodeURI(input);
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode URL. Please check your input.');
    }
  };

  // Toggle mode and swap input/output
  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  // Handle copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  // Clear all
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // Parse URL into components
  const parseURL = (url: string) => {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
      };
    } catch {
      return null;
    }
  };

  const parsedURL = input ? parseURL(input) : null;

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LinkIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            URL Encoder / Decoder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Encode and decode URLs and URL parameters
          </Typography>
        </Box>

        {/* Input Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Input</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={mode === 'encode' ? 'Encoding Mode' : 'Decoding Mode'} 
                color="primary" 
                size="small" 
              />
              <Button size="small" onClick={handleClear}>
                Clear All
              </Button>
            </Box>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text or URL to encode...' : 'Enter encoded URL to decode...'}
            error={!!error}
            helperText={error}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleEncode}
              disabled={!input}
            >
              Encode Component
            </Button>
            <Button
              variant="outlined"
              onClick={handleEncodeURL}
              disabled={!input}
            >
              Encode Full URL
            </Button>
            <Button
              variant="outlined"
              onClick={handleDecode}
              disabled={!input}
            >
              Decode URL
            </Button>
            {output && (
              <Tooltip title="Swap input and output">
                <IconButton onClick={handleSwap} color="primary">
                  <SwapVertIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Paper>

        {/* Output Section */}
        {output && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Output</Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton onClick={() => handleCopy(output, 'Output')}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={output}
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

        {/* URL Parser */}
        {parsedURL && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              URL Components
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gap: 2 }}>
              {parsedURL.protocol && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Protocol:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {parsedURL.protocol}
                  </Typography>
                </Box>
              )}
              {parsedURL.hostname && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hostname:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {parsedURL.hostname}
                  </Typography>
                </Box>
              )}
              {parsedURL.port && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Port:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {parsedURL.port}
                  </Typography>
                </Box>
              )}
              {parsedURL.pathname && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Path:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {parsedURL.pathname}
                  </Typography>
                </Box>
              )}
              {parsedURL.search && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Query String:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {parsedURL.search}
                  </Typography>
                </Box>
              )}
              {parsedURL.hash && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hash:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {parsedURL.hash}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {copySuccess} copied to clipboard!
          </Alert>
        )}

        {/* Information Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                URL Encoding
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 2 }}>
                URL encoding (also known as percent-encoding) converts characters into a format that can be transmitted over the Internet.
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Common Encoded Characters:
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Space → %20 or +
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  ! → %21
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  # → %23
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  $ → %24
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  & → %26
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  = → %3D
                </Typography>
                <Typography variant="body2">
                  ? → %3F
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                When to Use
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Encode Component:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Use for query parameters and URL fragments. Encodes all special characters including /, ?, &, =, etc.
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Encode Full URL:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Use for complete URLs. Preserves URL structure characters like :, /, ?, but encodes other special characters.
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Common Use Cases:
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Query string parameters
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Form data submission
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • API request parameters
              </Typography>
              <Typography variant="body2">
                • Sharing URLs with special characters
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reserved vs Unreserved Characters
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Unreserved Characters (Safe):
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  A-Z a-z 0-9 - _ . ~
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  These characters don&apos;t need encoding
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Reserved Characters:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  : / ? # [ ] @ ! $ & &apos; ( ) * + , ; =
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  These have special meaning and must be encoded when used literally
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Container>
        <Footer />
      </Box>
    </ProtectedRoute>
  );
}
