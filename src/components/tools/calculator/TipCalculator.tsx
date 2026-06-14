'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Grid,
  Paper,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function TipCalculator() {
  const [bill, setBill] = useState<string>('500');
  const [tipPct, setTipPct] = useState<number>(15);
  const [people, setPeople] = useState<number>(1);

  const [tipAmt, setTipAmt] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [perPerson, setPerPerson] = useState<number>(0);
  const [tipPerPerson, setTipPerPerson] = useState<number>(0);

  useEffect(() => {
    const billAmt = parseFloat(bill) || 0;
    const computedTip = (billAmt * tipPct) / 100;
    const computedTotal = billAmt + computedTip;
    const count = Math.max(1, people);

    setTipAmt(computedTip);
    setTotal(computedTotal);
    setPerPerson(computedTotal / count);
    setTipPerPerson(computedTip / count);
  }, [bill, tipPct, people]);

  const handleIncrement = () => setPeople((prev) => Math.min(100, prev + 1));
  const handleDecrement = () => setPeople((prev) => Math.max(1, prev - 1));

  const formatCurrency = (val: number) => {
    return '₹' + val.toFixed(2);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        {/* Left Input panel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Bill Amount (₹)"
              type="number"
              fullWidth
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              placeholder="Enter bill amount..."
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Tip Percentage: {tipPct}%
              </Typography>
              <Slider
                value={tipPct}
                min={0}
                max={50}
                onChange={(e, val) => setTipPct(val as number)}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Split Between
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={handleDecrement} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                  {people}
                </Typography>
                <IconButton onClick={handleIncrement} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <AddIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  Person(s)
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Output panel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>
              Result Details
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(tipAmt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Tip Amount
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Bill
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {formatCurrency(perPerson)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Per Person
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {formatCurrency(tipPerPerson)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Tip Per Person
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
