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
import CreateIcon from '@mui/icons-material/Create';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'ECDSA Cryptography Tool',
    title: 'ECDSA Signature Suite',
    subtitle: 'Generate ECDSA key pairs, sign messages, and verify signatures locally using Web Crypto.',
    genKeysTab: 'Key Generator',
    signTab: 'Sign Message',
    verifyTab: 'Verify Signature',
    curve: 'Named Curve',
    generateBtn: 'Generate Key Pair',
    pubKey: 'Public Key (PEM)',
    privKey: 'Private Key (PEM)',
    inputMsg: 'Message String',
    signatureOutput: 'Generated Signature (Base64)',
    signBtn: 'Sign Message',
    verifyBtn: 'Verify Signature',
    sigInput: 'Signature (Base64)',
    statusSuccess: 'Operation succeeded!',
    verifyValid: '✅ Signature is VALID',
    verifyInvalid: '❌ Signature is INVALID',
    clear: 'Clear',
    copied: 'Copied to clipboard',
    trust_users: '🌍 100% Client-Side Encryption',
    trust_rating: '🔒 Private Keys never leave your PC',
    trust_privacy: '🚀 WebCrypto Hardware Acceleration',
    trust_free: '🚫 No Server Logs, No Signups',
  },
  'zh-CN': {
    tool_name: 'ECDSA 密码学工具',
    title: 'ECDSA 签名与密钥管理',
    subtitle: '本地安全生成 ECDSA 密钥对、签名消息并验证签名。',
    genKeysTab: '密钥生成器',
    signTab: '签名消息',
    verifyTab: '验证签名',
    curve: '命名曲线',
    generateBtn: '生成密钥对',
    pubKey: '公钥 (PEM)',
    privKey: '私钥 (PEM)',
    inputMsg: '消息文本',
    signatureOutput: '生成的签名 (Base64)',
    signBtn: '签名消息',
    verifyBtn: '验证签名',
    sigInput: '签名 (Base64)',
    statusSuccess: '操作成功！',
    verifyValid: '✅ 签名有效',
    verifyInvalid: '❌ 签名无效',
    clear: '清空',
    copied: '已复制到剪贴板',
    trust_users: '🌍 100% 客户端运行',
    trust_rating: '🔒 密钥永不上传',
    trust_privacy: '🚀 WebCrypto 硬件加速',
    trust_free: '🚫 无服务器日志，零注册',
  },
  es: {
    tool_name: 'Herramienta ECDSA',
    title: 'Suite de Firma ECDSA',
    subtitle: 'Genera pares de claves ECDSA, firma mensajes y verifica firmas localmente.',
    genKeysTab: 'Generador de claves',
    signTab: 'Firmar mensaje',
    verifyTab: 'Verificar firma',
    curve: 'Curva elíptica',
    generateBtn: 'Generar par de claves',
    pubKey: 'Clave pública (PEM)',
    privKey: 'Clave privada (PEM)',
    inputMsg: 'Mensaje de texto',
    signatureOutput: 'Firma generada (Base64)',
    signBtn: 'Firmar mensaje',
    verifyBtn: 'Verificar firma',
    sigInput: 'Firma (Base64)',
    statusSuccess: '¡Operación exitosa!',
    verifyValid: '✅ La firma es VÁLIDA',
    verifyInvalid: '❌ La firma es INVÁLIDA',
    clear: 'Limpiar',
    copied: 'Copiado al portapapeles',
    trust_users: '🌍 100% Procesamiento Local',
    trust_rating: '🔒 Las claves nunca salen de tu PC',
    trust_privacy: '🚀 Aceleración de Hardware',
    trust_free: '🚫 Sin registro y Gratis',
  },
  fr: {
    tool_name: 'Outil ECDSA',
    title: 'Firme & Validation ECDSA',
    subtitle: 'Générez des clés ECDSA, signez vos messages et validez des signatures en local.',
    genKeysTab: 'Générateur de Clés',
    signTab: 'Signer un Message',
    verifyTab: 'Vérifier la Signature',
    curve: 'Courbe Nommée',
    generateBtn: 'Générer la Paire de Clés',
    pubKey: 'Clé Publique (PEM)',
    privKey: 'Clé Privée (PEM)',
    inputMsg: 'Message (Texte)',
    signatureOutput: 'Signature Générée (Base64)',
    signBtn: 'Signer',
    verifyBtn: 'Vérifier',
    sigInput: 'Signature (Base64)',
    statusSuccess: 'Succès !',
    verifyValid: '✅ Signature VALIDE',
    verifyInvalid: '❌ Signature INVALIDE',
    clear: 'Effacer',
    copied: 'Copié dans le presse-papiers',
    trust_users: '🌍 100% Côté Client',
    trust_rating: '🔒 Vos clés restent chez vous',
    trust_privacy: '🚀 Accélération WebCrypto',
    trust_free: '🚫 Gratuit et sans pub',
  },
};

