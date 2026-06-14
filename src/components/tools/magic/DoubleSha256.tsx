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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FunctionsIcon from '@mui/icons-material/Functions';
import CryptoJS from 'crypto-js';

export default function DoubleSha256() {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Text, 1 = File
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const computeDoubleSha256 = (wordArray: CryptoJS.lib.WordArray): string => {
    const hash1 = CryptoJS.SHA256(wordArray);
    const hash2 = CryptoJS.SHA256(hash1);
    return hash2.toString(CryptoJS.enc.Hex);
  };

  const handleProcess = () => {
    if (!inputText) return;
    setAlertInfo(null);
    try {
      const words = CryptoJS.enc.Utf8.parse(inputText);
      const result = computeDoubleSha256(words);
      setOutputText(result);
      setAlertInfo({ type: 'success', message: 'Double SHA-256 hash computed successfully!' });
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message || 'Hashing failed.' });
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
        // Convert arrayBuffer to WordArray
        const u8 = new Uint8Array(arrayBuffer);
        const words = CryptoJS.lib.WordArray.create(u8 as any);
        const result = computeDoubleSha256(words);
        setOutputText(result);
        setAlertInfo({
          type: 'success',
          message: `Successfully hashed file: ${file.name}`,
        });
      }
    };
    reader.onerror = () => {
      setAlertInfo({ type: 'error', message: 'Failed to read file.' });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Hash copied to clipboard!' });
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
        <Tab icon={<FunctionsIcon />} label="Text Input" iconPosition="start" />
        <Tab icon={<CloudUploadIcon />} label="File Input" iconPosition="start" />
      </Tabs>

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tabIndex === 0 ? (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Text to Hash
            </Typography>
            <TextField
              multiline
              rows={8}
              fullWidth
              placeholder="Enter text to compute double SHA-256 hash..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Box>
        ) : (
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ p: 4, borderStyle: 'dashed' }}
            >
              Select File to Compute Double SHA-256
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
            {fileInfo && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Loaded: {fileInfo.name} ({fileInfo.size} bytes)
              </Typography>
            )}
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Double SHA-256 Output Hash (hex)
          </Typography>
          <TextField
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            placeholder="Double SHA-256 hash will appear here..."
            value={outputText}
          />
        </Box>
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
        {tabIndex === 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<FunctionsIcon />}
            onClick={handleProcess}
            disabled={!inputText}
          >
            Compute Hash
          </Button>
        )}
      </Box>
    </Box>
  );
}
