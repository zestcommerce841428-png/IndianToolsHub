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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

type ReversalMode = 'entire' | 'words-order' | 'words-letters' | 'lines';

export default function TextReverser() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<ReversalMode>('entire');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const handleReverse = () => {
    if (!inputText) return;

    let result = '';

    switch (mode) {
      case 'entire':
        result = inputText.split('').reverse().join('');
        break;
      case 'words-order':
        result = inputText
          .split(/\r?\n/)
          .map((line) => line.split(/\s+/).reverse().join(' '))
          .join('\n');
        break;
      case 'words-letters':
        result = inputText
          .split(/\r?\n/)
          .map((line) =>
            line
              .split(' ')
              .map((word) => word.split('').reverse().join(''))
              .join(' ')
          )
          .join('\n');
        break;
      case 'lines':
        result = inputText.split(/\r?\n/).reverse().join('\n');
        break;
      default:
        break;
    }

    setOutputText(result);
    setAlertInfo({
      type: 'success',
      message: 'Successfully reversed text!',
    });
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Reversed text copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setAlertInfo(null);
  };

  const handleModeChange = (event: SelectChangeEvent<ReversalMode>) => {
    setMode(event.target.value as ReversalMode);
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
            Input Text
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="Enter or paste text to reverse..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Reversed Output
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            placeholder="Your reversed text will appear here..."
            value={outputText}
          />
        </Box>
      </Box>

      {/* Control Options */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <FormControl fullWidth size="small">
              <InputLabel id="reversal-mode-label">Reversal Mode</InputLabel>
              <Select
                labelId="reversal-mode-label"
                value={mode}
                label="Reversal Mode"
                onChange={handleModeChange}
              >
                <MenuItem value="entire">Reverse Everything (Characters)</MenuItem>
                <MenuItem value="words-order">Reverse Word Order (Per Line)</MenuItem>
                <MenuItem value="words-letters">Reverse Letters of Each Word</MenuItem>
                <MenuItem value="lines">Reverse Line Order</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select how you want to reverse the text. All operations run locally inside your browser.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Controls */}
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
          startIcon={<SwapHorizIcon />}
          onClick={handleReverse}
          disabled={!inputText}
        >
          Reverse Text
        </Button>
      </Box>
    </Box>
  );
}
