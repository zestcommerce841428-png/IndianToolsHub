'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, Divider, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TextCaseConverter() {
  const [text, setText] = useState('');

  const toUppercase = () => {
    setText(text.toUpperCase());
  };

  const toLowercase = () => {
    setText(text.toLowerCase());
  };

  const toTitleCase = () => {
    const titleCased = text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setText(titleCased);
  };

  const toSentenceCase = () => {
    if (!text) return;
    const sentenceCased = text
      .toLowerCase()
      .replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    setText(sentenceCased);
  };

  const toCapitalizedCase = () => {
    const capitalized = text
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');
    setText(capitalized);
  };

  const toAlternatingCase = () => {
    const alternating = text
      .split('')
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join('');
    setText(alternating);
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    }
  };

  const handleClear = () => {
    setText('');
  };

  const getStats = () => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return `${words} words | ${chars} characters`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Input box */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Enter Your Text
        </Typography>
        <TextField
          multiline
          rows={8}
          fullWidth
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right', fontWeight: 600 }}>
          {getStats()}
        </Typography>
      </Box>

      {/* Case Options */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Convert Options
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Button variant="outlined" fullWidth onClick={toUppercase} disabled={!text}>
              UPPERCASE
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Button variant="outlined" fullWidth onClick={toLowercase} disabled={!text}>
              lowercase
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Button variant="outlined" fullWidth onClick={toTitleCase} disabled={!text}>
              Title Case
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Button variant="outlined" fullWidth onClick={toSentenceCase} disabled={!text}>
              Sentence case
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Button variant="outlined" fullWidth onClick={toCapitalizedCase} disabled={!text}>
              Capitalize Words
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Button variant="outlined" fullWidth onClick={toAlternatingCase} disabled={!text}>
              aLtErNaTiNg CaSe
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Utilities */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear} disabled={!text}>
          Clear
        </Button>
        <Button variant="contained" color="secondary" startIcon={<ContentCopyIcon />} onClick={handleCopy} disabled={!text}>
          Copy Text
        </Button>
      </Stack>
    </Box>
  );
}
