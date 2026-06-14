'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ScientificCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleAppend = (val: string) => {
    setExpression((prev) => prev + val);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculateResult = () => {
    if (!expression) return;
    try {
      // Replace scientific terms with Math methods
      let processed = expression;
      processed = processed.replace(/sqrt/g, 'Math.sqrt');
      processed = processed.replace(/pow/g, 'Math.pow');
      processed = processed.replace(/log/g, 'Math.log');
      processed = processed.replace(/exp/g, 'Math.exp');
      processed = processed.replace(/sin/g, 'Math.sin');
      processed = processed.replace(/cos/g, 'Math.cos');
      processed = processed.replace(/tan/g, 'Math.tan');
      processed = processed.replace(/π/g, 'Math.PI');
      processed = processed.replace(/e/g, 'Math.E');

      // Use a safe evaluation pattern using Function
      const evalResult = new Function(`return (${processed})`)();

      if (evalResult === undefined || isNaN(evalResult)) {
        setResult('Error');
      } else {
        const resultString = Number.isInteger(evalResult)
          ? evalResult.toString()
          : parseFloat(evalResult.toFixed(8)).toString();
        setResult(resultString);
        setHistory((prev) => [
          `${expression} = ${resultString}`,
          ...prev.slice(0, 9), // Keep last 10 calculations
        ]);
      }
    } catch (error) {
      setResult('Error');
    }
  };

  const loadFromHistory = (item: string) => {
    const expr = item.split(' = ')[0];
    setExpression(expr);
    setResult('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Helper for button labels
  const buttons = [
    { label: 'C', value: 'clear', color: 'error.main', variant: 'contained' },
    { label: '(', value: '(', color: 'text.secondary', variant: 'outlined' },
    { label: ')', value: ')', color: 'text.secondary', variant: 'outlined' },
    { label: '⌫', value: 'backspace', color: 'error.main', variant: 'outlined' },

    { label: 'sin', value: 'sin(', color: 'secondary.main', variant: 'outlined' },
    { label: 'cos', value: 'cos(', color: 'secondary.main', variant: 'outlined' },
    { label: 'tan', value: 'tan(', color: 'secondary.main', variant: 'outlined' },
    { label: 'log', value: 'log(', color: 'secondary.main', variant: 'outlined' },

    { label: '√', value: 'sqrt(', color: 'secondary.main', variant: 'outlined' },
    { label: 'xʸ', value: 'pow(', color: 'secondary.main', variant: 'outlined' },
    { label: 'exp', value: 'exp(', color: 'secondary.main', variant: 'outlined' },
    { label: '÷', value: '/', color: 'primary.main', variant: 'contained' },

    { label: '7', value: '7', color: 'text.primary', variant: 'text' },
    { label: '8', value: '8', color: 'text.primary', variant: 'text' },
    { label: '9', value: '9', color: 'text.primary', variant: 'text' },
    { label: '×', value: '*', color: 'primary.main', variant: 'contained' },

    { label: '4', value: '4', color: 'text.primary', variant: 'text' },
    { label: '5', value: '5', color: 'text.primary', variant: 'text' },
    { label: '6', value: '6', color: 'text.primary', variant: 'text' },
    { label: '–', value: '-', color: 'primary.main', variant: 'contained' },

    { label: '1', value: '1', color: 'text.primary', variant: 'text' },
    { label: '2', value: '2', color: 'text.primary', variant: 'text' },
    { label: '3', value: '3', color: 'text.primary', variant: 'text' },
    { label: '+', value: '+', color: 'primary.main', variant: 'contained' },

    { label: '0', value: '0', color: 'text.primary', variant: 'text' },
    { label: '.', value: '.', color: 'text.primary', variant: 'text' },
    { label: 'π', value: 'π', color: 'secondary.main', variant: 'outlined' },
    { label: '=', value: 'equals', color: 'success.main', variant: 'contained' },
  ];

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', p: 1 }}>
      {/* Display Screen */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 2.5,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          minHeight: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          wordBreak: 'break-all',
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <IconButton
            size="small"
            color={showHistory ? 'primary' : 'default'}
            onClick={() => setShowHistory(!showHistory)}
            title="Toggle History"
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ userSelect: 'none' }}>
            {expression || '0'}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: result === 'Error' ? 'error.main' : 'text.primary' }}>
          {result || '0'}
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
        {/* Keypad */}
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            {buttons.map((btn, idx) => {
              const isEquals = btn.value === 'equals';
              const isClear = btn.value === 'clear';
              const isBackspace = btn.value === 'backspace';

              let onClick = () => handleAppend(btn.value);
              if (isEquals) onClick = calculateResult;
              else if (isClear) onClick = handleClear;
              else if (isBackspace) onClick = handleBackspace;

              // Color classes
              let bgHover = 'rgba(0, 0, 0, 0.04)';
              let textColor = 'text.primary';
              let buttonBg = 'transparent';

              if (btn.variant === 'contained') {
                if (btn.color.startsWith('primary')) {
                  buttonBg = 'primary.main';
                  textColor = 'primary.contrastText';
                  bgHover = 'primary.dark';
                } else if (btn.color.startsWith('error')) {
                  buttonBg = 'error.main';
                  textColor = 'error.contrastText';
                  bgHover = 'error.dark';
                } else if (btn.color.startsWith('success')) {
                  buttonBg = 'success.main';
                  textColor = 'success.contrastText';
                  bgHover = 'success.dark';
                }
              } else if (btn.variant === 'outlined') {
                if (btn.color.startsWith('secondary')) {
                  textColor = 'secondary.main';
                } else if (btn.color.startsWith('error')) {
                  textColor = 'error.main';
                } else {
                  textColor = 'text.secondary';
                }
              }

              return (
                <Grid size={3} key={idx}>
                  <Button
                    fullWidth
                    variant={btn.variant as 'contained' | 'outlined' | 'text'}
                    onClick={onClick}
                    sx={{
                      height: 52,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2.5,
                      borderColor: btn.variant === 'outlined' ? 'divider' : undefined,
                      bgcolor: buttonBg !== 'transparent' ? buttonBg : undefined,
                      color: textColor,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: btn.variant === 'contained' ? bgHover : 'rgba(37, 99, 235, 0.08)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                      },
                    }}
                  >
                    {btn.value === 'backspace' ? <BackspaceIcon fontSize="small" /> : btn.label}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* History Sidebar */}
        {showHistory && (
          <Paper
            sx={{
              position: { xs: 'absolute', sm: 'static' },
              top: 0,
              right: 0,
              width: { xs: '100%', sm: 200 },
              height: { xs: '100%', sm: 388 },
              zIndex: 10,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: { xs: 4, sm: 0 },
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                History
              </Typography>
              {history.length > 0 && (
                <IconButton size="small" color="error" onClick={clearHistory} title="Clear History">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {history.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
                  No calculations yet.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {history.map((item, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        px: 1,
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                      onClick={() => loadFromHistory(item)}
                    >
                      <ListItemText>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all' }}>
                          {item.split(' = ')[0]}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          = {item.split(' = ')[1]}
                        </Typography>
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        )}
      </Box>
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
          💡 <strong>Usage Tips:</strong>
          <br />
          • For powers, use <strong>xʸ</strong> which enters <strong>pow(</strong>. E.g., type <code>pow(2, 3)</code> for 2³ (8).
          <br />
          • Use standard parentheses for grouping, e.g., <code>sin(π / 2)</code> or <code>sqrt(16)</code>.
        </Typography>
      </Box>
    </Box>
  );
}
