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
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  principalPercent: number;
  interestPercent: number;
  schedule: Array<{
    month: number;
    principalPaid: number;
    interestPaid: number;
    balance: number;
  }>;
}

export default function LoanEmiCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [error, setError] = useState('');
  const [result, setResult] = useState<EmiResult | null>(null);

  const handleTenureTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'years' | 'months' | null
  ) => {
    if (newType !== null) {
      setTenureType(newType);
      setResult(null);
      setError('');
    }
  };

  const calculateEmi = () => {
    setError('');
    setResult(null);

    const amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    let months = parseInt(tenure);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid loan amount.');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      setError('Please enter a valid annual interest rate.');
      return;
    }
    if (isNaN(months) || months <= 0) {
      setError('Please enter a valid loan tenure.');
      return;
    }

    if (tenureType === 'years') {
      months = months * 12;
    }

    const monthlyInterestRate = rate / 12 / 100;
    
    // EMI formula: [P x R x (1+R)^N]/[((1+R)^N)-1]
    const emi =
      (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) /
      (Math.pow(1 + monthlyInterestRate, months) - 1);

    if (!isFinite(emi)) {
      setError('Calculation failed. Please verify interest rate and tenure settings.');
      return;
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;
    const principalPercent = (amount / totalPayment) * 100;
    const interestPercent = (totalInterest / totalPayment) * 100;

    // Generate monthly amortization schedule
    const schedule = [];
    let balance = amount;
    for (let i = 1; i <= months; i++) {
      const interestPaid = balance * monthlyInterestRate;
      const principalPaid = emi - interestPaid;
      balance = Math.max(0, balance - principalPaid);
      schedule.push({
        month: i,
        principalPaid: parseFloat(principalPaid.toFixed(2)),
        interestPaid: parseFloat(interestPaid.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
      });
    }

    setResult({
      monthlyEmi: parseFloat(emi.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      principalPercent: parseFloat(principalPercent.toFixed(1)),
      interestPercent: parseFloat(interestPercent.toFixed(1)),
      schedule,
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 1 }}>
      <Grid container spacing={3}>
        {/* Input Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Loan Amount (₹)"
              placeholder="e.g. 500000"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              fullWidth
              slotProps={{
                input: { startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography> }
              }}
            />

            <TextField
              label="Annual Interest Rate (%)"
              placeholder="e.g. 8.5"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              fullWidth
              slotProps={{
                input: { endAdornment: <Typography variant="caption" color="text.secondary">%</Typography> }
              }}
            />

            <Grid container spacing={1}>
              <Grid size={7}>
                <TextField
                  label={`Tenure (${tenureType === 'years' ? 'Years' : 'Months'})`}
                  placeholder="e.g. 5"
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={5}>
                <ToggleButtonGroup
                  color="primary"
                  value={tenureType}
                  exclusive
                  onChange={handleTenureTypeChange}
                  fullWidth
                  size="small"
                  sx={{ height: 40 }}
                >
                  <ToggleButton value="years">Yr</ToggleButton>
                  <ToggleButton value="months">Mo</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={calculateEmi}
              startIcon={<HomeIcon />}
              sx={{ py: 1.2 }}
            >
              Calculate EMI
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
                Enter the loan amount, interest rate, and tenure details to calculate monthly payment, total interest, and schedule.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* EMI Card */}
              <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Monthly Installment (EMI)
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: '"Poppins", sans-serif' }}>
                    ₹{result.monthlyEmi.toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Total Interest Payable</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      ₹{result.totalInterest.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Total Payment (Principal + Interest)</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      ₹{result.totalPayment.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Stacked Percentage Visual Bar */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>Principal: {result.principalPercent}%</span>
                    <span>Interest: {result.interestPercent}%</span>
                  </Typography>
                  <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: 'divider' }}>
                    <Box sx={{ width: `${result.principalPercent}%`, bgcolor: 'primary.main' }} title="Principal" />
                    <Box sx={{ width: `${result.interestPercent}%`, bgcolor: 'secondary.main' }} title="Interest" />
                  </Box>
                </Box>
              </Paper>

              {/* Amortization Schedule Accordion */}
              <Accordion sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    View Amortization Schedule (Months)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, maxHeight: 300, overflowY: 'auto' }}>
                  <TableContainer>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Principal Paid</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Interest Paid</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Remaining Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.schedule.map((row) => (
                          <TableRow key={row.month}>
                            <TableCell>{row.month}</TableCell>
                            <TableCell align="right">₹{row.principalPaid.toLocaleString('en-IN')}</TableCell>
                            <TableCell align="right">₹{row.interestPaid.toLocaleString('en-IN')}</TableCell>
                            <TableCell align="right">₹{row.balance.toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
