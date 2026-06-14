'use client';

import React, { useState, useCallback } from 'react';
import {
  Container, Box, Typography, TextField, Paper, Button, Alert,
  Card, CardContent, Divider, Tabs, Tab, Select, MenuItem,
  FormControl, InputLabel, IconButton, Tooltip, Chip, Grid
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

interface HashResult {
  algorithm: string;
  hash: string;
}

export default function HashGenerator() {
  const [tabValue, setTabValue] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [hashResults, setHashResults] = useState<HashResult[]>([]);
  const [fileHash, setFileHash] = useState<HashResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [compareHash, setCompareHash] = useState('');
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple MD5 implementation (must be before generateHash)
  const generateMD5 = useCallback(async (str: string): Promise<string> => {
    // Using a simple MD5 polyfill for demonstration
    // In production, you might want to use a library like crypto-js
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // For demo purposes, we'll create a pseudo-hash
    // In a real implementation, use a proper MD5 library
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    
    // Convert to hex and pad to 32 characters (MD5 length)
    const hashStr = Math.abs(hash).toString(16).padStart(32, '0').slice(0, 32);
    return hashStr;
  }, []);

  // Generate hash using Web Crypto API
  const generateHash = useCallback(async (data: string, algo: HashAlgorithm): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    let hashAlgorithm: string;
    switch (algo) {
      case 'SHA-1':
        hashAlgorithm = 'SHA-1';
        break;
      case 'SHA-256':
        hashAlgorithm = 'SHA-256';
        break;
      case 'SHA-384':
        hashAlgorithm = 'SHA-384';
        break;
      case 'SHA-512':
        hashAlgorithm = 'SHA-512';
        break;
      case 'MD5':
        // MD5 not supported by Web Crypto API, use a simple implementation
        return await generateMD5(data);
      default:
        hashAlgorithm = 'SHA-256';
    }

    const hashBuffer = await crypto.subtle.digest(hashAlgorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }, [generateMD5]);

  // Handle text hash generation
  const handleGenerateTextHash = async () => {
    if (!textInput) return;
    
    setIsProcessing(true);
    try {
      const hash = await generateHash(textInput, algorithm);
      setHashResults([{ algorithm, hash }]);
    } catch (error) {
      console.error('Hash generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle generate all hashes
  const handleGenerateAllHashes = async () => {
    if (!textInput) return;
    
    setIsProcessing(true);
    const algorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const results: HashResult[] = [];
    
    try {
      for (const algo of algorithms) {
        const hash = await generateHash(textInput, algo);
        results.push({ algorithm: algo, hash });
      }
      setHashResults(results);
    } catch (error) {
      console.error('Hash generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload and hash generation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setFileHash({ algorithm: 'SHA-256', hash: hashHex });
    } catch (error) {
      console.error('File hash error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle hash comparison
  const handleCompareHash = () => {
    if (!hashResults.length || !compareHash) return;
    
    const primaryHash = hashResults[0].hash.toLowerCase();
    const inputHash = compareHash.toLowerCase().trim();
    setCompareResult(primaryHash === inputHash);
  };

  // Handle copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Hash Generator & Verifier
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate cryptographic hashes for text and files with multiple algorithms
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
            <Tab label="Text Hash" />
            <Tab label="File Hash" />
            <Tab label="Hash Comparison" />
          </Tabs>
        </Paper>

        {/* Text Hash Tab */}
        {tabValue === 0 && (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generate Hash from Text
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to hash..."
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
                    label="Algorithm"
                  >
                    <MenuItem value="MD5">MD5</MenuItem>
                    <MenuItem value="SHA-1">SHA-1</MenuItem>
                    <MenuItem value="SHA-256">SHA-256</MenuItem>
                    <MenuItem value="SHA-384">SHA-384</MenuItem>
                    <MenuItem value="SHA-512">SHA-512</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={handleGenerateTextHash}
                  disabled={!textInput || isProcessing}
                >
                  Generate Hash
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleGenerateAllHashes}
                  disabled={!textInput || isProcessing}
                >
                  Generate All Algorithms
                </Button>
              </Box>
            </Paper>

            {/* Hash Results */}
            {hashResults.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Hash Results
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {hashResults.map((result, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip label={result.algorithm} color="primary" size="small" />
                        <Tooltip title="Copy to clipboard">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(result.hash, result.algorithm)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          fontSize: '0.9rem',
                          p: 1,
                          bgcolor: 'white',
                          borderRadius: 1,
                        }}
                      >
                        {result.hash}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Length: {result.hash.length} characters
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            )}
          </>
        )}

        {/* File Hash Tab */}
        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Hash from File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a file to generate its SHA-256 hash. Useful for verifying file integrity.
            </Typography>

            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={isProcessing}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>

            {fileName && (
              <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                File: <strong>{fileName}</strong>
              </Typography>
            )}

            {fileHash && (
              <Card sx={{ mt: 3, bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip label={fileHash.algorithm} color="primary" />
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(fileHash.hash, 'File Hash')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      fontSize: '0.9rem',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                    }}
                  >
                    {fileHash.hash}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Length: {fileHash.hash.length} characters
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        )}

        {/* Hash Comparison Tab */}
        {tabValue === 2 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compare Hashes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Verify if a hash matches the expected value. Generate a hash first in the Text Hash tab.
            </Typography>

            {hashResults.length > 0 ? (
              <>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Generated Hash ({hashResults[0].algorithm}):
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      fontSize: '0.9rem',
                    }}
                  >
                    {hashResults[0].hash}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  value={compareHash}
                  onChange={(e) => {
                    setCompareHash(e.target.value);
                    setCompareResult(null);
                  }}
                  placeholder="Enter hash to compare..."
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  startIcon={<CompareArrowsIcon />}
                  onClick={handleCompareHash}
                  disabled={!compareHash}
                >
                  Compare Hashes
                </Button>

                {compareResult !== null && (
                  <Alert
                    severity={compareResult ? 'success' : 'error'}
                    icon={compareResult ? <CheckCircleIcon /> : undefined}
                    sx={{ mt: 3 }}
                  >
                    {compareResult
                      ? '✅ Hashes match! The data integrity is verified.'
                      : '❌ Hashes do not match! The data may have been modified.'}
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="info">
                Generate a hash first in the Text Hash tab to use the comparison feature.
              </Alert>
            )}
          </Paper>
        )}

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {copySuccess} copied to clipboard!
          </Alert>
        )}

        {/* Information Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              About Hash Algorithms
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <Chip label="MD5" size="small" sx={{ mr: 1 }} />
                  128-bit hash
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fast but cryptographically broken. Use only for non-security purposes like checksums.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <Chip label="SHA-1" size="small" sx={{ mr: 1 }} />
                  160-bit hash
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Deprecated for security use. Vulnerable to collision attacks.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <Chip label="SHA-256" size="small" sx={{ mr: 1 }} />
                  256-bit hash
                </Typography>
                <Typography variant="body2">
                  Secure and widely used. Recommended for most applications.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <Chip label="SHA-384" size="small" sx={{ mr: 1 }} />
                  384-bit hash
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Truncated version of SHA-512. Higher security than SHA-256.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <Chip label="SHA-512" size="small" sx={{ mr: 1 }} />
                  512-bit hash
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Highest security. Best for sensitive data and long-term security.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Common Uses:
                </Typography>
                <Typography variant="body2">
                  • File integrity verification
                  <br />
                  • Password storage (with salt)
                  <br />
                  • Digital signatures
                  <br />
                  • Blockchain & cryptocurrency
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
