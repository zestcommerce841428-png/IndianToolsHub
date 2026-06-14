'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function NumberBaseConverter() {
  const [val, setVal] = useState<string>('255');
  const [base, setBase] = useState<number>(10);

  const [decimal, setDecimal] = useState<string>('255');
  const [binary, setBinary] = useState<string>('11111111');
  const [hex, setHex] = useState<string>('FF');
  const [octal, setOctal] = useState<string>('377');
  const [error, setError] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleConvert = () => {
    setError(null);
    const trimmed = val.trim();
    if (!trimmed) {
      setDecimal('');
      setBinary('');
      setHex('');
      setOctal('');
      return;
    }

    try {
      const parsed = parseInt(trimmed, base);
      if (isNaN(parsed)) {
        throw new Error('Invalid value for base ' + base);
      }
      setDecimal(parsed.toString(10));
      setBinary(parsed.toString(2));
      setHex(parsed.toString(16).toUpperCase());
      setOctal(parsed.toString(8));
    } catch (e: any) {
      setError('Invalid input format for the selected base.');
      setDecimal('Invalid');
      setBinary('Invalid');
      setHex('Invalid');
      setOctal('Invalid');
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (text === 'Invalid' || !text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  React.useEffect(() => {
    handleConvert();
  }, [val, base]);

  const outputs = [
    { label: 'Decimal (Base 10)', value: decimal, name: 'decimal' },
    { label: 'Binary (Base 2)', value: binary, name: 'binary' },
    { label: 'Hexadecimal (Base 16)', value: hex, name: 'hex' },
    { label: 'Octal (Base 8)', value: octal, name: 'octal' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Input Value"
          size="small"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="e.g. 255"
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Input Base</InputLabel>
          <Select value={base} label="Input Base" onChange={(e) => setBase(Number(e.target.value))}>
            <MenuItem value={10}>Decimal (10)</MenuItem>
            <MenuItem value={2}>Binary (2)</MenuItem>
            <MenuItem value={16}>Hexadecimal (16)</MenuItem>
            <MenuItem value={8}>Octal (8)</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleConvert}>
          Convert
        </Button>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {outputs.map((out) => (
          <Grid size={{ xs: 12, sm: 6 }} key={out.name}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  {out.label}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  color={copiedField === out.name ? 'success' : 'primary'}
                  startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                  onClick={() => handleCopy(out.value, out.name)}
                  sx={{ py: 0, minWidth: 'auto' }}
                >
                  {copiedField === out.name ? 'Copied' : 'Copy'}
                </Button>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  wordBreak: 'break-all',
                  color: out.value === 'Invalid' ? 'error.main' : 'primary.main',
                }}
              >
                {out.value || '—'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
