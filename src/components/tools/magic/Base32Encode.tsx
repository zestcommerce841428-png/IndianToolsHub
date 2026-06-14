'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Base32 encoder logic
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  while (output.length % 8 !== 0) {
    output += "=";
  }
  return output;
}

function stringToBytes(str: string, encoding: string): Uint8Array {
  if (encoding === 'hex') {
    const cleanHex = str.replace(/[^0-9A-Fa-f]/g, '');
    const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    return bytes;
  }
  if (encoding === 'base64') {
    try {
      const cleanB64 = str.replace(/[^A-Za-z0-9+/=]/g, '');
      const binaryString = atob(cleanB64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      throw new Error("Invalid Base64 input");
    }
  }
  if (encoding === 'utf-16le') {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes[i * 2] = code & 0xff;
      bytes[i * 2 + 1] = (code >>> 8) & 0xff;
    }
    return bytes;
  }
  if (encoding === 'utf-16be') {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes[i * 2] = (code >>> 8) & 0xff;
      bytes[i * 2 + 1] = code & 0xff;
    }
    return bytes;
  }
  return new TextEncoder().encode(str);
}

const translations = {
  en: {
    title: 'Base32 Encode',
    subtitle: 'Encode text or files into Base32 format easily and securely',
    textTab: 'Text Encode',
    fileTab: 'File Encode',
    inputText: 'Input Text',
    outputText: 'Output Base32',
    inputPlaceholder: 'Enter text here to encode...',
    outputPlaceholder: 'Base32 encoded result will appear here...',
    inputEncoding: 'Input Encoding',
    autoUpdate: 'Auto Update',
    copy: 'Copy',
    download: 'Download',
    copied: 'Copied to clipboard!',
    dragDrop: 'Drag & drop a file here, or click to select',
    selectedFile: 'Selected File:',
    fileSuccess: 'File encoded successfully!',
    encodeBtn: 'Encode',
    error: 'Error',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'What is Base32?',
    faq1A: 'Base32 is a notation for encoding arbitrary byte data using a set of 32 symbols. It uses the characters A-Z and 2-7, making it safe for case-insensitive filesystems and human transcription.',
    faq2Q: 'Is my data safe?',
    faq2A: 'Yes. All conversion logic runs 100% locally in your browser. No files or text are ever uploaded to any servers.',
    faq3Q: 'What is the padding character?',
    faq3A: 'Base32 uses the "=" character as padding to ensure the final output length is a multiple of 8 characters.',
  },
  es: {
    title: 'Codificación Base32',
    subtitle: 'Codifique texto o archivos en formato Base32 de forma fácil y segura',
    textTab: 'Codificar Texto',
    fileTab: 'Codificar Archivo',
    inputText: 'Texto de Entrada',
    outputText: 'Resultado Base32',
    inputPlaceholder: 'Ingrese el texto aquí para codificar...',
    outputPlaceholder: 'El resultado codificado en Base32 aparecerá aquí...',
    inputEncoding: 'Codificación de Entrada',
    autoUpdate: 'Actualización Automática',
    copy: 'Copiar',
    download: 'Descargar',
    copied: '¡Copiado al portapapeles!',
    dragDrop: 'Arrastre y suelte un archivo aquí, o haga clic para seleccionar',
    selectedFile: 'Archivo Seleccionado:',
    fileSuccess: '¡Archivo codificado con éxito!',
    encodeBtn: 'Codificar',
    error: 'Error',
    faqTitle: 'Preguntas Frecuentes',
    faq1Q: '¿Qué es Base32?',
    faq1A: 'Base32 es una notación para codificar datos binarios utilizando un conjunto de 32 símbolos. Utiliza los caracteres A-Z y 2-7, lo que lo hace seguro para sistemas de archivos insensibles a mayúsculas y minúsculas y transcripción humana.',
    faq2Q: '¿Son seguros mis datos?',
    faq2A: 'Sí. Toda la lógica de conversión se ejecuta al 100% localmente en su navegador. Ningún archivo o texto se sube a ningún servidor.',
    faq3Q: '¿Cuál es el carácter de relleno?',
    faq3A: 'Base32 utiliza el carácter "=" como relleno para garantizar que la longitud de la salida final sea un múltiplo de 8 caracteres.',
  },
  fr: {
    title: 'Encodage Base32',
    subtitle: 'Encodez facilement et en toute sécurité du texte ou des fichiers au format Base32',
    textTab: 'Encoder du Texte',
    fileTab: 'Encoder un Fichier',
    inputText: 'Texte d\'Entrée',
    outputText: 'Résultat Base32',
    inputPlaceholder: 'Entrez le texte ici à encoder...',
    outputPlaceholder: 'Le résultat encodé en Base32 apparaîtra ici...',
    inputEncoding: 'Encodage d\'Entrée',
    autoUpdate: 'Mise à Jour Auto',
    copy: 'Copier',
    download: 'Télécharger',
    copied: 'Copié dans le presse-papiers !',
    dragDrop: 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner',
    selectedFile: 'Fichier Sélectionné :',
    fileSuccess: 'Fichier encodé avec succès !',
    encodeBtn: 'Encoder',
    error: 'Erreur',
    faqTitle: 'Questions Fréquemment Posées',
    faq1Q: 'Qu\'est-ce que le Base32 ?',
    faq1A: 'Le Base32 est une notation pour encoder des données binaires en utilisant un jeu de 32 symboles. Il utilise les caractères A-Z et 2-7, ce qui le rend sûr pour les systèmes de fichiers insensibles à la casse et la transcription humaine.',
    faq2Q: 'Mes données sont-elles sécurisées ?',
    faq2A: 'Oui. Toute la logique de conversion s\'exécute à 100% localement dans votre navigateur. Aucun fichier ou texte n\'est envoyé sur un serveur.',
    faq3Q: 'Quel est le caractère de remplissage ?',
    faq3A: 'Le Base32 utilise le caractère "=" comme remplissage pour s\'assurer que la longueur finale de la sortie est un multiple de 8 caractères.',
  },
  'zh-CN': {
    title: 'Base32 编码',
    subtitle: '轻松、安全地将文本或文件编码为 Base32 格式',
    textTab: '文本编码',
    fileTab: '文件编码',
    inputText: '输入文本',
    outputText: 'Base32 输出',
    inputPlaceholder: '在此处输入要编码的文本...',
    outputPlaceholder: 'Base32 编码结果将显示在此处...',
    inputEncoding: '输入字符集',
    autoUpdate: '自动更新',
    copy: '复制',
    download: '下载',
    copied: '已复制到剪贴板！',
    dragDrop: '拖拽文件至此，或点击选择文件',
    selectedFile: '已选文件：',
    fileSuccess: '文件编码成功！',
    encodeBtn: '编码',
    error: '错误',
    faqTitle: '常见问题解答',
    faq1Q: '什么是 Base32？',
    faq1A: 'Base32 是一种使用 32 个字符组成的符号集来表示任意二进制数据的编码方案。它使用 A-Z 和数字 2-7，对大小写不敏感的文件系统及人类手动记录非常友好。',
    faq2Q: '我的数据安全吗？',
    faq2A: '安全。所有编码计算完全在您的浏览器本地进行，绝不会将您的文本或文件上传至任何服务器。',
    faq3Q: '什么是填充字符？',
    faq3A: 'Base32 使用 "=" 字符作为填充，以确保最终输出的长度是 8 的倍数。',
  },
};

