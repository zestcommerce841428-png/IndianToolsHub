'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

interface MatchSegment {
  text: string;
  isMatch: boolean;
  index: number;
}

interface MatchDetail {
  value: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [tabIndex, setTabIndex] = useState(0); 
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');
  
  const [globalFlag, setGlobalFlag] = useState(true);
  const [caseFlag, setCaseFlag] = useState(false);
  const [multilineFlag, setMultilineFlag] = useState(false);
  const [dotAllFlag, setDotAllFlag] = useState(false);
  const [unicodeFlag, setUnicodeFlag] = useState(false);

  const [alertInfo, setAlertInfo] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const flags = useMemo(() => {
    let f = '';
    if (globalFlag) f += 'g';
    if (caseFlag) f += 'i';
    if (multilineFlag) f += 'm';
    if (dotAllFlag) f += 's';
    if (unicodeFlag) f += 'u';
    return f;
  }, [globalFlag, caseFlag, multilineFlag, dotAllFlag, unicodeFlag]);

  const regexError = useMemo(() => {
    if (!pattern) return null;
    try {
      new RegExp(pattern, flags);
      return null;
    } catch (e: any) {
      return e.message || 'Invalid regular expression';
    }
  }, [pattern, flags]);

  const matches = useMemo((): MatchDetail[] => {
    if (!pattern || regexError || !testString) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const list: MatchDetail[] = [];

      if (flags.includes('g')) {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(testString)) !== null) {
          list.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1).map((g) => g || ''),
          });
          if (match[0].length === 0) {
            regex.lastIndex++; 
          }
        }
      } else {
        const match = testString.match(regex);
        if (match && match.index !== undefined) {
          list.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1).map((g) => g || ''),
          });
        }
      }
      return list;
    } catch (_) {
      return [];
    }
  }, [pattern, flags, testString, regexError]);

  const highlightedSegments = useMemo((): MatchSegment[] => {
    if (!pattern || regexError || !testString) {
      return [{ text: testString, isMatch: false, index: 0 }];
    }

    try {
      const regex = new RegExp(pattern, flags);
      const segments: MatchSegment[] = [];
      let lastIndex = 0;

      if (flags.includes('g')) {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(testString)) !== null) {
          const index = match.index;
          const matchText = match[0];

          if (index > lastIndex) {
            segments.push({
              text: testString.slice(lastIndex, index),
              isMatch: false,
              index: lastIndex,
            });
          }

          segments.push({
            text: matchText,
            isMatch: true,
            index: index,
          });

          lastIndex = index + matchText.length;
          if (matchText.length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = testString.match(regex);
        if (match && match.index !== undefined) {
          const index = match.index;
          const matchText = match[0];
          if (index > 0) {
            segments.push({
              text: testString.slice(0, index),
              isMatch: false,
              index: 0,
            });
          }
          segments.push({
            text: matchText,
            isMatch: true,
            index: index,
          });
          lastIndex = index + matchText.length;
        }
      }

      if (lastIndex < testString.length) {
        segments.push({
          text: testString.slice(lastIndex),
          isMatch: false,
          index: lastIndex,
        });
      }

      return segments;
    } catch (_) {
      return [{ text: testString, isMatch: false, index: 0 }];
    }
  }, [pattern, flags, testString, regexError]);

  const replacedString = useMemo(() => {
    if (!pattern || regexError || !testString) return testString;
    try {
      const regex = new RegExp(pattern, flags);
      return testString.replace(regex, replacement);
    } catch (_) {
      return testString;
    }
  }, [pattern, flags, testString, replacement, regexError]);

  const handleCopyReplacement = () => {
    if (replacedString) {
      navigator.clipboard.writeText(replacedString);
      setAlertInfo({ type: 'info', message: 'Replaced text copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setReplacement('');
    setAlertInfo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<FindInPageIcon />} label="Test & Match" iconPosition="start" />
        <Tab icon={<CompareArrowsIcon />} label="Replace" iconPosition="start" />
      </Tabs>

      {/* Pattern and Flags Input */}
      <Box sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 15 }}>
              /
            </Typography>
            <TextField
              fullWidth
              label="Expression Pattern"
              placeholder="e.g. ([A-Z]+)\d+"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              error={!!regexError}
              helperText={regexError}
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace' },
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              /{flags}
            </Typography>
          </Box>

          {/* Flags Checklist */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox size="small" checked={globalFlag} onChange={(e) => setGlobalFlag(e.target.checked)} />}
              label={<Typography variant="body2">global (g)</Typography>}
            />
            <FormControlLabel
              control={<Checkbox size="small" checked={caseFlag} onChange={(e) => setCaseFlag(e.target.checked)} />}
              label={<Typography variant="body2">case insensitive (i)</Typography>}
            />
            <FormControlLabel
              control={<Checkbox size="small" checked={multilineFlag} onChange={(e) => setMultilineFlag(e.target.checked)} />}
              label={<Typography variant="body2">multiline (m)</Typography>}
            />
            <FormControlLabel
              control={<Checkbox size="small" checked={dotAllFlag} onChange={(e) => setDotAllFlag(e.target.checked)} />}
              label={<Typography variant="body2">dotAll (s)</Typography>}
            />
            <FormControlLabel
              control={<Checkbox size="small" checked={unicodeFlag} onChange={(e) => setUnicodeFlag(e.target.checked)} />}
              label={<Typography variant="body2">unicode (u)</Typography>}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Testing Areas */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Test String Input */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Test String
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Type your test string here to match against the pattern..."
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
          />
        </Box>

        {/* Tab 0: Highlight view */}
        {tabIndex === 0 && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Visual Match Highlight ({matches.length} matches)
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: 240,
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                bgcolor: 'background.paper',
                borderRadius: 2,
              }}
            >
              {highlightedSegments.map((segment, idx) =>
                segment.isMatch ? (
                  <Box
                    key={idx}
                    component="mark"
                    sx={{
                      bgcolor: 'rgba(253, 224, 71, 0.4)',
                      borderBottom: '2px solid rgb(234, 179, 8)',
                      color: 'inherit',
                    }}
                  >
                    {segment.text}
                  </Box>
                ) : (
                  <span key={idx}>{segment.text}</span>
                )
              )}
            </Paper>
          </Box>
        )}

        {/* Tab 1: Replace view */}
        {tabIndex === 1 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Replacement String
              </Typography>
              <TextField
                fullWidth
                placeholder="Replacement string (e.g. $1, *, blank)"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                size="small"
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Replaced Result
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyReplacement}
                  disabled={!replacedString}
                >
                  Copy Result
                </Button>
              </Box>
              <TextField
                multiline
                rows={6}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                value={replacedString}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Captured Groups Table (Only in Tab 0) */}
      {tabIndex === 0 && matches.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Detailed Match Captures
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell width="10%" sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell width="15%" sx={{ fontWeight: 600 }}>Index</TableCell>
                  <TableCell width="40%" sx={{ fontWeight: 600 }}>Match Value</TableCell>
                  <TableCell width="35%" sx={{ fontWeight: 600 }}>Captured Groups</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{match.index}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{match.value}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: 'text.secondary' }}>
                      {match.groups.length > 0
                        ? match.groups.map((g, i) => `$${i + 1}: "${g}"`).join(', ')
                        : 'none'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Divider />

      {/* Action footer */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClear}
          disabled={!pattern && !testString && !replacement}
        >
          Clear Fields
        </Button>
      </Box>
    </Box>
  );
}