// ArrayBuffer converters
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

export default function EcdsaTools() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState(0); // 0: Keygen, 1: Sign, 2: Verify

  // Inputs/Outputs
  const [curve, setCurve] = useState('P-256');
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  
  const [message, setMessage] = useState('');
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
    setSignature('');
    setVerifyStatus(null);
    setSuccessMsg('');
    setErrorMsg('');
  };

  // Generate ECDSA Keys
  const handleGenerateKeys = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: curve,
        },
        true,
        ['sign', 'verify']
      );

      const exportedPriv = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

      setPrivateKeyPem(convertDerToPem(exportedPriv, 'PRIVATE KEY'));
      setPublicKeyPem(convertDerToPem(exportedPub, 'PUBLIC KEY'));
      setSuccessMsg(t('statusSuccess'));
    } catch (err: any) {
      setErrorMsg(`Generation failed: ${err.message}`);
    }
  };

  // Sign Message
  const handleSign = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!message || !privateKeyPem) {
      setErrorMsg('Please enter message and Private Key.');
      return;
    }

    try {
      const privateKeyDer = convertPemToDer(privateKeyPem, 'PRIVATE KEY');
      const importedKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyDer,
        {
          name: 'ECDSA',
          namedCurve: curve,
        },
        true,
        ['sign']
      );

      const encoder = new TextEncoder();
      const rawMessage = encoder.encode(message);

      const sigBuffer = await window.crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' },
        },
        importedKey,
        rawMessage
      );

      setSignature(arrayBufferToBase64(sigBuffer));
      setSuccessMsg(t('statusSuccess'));
    } catch (err: any) {
      setErrorMsg(`Signing failed: ${err.message}`);
    }
  };

  // Verify Signature
  const handleVerify = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    setVerifyStatus(null);
    if (!message || !publicKeyPem || !signature) {
      setErrorMsg('Please enter message, Public Key, and signature.');
      return;
    }

    try {
      const publicKeyDer = convertPemToDer(publicKeyPem, 'PUBLIC KEY');
      const importedKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyDer,
        {
          name: 'ECDSA',
          namedCurve: curve,
        },
        true,
        ['verify']
      );

      const encoder = new TextEncoder();
      const rawMessage = encoder.encode(message);
      const rawSig = base64ToArrayBuffer(signature);

      const isValid = await window.crypto.subtle.verify(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' },
        },
        importedKey,
        rawSig,
        rawMessage
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
        <Tab label={t('genKeysTab')} />
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
        {/* Settings & Primary inputs */}
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
              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>{t('curve')}</InputLabel>
                <Select value={curve} label={t('curve')} onChange={(e) => setCurve(e.target.value)}>
                  <MenuItem value="P-256">NIST P-256 (secp256r1)</MenuItem>
                  <MenuItem value="P-384">NIST P-384 (secp384r1)</MenuItem>
                  <MenuItem value="P-521">NIST P-521 (secp521r1)</MenuItem>
                </Select>
              </FormControl>

              {activeTab === 0 && (
                <Box>
                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    startIcon={<KeyIcon />}
                    onClick={handleGenerateKeys}
                  >
                    {t('generateBtn')}
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
                    label={t('privKey')}
                    multiline
                    rows={6}
                    value={privateKeyPem}
                    onChange={(e) => setPrivateKeyPem(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button variant="contained" color="secondary" startIcon={<CreateIcon />} onClick={handleSign}>
                    {t('signBtn')}
                  </Button>
                </Box>
              )}

              {activeTab === 2 && (
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
                    label={t('sigInput')}
                    multiline
                    rows={2}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleVerify}>
                    {t('verifyBtn')}
                  </Button>
                </Box>
              )}

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RotateLeftIcon />}
                onClick={handleClear}
                sx={{ mt: 3, display: activeTab === 0 ? 'none' : 'inline-flex' }}
              >
                {t('clear')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results/Outputs */}
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
                    <Typography variant="subtitle2">{t('signatureOutput')}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(signature)} disabled={!signature}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={signature}
                    slotProps={{ input: { readOnly: true } }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Box>
              )}

              {activeTab === 2 && (
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
