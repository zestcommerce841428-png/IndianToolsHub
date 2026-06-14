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
  FormControl,
  FormLabel,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';

export default function HtmlEntityCodec() {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Encode, 1 = Decode
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [entityType, setEntityType] = useState<'named' | 'numeric'>('named');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Helper: encodes string to HTML Entities
  const encodeHtml = (str: string): string => {
    if (entityType === 'named') {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    } else {
      // Numeric decimal format e.g. &#65;
      return str
        .split('')
        .map((char) => `&#${char.charCodeAt(0)};`)
        .join('');
    }
  };

  // Helper: decodes HTML Entities back to string
  const decodeHtml = (str: string): string => {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent || div.innerText || '';
  };

  const handleProcess = () => {
    if (!inputText) return;
    setAlertInfo(null);
    try {
      if (tabIndex === 0) {
        const result = encodeHtml(inputText);
        setOutputText(result);
        setAlertInfo({ type: 'success', message: 'Successfully encoded text to HTML Entities!' });
      } else {
        const result = decodeHtml(inputText);
        setOutputText(result);
        setAlertInfo({ type: 'success', message: 'Successfully decoded HTML Entities to text!' });
      }
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err.message || 'Operation failed.' });
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
          handleClear();
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<CodeIcon />} label="Encode" iconPosition="start" />
        <Tab icon={<DownloadIcon />} label="Decode" iconPosition="start" />
      </Tabs>

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Text to Encode' : 'HTML Entities to Decode'}
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder={
              tabIndex === 0
                ? 'Enter text containing symbols like <, >, &, ", etc...'
                : 'Enter HTML entities like &lt;div&gt; or &#60;div&#62; here...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'HTML Entities Output' : 'Decoded Text Output'}
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

      {/* Control Options */}
      {tabIndex === 0 && (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Entity Style</FormLabel>
            <RadioGroup
              row
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as 'named' | 'numeric')}
            >
              <FormControlLabel value="named" control={<Radio />} label="Named (e.g. &lt; → &amp;lt;)" />
              <FormControlLabel value="numeric" control={<Radio />} label="Numeric Decimal (e.g. A → &amp;#65;)" />
            </RadioGroup>
          </FormControl>
        </Box>
      )}

      <Divider />

      {/* Actions */}
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
          startIcon={<CodeIcon />}
          onClick={handleProcess}
          disabled={!inputText}
        >
          {tabIndex === 0 ? 'Encode' : 'Decode'}
        </Button>
      </Box>
    </Box>
  );
}
