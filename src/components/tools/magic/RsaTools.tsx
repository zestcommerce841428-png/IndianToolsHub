'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Stack,
  SelectChangeEvent,
  Tabs,
  Tab,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import LanguageIcon from '@mui/icons-material/Language';
import KeyIcon from '@mui/icons-material/Key';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import CreateIcon from '@mui/icons-material/Create';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'RSA Cryptography Suite',
    subtitle: 'Generate RSA key pairs, encrypt/decrypt text, and sign/verify signatures natively in your browser.',
    keygenTab: 'Key Generator',
    encryptTab: 'Encrypt',
    decryptTab: 'Decrypt',
    signTab: 'Sign',
    verifyTab: 'Verify',
    keySize: 'Key Size (Bits)',
    purpose: 'Key Purpose',
    purposeEnc: 'Encryption / Decryption (RSA-OAEP)',
    purposeSig: 'Signature / Verification (PKCS1 v1.5)',
    hash: 'Hash Algorithm',
    pubKey: 'Public Key (PEM)',
    privKey: 'Private Key (PEM)',
    generate: 'Generate Key Pair',
    inputMsg: 'Plaintext Message',
    cipherText: 'Ciphertext (Base64)',
    encrypt: 'Encrypt Message',
    decrypt: 'Decrypt Ciphertext',
    sign: 'Sign Message',
    verify: 'Verify Signature',
    signature: 'Signature (Base64)',
    clear: 'Clear',
    copied: 'Copied to clipboard',
    verifyValid: '✅ Signature is VALID',
    verifyInvalid: '❌ Signature is INVALID',
    trust_users: '🌍 100% Native Sandbox Processing',
    trust_rating: '🔒 Zero Data transmitted to servers',
    trust_privacy: '🚀 High-Performance WebCrypto API',
    trust_free: '🚫 Free, Offline-Ready, No Ads',
  },
  'zh-CN': {
    title: 'RSA 密写与签名套件',
    subtitle: '在浏览器中安全地生成 RSA 密钥对、加密/解密文本以及签名/验签。',
    keygenTab: '密钥生成器',
    encryptTab: '加密',
    decryptTab: '解密',
    signTab: '签名',
    verifyTab: '验签',
    keySize: '密钥长度 (位)',
    purpose: '密钥用途',
    purposeEnc: '数据加密/解密 (RSA-OAEP)',
    purposeSig: '签名/验签 (PKCS1 v1.5)',
    hash: '哈希算法',
    pubKey: '公钥 (PEM)',
    privKey: '私钥 (PEM)',
    generate: '生成密钥对',
    inputMsg: '明文消息',
    cipherText: '密文 (Base64)',
    encrypt: '加密消息',
    decrypt: '解密密文',
    sign: '签名消息',
    verify: '验证签名',
    signature: '签名 (Base64)',
    clear: '清空',
    copied: '已复制到剪贴板',
    verifyValid: '✅ 签名有效',
    verifyInvalid: '❌ 签名无效',
    trust_users: '🌍 100% 本地浏览器处理',
    trust_rating: '🔒 数据永不离开您的设备',
    trust_privacy: '🚀 高性能 WebCrypto API 加速',
    trust_free: '🚫 免费、无广告、可离线使用',
  },
  es: {
    title: 'Suite de Criptografía RSA',
    subtitle: 'Genera pares de claves RSA, cifra/descifra texto y firma/verifica firmas de forma nativa.',
    keygenTab: 'Generador de claves',
    encryptTab: 'Cifrar',
    decryptTab: 'Descifrar',
    signTab: 'Firmar',
    verifyTab: 'Verificar',
    keySize: 'Tamaño de clave (Bits)',
    purpose: 'Propósito de clave',
    purposeEnc: 'Cifrado / Descifrado (RSA-OAEP)',
    purposeSig: 'Firma / Verificación (PKCS1 v1.5)',
    hash: 'Algoritmo Hash',
    pubKey: 'Clave pública (PEM)',
    privKey: 'Clave privada (PEM)',
    generate: 'Generar par de claves',
    inputMsg: 'Mensaje en texto plano',
    cipherText: 'Texto cifrado (Base64)',
    encrypt: 'Cifrar Mensaje',
    decrypt: 'Descifrar Texto Cifrado',
    sign: 'Firmar Mensaje',
    verify: 'Verificar Firma',
    signature: 'Firma (Base64)',
    clear: 'Limpiar',
    copied: 'Copiado al portapapeles',
    verifyValid: '✅ La firma es VÁLIDA',
    verifyInvalid: '❌ La firma es INVÁLIDA',
    trust_users: '🌍 100% Procesamiento en Sandbox',
    trust_rating: '🔒 Cero datos transmitidos al servidor',
    trust_privacy: '🚀 API WebCrypto de alto rendimiento',
    trust_free: '🚫 Gratis, listo para usar sin conexión',
  },
  fr: {
    title: 'Suite Cryptographique RSA',
    subtitle: 'Générez des clés RSA, chiffrez/déchiffrez des messages et signez/vérifiez des signatures en local.',
    keygenTab: 'Générateur de Clés',
    encryptTab: 'Chiffrer',
    decryptTab: 'Déchiffrer',
    signTab: 'Signer',
    verifyTab: 'Vérifier',
    keySize: 'Taille de Clé (Bits)',
    purpose: 'Usage de la Clé',
    purposeEnc: 'Chiffrement / Déchiffrement (RSA-OAEP)',
    purposeSig: 'Signature / Vérification (PKCS1 v1.5)',
    hash: 'Algorithme de Hash',
    pubKey: 'Clé Publique (PEM)',
    privKey: 'Clé Privée (PEM)',
    generate: 'Générer la Paire de Clés',
    inputMsg: 'Message (Texte)',
    cipherText: 'Texte Chiffré (Base64)',
    encrypt: 'Chiffrer le Message',
    decrypt: 'Déchiffrer le Texte',
    sign: 'Signer le Message',
    verify: 'Vérifier la Signature',
    signature: 'Signature (Base64)',
    clear: 'Effacer',
    copied: 'Copié dans le presse-papiers',
    verifyValid: '✅ Signature VALIDE',
    verifyInvalid: '❌ Signature INVALIDE',
    trust_users: '🌍 15 000+ développeurs font confiance',
    trust_rating: '🔒 Données 100% locales',
    trust_privacy: '🚀 API WebCrypto Accélérée',
    trust_free: '🚫 Gratuit, Sans Compte ni Pub',
  },
};

