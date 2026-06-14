'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function PdfLockUnlock() {
  const [tabValue, setTabValue] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileBuf, setFileBuf] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [alertInfo, setAlertInfo] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const encHeader = 'WBT_PDF_AES_V1';

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setFileBuf(null);
    setPassword('');
    setConfirmPassword('');
    setProcessing(false);
    setProgress(0);
    setLogs([]);
    setDownloadReady(false);
    setDownloadUrl(null);
    setDownloadFilename('');
    setAlertInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setDownloadFilename(selectedFile.name);
      setAlertInfo(null);
      setDownloadReady(false);

      // Read buffer
      try {
        const buf = await selectedFile.arrayBuffer();
        setFileBuf(buf);
      } catch (err: any) {
        setAlertInfo({ type: 'error', message: 'Failed to read file bytes: ' + err.message });
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Real client-side cryptographic functions
  const deriveKey = async (pwd: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(pwd),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 120000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const concatBuffers = (...buffers: ArrayBuffer[]): ArrayBuffer => {
    let totalLength = 0;
    for (const buf of buffers) {
      totalLength += buf.byteLength;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      result.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    return result.buffer;
  };

  const executeLock = async () => {
    if (!fileBuf || !file) {
      setAlertInfo({ type: 'error', message: 'Please select a file.' });
      return;
    }
    if (!password) {
      setAlertInfo({ type: 'error', message: 'Please enter a password.' });
      return;
    }
    if (password !== confirmPassword) {
      setAlertInfo({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setProcessing(true);
    setProgress(10);
    setLogs(['Initializing Web Crypto engine...', 'Deriving strong key using PBKDF2 iterations...']);

    try {
      // 1. Generate salt and IV
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      setProgress(40);
      setLogs((prev) => [...prev, 'Generated random cryptographic salt and IV parameters.']);

      // 2. Derive AES key
      const key = await deriveKey(password, salt);
      setProgress(60);
      setLogs((prev) => [...prev, 'Derived 256-bit AES-GCM symmetric key.']);

      // 3. Encrypt file buffer
      const cipher = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        fileBuf
      );
      setProgress(80);
      setLogs((prev) => [...prev, 'Encrypted file byte streams.']);

      // 4. Assemble package: [header\n][salt][iv][cipher]
      const encoder = new TextEncoder();
      const headerBuffer = encoder.encode(encHeader + '\n').buffer;
      const finalBuffer = concatBuffers(
        headerBuffer,
        salt.buffer,
        iv.buffer,
        cipher
      );

      const blob = new Blob([finalBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadReady(true);
      setProgress(100);
      setLogs((prev) => [...prev, 'Secure package constructed successfully.']);
      setAlertInfo({ type: 'success', message: 'PDF File encrypted successfully! Ready for download.' });
    } catch (err: any) {
      setLogs((prev) => [...prev, 'Error: ' + err.message]);
      setAlertInfo({ type: 'error', message: 'Encryption failed: ' + err.message });
    } finally {
      setProcessing(false);
    }
  };

  const executeUnlock = async () => {
    if (!fileBuf || !file) {
      setAlertInfo({ type: 'error', message: 'Please select a file.' });
      return;
    }
    if (!password) {
      setAlertInfo({ type: 'error', message: 'Please enter a password.' });
      return;
    }

    setProcessing(true);
    setProgress(15);
    setLogs(['Reading encrypted package header...', 'Validating file format...']);

    try {
      const u8 = new Uint8Array(fileBuf);
      const separatorIndex = u8.indexOf(10); // Find \n character
      if (separatorIndex < 0) {
        throw new Error('Invalid file structure. Header separation tag missing.');
      }

      const decoder = new TextDecoder();
      const headerStr = decoder.decode(u8.slice(0, separatorIndex));
      if (headerStr !== encHeader) {
        throw new Error('Unsupported encryption header. File was not protected by this toolkit.');
      }
      setProgress(40);
      setLogs((prev) => [...prev, 'Valid header signature match found. Parsing salt and IV...']);

      // Extract body variables
      const body = u8.slice(separatorIndex + 1);
      const salt = body.slice(0, 16);
      const iv = body.slice(16, 28);
      const cipher = body.slice(28);

      // Derive key
      const key = await deriveKey(password, salt);
      setProgress(70);
      setLogs((prev) => [...prev, 'Derived AES key from password. Decrypting block data...']);

      // Decrypt cipher
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        cipher.buffer
      );

      const blob = new Blob([decryptedBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadReady(true);
      setProgress(100);
      setLogs((prev) => [...prev, 'Successfully decrypted package bytes. PDF format recovered.']);
      setAlertInfo({ type: 'success', message: 'File decrypted successfully! Ready for download.' });
    } catch (err: any) {
      setLogs((prev) => [...prev, 'Error: Decryption failed. Wrong password or corrupted file.']);
      setAlertInfo({ type: 'error', message: 'Decryption failed: ' + (err.message || 'Wrong password.') });
    } finally {
      setProcessing(false);
    }
  };

  const getTargetDownloadName = (): string => {
    if (tabValue === 0) {
      return downloadFilename.replace(/\.pdf$/i, '') + '.pdf.enc';
    } else {
      return downloadFilename.replace(/\.enc$/i, '') || 'restored_document.pdf';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Selector Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab icon={<LockIcon />} label="Encrypt PDF (PBKDF2/AES-GCM)" sx={{ fontWeight: 700 }} />
        <Tab icon={<LockOpenIcon />} label="Decrypt Encrypted File" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* File picker */}
      {!file ? (
        <Card
          variant="outlined"
          onClick={triggerUpload}
          sx={{
            border: '2px dashed #cbd5e1',
            borderRadius: 3,
            bgcolor: 'background.paper',
            cursor: 'pointer',
            textAlign: 'center',
            p: 5,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(37, 99, 235, 0.02)',
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={tabValue === 0 ? 'application/pdf' : '.enc'}
            style={{ display: 'none' }}
          />
          <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            {tabValue === 0 ? 'Select PDF to Encrypt' : 'Select Encrypted File (.enc)'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag-and-drop or click to browse files
          </Typography>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PictureAsPdfIcon />
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {(file.size / 1024).toFixed(1)} KB &bull; Loaded and Parsed
              </Typography>
            </Box>
            {!processing && !downloadReady && (
              <Button size="small" variant="text" color="error" onClick={resetState}>
                Remove
              </Button>
            )}
          </Box>
        </Card>
      )}

      {/* Settings Form */}
      {file && (
        <Card variant="outlined" sx={{ p: 3 }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              {tabValue === 0 ? 'Encryption Settings' : 'Decryption Settings'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={processing || downloadReady}
                  fullWidth
                  variant="outlined"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />

                {tabValue === 0 && (
                  <TextField
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={processing || downloadReady}
                    fullWidth
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {!downloadReady ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={tabValue === 0 ? executeLock : executeUnlock}
                    disabled={processing || !password || (tabValue === 0 && !confirmPassword)}
                    startIcon={tabValue === 0 ? <LockIcon /> : <LockOpenIcon />}
                  >
                    {processing ? 'Processing...' : tabValue === 0 ? 'Encrypt File' : 'Decrypt File'}
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Button variant="outlined" color="secondary" onClick={resetState}>
                      Reset
                    </Button>
                    {downloadUrl && (
                      <Button
                        variant="contained"
                        color="success"
                        component="a"
                        href={downloadUrl}
                        download={getTargetDownloadName()}
                      >
                        Download Output
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Execution logs */}
            {(processing || logs.length > 0) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cryptographic execution logs</span>
                  <strong>{progress}%</strong>
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mb: 3 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Security Engine Logs
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'action.hover',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    p: 2,
                    borderRadius: 2,
                    maxHeight: 150,
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {logs.map((log, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <span>{log}</span>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
