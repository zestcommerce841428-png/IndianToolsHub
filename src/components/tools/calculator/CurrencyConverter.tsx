'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  MenuItem,
  IconButton,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // Rate representing how much of this currency equals 1 USD (e.g. 1 USD = 83.5 INR)
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToUSD: 1.0 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToUSD: 83.5 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToUSD: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToUSD: 156.0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUSD: 1.51 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rateToUSD: 1.37 },
];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    amount: number;
    fromCode: string;
    toCode: string;
    converted: number;
    rate: number;
    fromSymbol: string;
    toSymbol: string;
  } | null>(null);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleConvert = (customAmount?: number) => {
    setError('');
    setResult(null);

    const amtStr = customAmount !== undefined ? customAmount.toString() : amount;
    if (customAmount !== undefined) {
      setAmount(amtStr);
    }

    const parsedAmount = parseFloat(amtStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    const from = CURRENCIES.find((c) => c.code === fromCurrency);
    const to = CURRENCIES.find((c) => c.code === toCurrency);

    if (!from || !to) {
      setError('Selected currencies are not supported.');
      return;
    }

    // Conversion:
    // Amount in USD = Amount / from.rateToUSD
    // Converted Amount = Amount in USD * to.rateToUSD
    const amountInUSD = parsedAmount / from.rateToUSD;
    const convertedAmount = amountInUSD * to.rateToUSD;

    // Derived exchange rate (1 From = X To)
    const exchangeRate = to.rateToUSD / from.rateToUSD;

    setResult({
      amount: parsedAmount,
      fromCode: from.code,
      toCode: to.code,
      converted: parseFloat(convertedAmount.toFixed(4)),
      rate: parseFloat(exchangeRate.toFixed(4)),
      fromSymbol: from.symbol,
      toSymbol: to.symbol,
    });
  };

  const quickAmounts = [10, 50, 100, 500, 1000];

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', p: 1 }}>
      <Grid container spacing={3}>
        {/* Input Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Amount input */}
            <TextField
              label="Amount"
              placeholder="Enter amount to convert"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
            />

            {/* Currency Selects */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                select
                label="From"
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setResult(null);
                }}
                fullWidth
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <IconButton
                color="primary"
                onClick={handleSwap}
                title="Swap Currencies"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1.2,
                  bgcolor: 'grey.50',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <SwapHorizIcon />
              </IconButton>

              <TextField
                select
                label="To"
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setResult(null);
                }}
                fullWidth
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Quick Amounts */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                Quick Amounts:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quickAmounts.map((qAmt) => (
                  <Button
                    key={qAmt}
                    variant="outlined"
                    size="small"
                    onClick={() => handleConvert(qAmt)}
                    sx={{ py: 0.5, px: 1.5, fontSize: '0.8rem' }}
                  >
                    {fromCurrency === 'USD' ? '$' : fromCurrency === 'INR' ? '₹' : ''}
                    {qAmt}
                  </Button>
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleConvert()}
              startIcon={<CurrencyExchangeIcon />}
              sx={{ py: 1.2 }}
            >
              Convert Currency
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        {/* Results Panel */}
        <Grid size={{ xs: 12, md: 7 }}>
          {!result ? (
            <Paper
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'grey.50',
                borderRadius: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Select currencies and input an amount to view real-time conversion simulation values and rates.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Primary Conversion Result Card */}
              <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Converted Value
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: '"Poppins", sans-serif' }}>
                    {result.toSymbol}
                    {result.converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {result.amount} {result.fromCode} = {result.converted} {result.toCode}
                  </Typography>
                </CardContent>
              </Card>

              {/* Conversion rate details */}
              <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Exchange Rate Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  1 {result.fromCode} = <strong>{result.rate} {result.toCode}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1 {result.toCode} = <strong>{(1 / result.rate).toFixed(4)} {result.fromCode}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  💡 <em>Note: Simulated reference rates are configured statically. Actual exchange rates may vary slightly in real time.</em>
                </Typography>
              </Paper>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
