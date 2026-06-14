'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';

type SpaceMode = 'percent' | 'plus';
type EncodeMode = 'component' | 'full';

interface QueryParam {
  key: string;
  value: string;
}

export default function UrlEncoderDecoder() {
  const [tabIndex, setTabIndex] = useState(0); 
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [spaceMode, setSpaceMode] = useState<SpaceMode>('percent');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('component');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const handleProcess = () => {
    if (!inputText) return;
    setAlertInfo(null);
    setQueryParams([]);

    try {
      if (tabIndex === 0) {
        let encoded = '';
        if (encodeMode === 'component') {
          encoded = encodeURIComponent(inputText);
        } else {
          encoded = encodeURI(inputText);
        }

        if (spaceMode === 'plus') {
          encoded = encoded.replace(/%20/g, '+');
        }

        setOutputText(encoded);
        setAlertInfo({ type: 'success', message: 'URL successfully encoded!' });
      } else {
        let toDecode = inputText;
        if (spaceMode === 'plus') {
          toDecode = toDecode.replace(/\+/g, ' ');
        }

        const decoded = decodeURIComponent(toDecode);
        setOutputText(decoded);

        try {
          const urlString = decoded.includes('?') ? decoded : `?${decoded}`;
          const searchParams = new URLSearchParams(urlString.substring(urlString.indexOf('?')));
          const paramsList: QueryParam[] = [];
          searchParams.forEach((value, key) => {
            paramsList.push({ key, value });
          });
          if (paramsList.length > 0) {
            setQueryParams(paramsList);
          }
        } catch (_) {
          // Ignore
        }

        setAlertInfo({ type: 'success', message: 'URL successfully decoded!' });
      }
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: 'Processing failed. Check if your input contains valid percent-encoding sequence.',
      });
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Output copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setQueryParams([]);
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
        onChange={(_, val) => {
          setTabIndex(val);
          if (outputText && !inputText) {
            setInputText(outputText);
            setOutputText('');
          } else {
            setOutputText('');
          }
          setQueryParams([]);
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<LinkIcon />} label="Encode" iconPosition="start" />
        <Tab icon={<LinkIcon />} label="Decode" iconPosition="start" />
      </Tabs>

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Text / URL to Encode' : 'Encoded URL to Decode'}
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder={
              tabIndex === 0
                ? 'Enter text or URL here (e.g. https://google.com/search?q=query text)'
                : 'Enter encoded URL here (e.g. https%3A%2F%2Fgoogle.com%2Fsearch%3Fq%3Dquery%20text)'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Encoded Result' : 'Decoded Result'}
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            placeholder="Result will appear here..."
            value={outputText}
          />
        </Box>
      </Box>

      {/* Advanced Options */}
      <Box sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
          {tabIndex === 0 && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Encoding Mode
              </Typography>
              <RadioGroup
                row
                value={encodeMode}
                onChange={(e) => setEncodeMode(e.target.value as EncodeMode)}
              >
                <FormControlLabel
                  value="component"
                  control={<Radio size="small" />}
                  label="URI Component (Strict)"
                />
                <FormControlLabel
                  value="full"
                  control={<Radio size="small" />}
                  label="Full URI (Preserve Path)"
                />
              </RadioGroup>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                URI Component encodes protocol symbols (e.g. ://, &). Full URI keeps standard URL paths unencoded.
              </Typography>
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Space Character Encoding
            </Typography>
            <RadioGroup
              row
              value={spaceMode}
              onChange={(e) => setSpaceMode(e.target.value as SpaceMode)}
            >
              <FormControlLabel
                value="percent"
                control={<Radio size="small" />}
                label="Encode Space as %20"
              />
              <FormControlLabel
                value="plus"
                control={<Radio size="small" />}
                label="Encode Space as + (Form Data)"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      {/* Query Parameters Breakdown Table */}
      {tabIndex === 1 && queryParams.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Parsed Query Parameters ({queryParams.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Parameter Key</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Decoded Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queryParams.map((param, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {param.key}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                      {param.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          startIcon={<LinkIcon />}
          onClick={handleProcess}
          disabled={!inputText}
        >
          {tabIndex === 0 ? 'Encode URL' : 'Decode URL'}
        </Button>
      </Box>
    </Box>
  );
}
