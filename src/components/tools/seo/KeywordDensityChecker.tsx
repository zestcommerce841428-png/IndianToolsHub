'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Checkbox,
  Stack,
  Alert,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

interface KeywordStat {
  phrase: string;
  count: number;
  density: number;
}

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
  'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn'
]);

export default function KeywordDensityChecker() {
  const [text, setText] = useState<string>('');
  const [targetKeyword, setTargetKeyword] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [ignoreStopWords, setIgnoreStopWords] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  const [results, setResults] = useState<{
    totalWords: number;
    targetDensity: number | null;
    targetCount: number | null;
    oneWordStats: KeywordStat[];
    twoWordStats: KeywordStat[];
    threeWordStats: KeywordStat[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    const trimmedText = text.trim();

    if (!trimmedText) {
      setError('Please enter some text to analyze.');
      return;
    }

    // Clean text: strip punctuation but preserve spaces
    const cleanText = trimmedText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
      .replace(/\s+/g, ' ');

    const rawWords = cleanText.split(' ').filter(word => word.length > 0);
    const totalWordsCount = rawWords.length;

    if (totalWordsCount === 0) {
      setError('No valid words found in the text.');
      return;
    }

    // 1. Target keyword density if provided
    let targetCnt = null;
    let targetDens = null;

    if (targetKeyword.trim()) {
      const keyword = targetKeyword.trim();
      const kwWords = keyword.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      const kwLength = kwWords.length;

      let kwMatchCount = 0;
      if (kwLength > 0) {
        for (let i = 0; i <= totalWordsCount - kwLength; i++) {
          let matches = true;
          for (let j = 0; j < kwLength; j++) {
            const wordA = rawWords[i + j];
            const wordB = kwWords[j];
            if (caseSensitive) {
              if (wordA !== wordB && wordA.toLowerCase() !== wordB) {
                // If checking case-sensitively, match exactly, or match query as case-insensitive if query is lowercase
                const queryCase = targetKeyword.split(/\s+/)[j];
                if (wordA !== queryCase) {
                  matches = false;
                  break;
                }
              }
            } else {
              if (wordA.toLowerCase() !== wordB.toLowerCase()) {
                matches = false;
                break;
              }
            }
          }
          if (matches) {
            kwMatchCount++;
          }
        }
      }

      targetCnt = kwMatchCount;
      targetDens = totalWordsCount > 0 ? (kwMatchCount / totalWordsCount) * 100 : 0;
    }

    // Helper to extract N-grams and return sorted stats
    const getNGrams = (words: string[], n: number): KeywordStat[] => {
      const frequencies: Record<string, number> = {};

      for (let i = 0; i <= words.length - n; i++) {
        const slice = words.slice(i, i + n);
        
        // If ignoring stop words, check if any word in the slice is a stop word (mostly for single/double words)
        if (ignoreStopWords) {
          if (n === 1 && STOP_WORDS.has(slice[0].toLowerCase())) continue;
          if (n > 1 && slice.every(w => STOP_WORDS.has(w.toLowerCase()))) continue;
        }

        const phrase = slice.join(' ');
        const key = caseSensitive ? phrase : phrase.toLowerCase();
        frequencies[key] = (frequencies[key] || 0) + 1;
      }

      const totalPossibleGrams = words.length - n + 1;
      if (totalPossibleGrams <= 0) return [];

      return Object.entries(frequencies)
        .map(([phrase, count]) => ({
          phrase,
          count,
          density: (count / totalWordsCount) * 100, // standard calculation uses total single words
        }))
        .sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase))
        .slice(0, 15); // limit to top 15
    };

    const oneWordStats = getNGrams(rawWords, 1);
    const twoWordStats = getNGrams(rawWords, 2);
    const threeWordStats = getNGrams(rawWords, 3);

    setResults({
      totalWords: totalWordsCount,
      targetCount: targetCnt,
      targetDensity: targetDens,
      oneWordStats,
      twoWordStats,
      threeWordStats,
    });
  };

  const renderStatsTable = (stats: KeywordStat[]) => {
    if (stats.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          No keywords or phrases found matching the filters.
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderStyle: 'solid' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Keyword/Phrase</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Count</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Density (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((stat, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{stat.phrase}</TableCell>
                <TableCell align="right">{stat.count}</TableCell>
                <TableCell align="right">{stat.density.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {/* Input Text Area */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Enter/Paste Text Content"
            multiline
            rows={8}
            fullWidth
            placeholder="Paste your article, blog post, or website text here to analyze its keyword density..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
        </Grid>

        {/* Target Keyword and settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Target Keyword (Optional)"
            placeholder="e.g. digital marketing"
            fullWidth
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={2} sx={{ height: '100%', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                />
              }
              label="Case Sensitive"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={ignoreStopWords}
                  onChange={(e) => setIgnoreStopWords(e.target.checked)}
                />
              }
              label="Ignore Stop Words"
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalculateIcon />}
            fullWidth
            size="large"
            onClick={handleCalculate}
          >
            Analyze Keyword Density
          </Button>
        </Grid>
      </Grid>

      {results && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Analysis Results
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Words
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {results.totalWords}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {results.targetCount !== null && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Target Keyword Occurrences
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {results.targetCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Target Keyword Density
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                        {results.targetDensity?.toFixed(2)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>

          {/* Detailed N-gram tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              aria-label="keyword length tabs"
            >
              <Tab label="Single Words (1-gram)" icon={<ZoomInIcon />} iconPosition="start" />
              <Tab label="Two Words (2-gram)" icon={<ZoomInIcon />} iconPosition="start" />
              <Tab label="Three Words (3-gram)" icon={<ZoomInIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box sx={{ mt: 1 }}>
            {activeTab === 0 && renderStatsTable(results.oneWordStats)}
            {activeTab === 1 && renderStatsTable(results.twoWordStats)}
            {activeTab === 2 && renderStatsTable(results.threeWordStats)}
          </Box>
        </Box>
      )}
    </Box>
  );
}
