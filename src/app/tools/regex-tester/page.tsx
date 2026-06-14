'use client';

import React, { useState, useMemo } from 'react';
import {
  Container, Box, Typography, TextField, Paper, Chip, Alert,
  Button, FormControlLabel, Checkbox, Card, CardContent, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Match {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [testString, setTestString] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const getFlagString = () => {
    let flagStr = '';
    if (flags.global) flagStr += 'g';
    if (flags.caseInsensitive) flagStr += 'i';
    if (flags.multiline) flagStr += 'm';
    if (flags.dotAll) flagStr += 's';
    if (flags.unicode) flagStr += 'u';
    if (flags.sticky) flagStr += 'y';
    return flagStr;
  };

  const regexResult = useMemo(() => {
    if (!pattern) {
      return {
        isValid: false,
        matches: [] as Match[],
        test: false,
        replaced: '',
        highlightedText: testString,
        error: '',
      };
    }

    try {
      const regex = new RegExp(pattern, getFlagString());
      const matches: Match[] = [];
      let match;

      if (flags.global) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      const test = regex.test(testString);
      const replaced = testString.replace(new RegExp(pattern, getFlagString()), replaceWith);

      // Highlight matches in text
      let highlightedText = testString;
      if (matches.length > 0) {
        const parts: string[] = [];
        let lastIndex = 0;

        matches.forEach((m, idx) => {
          parts.push(testString.substring(lastIndex, m.index));
          parts.push(`<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 2px; font-weight: 600;">${m.match}</mark>`);
          lastIndex = m.index + m.match.length;
        });
        parts.push(testString.substring(lastIndex));
        highlightedText = parts.join('');
      }

      return { isValid: true, matches, test, replaced, highlightedText, error: '' };
    } catch (err) {
      return {
        isValid: false,
        matches: [] as Match[],
        test: false,
        replaced: '',
        highlightedText: testString,
        error: err instanceof Error ? err.message : 'Invalid regex pattern',
      };
    }
  }, [pattern, flags, testString, replaceWith]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const commonPatterns = [
    { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { label: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { label: 'Phone (US)', pattern: '\\(\\d{3}\\)\\s?\\d{3}-\\d{4}' },
    { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { label: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { label: 'Hex Color', pattern: '#[0-9A-Fa-f]{6}\\b' },
  ];

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CodeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Regex Tester & Visualizer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test regular expressions in real-time with match highlighting and replacement preview
          </Typography>
        </Box>

        {/* Regex Pattern Input */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Regular Expression Pattern
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern (e.g., \d{3}-\d{3}-\d{4})"
              error={!!regexResult.error}
              helperText={regexResult.error}
              slotProps={{
                input: {
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>/</Typography>,
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ color: 'text.secondary' }}>/{getFlagString()}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(pattern)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ),
                },
              }}
            />
          </Box>

          {/* Flags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={flags.global} onChange={(e) => setFlags({ ...flags, global: e.target.checked })} />}
              label="Global (g)"
            />
            <FormControlLabel
              control={<Checkbox checked={flags.caseInsensitive} onChange={(e) => setFlags({ ...flags, caseInsensitive: e.target.checked })} />}
              label="Case Insensitive (i)"
            />
            <FormControlLabel
              control={<Checkbox checked={flags.multiline} onChange={(e) => setFlags({ ...flags, multiline: e.target.checked })} />}
              label="Multiline (m)"
            />
            <FormControlLabel
              control={<Checkbox checked={flags.dotAll} onChange={(e) => setFlags({ ...flags, dotAll: e.target.checked })} />}
              label="Dot All (s)"
            />
            <FormControlLabel
              control={<Checkbox checked={flags.unicode} onChange={(e) => setFlags({ ...flags, unicode: e.target.checked })} />}
              label="Unicode (u)"
            />
          </Box>

          {/* Common Patterns */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Common Patterns:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonPatterns.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  onClick={() => setPattern(p.pattern)}
                  size="small"
                  clickable
                />
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Test String Input */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test String
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against the regex pattern..."
          />
        </Paper>

        {/* Results */}
        {pattern && testString && regexResult.isValid && (
          <>
            {/* Match Status */}
            <Alert
              severity={regexResult.test ? 'success' : 'info'}
              icon={regexResult.test ? <CheckCircleIcon /> : <ErrorIcon />}
              sx={{ mb: 3 }}
            >
              {regexResult.test
                ? `✅ Pattern matched! Found ${regexResult.matches.length} match${regexResult.matches.length !== 1 ? 'es' : ''}`
                : '❌ No matches found'}
            </Alert>

            {/* Highlighted Text */}
            {regexResult.matches.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Highlighted Matches
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: regexResult.highlightedText }}
                />
              </Paper>
            )}

            {/* Matches Table */}
            {regexResult.matches.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Match Details
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Match</strong></TableCell>
                        <TableCell><strong>Index</strong></TableCell>
                        <TableCell><strong>Groups</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {regexResult.matches.map((m, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.match}</TableCell>
                          <TableCell>{m.index}</TableCell>
                          <TableCell>{m.groups.length > 0 ? m.groups.join(', ') : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Replace Function */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Replace Function
              </Typography>
              <TextField
                fullWidth
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                placeholder="Enter replacement text (use $1, $2 for captured groups)"
                sx={{ mb: 2 }}
              />
              {replaceWith && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Result:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#e8f5e9',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {regexResult.replaced}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(regexResult.replaced)}
                    sx={{ mt: 1 }}
                  >
                    Copy Result
                  </Button>
                </Box>
              )}
            </Paper>
          </>
        )}

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Copied to clipboard!
          </Alert>
        )}

        {/* Quick Reference */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Reference
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Character Classes</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>\d - Digit (0-9)</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>\w - Word character</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>\s - Whitespace</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>. - Any character</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Quantifiers</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>* - 0 or more</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>+ - 1 or more</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>? - 0 or 1</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'{'}n,m{'}'} - Between n and m</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Container>
        <Footer />
      </Box>
    </ProtectedRoute>
  );
}
