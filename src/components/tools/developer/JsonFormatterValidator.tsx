'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, MenuItem, Select, FormControl, InputLabel, ButtonGroup } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function JsonFormatterValidator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [indentSize, setIndentSize] = useState<number | string>(2);

  const handleFormat = () => {
    setError(null);
    setSuccess(false);
    setOutput('');

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError('Please paste JSON data first.');
      return;
    }

    try {
      const parsed = JSON.parse(trimmedInput);
      const space = indentSize === 'tab' ? '\t' : Number(indentSize);
      const formatted = JSON.stringify(parsed, null, space);
      setOutput(formatted);
      setSuccess(true);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleMinify = () => {
    setError(null);
    setSuccess(false);
    setOutput('');

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError('Please paste JSON data first.');
      return;
    }

    try {
      const parsed = JSON.parse(trimmedInput);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setSuccess(true);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      alert('Formatted JSON copied to clipboard!');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Settings / Controls */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="indent-size-label">Indentation</InputLabel>
          <Select
            labelId="indent-size-label"
            value={indentSize}
            label="Indentation"
            onChange={(e) => setIndentSize(e.target.value)}
          >
            <MenuItem value={2}>2 Spaces</MenuItem>
            <MenuItem value={4}>4 Spaces</MenuItem>
            <MenuItem value="tab">1 Tab</MenuItem>
          </Select>
        </FormControl>

        <ButtonGroup variant="contained" size="medium" sx={{ borderRadius: 2 }}>
          <Button startIcon={<FormatAlignLeftIcon />} onClick={handleFormat}>
            Format & Validate
          </Button>
          <Button onClick={handleMinify}>
            Minify JSON
          </Button>
        </ButtonGroup>
      </Box>

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Input JSON
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="Paste raw JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            slotProps={{
              input: {
                sx: { fontFamily: 'monospace', fontSize: '0.9rem' }
              }
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Output
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="Formatted JSON result..."
            value={output}
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.9rem', bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }
            }}
          />
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear}>
          Clear
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          disabled={!output}
        >
          Copy Result
        </Button>
      </Box>

      {/* Status Notifications */}
      {error && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 1, borderRadius: 2 }}>
          Valid JSON! JSON successfully formatted.
        </Alert>
      )}
    </Box>
  );
}
