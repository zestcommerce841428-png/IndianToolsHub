'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Autocomplete,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PublicIcon from '@mui/icons-material/Public';

const QUICK_ZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'New York (EST/EDT)', value: 'America/New_York' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
];

export default function TimeZoneConverter() {
  const [timeZones, setTimeZones] = useState<string[]>([]);
  const [fromZone, setFromZone] = useState<string>('UTC');
  const [toZone, setToZone] = useState<string>('UTC');
  
  // Set default to today's date and time in YYYY-MM-DDTHH:mm format
  const [dateTimeStr, setDateTimeStr] = useState<string>('');
  const [convertedTime, setConvertedTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Live clocks
  const [utcTime, setUtcTime] = useState<string>('');
  const [fromCurrentTime, setFromCurrentTime] = useState<string>('');
  const [toCurrentTime, setToCurrentTime] = useState<string>('');

  useEffect(() => {
    try {
      const zones = Intl.supportedValuesOf('timeZone');
      setTimeZones(zones);

      // Default timezone setup
      const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zones.includes(localZone)) {
        setFromZone(localZone);
      }
      setToZone('UTC');

      // Initialize date input with current local time
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setDateTimeStr(`${year}-${month}-${day}T${hours}:${minutes}`);
    } catch (err) {
      // Fallback list of timezones if supportedValuesOf is not supported
      const fallbackZones = ['UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'];
      setTimeZones(fallbackZones);
      setFromZone('UTC');
      setToZone('UTC');
    }
  }, []);

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeOpts: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      setUtcTime(new Intl.DateTimeFormat('en-US', { ...timeOpts, timeZone: 'UTC' }).format(now));
      setFromCurrentTime(new Intl.DateTimeFormat('en-US', { ...timeOpts, timeZone: fromZone }).format(now));
      setToCurrentTime(new Intl.DateTimeFormat('en-US', { ...timeOpts, timeZone: toZone }).format(now));
    }, 1000);

    return () => clearInterval(timer);
  }, [fromZone, toZone]);

  const handleConvert = () => {
    setError(null);
    if (!dateTimeStr) {
      setError('Please select a date and time.');
      return;
    }

    try {
      // 1. Parse datetime-local input
      const [datePart, timePart] = dateTimeStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Create UTC candidate
      const utcCandidate = new Date(Date.UTC(year, month - 1, day, hour, minute));

      // Format UTC candidate in the FROM timezone to compute difference
      const formatterFrom = new Intl.DateTimeFormat('en-US', {
        timeZone: fromZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      const parts = formatterFrom.formatToParts(utcCandidate);
      const getPartVal = (type: string) => Number(parts.find((p) => p.type === type)?.value);

      const y = getPartVal('year');
      const m = getPartVal('month');
      const d = getPartVal('day');
      const h = getPartVal('hour') % 24;
      const min = getPartVal('minute');

      const formattedUtc = Date.UTC(y, m - 1, d, h, min);
      const diff = utcCandidate.getTime() - formattedUtc;

      // Actual UTC Date matching the chosen local time in FROM zone
      const targetUtcDate = new Date(utcCandidate.getTime() + diff);

      // 2. Format the actual UTC date in the TO timezone
      const formatterTo = new Intl.DateTimeFormat('en-US', {
        timeZone: toZone,
        dateStyle: 'full',
        timeStyle: 'medium',
      });

      setConvertedTime(formatterTo.format(targetUtcDate));
    } catch (err) {
      setError('Conversion failed. Please verify selected zones and date/time format.');
    }
  };

  useEffect(() => {
    if (dateTimeStr && fromZone && toZone) {
      handleConvert();
    }
  }, [dateTimeStr, fromZone, toZone]);

  const handleSwap = () => {
    const temp = fromZone;
    setFromZone(toZone);
    setToZone(temp);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {/* Input Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" /> Time & Zone Selector
              </Typography>

              <TextField
                label="Date & Time"
                type="datetime-local"
                fullWidth
                value={dateTimeStr}
                onChange={(e) => setDateTimeStr(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Divider />

              {/* Autocomplete Zone Selectors */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  From Time Zone
                </Typography>
                <Autocomplete
                  options={timeZones}
                  value={fromZone}
                  onChange={(_, val) => val && setFromZone(val)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {QUICK_ZONES.map((qz) => (
                    <Chip
                      key={qz.value}
                      label={qz.label}
                      size="small"
                      onClick={() => setFromZone(qz.value)}
                      variant={fromZone === qz.value ? 'filled' : 'outlined'}
                      color={fromZone === qz.value ? 'primary' : 'default'}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SwapVertIcon />}
                  onClick={handleSwap}
                >
                  Swap Zones
                </Button>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  To Time Zone
                </Typography>
                <Autocomplete
                  options={timeZones}
                  value={toZone}
                  onChange={(_, val) => val && setToZone(val)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {QUICK_ZONES.map((qz) => (
                    <Chip
                      key={qz.value}
                      label={qz.label}
                      size="small"
                      onClick={() => setToZone(qz.value)}
                      variant={toZone === qz.value ? 'filled' : 'outlined'}
                      color={toZone === qz.value ? 'secondary' : 'default'}
                    />
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Conversion result */}
            <Card variant="outlined" sx={{ bgcolor: 'rgba(37, 99, 235, 0.02)', borderColor: 'primary.light' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Converted Date & Time
                </Typography>
                {convertedTime ? (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                      {convertedTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Zone: {toZone}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a date and time to view conversion.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Live clocks */}
            <Card variant="outlined" sx={{ flexGrow: 1 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PublicIcon color="secondary" /> Live World Clocks
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Selected From Zone
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {fromCurrentTime || '--:--:--'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Selected To Zone
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'secondary.main' }}>
                      {toCurrentTime || '--:--:--'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Universal Time (UTC)
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>
                      {utcTime || '--:--:--'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
