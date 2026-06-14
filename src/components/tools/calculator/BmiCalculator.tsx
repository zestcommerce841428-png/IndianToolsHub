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
  LinearProgress,
} from '@mui/material';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';

interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: 'info' | 'success' | 'warning' | 'error';
  minHealthyWeight: number;
  maxHealthyWeight: number;
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<BmiResult | null>(null);

  const handleUnitChange = (
    event: React.MouseEvent<HTMLElement>,
    newUnit: 'metric' | 'imperial' | null
  ) => {
    if (newUnit !== null) {
      setUnit(newUnit);
      setResult(null);
      setError('');
    }
  };

  const calculateBmi = () => {
    setError('');
    setResult(null);

    let w = parseFloat(weight);
    let hInches = 0;
    let hMeters = 0;

    if (isNaN(w) || w <= 0) {
      setError('Please enter a valid weight.');
      return;
    }

    if (unit === 'metric') {
      const hCm = parseFloat(heightCm);
      if (isNaN(hCm) || hCm <= 0) {
        setError('Please enter a valid height in centimeters.');
        return;
      }
      hMeters = hCm / 100;
    } else {
      const ft = parseFloat(heightFt);
      const inch = parseFloat(heightIn) || 0;
      if (isNaN(ft) || ft < 0 || (ft === 0 && inch === 0)) {
        setError('Please enter a valid height in feet/inches.');
        return;
      }
      hInches = ft * 12 + inch;
    }

    let bmi = 0;
    let minHealthyWeight = 0;
    let maxHealthyWeight = 0;

    if (unit === 'metric') {
      bmi = w / (hMeters * hMeters);
      // Healthy range (18.5 - 24.9)
      minHealthyWeight = 18.5 * (hMeters * hMeters);
      maxHealthyWeight = 24.9 * (hMeters * hMeters);
    } else {
      bmi = 703 * (w / (hInches * hInches));
      minHealthyWeight = (18.5 * (hInches * hInches)) / 703;
      maxHealthyWeight = (24.9 * (hInches * hInches)) / 703;
    }

    let category: BmiResult['category'] = 'Normal';
    let color: BmiResult['color'] = 'success';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'info';
    } else if (bmi < 24.9) {
      category = 'Normal';
      color = 'success';
    } else if (bmi < 29.9) {
      category = 'Overweight';
      color = 'warning';
    } else {
      category = 'Obese';
      color = 'error';
    }

    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      color,
      minHealthyWeight: parseFloat(minHealthyWeight.toFixed(1)),
      maxHealthyWeight: parseFloat(maxHealthyWeight.toFixed(1)),
    });
  };

  // Convert visual gauge progress (0 to 40 max range for progress bar)
  const getProgressVal = (bmiVal: number) => {
    const min = 15;
    const max = 35;
    if (bmiVal <= min) return 0;
    if (bmiVal >= max) return 100;
    return ((bmiVal - min) / (max - min)) * 100;
  };

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', p: 1 }}>
      <Grid container spacing={3}>
        {/* Inputs Column */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Unit Selector */}
            <ToggleButtonGroup
              color="primary"
              value={unit}
              exclusive
              onChange={handleUnitChange}
              fullWidth
              size="small"
            >
              <ToggleButton value="metric">Metric (kg/cm)</ToggleButton>
              <ToggleButton value="imperial">Imperial (lbs/in)</ToggleButton>
            </ToggleButtonGroup>

            {/* Height input based on system */}
            {unit === 'metric' ? (
              <TextField
                label="Height"
                placeholder="Height (cm)"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                fullWidth
                slotProps={{
                  input: { endAdornment: <Typography variant="caption" color="text.secondary">cm</Typography> }
                }}
              />
            ) : (
              <Grid container spacing={1}>
                <Grid size={6}>
                  <TextField
                    label="Feet"
                    placeholder="ft"
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: { endAdornment: <Typography variant="caption" color="text.secondary">ft</Typography> }
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Inches"
                    placeholder="in"
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: { endAdornment: <Typography variant="caption" color="text.secondary">in</Typography> }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* Weight input */}
            <TextField
              label="Weight"
              placeholder={unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <Typography variant="caption" color="text.secondary">
                      {unit === 'metric' ? 'kg' : 'lbs'}
                    </Typography>
                  ),
                },
              }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={calculateBmi}
              startIcon={<MonitorWeightIcon />}
              sx={{ py: 1.2 }}
            >
              Calculate BMI
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        {/* Results/Gauge Column */}
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
                Enter your height and weight to view your BMI category, visual gauge, and ideal weight targets.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* BMI Card */}
              <Card
                sx={{
                  bgcolor: `${result.color}.light`,
                  color: `${result.color}.contrastText`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Your Body Mass Index (BMI)
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: '"Poppins", sans-serif' }}>
                    {result.bmi}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {result.category}
                  </Typography>
                </CardContent>
              </Card>

              {/* Progress Gauge */}
              <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  BMI Spectrum Gauge
                </Typography>
                <Box sx={{ width: '100%', mr: 1, my: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressVal(result.bmi)}
                    color={result.color}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Grid container spacing={0} sx={{ textAlign: 'center' }}>
                  <Grid size={3}>
                    <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 600 }}>&lt; 18.5</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Underweight</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>18.5 - 24.9</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Normal</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>25 - 29.9</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Overweight</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>&gt; 30</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Obese</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Healthy Target Recommendation */}
              <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Target Health Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  For your height, a healthy weight range is between:
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  {result.minHealthyWeight} - {result.maxHealthyWeight} {unit === 'metric' ? 'kg' : 'lbs'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  💡 <em>Note: BMI is a general indicator and does not differentiate between body fat and lean muscle mass.</em>
                </Typography>
              </Paper>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
