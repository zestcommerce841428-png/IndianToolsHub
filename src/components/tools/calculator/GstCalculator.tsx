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
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';

interface GstResult {
  originalAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export default function GstCalculator() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('');
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [error, setError] = useState('');
  const [result, setResult] = useState<GstResult | null>(null);

  const commonSlabs = [5, 12, 18, 28];

  const handleGstTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'exclusive' | 'inclusive' | null
  ) => {
    if (newType !== null) {
      setGstType(newType);
      setResult(null);
      setError('');
    }
  };

  const calculateGst = (customRate?: number) => {
    setError('');
    setResult(null);

    const amt = parseFloat(amount);
    const rate = customRate !== undefined ? customRate : parseFloat(gstRate);

    if (customRate !== undefined) {
      setGstRate(customRate.toString());
    }

    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (isNaN(rate) || rate < 0) {
      setError('Please enter a valid GST rate.');
      return;
    }

    let originalAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (gstType === 'exclusive') {
      originalAmount = amt;
      gstAmount = (amt * rate) / 100;
      totalAmount = amt + gstAmount;
    } else {
      totalAmount = amt;
      originalAmount = amt / (1 + rate / 100);
      gstAmount = amt - originalAmount;
    }

    // Split CGST and SGST (50% each of the GST amount)
    const splitGst = gstAmount / 2;

    setResult({
      originalAmount: parseFloat(originalAmount.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      cgst: parseFloat(splitGst.toFixed(2)),
      sgst: parseFloat(splitGst.toFixed(2)),
      igst: parseFloat(gstAmount.toFixed(2)),
    });
  };

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', p: 1 }}>
      <Grid container spacing={3}>
        {/* Input panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Exclusive/Inclusive Toggle */}
            <ToggleButtonGroup
              color="primary"
              value={gstType}
              exclusive
              onChange={handleGstTypeChange}
              fullWidth
              size="small"
            >
              <ToggleButton value="exclusive">GST Exclusive (+)</ToggleButton>
              <ToggleButton value="inclusive">GST Inclusive (-)</ToggleButton>
            </ToggleButtonGroup>

            {/* Input Amount */}
            <TextField
              label="Amount (₹)"
              placeholder="e.g. 1000"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              slotProps={{
                input: { startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography> }
              }}
            />

            {/* GST Rate */}
            <TextField
              label="GST Rate (%)"
              placeholder="e.g. 18"
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              fullWidth
              slotProps={{
                input: { endAdornment: <Typography variant="caption" color="text.secondary">%</Typography> }
              }}
            />

            {/* Common GST slabs preset buttons */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                Standard Slabs presets:
              </Typography>
              <Grid container spacing={1}>
                {commonSlabs.map((slab) => (
                  <Grid size={3} key={slab}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={() => calculateGst(slab)}
                      sx={{ py: 0.5, fontSize: '0.8rem' }}
                    >
                      {slab}%
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => calculateGst()}
              startIcon={<PercentIcon />}
              sx={{ py: 1.2 }}
            >
              Calculate GST
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
                Enter the starting amount and GST tax rate (or click a slab) to calculate the tax details.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Primary Amount Card */}
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {gstType === 'exclusive' ? 'Total Amount (Incl. GST)' : 'Original Price (Excl. GST)'}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: '"Poppins", sans-serif' }}>
                    ₹{gstType === 'exclusive' ? result.totalAmount.toLocaleString('en-IN') : result.originalAmount.toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
              </Card>

              {/* Table breakdown */}
              <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Original Cost</TableCell>
                      <TableCell align="right">₹{result.originalAmount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Total GST Tax</TableCell>
                      <TableCell align="right" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                        +₹{result.gstAmount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4, color: 'text.secondary' }}>CGST (Intra-state 50%)</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        ₹{result.cgst.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4, color: 'text.secondary' }}>SGST (Intra-state 50%)</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        ₹{result.sgst.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4, color: 'text.secondary' }}>IGST (Inter-state 100%)</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        ₹{result.igst.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Final Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₹{result.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
