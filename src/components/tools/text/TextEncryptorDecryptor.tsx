'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

type Algorithm = 'caesar' | 'vigenere' | 'aes-gcm';

function caesarCipher(str: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return str
    .split('')
    .map((char) => {
      const charCode = char.charCodeAt(0);
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((charCode - 97 + s) % 26) + 97);
      } else if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((charCode - 65 + s) % 26) + 65);
      } else {
        return char;
      }
    })
    .join('');
}

function vigenereCipher(str: string, key: string, decrypt = false): string {
  if (!key) return str;
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (normalizedKey.length === 0) return str;

  let keyIndex = 0;
  return str
    .split('')
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        const charCode = char.charCodeAt(0);
        const isUpper = char >= 'A' && char <= 'Z';
        const base = isUpper ? 65 : 97;
        const keyCharShift = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 97;
        
        let shift = decrypt ? -keyCharShift : keyCharShift;
        shift = ((shift % 26) + 26) % 26;

        keyIndex++;
        return String.fromCharCode(((charCode - base + shift) % 26) + base);
      }
      return char;
    })
    .join('');
}

async function aesEncrypt(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    enc.encode(text)
  );

  const resultBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  resultBuffer.set(salt, 0);
  resultBuffer.set(iv, salt.byteLength);
  resultBuffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode(...resultBuffer));
}

async function aesDecrypt(base64Ciphertext: string, password: string): Promise<string> {
  const binaryString = atob(base64Ciphertext);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  if (buffer.length < 28) {
    throw new Error('Invalid ciphertext length');
  }

  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const ciphertext = buffer.slice(28);

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    ciphertext
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

export default function TextEncryptorDecryptor() {
  const [tabIndex, setTabIndex] = useState(0); 
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [algo, setAlgo] = useState<Algorithm>('aes-gcm');
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('');
  const [aesPassword, setAesPassword] = useState('');
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleProcess = async () => {
    if (!inputText) return;
    setAlertInfo(null);
    const isEncrypt = tabIndex === 0;

    try {
      if (algo === 'caesar') {
        const shift = isEncrypt ? caesarShift : -caesarShift;
        const result = caesarCipher(inputText, shift);
        setOutputText(result);
        setAlertInfo({
          type: 'success',
          message: `Successfully ${isEncrypt ? 'encrypted' : 'decrypted'} text using Caesar Cipher!`,
        });
      } else if (algo === 'vigenere') {
        if (!vigenereKey) {
          setAlertInfo({ type: 'error', message: 'Vigenère Cipher requires a key string.' });
          return;
        }
        const result = vigenereCipher(inputText, vigenereKey, !isEncrypt);
        setOutputText(result);
        setAlertInfo({
          type: 'success',
          message: `Successfully ${isEncrypt ? 'encrypted' : 'decrypted'} text using Vigenère Cipher!`,
        });
      } else if (algo === 'aes-gcm') {
        if (!aesPassword) {
          setAlertInfo({ type: 'error', message: 'AES-256 requires a password.' });
          return;
        }
        if (isEncrypt) {
          const result = await aesEncrypt(inputText, aesPassword);
          setOutputText(result);
          setAlertInfo({
            type: 'success',
            message: 'Successfully encrypted text using AES-256-GCM!',
          });
        } else {
          try {
            const result = await aesDecrypt(inputText, aesPassword);
            setOutputText(result);
            setAlertInfo({
              type: 'success',
              message: 'Successfully decrypted text using AES-256-GCM!',
            });
          } catch (e) {
            setAlertInfo({
              type: 'error',
              message: 'Decryption failed! Ensure the cipher text is valid Base64 and the password is correct.',
            });
          }
        }
      }
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: `Error: ${err.message || 'An unexpected error occurred.'}`,
      });
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setAlertInfo({ type: 'info', message: 'Output copied to clipboard!' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setAlertInfo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Mode Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => {
          setTabIndex(val);
          if (outputText && !inputText) {
            setInputText(outputText);
            setOutputText('');
          } else {
            setOutputText('');
          }
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<LockIcon />} label="Encrypt Text" iconPosition="start" />
        <Tab icon={<LockOpenIcon />} label="Decrypt Text" iconPosition="start" />
      </Tabs>

      {/* Inputs and Outputs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Plaintext to Encrypt' : 'Ciphertext to Decrypt (Base64 for AES)'}
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder={
              tabIndex === 0
                ? 'Enter the secret message here...'
                : 'Enter the encrypted text here...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {tabIndex === 0 ? 'Encrypted Result' : 'Decrypted Result'}
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            placeholder="Result will appear here..."
            value={outputText}
          />
        </Box>
      </Box>

      {/* Parameter Inputs */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: '33%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel id="algo-label">Algorithm</InputLabel>
              <Select
                labelId="algo-label"
                value={algo}
                label="Algorithm"
                onChange={(e) => setAlgo(e.target.value as Algorithm)}
              >
                <MenuItem value="aes-gcm">AES-256 GCM (Highly Secure)</MenuItem>
                <MenuItem value="caesar">Caesar Cipher (Classic Shift)</MenuItem>
                <MenuItem value="vigenere">Vigenère Cipher (Classic Key)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: 1, width: '100%' }}>
            {algo === 'caesar' && (
              <TextField
                label="Shift Value (1 - 25)"
                type="number"
                size="small"
                fullWidth
                slotProps={{
                  htmlInput: { min: 1, max: 25 }
                }}
                value={caesarShift}
                onChange={(e) => setCaesarShift(Math.max(1, Math.min(25, parseInt(e.target.value) || 1)))}
              />
            )}

            {algo === 'vigenere' && (
              <TextField
                label="Vigenère Secret Key (Alphabetical)"
                placeholder="e.g. KEYWORD"
                size="small"
                fullWidth
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              />
            )}

            {algo === 'aes-gcm' && (
              <TextField
                label="AES Password / Passphrase"
                placeholder="Enter strong password"
                type="password"
                size="small"
                fullWidth
                value={aesPassword}
                onChange={(e) => setAesPassword(e.target.value)}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Action Controls */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClear}
          disabled={!inputText && !outputText}
        >
          Clear
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          disabled={!outputText}
        >
          Copy Output
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={tabIndex === 0 ? <LockIcon /> : <LockOpenIcon />}
          onClick={handleProcess}
          disabled={!inputText}
        >
          {tabIndex === 0 ? 'Encrypt' : 'Decrypt'}
        </Button>
      </Box>
    </Box>
  );
}
