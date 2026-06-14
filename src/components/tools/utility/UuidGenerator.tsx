'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export default function UuidGenerator() {
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [noHyphens, setNoHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUUIDs = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      if (noHyphens) {
        uuid = uuid.replace(/-/g, '');
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      list.push(uuid);
    }
    setUuids(list);
  };

  const handleCopyAll = () => {
    if (uuids.length > 0) {
      navigator.clipboard.writeText(uuids.join('\n'));
      alert('All UUIDs copied to clipboard!');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="uuid-qty-label">Quantity</InputLabel>
          <Select
            labelId="uuid-qty-label"
            value={quantity}
            label="Quantity"
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            <MenuItem value={1}>1 UUID</MenuItem>
            <MenuItem value={5}>5 UUIDs</MenuItem>
            <MenuItem value={10}>10 UUIDs</MenuItem>
            <MenuItem value={20}>20 UUIDs</MenuItem>
            <MenuItem value={50}>50 UUIDs</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={<Checkbox checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />}
          label="Uppercase Casing"
        />

        <FormControlLabel
          control={<Checkbox checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} />}
          label="Remove Hyphens"
        />

        <Button variant="contained" color="primary" startIcon={<AutorenewIcon />} onClick={generateUUIDs} sx={{ ml: 'auto' }}>
          Generate UUIDs
        </Button>
      </Stack>

      {/* Output list */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Generated UUIDs
        </Typography>

        {uuids.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card variant="outlined" sx={{ bgcolor: 'rgba(0, 0, 0, 0.01)', borderStyle: 'dashed' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <pre style={{ margin: 0, overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {uuids.join('\n')}
                </pre>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyAll}>
                Copy All to Clipboard
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              color: 'text.secondary',
            }}
          >
            Click the "Generate UUIDs" button above to generate unique identifiers.
          </Box>
        )}
      </Box>
    </Box>
  );
}
