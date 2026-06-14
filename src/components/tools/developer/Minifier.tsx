'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CompressIcon from '@mui/icons-material/Compress';

type CodeType = 'auto' | 'html' | 'css' | 'js';

function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespaces
    .replace(/>\s+</g, '><') // remove spaces between tags
    .trim();
}

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ') // collapse spaces
    .replace(/\s*([{}:;])\s*/g, '$1') // remove space around separators
    .replace(/;}/g, '}') // remove trailing semicolons before bracket
    .trim();
}

function minifyJS(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') 
    .replace(/(?:^|[^\\])\/\/.*$/gm, '') 
    .replace(/\s+/g, ' ') 
    .replace(/\s*([=+\-*/{}()\[\];,<>:])\s*/g, '$1') 
    .trim();
}

export default function Minifier() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('auto');
  const [detectedType, setDetectedType] = useState<string>('');
  const [stats, setStats] = useState<{
    original: number;
    minified: number;
    ratio: number;
  } | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const handleMinify = () => {
    if (!inputText) return;

    let typeToUse = codeType;
    if (codeType === 'auto') {
      const content = inputText.trim();
      if (content.match(/<!DOCTYPE html>/i) || content.includes('<html>') || content.includes('<div') || content.includes('<p')) {
        typeToUse = 'html';
        setDetectedType('HTML (Auto-detected)');
      } else if (content.includes('{') && content.includes('}') && (content.includes('.') || content.includes('#') || content.includes(':hover'))) {
        typeToUse = 'css';
        setDetectedType('CSS (Auto-detected)');
      } else {
        typeToUse = 'js';
        setDetectedType('JavaScript (Auto-detected)');
      }
    } else {
      setDetectedType('');
    }

    let minified = '';
    if (typeToUse === 'html') {
      minified = minifyHTML(inputText);
    } else if (typeToUse === 'css') {
      minified = minifyCSS(inputText);
    } else {
      minified = minifyJS(inputText);
    }

    setOutputText(minified);

    const originalSize = new Blob([inputText]).size;
    const minifiedSize = new Blob([minified]).size;
    const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

    setStats({
      original: originalSize,
      minified: minifiedSize,
      ratio: Math.max(0, parseFloat(savings.toFixed(2))),
    });

    setAlertInfo({
      type: 'success',
      message: `Code minified successfully! Saved ${savings.toFixed(1)}% space.`,
    });
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Minified code copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setStats(null);
    setDetectedType('');
    setAlertInfo(null);
  };

  const handleTypeChange = (event: SelectChangeEvent<CodeType>) => {
    setCodeType(event.target.value as CodeType);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Source Code
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="Paste your HTML, CSS, or JavaScript code here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            slotProps={{
              input: {
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Minified Output {detectedType && `(${detectedType})`}
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
              },
            }}
            placeholder="Minified code will appear here..."
            value={outputText}
          />
        </Box>
      </Box>

      {/* Control Options */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <FormControl fullWidth size="small">
              <InputLabel id="code-type-label">Source Language</InputLabel>
              <Select
                labelId="code-type-label"
                value={codeType}
                label="Source Language"
                onChange={handleTypeChange}
              >
                <MenuItem value="auto">Auto-detect</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
                <MenuItem value="js">JavaScript</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Note: This tool uses secure, client-side regex rules. Code is processed entirely in your browser and never sent to any server.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
            Compression Stats
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Original Size
              </Typography>
              <Typography variant="h6">{stats.original} Bytes</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Minified Size
              </Typography>
              <Typography variant="h6">{stats.minified} Bytes</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ color: 'success.main' }}>
                Space Saved
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main' }}>
                {stats.ratio}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

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
          startIcon={<CompressIcon />}
          onClick={handleMinify}
          disabled={!inputText}
        >
          Minify
        </Button>
      </Box>
    </Box>
  );
}
