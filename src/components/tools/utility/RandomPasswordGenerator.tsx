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
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Stack,
  Slider,
  Alert,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SecurityIcon from '@mui/icons-material/Security';
import DialpadIcon from '@mui/icons-material/Dialpad';
import DeleteIcon from '@mui/icons-material/Delete';

export default function RandomPasswordGenerator() {
  const [tabValue, setTabValue] = useState<number>(0);

  // Password Generator States
  const [passwordLength, setPasswordLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [passwordResult, setPasswordResult] = useState<string>('');
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number; // 0 to 100
    label: string;
    color: 'error' | 'warning' | 'info' | 'success';
  }>({ score: 0, label: 'Very Weak', color: 'error' });

  // Number Generator States
  const [minNum, setMinNum] = useState<number>(1);
  const [maxNum, setMaxNum] = useState<number>(100);
  const [numQty, setNumQty] = useState<number>(5);
  const [allowDupes, setAllowDupes] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [numbersResult, setNumbersResult] = useState<number[]>([]);
  const [numberError, setNumberError] = useState<string | null>(null);

  // Character pools
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+[]{}|;:,.<>?';
  const SIMILAR_CHARS = /[il1Lo0OIS5B8]/g;

  // 1. Password Generation Logic
  const generatePassword = () => {
    let pool = '';
    if (useUpper) pool += UPPERCASE;
    if (useLower) pool += LOWERCASE;
    if (useNumbers) pool += NUMBERS;
    if (useSymbols) pool += SYMBOLS;

    if (excludeSimilar) {
      pool = pool.replace(SIMILAR_CHARS, '');
    }

    if (!pool) {
      setPasswordResult('');
      return;
    }

    let password = '';
    // Use Web Crypto API for secure random values
    const randomBuffer = new Uint32Array(passwordLength);
    window.crypto.getRandomValues(randomBuffer);

    for (let i = 0; i < passwordLength; i++) {
      const index = randomBuffer[i] % pool.length;
      password += pool.charAt(index);
    }

    setPasswordResult(password);
    setPasswordHistory((prev) => [password, ...prev.slice(0, 4)]);
  };

  // Evaluate Password Strength
  useEffect(() => {
    if (!passwordResult) {
      setPasswordStrength({ score: 0, label: 'No Password', color: 'error' });
      return;
    }

    let poolSize = 0;
    if (useUpper) poolSize += UPPERCASE.length;
    if (useLower) poolSize += LOWERCASE.length;
    if (useNumbers) poolSize += NUMBERS.length;
    if (useSymbols) poolSize += SYMBOLS.length;
    if (excludeSimilar) poolSize -= 12; // approximate simplification

    const entropy = passwordLength * Math.log2(Math.max(1, poolSize));

    let score = 0;
    let label = 'Very Weak';
    let color: 'error' | 'warning' | 'info' | 'success' = 'error';

    if (entropy < 30) {
      score = 20;
      label = 'Very Weak 🔴';
      color = 'error';
    } else if (entropy < 55) {
      score = 45;
      label = 'Weak ⚠️';
      color = 'warning';
    } else if (entropy < 80) {
      score = 70;
      label = 'Good / Medium 🟡';
      color = 'info';
    } else if (entropy < 110) {
      score = 90;
      label = 'Strong 🟢';
      color = 'success';
    } else {
      score = 100;
      label = 'Very Strong 💪';
      color = 'success';
    }

    setPasswordStrength({ score, label, color });
  }, [passwordResult, passwordLength, useUpper, useLower, useNumbers, useSymbols, excludeSimilar]);

  useEffect(() => {
    if (tabValue === 0) {
      generatePassword();
    }
  }, [tabValue]);

  // 2. Number Generation Logic
  const generateNumbers = () => {
    setNumberError(null);
    setNumbersResult([]);

    const min = Math.ceil(minNum);
    const max = Math.floor(maxNum);

    if (isNaN(min) || isNaN(max)) {
      setNumberError('Please enter valid minimum and maximum boundaries.');
      return;
    }

    if (min > max) {
      setNumberError('Minimum boundary cannot be greater than Maximum boundary.');
      return;
    }

    const range = max - min + 1;
    if (!allowDupes && numQty > range) {
      setNumberError(`Cannot generate ${numQty} unique numbers when the range only contains ${range} numbers. Check "Allow Duplicates" or shrink the Quantity.`);
      return;
    }

    const results: number[] = [];
    
    if (!allowDupes) {
      // Create a pool of all numbers in range and shuffle/sample
      const pool = Array.from({ length: range }, (_, i) => min + i);
      // Modern Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      results.push(...pool.slice(0, numQty));
    } else {
      for (let i = 0; i < numQty; i++) {
        const num = Math.floor(Math.random() * range) + min;
        results.push(num);
      }
    }

    if (sortOrder === 'asc') {
      results.sort((a, b) => a - b);
    } else if (sortOrder === 'desc') {
      results.sort((a, b) => b - a);
    }

    setNumbersResult(results);
  };

  const handleCopy = (val: string) => {
    if (val) {
      navigator.clipboard.writeText(val);
      alert('Copied to clipboard!');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="Password Generator" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Number Generator" icon={<DialpadIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Password Generator Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Settings
                </Typography>

                <Box sx={{ px: 1 }}>
                  <Typography id="len-slider" variant="caption" color="text.secondary">
                    Password Length: {passwordLength} characters
                  </Typography>
                  <Slider
                    aria-labelledby="len-slider"
                    value={passwordLength}
                    min={6}
                    max={64}
                    step={1}
                    onChange={(_, val) => setPasswordLength(val as number)}
                  />
                </Box>

                <Divider />

                <Stack spacing={1.5}>
                  <FormControlLabel
                    control={<Checkbox checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />}
                    label="Include Uppercase Letters (A-Z)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={useLower} onChange={(e) => setUseLower(e.target.checked)} />}
                    label="Include Lowercase Letters (a-z)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />}
                    label="Include Numbers (0-9)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />}
                    label="Include Symbols (!@#$%...)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} />}
                    label="Exclude Ambiguous/Similar Characters (i, l, 1, o, 0, O)"
                  />
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AutorenewIcon />}
                  onClick={generatePassword}
                  disabled={!useUpper && !useLower && !useNumbers && !useSymbols}
                >
                  Generate Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              {/* Output Display */}
              <Card variant="outlined" sx={{ bgcolor: 'rgba(37, 99, 235, 0.01)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Generated Password
                  </Typography>

                  {passwordResult ? (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          wordBreak: 'break-all',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: passwordLength > 24 ? '1rem' : '1.2rem',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {passwordResult}
                        </Typography>
                        <IconButton
                          onClick={() => handleCopy(passwordResult)}
                          color="primary"
                          sx={{ ml: 1, flexShrink: 0 }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>

                      {/* Password Strength Meter */}
                      <Box>
                        <Stack direction="row" sx={{ mb: 0.5, justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Strength Rating:
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }} color={passwordStrength.color}>
                            {passwordStrength.label}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.score}
                          color={passwordStrength.color}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Select options and click Generate.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Password Session History */}
              {passwordHistory.length > 1 && (
                <Card variant="outlined">
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recent History
                      </Typography>
                      <IconButton size="small" onClick={() => setPasswordHistory([])} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <List dense>
                      {passwordHistory.slice(1).map((pwd, idx) => (
                        <ListItem
                          key={idx}
                          secondaryAction={
                            <IconButton edge="end" size="small" onClick={() => handleCopy(pwd)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          }
                          sx={{ py: 0.5, px: 1 }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                {pwd}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Number Generator Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Number Range Configuration
                </Typography>

                {numberError && <Alert severity="error">{numberError}</Alert>}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Minimum (From)"
                      type="number"
                      fullWidth
                      value={minNum}
                      onChange={(e) => setMinNum(Number(e.target.value))}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Maximum (To)"
                      type="number"
                      fullWidth
                      value={maxNum}
                      onChange={(e) => setMaxNum(Number(e.target.value))}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Quantity of Numbers"
                      type="number"
                      fullWidth
                      value={numQty}
                      onChange={(e) => setNumQty(Math.max(1, Number(e.target.value)))}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={3}>
                      <FormControlLabel
                        control={<Checkbox checked={allowDupes} onChange={(e) => setAllowDupes(e.target.checked)} />}
                        label="Allow Duplicates"
                      />
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography id="sort-order-label" variant="caption" color="text.secondary">
                      Sort Output Order
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label="No Sorting"
                        onClick={() => setSortOrder('none')}
                        color={sortOrder === 'none' ? 'primary' : 'default'}
                        variant={sortOrder === 'none' ? 'filled' : 'outlined'}
                      />
                      <Chip
                        label="Ascending (Low-High)"
                        onClick={() => setSortOrder('asc')}
                        color={sortOrder === 'asc' ? 'primary' : 'default'}
                        variant={sortOrder === 'asc' ? 'filled' : 'outlined'}
                      />
                      <Chip
                        label="Descending (High-Low)"
                        onClick={() => setSortOrder('desc')}
                        color={sortOrder === 'desc' ? 'primary' : 'default'}
                        variant={sortOrder === 'desc' ? 'filled' : 'outlined'}
                      />
                    </Stack>
                  </Grid>
                </Grid>

                <Button variant="contained" color="secondary" startIcon={<AutorenewIcon />} onClick={generateNumbers}>
                  Generate Numbers
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Generated Numbers
              </Typography>

              {numbersResult.length > 0 ? (
                <Stack spacing={3} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      justifyContent: 'center',
                    }}
                  >
                    {numbersResult.map((num, idx) => (
                      <Chip
                        key={idx}
                        label={num}
                        sx={{ fontSize: '1.1rem', fontWeight: 700, p: 2 }}
                        color="secondary"
                      />
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(numbersResult.join(', '))}
                  >
                    Copy List (Comma-Separated)
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Set limits and click Generate to see random numbers.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
