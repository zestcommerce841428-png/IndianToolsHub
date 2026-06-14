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
  Divider,
} from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface AgeStats {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  daysToNextBirthday: number;
}

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AgeStats | null>(null);

  const calculateAge = () => {
    setError('');
    setResult(null);

    if (!dob) {
      setError('Please select a valid date of birth.');
      return;
    }

    const birthDate = new Date(dob);
    const end = new Date(targetDate);

    if (isNaN(birthDate.getTime()) || isNaN(end.getTime())) {
      setError('Please enter valid dates.');
      return;
    }

    if (birthDate > end) {
      setError('Date of birth cannot be after the age calculation date.');
      return;
    }

    // Exact years, months, days difference
    let ageYears = end.getFullYear() - birthDate.getFullYear();
    let ageMonths = end.getMonth() - birthDate.getMonth();
    let ageDays = end.getDate() - birthDate.getDate();

    if (ageDays < 0) {
      ageMonths--;
      // Get days in the previous month of age calculation date
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      ageDays += prevMonth.getDate();
    }

    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }

    // Overall metrics
    const diffMs = end.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalMonths = ageYears * 12 + ageMonths;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Calculate days to next birthday
    const nextBirthday = new Date(end.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < end) {
      nextBirthday.setFullYear(end.getFullYear() + 1);
    }
    const birthdayDiffMs = nextBirthday.getTime() - end.getTime();
    const daysToNextBirthday = Math.ceil(birthdayDiffMs / (1000 * 60 * 60 * 24));

    setResult({
      years: ageYears,
      months: ageMonths,
      days: ageDays,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      daysToNextBirthday,
    });
  };

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', p: 1 }}>
      <Grid container spacing={3}>
        {/* Input Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
            <TextField
              label="Age at Date of"
              type="date"
              fullWidth
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={calculateAge}
              startIcon={<CakeIcon />}
              sx={{ py: 1.2 }}
            >
              Calculate Age
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
                Fill in your Date of Birth and click Calculate to view your age breakdown and stats.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Primary Age Result */}
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Exact Age
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: '"Poppins", sans-serif' }}>
                    {result.years} <Typography component="span" variant="h5" sx={{ opacity: 0.9 }}>years</Typography>
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {result.months} months, {result.days} days
                  </Typography>
                </CardContent>
              </Card>

              {/* Next Birthday */}
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EventIcon color="secondary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Next Birthday
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {result.daysToNextBirthday === 365 || result.daysToNextBirthday === 0
                        ? 'Happy Birthday! 🎂 Today is the day!'
                        : `In ${result.daysToNextBirthday} days`}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Lifetime Stats */}
              <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" /> Lifetime Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Total Months</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{result.totalMonths.toLocaleString()}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Total Weeks</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{result.totalWeeks.toLocaleString()}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Total Days</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{result.totalDays.toLocaleString()}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{result.totalHours.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                  Your heart has beaten approximately {(result.totalMinutes * 72).toLocaleString()} times! ❤️
                </Typography>
              </Paper>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
