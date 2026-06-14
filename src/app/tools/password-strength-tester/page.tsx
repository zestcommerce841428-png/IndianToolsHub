'use client';

import React, { useState, useMemo } from 'react';
import {
  Container, Box, Typography, TextField, Paper, LinearProgress, Chip,
  Button, IconButton, InputAdornment, Alert, List, ListItem, ListItemIcon,
  ListItemText, Card, CardContent, Slider, FormControlLabel, Checkbox, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PasswordStrength {
  score: number; // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  color: string;
  label: string;
  feedback: string[];
  passed: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommon: boolean;
  };
}

const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123', 'password123', 'admin', 'letmein'];

export default function PasswordStrengthTester() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generator settings
  const [genLength, setGenLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const analyzePassword = (pwd: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    // Check criteria
    const hasLength = pwd.length >= 12;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const noCommon = !commonPasswords.some(common => pwd.toLowerCase().includes(common));

    // Calculate score
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (pwd.length >= 16) score += 10;
    if (hasUppercase) score += 15;
    if (hasLowercase) score += 15;
    if (hasNumbers) score += 15;
    if (hasSymbols) score += 15;
    if (noCommon) score += 10;

    // Feedback
    if (!hasLength) feedback.push('Use at least 12 characters');
    if (!hasUppercase) feedback.push('Add uppercase letters (A-Z)');
    if (!hasLowercase) feedback.push('Add lowercase letters (a-z)');
    if (!hasNumbers) feedback.push('Add numbers (0-9)');
    if (!hasSymbols) feedback.push('Add symbols (!@#$%^&*)');
    if (!noCommon) feedback.push('Avoid common passwords');

    // Determine level
    let level: PasswordStrength['level'];
    let color: string;
    let label: string;

    if (score < 30) {
      level = 'very-weak';
      color = '#d32f2f';
      label = 'Very Weak';
    } else if (score < 50) {
      level = 'weak';
      color = '#f57c00';
      label = 'Weak';
    } else if (score < 65) {
      level = 'fair';
      color = '#fbc02d';
      label = 'Fair';
    } else if (score < 80) {
      level = 'good';
      color = '#7cb342';
      label = 'Good';
    } else if (score < 90) {
      level = 'strong';
      color = '#43a047';
      label = 'Strong';
    } else {
      level = 'very-strong';
      color = '#2e7d32';
      label = 'Very Strong';
    }

    return {
      score: Math.min(score, 100),
      level,
      color,
      label,
      feedback,
      passed: {
        length: hasLength,
        uppercase: hasUppercase,
        lowercase: hasLowercase,
        numbers: hasNumbers,
        symbols: hasSymbols,
        noCommon: noCommon,
      },
    };
  };

  const strength = useMemo(() => analyzePassword(password), [password]);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (charset === '') charset = lowercase; // Fallback

    let newPassword = '';
    for (let i = 0; i < genLength; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(newPassword);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Password Strength Tester
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test your password security and generate strong passwords instantly
          </Typography>
        </Box>

        {/* Password Input */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Your Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to test..."
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    {password && (
                      <IconButton onClick={handleCopy} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          {password && (
            <>
              {/* Strength Meter */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Strength:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: strength.color }}>
                    {strength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: strength.color,
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              {/* Criteria Checklist */}
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {strength.passed.length ? (
                      <CheckCircleIcon sx={{ color: '#43a047' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#d32f2f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="At least 12 characters" />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {strength.passed.uppercase ? (
                      <CheckCircleIcon sx={{ color: '#43a047' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#d32f2f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Uppercase letters (A-Z)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {strength.passed.lowercase ? (
                      <CheckCircleIcon sx={{ color: '#43a047' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#d32f2f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Lowercase letters (a-z)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {strength.passed.numbers ? (
                      <CheckCircleIcon sx={{ color: '#43a047' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#d32f2f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Numbers (0-9)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {strength.passed.symbols ? (
                      <CheckCircleIcon sx={{ color: '#43a047' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#d32f2f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Symbols (!@#$%^&*)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {strength.passed.noCommon ? (
                      <CheckCircleIcon sx={{ color: '#43a047' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#d32f2f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Not a common password" />
                </ListItem>
              </List>

              {strength.feedback.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Suggestions:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {strength.feedback.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </>
          )}

          {copySuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password copied to clipboard!
            </Alert>
          )}
        </Paper>

        {/* Password Generator */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generate Strong Password
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Password Length: {genLength}
            </Typography>
            <Slider
              value={genLength}
              onChange={(_, val) => setGenLength(val as number)}
              min={8}
              max={32}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />}
              label="Uppercase (A-Z)"
            />
            <FormControlLabel
              control={<Checkbox checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} />}
              label="Lowercase (a-z)"
            />
            <FormControlLabel
              control={<Checkbox checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />}
              label="Numbers (0-9)"
            />
            <FormControlLabel
              control={<Checkbox checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />}
              label="Symbols (!@#$)"
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={generatePassword}
            size="large"
          >
            Generate Password
          </Button>
        </Paper>

        {/* Tips */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Password Security Tips
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ Use a unique password for each account
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ Enable two-factor authentication (2FA) when available
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ Use a password manager to store passwords securely
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ Change passwords regularly, especially after security breaches
            </Typography>
            <Typography variant="body2">
              ❌ Never share your passwords via email or messaging apps
            </Typography>
          </CardContent>
        </Card>
        </Container>
        <Footer />
      </Box>
    </ProtectedRoute>
  );
}
