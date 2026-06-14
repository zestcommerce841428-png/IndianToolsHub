'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import StraightenIcon from '@mui/icons-material/Straighten';

interface Unit {
  value: string;
  label: string;
  factor: number; // Factor relative to baseline unit
}

interface Category {
  id: string;
  name: string;
  units: Unit[];
}

const CONVERSION_DATA: Category[] = [
  {
    id: 'length',
    name: 'Length',
    units: [
      { value: 'm', label: 'Meters (m)', factor: 1 },
      { value: 'km', label: 'Kilometers (km)', factor: 1000 },
      { value: 'cm', label: 'Centimeters (cm)', factor: 0.01 },
      { value: 'mm', label: 'Millimeters (mm)', factor: 0.001 },
      { value: 'mi', label: 'Miles (mi)', factor: 1609.344 },
      { value: 'yd', label: 'Yards (yd)', factor: 0.9144 },
      { value: 'ft', label: 'Feet (ft)', factor: 0.3048 },
      { value: 'in', label: 'Inches (in)', factor: 0.0254 },
    ],
  },
  {
    id: 'weight',
    name: 'Weight / Mass',
    units: [
      { value: 'kg', label: 'Kilograms (kg)', factor: 1 },
      { value: 'g', label: 'Grams (g)', factor: 0.001 },
      { value: 'mg', label: 'Milligrams (mg)', factor: 0.000001 },
      { value: 'lb', label: 'Pounds (lb)', factor: 0.45359237 },
      { value: 'oz', label: 'Ounces (oz)', factor: 0.028349523 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    units: [
      { value: 'sqm', label: 'Square Meters (m²)', factor: 1 },
      { value: 'sqkm', label: 'Square Kilometers (km²)', factor: 1000000 },
      { value: 'sqft', label: 'Square Feet (ft²)', factor: 0.09290304 },
      { value: 'sqin', label: 'Square Inches (in²)', factor: 0.00064516 },
      { value: 'acre', label: 'Acres (ac)', factor: 4046.85642 },
      { value: 'hectare', label: 'Hectares (ha)', factor: 10000 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    units: [
      { value: 'l', label: 'Liters (L)', factor: 1 },
      { value: 'ml', label: 'Milliliters (mL)', factor: 0.001 },
      { value: 'gal', label: 'Gallons (US)', factor: 3.785411784 },
      { value: 'qt', label: 'Quarts (US)', factor: 0.946352946 },
      { value: 'pt', label: 'Pints (US)', factor: 0.473176473 },
      { value: 'cup', label: 'Cups (US)', factor: 0.236588236 },
      { value: 'cum', label: 'Cubic Meters (m³)', factor: 1000 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    units: [
      { value: 'c', label: 'Celsius (°C)', factor: 1 },
      { value: 'f', label: 'Fahrenheit (°F)', factor: 1 },
      { value: 'k', label: 'Kelvin (K)', factor: 1 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    units: [
      { value: 'sec', label: 'Seconds (s)', factor: 1 },
      { value: 'min', label: 'Minutes (min)', factor: 60 },
      { value: 'hr', label: 'Hours (h)', factor: 3600 },
      { value: 'day', label: 'Days (d)', factor: 86400 },
      { value: 'week', label: 'Weeks (w)', factor: 604800 },
      { value: 'year', label: 'Years (yr)', factor: 31536000 },
    ],
  },
  {
    id: 'storage',
    name: 'Digital Storage',
    units: [
      { value: 'b', label: 'Bytes (B)', factor: 1 },
      { value: 'kb', label: 'Kilobytes (KB)', factor: 1024 },
      { value: 'mb', label: 'Megabytes (MB)', factor: 1024 * 1024 },
      { value: 'gb', label: 'Gigabytes (GB)', factor: 1024 * 1024 * 1024 },
      { value: 'tb', label: 'Terabytes (TB)', factor: 1024 * 1024 * 1024 * 1024 },
    ],
  },
];

export default function UnitConverter() {
  const [category, setCategory] = useState<string>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');
  const [result, setResult] = useState<string>('');
  const [allConversions, setAllConversions] = useState<{ label: string; value: string }[]>([]);

  // Find active category
  const activeCategory = CONVERSION_DATA.find((c) => c.id === category) || CONVERSION_DATA[0];

  // Set default units when category changes
  useEffect(() => {
    const defaultFrom = activeCategory.units[0].value;
    const defaultTo = activeCategory.units[1]?.value || activeCategory.units[0].value;
    setFromUnit(defaultFrom);
    setToUnit(defaultTo);
  }, [category]);

  const convertValue = (val: number, from: string, to: string): number => {
    if (category === 'temperature') {
      if (from === to) return val;
      if (from === 'c' && to === 'f') return (val * 9) / 5 + 32;
      if (from === 'c' && to === 'k') return val + 273.15;
      if (from === 'f' && to === 'c') return ((val - 32) * 5) / 9;
      if (from === 'f' && to === 'k') return ((val - 32) * 5) / 9 + 273.15;
      if (from === 'k' && to === 'c') return val - 273.15;
      if (from === 'k' && to === 'f') return ((val - 273.15) * 9) / 5 + 32;
      return val;
    }

    const fromUnitObj = activeCategory.units.find((u) => u.value === from);
    const toUnitObj = activeCategory.units.find((u) => u.value === to);
    if (!fromUnitObj || !toUnitObj) return 0;

    // Convert from unit to base unit, then to target unit
    const baseValue = val * fromUnitObj.factor;
    return baseValue / toUnitObj.factor;
  };

  useEffect(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setResult('');
      setAllConversions([]);
      return;
    }

    // Direct Conversion
    const converted = convertValue(num, fromUnit, toUnit);
    setResult(
      converted % 1 === 0 ? converted.toString() : converted.toFixed(6).replace(/\.?0+$/, '')
    );

    // Alternative conversions list
    const list = activeCategory.units
      .filter((u) => u.value !== fromUnit)
      .map((u) => {
        const valueConverted = convertValue(num, fromUnit, u.value);
        const formatted = valueConverted % 1 === 0 
          ? valueConverted.toString() 
          : valueConverted.toFixed(6).replace(/\.?0+$/, '');
        return {
          label: u.label,
          value: formatted,
        };
      });
    setAllConversions(list);
  }, [inputValue, fromUnit, toUnit, category]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        {/* Converter Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StraightenIcon color="primary" /> Conversion Category
              </Typography>

              <FormControl size="small" fullWidth>
                <InputLabel>Measurement Type</InputLabel>
                <Select
                  value={category}
                  label="Measurement Type"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CONVERSION_DATA.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    label="From Value"
                    type="number"
                    fullWidth
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <FormControl size="small" fullWidth sx={{ mt: 1.5 }}>
                    <Select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                      {activeCategory.units.map((u) => (
                        <MenuItem key={u.value} value={u.value}>
                          {u.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <IconButton onClick={handleSwap} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <SwapHorizIcon />
                  </IconButton>
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    label="To Value (Result)"
                    fullWidth
                    value={result}
                    slotProps={{
                      input: { readOnly: true },
                      inputLabel: { shrink: true }
                    }}
                  />
                  <FormControl size="small" fullWidth sx={{ mt: 1.5 }}>
                    <Select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                      {activeCategory.units.map((u) => (
                        <MenuItem key={u.value} value={u.value}>
                          {u.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* All equivalents list */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Equivalent Values
              </Typography>
              {allConversions.length > 0 ? (
                <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
                  {allConversions.map((conv, idx) => (
                    <Box key={idx}>
                      <ListItem sx={{ py: 0.75 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                              {conv.value}
                            </Typography>
                          }
                          secondary={conv.label}
                        />
                      </ListItem>
                      {idx < allConversions.length - 1 && <Divider component="li" />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Enter a number to see alternative unit calculations.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
