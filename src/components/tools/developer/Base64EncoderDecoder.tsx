'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function Base64EncoderDecoder() {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Text, 1 = File, 2 = Image
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState('decoded_file.bin');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // File specific state
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileBase64, setFileBase64] = useState('');
  const [fileDataUri, setFileDataUri] = useState('');
  const [decodeBase64Input, setDecodeBase64Input] = useState('');

  // Image specific state
  const [imageInfo, setImageInfo] = useState<{ name: string; size: number } | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageDataUri, setImageDataUri] = useState('');

  const encodeText = (text: string) => {
    try {
      let encoded = btoa(unescape(encodeURIComponent(text)));
      if (urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      return encoded;
    } catch (e) {
      throw new Error('Failed to encode. Ensure text contains valid characters.');
    }
  };

  const decodeText = (base64: string) => {
    try {
      let cleaned = base64.trim();
      if (urlSafe) {
        cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
        while (cleaned.length % 4) {
          cleaned += '=';
        }
      }
      return decodeURIComponent(escape(atob(cleaned)));
    } catch (e) {
      throw new Error('Failed to decode. Ensure the input is a valid Base64 string.');
    }
  };

  const handleProcessText = (mode: 'encode' | 'decode') => {
    if (!inputText) return;
    setAlertInfo(null);
    try {
      if (mode === 'encode') {
        const result = encodeText(inputText);
        setOutputText(result);
        setAlertInfo({ type: 'success', message: 'Text successfully encoded to Base64!' });
      } else {
        const result = decodeText(inputText);
        setOutputText(result);
        setAlertInfo({ type: 'success', message: 'Base64 successfully decoded to text!' });
      }
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAlertInfo(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setFileDataUri(dataUri);
        const base64 = dataUri.substring(dataUri.indexOf(',') + 1);
        setFileBase64(base64);
        setFileInfo({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        });
        setAlertInfo({
          type: 'success',
          message: `Successfully encoded file: ${file.name} to Base64!`,
        });
      }
    };
    reader.onerror = () => {
      setAlertInfo({ type: 'error', message: 'Failed to read file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertInfo({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }

    setAlertInfo(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setImageDataUri(dataUri);
        const base64 = dataUri.substring(dataUri.indexOf(',') + 1);
        setImageBase64(base64);
        setImageUrl(URL.createObjectURL(file));
        setImageInfo({
          name: file.name,
          size: file.size,
        });
        setAlertInfo({
          type: 'success',
          message: `Successfully encoded image: ${file.name} to Base64!`,
        });
      }
    };
    reader.onerror = () => {
      setAlertInfo({ type: 'error', message: 'Failed to read image.' });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadDecodedFile = () => {
    if (!decodeBase64Input) return;
    setAlertInfo(null);
    try {
      let base64Data = decodeBase64Input.trim();
      let mimeType = 'application/octet-stream';
      let filename = downloadFilename;

      const dataUrlRegex = /^data:([^;]+);base64,(.+)$/;
      const match = base64Data.match(dataUrlRegex);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setAlertInfo({ type: 'success', message: `Downloaded decoded file as ${filename}!` });
    } catch (e) {
      setAlertInfo({
        type: 'error',
        message: 'Could not decode file. Ensure the input text is a valid Base64 string or Data URI.',
      });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setFileInfo(null);
    setFileBase64('');
    setFileDataUri('');
    setDecodeBase64Input('');
    setImageInfo(null);
    setImageUrl('');
    setImageBase64('');
    setImageDataUri('');
    setAlertInfo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => {
          setTabIndex(val);
          handleClear();
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<CodeIcon />} label="Text Encode/Decode" iconPosition="start" />
        <Tab icon={<InsertDriveFileIcon />} label="File Encode" iconPosition="start" />
        <Tab icon={<ImageIcon />} label="Image Encode" iconPosition="start" />
      </Tabs>

      {/* TAB 0: TEXT ENCODE/DECODE */}
      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Input Text
              </Typography>
              <TextField
                multiline
                rows={10}
                fullWidth
                placeholder="Enter text or paste Base64 here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Output Result
              </Typography>
              <TextField
                multiline
                rows={10}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                placeholder="Result will appear here..."
                value={outputText}
              />
            </Box>
          </Box>

          {/* URL-Safe Options */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  color="primary"
                />
              }
              label="URL-Safe Base64 (RFC 4648)"
            />
          </Box>

          <Divider />

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClear}
              disabled={!inputText && !outputText}
            >
              Clear
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ContentCopyIcon />}
              onClick={() => {
                if (outputText) {
                  navigator.clipboard.writeText(outputText);
                  setAlertInfo({ type: 'info', message: 'Output copied to clipboard!' });
                }
              }}
              disabled={!outputText}
            >
              Copy Output
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleProcessText('decode')}
              disabled={!inputText}
            >
              Decode
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleProcessText('encode')}
              disabled={!inputText}
            >
              Encode
            </Button>
          </Box>
        </Box>
      )}

      {/* TAB 1: FILE ENCODE & DECODE */}
      {tabIndex === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* File Encoder Section */}
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              File to Base64 Encoder
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ p: 4, borderStyle: 'dashed' }}
            >
              Upload Any File to Encode
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>

            {fileInfo && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Encoded File: {fileInfo.name} ({fileInfo.type}, {(fileInfo.size / 1024).toFixed(1)} KB)
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        navigator.clipboard.writeText(fileBase64);
                        setAlertInfo({ type: 'info', message: 'Raw Base64 copied to clipboard!' });
                      }}
                    >
                      Copy Raw Base64
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText(fileDataUri);
                        setAlertInfo({ type: 'info', message: 'Data URI copied to clipboard!' });
                      }}
                    >
                      Copy Data URI
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          {/* File Decoder Section */}
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Decode Base64 string back to File
            </Typography>
            <TextField
              multiline
              rows={5}
              fullWidth
              placeholder="Paste Base64 or Data URI string here..."
              value={decodeBase64Input}
              onChange={(e) => setDecodeBase64Input(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Filename for Decoded File"
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
                size="small"
                fullWidth
              />
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadDecodedFile}
                disabled={!decodeBase64Input}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Decode & Download
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* TAB 2: IMAGE ENCODE */}
      {tabIndex === 2 && (
        <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Image to Base64 Encoder
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ p: 4, borderStyle: 'dashed' }}
          >
            Select/Upload Image File
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </Button>

          {imageInfo && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
              {/* Preview image */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Image Preview
                </Typography>
                <Box
                  component="img"
                  src={imageUrl}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 240,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {/* Action buttons */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Image: {imageInfo.name} ({(imageInfo.size / 1024).toFixed(1)} KB)
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigator.clipboard.writeText(imageBase64);
                    setAlertInfo({ type: 'info', message: 'Image Base64 copied!' });
                  }}
                >
                  Copy Base64 String
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    navigator.clipboard.writeText(imageDataUri);
                    setAlertInfo({ type: 'info', message: 'Image Data URI copied!' });
                  }}
                >
                  Copy Data URI
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
