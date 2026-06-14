'use client';

import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Paper, Button, Alert,
  Card, CardContent, Divider, Select, MenuItem, FormControl,
  InputLabel, IconButton, Tooltip, List, ListItem, ListItemText,
  Chip
} from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

type UUIDVersion = 'v4' | 'v1';

export default function UUIDGenerator() {
  const [uuidVersion, setUuidVersion] = useState<UUIDVersion>('v4');
  const [quantity, setQuantity] = useState(1);
  const [generatedUUIDs, setGeneratedUUIDs] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState('');
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);

  // Generate UUID v4
  const generateUUIDv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Generate UUID v1 (timestamp-based, simplified)
  const generateUUIDv1 = (): string => {
    const timestamp = new Date().getTime();
    const timestampHex = timestamp.toString(16).padStart(16, '0');
    const random = Math.random().toString(16).substring(2, 14);
    
    return `${timestampHex.substring(0, 8)}-${timestampHex.substring(8, 12)}-1${timestampHex.substring(13, 16)}-${random.substring(0, 4)}-${random.substring(4, 16)}`;
  };

  // Generate UUIDs
  const handleGenerate = () => {
    const uuids: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let uuid = uuidVersion === 'v4' ? generateUUIDv4() : generateUUIDv1();
      
      if (!hyphens) {
        uuid = uuid.replace(/-/g, '');
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      
      uuids.push(uuid);
    }
    setGeneratedUUIDs(uuids);
  };

  // Generate single UUID
  const handleGenerateSingle = () => {
    let uuid = uuidVersion === 'v4' ? generateUUIDv4() : generateUUIDv1();
    
    if (!hyphens) {
      uuid = uuid.replace(/-/g, '');
    }
    if (uppercase) {
      uuid = uuid.toUpperCase();
    }
    
    setGeneratedUUIDs([...generatedUUIDs, uuid]);
  };

  // Copy single UUID
  const handleCopy = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopySuccess(uuid);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  // Copy all UUIDs
  const handleCopyAll = () => {
    const allUUIDs = generatedUUIDs.join('\n');
    navigator.clipboard.writeText(allUUIDs);
    setCopySuccess('All UUIDs');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  // Clear all
  const handleClear = () => {
    setGeneratedUUIDs([]);
  };

  // Remove single UUID
  const handleRemove = (index: number) => {
    setGeneratedUUIDs(generatedUUIDs.filter((_, i) => i !== index));
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <FingerprintIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            UUID Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate universally unique identifiers (UUIDs) in various formats
          </Typography>
        </Box>

        {/* Configuration */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>UUID Version</InputLabel>
              <Select
                value={uuidVersion}
                onChange={(e) => setUuidVersion(e.target.value as UUIDVersion)}
                label="UUID Version"
              >
                <MenuItem value="v4">Version 4 (Random)</MenuItem>
                <MenuItem value="v1">Version 1 (Timestamp)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Quantity</InputLabel>
              <Select
                value={quantity}
                onChange={(e) => setQuantity(e.target.value as number)}
                label="Quantity"
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={hyphens ? 'hyphens' : 'nohyphens'}
                onChange={(e) => setHyphens(e.target.value === 'hyphens')}
                label="Format"
              >
                <MenuItem value="hyphens">With Hyphens</MenuItem>
                <MenuItem value="nohyphens">Without Hyphens</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Case</InputLabel>
              <Select
                value={uppercase ? 'upper' : 'lower'}
                onChange={(e) => setUppercase(e.target.value === 'upper')}
                label="Case"
              >
                <MenuItem value="lower">Lowercase</MenuItem>
                <MenuItem value="upper">Uppercase</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleGenerate}
            >
              Generate {quantity} UUID{quantity > 1 ? 's' : ''}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleGenerateSingle}
            >
              Add One More
            </Button>
            {generatedUUIDs.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCopyAll}
                >
                  Copy All
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClear}
                >
                  Clear All
                </Button>
              </>
            )}
          </Box>
        </Paper>

        {/* Generated UUIDs */}
        {generatedUUIDs.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Generated UUIDs ({generatedUUIDs.length})
              </Typography>
              <Chip 
                label={`${uuidVersion.toUpperCase()}`} 
                color="primary" 
                size="small" 
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {generatedUUIDs.map((uuid, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: index % 2 === 0 ? '#f5f5f5' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Copy UUID">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(uuid)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          fontWeight: 500,
                        }}
                      >
                        {uuid}
                      </Typography>
                    }
                    secondary={`UUID #${index + 1}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {copySuccess === 'All UUIDs' ? 'All UUIDs' : 'UUID'} copied to clipboard!
          </Alert>
        )}

        {/* Information Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                UUID Version 4
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 2 }}>
                UUIDv4 uses random or pseudo-random numbers. It&apos;s the most commonly used version for general purposes.
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Format:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Characteristics:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Random generation
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • No timestamp information
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Collision probability: ~1 in 2^122
              </Typography>
              <Typography variant="body2">
                • Best for distributed systems
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                UUID Version 1
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 2 }}>
                UUIDv1 is timestamp-based, incorporating the current time and node information (MAC address).
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Format:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                xxxxxxxx-xxxx-1xxx-xxxx-xxxxxxxxxxxx
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Characteristics:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Timestamp-based
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Contains temporal ordering
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • May expose MAC address
              </Typography>
              <Typography variant="body2">
                • Good for database indexing
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Common Use Cases
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Database primary keys
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • File and document identification
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Session identifiers
                </Typography>
                <Typography variant="body2">
                  • Transaction IDs
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • API request tracking
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Distributed system coordination
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Resource naming in cloud services
                </Typography>
                <Typography variant="body2">
                  • Message queue identifiers
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
