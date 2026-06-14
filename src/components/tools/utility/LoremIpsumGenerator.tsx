'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

export default function LoremIpsumGenerator() {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const rndWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  const rndSentence = () => {
    const n = 8 + Math.floor(Math.random() * 10);
    const w = [];
    for (let i = 0; i < n; i++) w.push(rndWord());
    return w[0].charAt(0).toUpperCase() + w[0].slice(1) + ' ' + w.slice(1).join(' ') + '.';
  };
  const rndPara = () => {
    const n = 4 + Math.floor(Math.random() * 4);
    const s = [];
    for (let i = 0; i < n; i++) s.push(rndSentence());
    return s.join(' ');
  };

  const handleGenerate = () => {
    const c = Math.min(100, Math.max(1, count));
    let out = '';
    if (type === 'words') {
      const w = [];
      for (let i = 0; i < c * 10; i++) w.push(rndWord());
      out = w.join(' ') + '.';
    } else if (type === 'sentences') {
      const s = [];
      for (let i = 0; i < c; i++) s.push(rndSentence());
      out = s.join(' ');
    } else {
      const p = [];
      for (let i = 0; i < c; i++) p.push(rndPara());
      out = p.join('\n\n');
    }
    setOutput(out);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    handleGenerate();
  }, [type, count]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} label="Type" onChange={(e) => setType(e.target.value as any)}>
            <MenuItem value="paragraphs">Paragraphs</MenuItem>
            <MenuItem value="sentences">Sentences</MenuItem>
            <MenuItem value="words">Words</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Count"
          type="number"
          size="small"
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          slotProps={{ htmlInput: { min: 1, max: 100 } }}
          sx={{ width: 100 }}
        />

        <Button variant="contained" color="primary" onClick={handleGenerate}>
          Generate
        </Button>
      </Box>

      {output && (
        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Generated Placeholder Text
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color={copied ? 'success' : 'primary'}
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: 'text.primary',
              fontFamily: 'inherit',
            }}
          >
            {output}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
