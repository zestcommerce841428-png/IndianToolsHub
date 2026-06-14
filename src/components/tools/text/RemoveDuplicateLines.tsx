'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export default function RemoveDuplicateLines() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [trimLines, setTrimLines] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [stats, setStats] = useState<{
    original: number;
    removed: number;
    remaining: number;
  } | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const handleProcess = () => {
    if (!inputText) return;

    const lines = inputText.split(/\r?\n/);
    const originalCount = lines.length;

    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      let processLine = line;
      if (trimLines) {
        processLine = processLine.trim();
      }

      if (removeEmpty && processLine === '') {
        continue;
      }

      const compareKey = caseSensitive ? processLine : processLine.toLowerCase();

      if (!seen.has(compareKey)) {
        seen.add(compareKey);
        uniqueLines.push(line);
      }
    }

    const resultText = uniqueLines.join('\n');
    setOutputText(resultText);

    const remainingCount = uniqueLines.length;
    const removedCount = originalCount - remainingCount;

    setStats({
      original: originalCount,
      removed: removedCount,
      remaining: remainingCount,
    });

    setAlertInfo({
      type: 'success',
      message: `Successfully processed! Removed ${removedCount} duplicate line(s).`,
    });
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Output text copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setStats(null);
    setAlertInfo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Input and Output side-by-side on desktop, stacked on mobile */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Input Text
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="Enter or paste your text lines here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Output Text (Cleaned)
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
            placeholder="Your deduplicated text will appear here..."
            value={outputText}
          />
        </Box>
      </Box>

      {/* Options section */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Deduplication Options
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                color="primary"
              />
            }
            label="Trim Whitespace"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                color="primary"
              />
            }
            label="Case Sensitive"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                color="primary"
              />
            }
            label="Remove Empty Lines"
          />
        </Box>
      </Box>

      {/* Stats section */}
      {stats && (
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Lines Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Original Lines
              </Typography>
              <Typography variant="h6">{stats.original}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ color: 'error.main' }}>
                Duplicates Removed
              </Typography>
              <Typography variant="h6" sx={{ color: 'error.main' }}>
                {stats.removed}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ color: 'success.main' }}>
                Remaining Lines
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main' }}>
                {stats.remaining}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

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
          startIcon={<FilterAltIcon />}
          onClick={handleProcess}
          disabled={!inputText}
        >
          Remove Duplicates
        </Button>
      </Box>
    </Box>
  );
}