export default function Base32Encode() {
  const [lang, setLang] = useState<'en' | 'es' | 'fr' | 'zh-CN'>('en');
  const [tab, setTab] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [inputEncoding, setInputEncoding] = useState<string>('utf-8');
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [output, setOutput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const t = translations[lang];

  const handleEncode = useCallback(() => {
    setAlertMsg(null);
    if (tab === 0) {
      if (!inputText) {
        setOutput('');
        return;
      }
      try {
        const bytes = stringToBytes(inputText, inputEncoding);
        const encoded = base32Encode(bytes);
        setOutput(encoded);
      } catch (err: any) {
        setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
        setOutput('');
      }
    } else {
      if (!file) {
        setAlertMsg({ type: 'error', text: lang === 'zh-CN' ? '请选择一个文件' : 'Please select a file' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          const encoded = base32Encode(bytes);
          setOutput(encoded);
          setAlertMsg({ type: 'success', text: t.fileSuccess });
        } catch (err: any) {
          setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
        }
      };
      reader.onerror = () => {
        setAlertMsg({ type: 'error', text: lang === 'zh-CN' ? '文件读取失败' : 'Failed to read file' });
      };
      reader.readAsArrayBuffer(file);
    }
  }, [tab, inputText, inputEncoding, file, t, lang]);

  useEffect(() => {
    if (autoUpdate && tab === 0) {
      handleEncode();
    }
  }, [inputText, inputEncoding, autoUpdate, tab, handleEncode]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setAlertMsg({ type: 'success', text: t.copied });
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file ? `${file.name}.base32.txt` : 'encoded.base32.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAlertMsg(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Grid container spacing={3} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
            {t.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t.subtitle}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select value={lang} label="Language" onChange={(e) => setLang(e.target.value as any)}>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="zh-CN">简体中文</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', mb: 4 }}>
        <Tabs value={tab} onChange={(_, val) => { setTab(val); setOutput(''); setAlertMsg(null); }} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t.textTab} />
          <Tab label={t.fileTab} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {alertMsg && (
            <Alert severity={alertMsg.type} sx={{ mb: 3 }} onClose={() => setAlertMsg(null)}>
              {alertMsg.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Input column */}
            <Grid size={{ xs: 12, md: 6 }}>
              {tab === 0 ? (
                <Stack spacing={2}>
                  <TextField
                    label={t.inputText}
                    multiline
                    rows={8}
                    variant="outlined"
                    placeholder={t.inputPlaceholder}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    fullWidth
                  />
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>{t.inputEncoding}</InputLabel>
                      <Select
                        value={inputEncoding}
                        label={t.inputEncoding}
                        onChange={(e) => setInputEncoding(e.target.value)}
                      >
                        <MenuItem value="utf-8">UTF-8</MenuItem>
                        <MenuItem value="utf-16le">UTF-16LE</MenuItem>
                        <MenuItem value="utf-16be">UTF-16BE</MenuItem>
                        <MenuItem value="hex">Hex</MenuItem>
                        <MenuItem value="base64">Base64</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={<Checkbox checked={autoUpdate} onChange={(e) => setAutoUpdate(e.target.checked)} />}
                      label={t.autoUpdate}
                    />
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={3} sx={{ py: 3, alignItems: 'center' }}>
                  <Box
                    sx={{
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'border-color 0.3s',
                      '&:hover': { borderColor: 'primary.main' },
                      position: 'relative',
                    }}
                  >
                    <input
                      type="file"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                      onChange={handleFileChange}
                    />
                    <UploadFileIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">{t.dragDrop}</Typography>
                  </Box>

                  {file && (
                    <Typography variant="body2" color="text.secondary">
                      {t.selectedFile} <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
                    </Typography>
                  )}

                  <Button variant="contained" color="primary" onClick={handleEncode} startIcon={<SwapHorizIcon />}>
                    {t.encodeBtn}
                  </Button>
                </Stack>
              )}
            </Grid>

            {/* Output column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                <TextField
                  label={t.outputText}
                  multiline
                  rows={8}
                  variant="outlined"
                  placeholder={t.outputPlaceholder}
                  value={output}
                  slotProps={{ htmlInput: { readOnly: true } }}
                  fullWidth
                />
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                  <IconButton onClick={handleCopy} disabled={!output} title={t.copy}>
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton onClick={handleDownload} disabled={!output} title={t.download}>
                    <DownloadIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Info & FAQ Section */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
          {t.faqTitle}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary.main">
              {t.faq1Q}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.faq1A}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary.main">
              {t.faq2Q}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.faq2A}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary.main">
              {t.faq3Q}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.faq3A}
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
