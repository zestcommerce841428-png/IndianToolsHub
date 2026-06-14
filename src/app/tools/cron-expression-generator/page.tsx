'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Container, Box, Typography, TextField, Paper, Button, Alert,
  Card, CardContent, Divider, Select, MenuItem, FormControl,
  InputLabel, IconButton, Tooltip, Chip, List, ListItem, ListItemText
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

interface CronField {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export default function CronExpressionGenerator() {
  const [cronFields, setCronFields] = useState<CronField>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate cron expression from fields
  const cronExpression = useMemo(() => {
    return `${cronFields.minute} ${cronFields.hour} ${cronFields.dayOfMonth} ${cronFields.month} ${cronFields.dayOfWeek}`;
  }, [cronFields]);

  // Generate human-readable description
  const description = useMemo(() => {
    const parts: string[] = [];

    // Minute
    if (cronFields.minute === '*') {
      parts.push('every minute');
    } else if (cronFields.minute.includes('/')) {
      const [, interval] = cronFields.minute.split('/');
      parts.push(`every ${interval} minutes`);
    } else if (cronFields.minute.includes(',')) {
      parts.push(`at minutes ${cronFields.minute}`);
    } else {
      parts.push(`at minute ${cronFields.minute}`);
    }

    // Hour
    if (cronFields.hour !== '*') {
      if (cronFields.hour.includes('/')) {
        const [, interval] = cronFields.hour.split('/');
        parts.push(`every ${interval} hours`);
      } else if (cronFields.hour.includes(',')) {
        parts.push(`at hours ${cronFields.hour}`);
      } else {
        parts.push(`at ${cronFields.hour}:00`);
      }
    }

    // Day of month
    if (cronFields.dayOfMonth !== '*') {
      if (cronFields.dayOfMonth.includes('/')) {
        const [, interval] = cronFields.dayOfMonth.split('/');
        parts.push(`every ${interval} days`);
      } else if (cronFields.dayOfMonth.includes(',')) {
        parts.push(`on days ${cronFields.dayOfMonth}`);
      } else {
        parts.push(`on day ${cronFields.dayOfMonth}`);
      }
    }

    // Month
    if (cronFields.month !== '*') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (cronFields.month.includes(',')) {
        const monthNums = cronFields.month.split(',').map(m => months[parseInt(m) - 1]);
        parts.push(`in ${monthNums.join(', ')}`);
      } else {
        parts.push(`in ${months[parseInt(cronFields.month) - 1]}`);
      }
    }

    // Day of week
    if (cronFields.dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (cronFields.dayOfWeek.includes(',')) {
        const dayNums = cronFields.dayOfWeek.split(',').map(d => days[parseInt(d)]);
        parts.push(`on ${dayNums.join(', ')}`);
      } else {
        parts.push(`on ${days[parseInt(cronFields.dayOfWeek)]}`);
      }
    }

    return parts.join(', ');
  }, [cronFields]);

  // Calculate next execution times (simplified)
  const nextExecutions = useMemo(() => {
    const executions: string[] = [];
    const now = new Date();
    
    // This is a simplified calculation
    // In production, use a library like cron-parser
    for (let i = 0; i < 5; i++) {
      const nextTime = new Date(now.getTime() + (i + 1) * 60000); // Add minutes
      executions.push(nextTime.toLocaleString());
    }
    
    return executions;
  }, [cronFields]);

