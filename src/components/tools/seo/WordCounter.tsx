'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

export default function WordCounter() {
  const [text, setText] = useState<string>('');
  const [stats, setStats] = useState({
    words: 0,
    charsWithSpaces: 0,
    charsNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0, // in minutes
    speakingTime: 0, // in minutes
    topWords: [] as { word: string; count: number }[],
  });

  const analyzeText = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setStats({
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0,
        topWords: [],
      });
      return;
    }

    // Characters
    const charsWithSpaces = val.length;
    const charsNoSpaces = val.replace(/\s/g, '').length;

    // Words
    const wordsArray = trimmed.split(/\s+/).filter(Boolean);
    const words = wordsArray.length;

    // Sentences
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Paragraphs
    const paragraphs = val.split(/\n+/).filter(p => p.trim().length > 0).length;

    // Estimated times
    const readingTime = Math.ceil(words / 200); // 200 wpm average
    const speakingTime = Math.ceil(words / 130); // 130 wpm average

    // Top words (ignoring case, filtering down, simple count)
    const wordCounts: Record<string, number> = {};
    const excludeList = new Set(['the', 'a', 'to', 'of', 'in', 'is', 'that', 'it', 'on', 'for', 'as', 'with', 'and', 'or', 'an']);
    wordsArray.forEach((w) => {
      const cleaned = w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"]/g, '');
      if (cleaned && !excludeList.has(cleaned) && cleaned.length > 1) {
        wordCounts[cleaned] = (wordCounts[cleaned] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, 5);

    setStats({
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      topWords,
    });
  };

  useEffect(() => {
    analyzeText(text);
  }, [text]);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Copied text to clipboard!');
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      alert('Could not read from clipboard. Please paste manually.');
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Editor Controls */}
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title="Paste from Clipboard">
          <Button variant="outlined" startIcon={<ContentPasteIcon />} onClick={handlePaste} size="small">
            Paste
          </Button>
        </Tooltip>
        <Tooltip title="Copy Text">
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy} size="small" disabled={!text}>
            Copy
          </Button>
        </Tooltip>
        <Tooltip title="Clear Text">
          <IconButton onClick={handleClear} color="error" disabled={!text}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={3}>
        {/* Editor Area */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            label="Type or Paste Your Content"
            placeholder="Start typing your text here..."
            multiline
            rows={12}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
        </Grid>

        {/* Real-time stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Card variant="outlined" sx={{ flexGrow: 1 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QueryStatsIcon color="primary" /> Character & Word Counts
                </Typography>
                
                <Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Words</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.words}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Paragraphs</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.paragraphs}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Characters (all)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.charsWithSpaces}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Characters (no space)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.charsNoSpaces}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Sentences</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.sentences}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Estimated Time
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Reading Time</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{stats.readingTime} min</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Speaking Time</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{stats.speakingTime} min</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Density & Word Frequencies */}
      {stats.words > 0 && stats.topWords.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Keyword Density (Top Words)
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Word</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Occurrences</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Density</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.topWords.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{item.word}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{((item.count / stats.words) * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
