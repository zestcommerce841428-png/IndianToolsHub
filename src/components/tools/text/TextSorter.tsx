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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SortIcon from '@mui/icons-material/Sort';

type SortType =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'num-asc'
  | 'num-desc'
  | 'length-asc'
  | 'length-desc'
  | 'shuffle';

export default function TextSorter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sortType, setSortType] = useState<SortType>('alpha-asc');
  const [trimLines, setTrimLines] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const handleSort = () => {
    if (!inputText) return;

    let lines = inputText.split(/\r?\n/);

    // Initial cleaning
    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }
    if (removeEmpty) {
      lines = lines.filter((l) => l !== '');
    }

    // Sort function
    lines.sort((a, b) => {
      switch (sortType) {
        case 'alpha-asc':
        case 'alpha-desc': {
          const valA = caseSensitive ? a : a.toLowerCase();
          const valB = caseSensitive ? b : b.toLowerCase();
          const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
          return sortType === 'alpha-asc' ? comparison : -comparison;
        }
        case 'num-asc':
        case 'num-desc': {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return sortType === 'num-asc' ? numA - numB : numB - numA;
        }
        case 'length-asc':
          return a.length - b.length;
        case 'length-desc':
          return b.length - a.length;
        default:
          return 0;
      }
    });

    // Handle shuffle separately since sort doesn't work well for randomizing
    if (sortType === 'shuffle') {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
    }

    setOutputText(lines.join('\n'));
    setAlertInfo({
      type: 'success',
      message: `Successfully sorted ${lines.length} lines!`,
    });
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Sorted text copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setAlertInfo(null);
  };

  const handleSortChange = (event: SelectChangeEvent<SortType>) => {
    setSortType(event.target.value as SortType);
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
            placeholder="Enter or paste text lines to sort..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Sorted Output
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
            placeholder="Your sorted text will appear here..."
            value={outputText}
          />
        </Box>
      </Box>

      {/* Sorting Control Options */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-type-label">Sorting Method</InputLabel>
              <Select
                labelId="sort-type-label"
                value={sortType}
                label="Sorting Method"
                onChange={handleSortChange}
              >
                <MenuItem value="alpha-asc">Alphabetical (A to Z)</MenuItem>
                <MenuItem value="alpha-desc">Alphabetical (Z to A)</MenuItem>
                <MenuItem value="num-asc">Numerical (Ascending)</MenuItem>
                <MenuItem value="num-desc">Numerical (Descending)</MenuItem>
                <MenuItem value="length-asc">Line Length (Short to Long)</MenuItem>
                <MenuItem value="length-desc">Line Length (Long to Short)</MenuItem>
                <MenuItem value="shuffle">Random / Shuffle</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={trimLines}
                  onChange={(e) => setTrimLines(e.target.checked)}
                  color="primary"
                />
              }
              label="Trim Lines"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  color="primary"
                  disabled={sortType.startsWith('num') || sortType === 'shuffle'}
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
              label="Remove Empty"
            />
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
          startIcon={<SortIcon />}
          onClick={handleSort}
          disabled={!inputText}
        >
          Sort
        </Button>
      </Box>
    </Box>
  );
}