  // Handle preset selection
  const handlePreset = useCallback((preset: string) => {
    switch (preset) {
      case 'every-minute':
        setCronFields({ minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'every-5-minutes':
        setCronFields({ minute: '*/5', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'every-15-minutes':
        setCronFields({ minute: '*/15', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'every-30-minutes':
        setCronFields({ minute: '*/30', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'hourly':
        setCronFields({ minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'daily-midnight':
        setCronFields({ minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'daily-noon':
        setCronFields({ minute: '0', hour: '12', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        break;
      case 'weekly-monday':
        setCronFields({ minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1' });
        break;
      case 'monthly-first':
        setCronFields({ minute: '0', hour: '9', dayOfMonth: '1', month: '*', dayOfWeek: '*' });
        break;
      case 'yearly':
        setCronFields({ minute: '0', hour: '0', dayOfMonth: '1', month: '1', dayOfWeek: '*' });
        break;
    }
  }, []);

  // Handle custom expression input
  const handleCustomExpression = useCallback((expr: string) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) {
      setCronFields({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      });
    }
  }, []);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const presets = [
    { label: 'Every Minute', value: 'every-minute' },
    { label: 'Every 5 Minutes', value: 'every-5-minutes' },
    { label: 'Every 15 Minutes', value: 'every-15-minutes' },
    { label: 'Every 30 Minutes', value: 'every-30-minutes' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily at Midnight', value: 'daily-midnight' },
    { label: 'Daily at Noon', value: 'daily-noon' },
    { label: 'Weekly (Monday 9 AM)', value: 'weekly-monday' },
    { label: 'Monthly (1st at 9 AM)', value: 'monthly-first' },
    { label: 'Yearly (Jan 1st)', value: 'yearly' },
  ];

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
          {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Cron Expression Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Build and test cron expressions with a visual interface
          </Typography>
        </Box>

        {/* Cron Expression Display */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Cron Expression</Typography>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: 'primary.main',
                flex: 1,
              }}
            >
              {cronExpression}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" fontSize="small" />
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              {description || 'Configure the fields below to generate a cron expression'}
            </Typography>
          </Box>
        </Paper>

        {/* Common Presets */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Common Presets
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {presets.map((preset) => (
              <Chip
                key={preset.value}
                label={preset.label}
                onClick={() => handlePreset(preset.value)}
                clickable
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>

        {/* Cron Fields */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configure Fields
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize each field or use wildcards (*) for any value
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
            {/* Minute */}
            <FormControl fullWidth>
              <InputLabel>Minute (0-59)</InputLabel>
              <Select
                value={cronFields.minute}
                onChange={(e) => setCronFields({ ...cronFields, minute: e.target.value })}
                label="Minute (0-59)"
              >
                <MenuItem value="*">* (Every)</MenuItem>
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="15">15</MenuItem>
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="45">45</MenuItem>
                <MenuItem value="*/5">*/5 (Every 5)</MenuItem>
                <MenuItem value="*/15">*/15 (Every 15)</MenuItem>
              </Select>
            </FormControl>

            {/* Hour */}
            <FormControl fullWidth>
              <InputLabel>Hour (0-23)</InputLabel>
              <Select
                value={cronFields.hour}
                onChange={(e) => setCronFields({ ...cronFields, hour: e.target.value })}
                label="Hour (0-23)"
              >
                <MenuItem value="*">* (Every)</MenuItem>
                <MenuItem value="0">0 (Midnight)</MenuItem>
                <MenuItem value="6">6 AM</MenuItem>
                <MenuItem value="9">9 AM</MenuItem>
                <MenuItem value="12">12 (Noon)</MenuItem>
                <MenuItem value="18">6 PM</MenuItem>
                <MenuItem value="*/2">*/2 (Every 2)</MenuItem>
                <MenuItem value="*/6">*/6 (Every 6)</MenuItem>
              </Select>
            </FormControl>

            {/* Day of Month */}
            <FormControl fullWidth>
              <InputLabel>Day (1-31)</InputLabel>
              <Select
                value={cronFields.dayOfMonth}
                onChange={(e) => setCronFields({ ...cronFields, dayOfMonth: e.target.value })}
                label="Day (1-31)"
              >
                <MenuItem value="*">* (Every)</MenuItem>
                <MenuItem value="1">1st</MenuItem>
                <MenuItem value="15">15th</MenuItem>
                <MenuItem value="*/7">*/7 (Weekly)</MenuItem>
              </Select>
            </FormControl>

            {/* Month */}
            <FormControl fullWidth>
              <InputLabel>Month (1-12)</InputLabel>
              <Select
                value={cronFields.month}
                onChange={(e) => setCronFields({ ...cronFields, month: e.target.value })}
                label="Month (1-12)"
              >
                <MenuItem value="*">* (Every)</MenuItem>
                <MenuItem value="1">January</MenuItem>
                <MenuItem value="2">February</MenuItem>
                <MenuItem value="3">March</MenuItem>
                <MenuItem value="6">June</MenuItem>
                <MenuItem value="12">December</MenuItem>
              </Select>
            </FormControl>

            {/* Day of Week */}
            <FormControl fullWidth>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={cronFields.dayOfWeek}
                onChange={(e) => setCronFields({ ...cronFields, dayOfWeek: e.target.value })}
                label="Day of Week"
              >
                <MenuItem value="*">* (Every)</MenuItem>
                <MenuItem value="0">Sunday</MenuItem>
                <MenuItem value="1">Monday</MenuItem>
                <MenuItem value="2">Tuesday</MenuItem>
                <MenuItem value="3">Wednesday</MenuItem>
                <MenuItem value="4">Thursday</MenuItem>
                <MenuItem value="5">Friday</MenuItem>
                <MenuItem value="6">Saturday</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Custom Expression */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Expression
          </Typography>
          <TextField
            fullWidth
            value={cronExpression}
            onChange={(e) => handleCustomExpression(e.target.value)}
            placeholder="* * * * *"
            helperText="Enter a custom cron expression (5 fields: minute hour day month day-of-week)"
          />
        </Paper>

        {/* Next Executions */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PlayArrowIcon color="primary" />
            <Typography variant="h6">
              Next 5 Executions (Approximate)
            </Typography>
          </Box>
          <List dense>
            {nextExecutions.map((time, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${index + 1}. ${time}`}
                  sx={{ fontFamily: 'monospace' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Cron expression copied to clipboard!
          </Alert>
        )}

        {/* Reference Guide */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cron Expression Format
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Field Order:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  * * * * *
                  <br />
                  │ │ │ │ │
                  <br />
                  │ │ │ │ └── Day of Week (0-6, 0=Sunday)
                  <br />
                  │ │ │ └──── Month (1-12)
                  <br />
                  │ │ └────── Day of Month (1-31)
                  <br />
                  │ └──────── Hour (0-23)
                  <br />
                  └────────── Minute (0-59)
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Special Characters:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>*</strong> - Any value
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>,</strong> - Value list (1,3,5)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>-</strong> - Range (1-5)
                </Typography>
                <Typography variant="body2">
                  <strong>/</strong> - Step (*/5 = every 5)
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Examples:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  <strong>0 0 * * *</strong> - Daily at midnight
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  <strong>*/15 * * * *</strong> - Every 15 minutes
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  <strong>0 9-17 * * 1-5</strong> - Hourly on weekdays 9-5
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  <strong>0 0 1 */3 *</strong> - Quarterly (every 3 months)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  <strong>30 2 * * 0</strong> - 2:30 AM every Sunday
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Container>
        <Footer />
      </Box>
    </ProtectedRoute>
  );
}