// Utilities for array buffer conversions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function convertDerToPem(der: ArrayBuffer, label: string): string {
  const base64 = arrayBufferToBase64(der);
  const chunks = base64.match(/.{1,64}/g);
  return `-----BEGIN ${label}-----\n${chunks ? chunks.join('\n') : base64}\n-----END ${label}-----`;
}

function convertPemToDer(pem: string, label: string): ArrayBuffer {
  const cleanPem = pem
    .replace(new RegExp(`-----BEGIN ${label}-----`), '')
    .replace(new RegExp(`-----END ${label}-----`), '')
    .replace(/\s/g, '');
  return base64ToArrayBuffer(cleanPem);
}

export default function RsaTools() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState(0);

  // States for Keygen
  const [keySize, setKeySize] = useState<number>(2048);
  const [keyPurpose, setKeyPurpose] = useState<string>('RSA-OAEP');
  const [hashAlg, setHashAlg] = useState<string>('SHA-256');
  
  // Key inputs & PEM
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  
  // Encrypt/Decrypt/Sign/Verify buffers
  const [message, setMessage] = useState('');
  const [cipherText, setCipherText] = useState('');
  const [signature, setSignature] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleClear = () => {
    setPublicKeyPem('');
    setPrivateKeyPem('');
    setMessage('');
    setCipherText('');
    setSignature('');
    setVerifyStatus(null);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleGenerateKeys = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const usages = keyPurpose === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify'];
      
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: keyPurpose,
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: hashAlg },
        },
        true,
        usages as KeyUsage[]
      );

      const exportedPriv = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

      setPrivateKeyPem(convertDerToPem(exportedPriv, 'PRIVATE KEY'));
      setPublicKeyPem(convertDerToPem(exportedPub, 'PUBLIC KEY'));
      setSuccessMsg('RSA key pair generated successfully.');
    } catch (err: any) {
      setErrorMsg(`Generation failed: ${err.message}`);
    }
  };

  const handleEncrypt = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!message || !publicKeyPem) {
      setErrorMsg('Please provide message and Public Key.');
      return;
    }

    try {
      const pubDer = convertPemToDer(publicKeyPem, 'PUBLIC KEY');
      const importedKey = await window.crypto.subtle.importKey(
        'spki',
        pubDer,
        {
          name: 'RSA-OAEP',
          hash: { name: hashAlg },
        },
        true,
        ['encrypt']
      );

      const encoder = new TextEncoder();
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        importedKey,
        encoder.encode(message)
      );

      setCipherText(arrayBufferToBase64(encrypted));
      setSuccessMsg('Message encrypted successfully.');
    } catch (err: any) {
      setErrorMsg(`Encryption failed: ${err.message}`);
    }
  };

  const handleDecrypt = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!cipherText || !privateKeyPem) {
      setErrorMsg('Please provide Ciphertext and Private Key.');
      return;
    }

    try {
      const privDer = convertPemToDer(privateKeyPem, 'PRIVATE KEY');
      const importedKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privDer,
        {
          name: 'RSA-OAEP',
          hash: { name: hashAlg },
        },
        true,
        ['decrypt']
      );

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        importedKey,
        base64ToArrayBuffer(cipherText)
      );

      const decoder = new TextDecoder();
      setMessage(decoder.decode(decrypted));
      setSuccessMsg('Ciphertext decrypted successfully.');
    } catch (err: any) {
      setErrorMsg(`Decryption failed: ${err.message}`);
    }
  };

  const handleSign = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!message || !privateKeyPem) {
      setErrorMsg('Please provide Message and Private Key.');
      return;
    }

    try {
      const privDer = convertPemToDer(privateKeyPem, 'PRIVATE KEY');
      const importedKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privDer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: { name: hashAlg },
        },
        true,
        ['sign']
      );

      const encoder = new TextEncoder();
      const signed = await window.crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        importedKey,
        encoder.encode(message)
      );

      setSignature(arrayBufferToBase64(signed));
      setSuccessMsg('Signature generated successfully.');
    } catch (err: any) {
      setErrorMsg(`Signing failed: ${err.message}`);
    }
  };

  const handleVerify = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    setVerifyStatus(null);
    if (!message || !publicKeyPem || !signature) {
      setErrorMsg('Please provide Message, Public Key, and Signature.');
      return;
    }

    try {
      const pubDer = convertPemToDer(publicKeyPem, 'PUBLIC KEY');
      const importedKey = await window.crypto.subtle.importKey(
        'spki',
        pubDer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: { name: hashAlg },
        },
        true,
        ['verify']
      );

      const encoder = new TextEncoder();
      const isValid = await window.crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
        importedKey,
        base64ToArrayBuffer(signature),
        encoder.encode(message)
      );

      if (isValid) {
        setVerifyStatus(t('verifyValid'));
      } else {
        setVerifyStatus(t('verifyInvalid'));
      }
    } catch (err: any) {
      setErrorMsg(`Verification failed: ${err.message}`);
    }
  };

  const handleCopy = (val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      setSuccessMsg(t('copied'));
      setTimeout(() => setSuccessMsg(''), 3000);
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LanguageIcon color="action" />
            <Select value={lang} onChange={handleLanguageChange}>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="zh-CN">简体中文</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
            </Select>
          </Stack>
        </FormControl>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => {
          setActiveTab(val);
          setSuccessMsg('');
          setErrorMsg('');
          setVerifyStatus(null);
        }}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label={t('keygenTab')} />
        <Tab label={t('encryptTab')} />
        <Tab label={t('decryptTab')} />
        <Tab label={t('signTab')} />
        <Tab label={t('verifyTab')} />
      </Tabs>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side settings/actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent>
              {/* General Config */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('hash')}</InputLabel>
                  <Select value={hashAlg} label={t('hash')} onChange={(e) => setHashAlg(e.target.value)}>
                    <MenuItem value="SHA-1">SHA-1</MenuItem>
                    <MenuItem value="SHA-256">SHA-256</MenuItem>
                    <MenuItem value="SHA-384">SHA-384</MenuItem>
                    <MenuItem value="SHA-512">SHA-512</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {activeTab === 0 && (
                <Box>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <FormControl size="small">
                      <InputLabel>{t('keySize')}</InputLabel>
                      <Select
                        value={keySize}
                        label={t('keySize')}
                        onChange={(e) => setKeySize(Number(e.target.value))}
                      >
                        <MenuItem value={1024}>1024 Bits</MenuItem>
                        <MenuItem value={2048}>2048 Bits</MenuItem>
                        <MenuItem value={4096}>4096 Bits</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small">
                      <InputLabel>{t('purpose')}</InputLabel>
                      <Select
                        value={keyPurpose}
                        label={t('purpose')}
                        onChange={(e) => setKeyPurpose(e.target.value)}
                      >
                        <MenuItem value="RSA-OAEP">{t('purposeEnc')}</MenuItem>
                        <MenuItem value="RSASSA-PKCS1-v1_5">{t('purposeSig')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Button variant="contained" fullWidth startIcon={<KeyIcon />} onClick={handleGenerateKeys}>
                    {t('generate')}
                  </Button>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <TextField
                    fullWidth
                    label={t('inputMsg')}
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label={t('pubKey')}
                    multiline
                    rows={5}
                    value={publicKeyPem}
                    onChange={(e) => setPublicKeyPem(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button variant="contained" color="primary" startIcon={<LockIcon />} onClick={handleEncrypt}>
                    {t('encrypt')}
                  </Button>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <TextField
                    fullWidth
                    label={t('cipherText')}
                    multiline
                    rows={4}
                    value={cipherText}
                    onChange={(e) => setCipherText(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label={t('privKey')}
                    multiline
                    rows={5}
                    value={privateKeyPem}
                    onChange={(e) => setPrivateKeyPem(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button variant="contained" color="secondary" startIcon={<LockOpenIcon />} onClick={handleDecrypt}>
                    {t('decrypt')}
                  </Button>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <TextField
                    fullWidth
                    label={t('inputMsg')}
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label={t('privKey')}
                    multiline
                    rows={5}
                    value={privateKeyPem}
                    onChange={(e) => setPrivateKeyPem(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button variant="contained" color="warning" startIcon={<CreateIcon />} onClick={handleSign}>
                    {t('sign')}
                  </Button>
                </Box>
              )}

              {activeTab === 4 && (
                <Box>
                  <TextField
                    fullWidth
                    label={t('inputMsg')}
                    multiline
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label={t('pubKey')}
                    multiline
                    rows={4}
                    value={publicKeyPem}
                    onChange={(e) => setPublicKeyPem(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label={t('signature')}
                    multiline
                    rows={2}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleVerify}>
                    {t('verify')}
                  </Button>
                </Box>
              )}

              {activeTab !== 0 && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RotateLeftIcon />}
                  onClick={handleClear}
                  sx={{ mt: 3 }}
                >
                  {t('clear')}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side Outputs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {activeTab === 0 && (
                <Stack spacing={3} sx={{ flexGrow: 1 }}>
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{t('pubKey')}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(publicKeyPem)} disabled={!publicKeyPem}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      value={publicKeyPem}
                      slotProps={{ input: { readOnly: true } }}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.8rem' } }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{t('privKey')}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(privateKeyPem)} disabled={!privateKeyPem}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      value={privateKeyPem}
                      slotProps={{ input: { readOnly: true } }}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.8rem' } }}
                    />
                  </Box>
                </Stack>
              )}

              {activeTab === 1 && (
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{t('cipherText')}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(cipherText)} disabled={!cipherText}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={cipherText}
                    slotProps={{ input: { readOnly: true } }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Box>
              )}

              {activeTab === 2 && (
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{t('inputMsg')}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(message)} disabled={!message}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={message}
                    slotProps={{ input: { readOnly: true } }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Box>
              )}

              {activeTab === 3 && (
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{t('signature')}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(signature)} disabled={!signature}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={signature}
                    slotProps={{ input: { readOnly: true } }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Box>
              )}

              {activeTab === 4 && (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {verifyStatus ? (
                    <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      {verifyStatus}
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Please provide verify parameters and run verification.
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trust Badges */}
      <Stack
        direction="row"
        sx={{ mt: 5, color: 'text.secondary', fontSize: '0.875rem', justifyContent: 'center', gap: 3 }}
      >
        <Typography variant="body2">{t('trust_users')}</Typography>
        <Typography variant="body2">{t('trust_rating')}</Typography>
        <Typography variant="body2">{t('trust_privacy')}</Typography>
        <Typography variant="body2">{t('trust_free')}</Typography>
      </Stack>
    </Box>
  );
}
