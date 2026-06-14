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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

export default function HexEncoderDecoder() {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Encode, 1 = Decode
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [useSpaces, setUseSpaces] = useState(true);
  const [downloadFilename, setDownloadFilename] = useState('decoded_file.bin');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);

  // Helper: converts Uint8Array to Hex string
  const bufToHex = (buf: Uint8Array): string => {
    const hexParts: string[] = [];
    for (let i = 0; i < buf.length; i++) {
      const hex = buf[i].toString(16).padStart(2, '0');
      hexParts.push(hex);
    }
    return hexParts.join(useSpaces ? ' ' : '');
  };

  // Helper: converts Hex string back to Uint8Array
  const hexToBuf = (hexStr: string): Uint8Array => {
    const cleanHex = hexStr.replace(/[^0-9a-fA-F]/g, '');
    if (cleanHex.length % 2 !== 0) {
      throw new Error('Hexadecimal string must have an even number of characters.');
    }
    const len = cleanHex.length / 2;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return buf;
  };

  const handleProcess = () => {
    if (!inputText) return;
    setAlertInfo(null);
    try {
      if (tabIndex === 0) {
        // Encode Text
        const encoder = new TextEncoder();
        const buf = encoder.encode(inputText);
        setOutputText(bufToHex(buf));
        setAlertInfo({ type: 'success', message: 'Text successfully encoded to Hex!' });
      } else {
        // Decode Text
        const buf = hexToBuf(inputText);
        const decoder = new TextDecoder('utf-8', { fatal: true });
        const decodedString = decoder.decode(buf);
        setOutputText(decodedString);
        setAlertInfo({ type: 'success', message: 'Hex successfully decoded to Text!' });
      }
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message || 'Invalid Hex format.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAlertInfo(null);
    setFileInfo({ name: file.name, size: file.size });

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        const u8 = new Uint8Array(arrayBuffer);
        const result = bufToHex(u8);
        setOutputText(result);
        setAlertInfo({
          type: 'success',
          message: `Successfully encoded file: ${file.name} to Hex!`,
        });
      }
    };
    reader.onerror = () => {
      setAlertInfo({ type: 'error', message: 'Failed to read file.' });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadDecodedFile = () => {
    if (!inputText) return;
    setAlertInfo(null);
    try {
      const buf = hexToBuf(inputText);
      const blob = new Blob([buf as any], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename || 'decoded_file.bin';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAlertInfo({ type: 'success', message: `Downloaded decoded file as ${downloadFilename}!` });
    } catch (e: any) {
      setAlertInfo({
        type: 'error',
        message: e.message || 'Could not decode file. Ensure the input text is a valid Hexadecimal string.',
      });
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Output copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setFileInfo(null);
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
        <Tab icon={<CodeIcon />} label="Encode" iconPosition="start" />
        <Tab icon={<DownloadIcon />} label="Decode" iconPosition="start" />
      </Tabs>

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Text to Encode' : 'Hexadecimal to Decode'}
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder={
              tabIndex === 0
                ? 'Enter plain text here...'
                : 'Paste Hex string (e.g., 48 65 6c 6c 6f) here...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          {tabIndex === 0 && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Or Upload File to Encode
                <input type="file" hidden onChange={handleFileUpload} />
              </Button>
              {fileInfo && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Loaded: {fileInfo.name} ({fileInfo.size} bytes)
                </Typography>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Filename for Decoded File"
                size="small"
                fullWidth
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadDecodedFile}
                disabled={!inputText}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Decode & Download
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Hexadecimal Output' : 'Decoded Text Output'}
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

      {/* Control Options */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={useSpaces}
              onChange={(e) => setUseSpaces(e.target.checked)}
              color="primary"
            />
          }
          label="Separate Bytes with Spaces"
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
          onClick={handleCopy}
          disabled={!outputText}
        >
          Copy Output
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CodeIcon />}
          onClick={handleProcess}
          disabled={!inputText}
        >
          {tabIndex === 0 ? 'Encode' : 'Decode'}
        </Button>
      </Box>
    </Box>
  );
}
