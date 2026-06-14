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

// Base58 Codec logic (based on base-x Bitcoin alphabet)
const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const SIZE_LIMIT = 20480; // 20 KB limit to prevent browser hanging on O(N^2) conversion

function base58Encode(source: Uint8Array): string {
  if (source.length === 0) return "";
  
  let zeroes = 0;
  let length = 0;
  let pbegin = 0;
  const pend = source.length;
  
  while (pbegin < pend && source[pbegin] === 0) {
    pbegin++;
    zeroes++;
  }
  
  const size = ((pend - pbegin) * 138 / 100 + 1) | 0;
  const b58 = new Uint8Array(size);
  
  while (pbegin < pend) {
    let carry = source[pbegin];
    let i = 0;
    for (let it = size - 1; (carry !== 0 || i < length) && it >= 0; it--, i++) {
      carry += 256 * b58[it];
      b58[it] = carry % 58;
      carry = (carry / 58) | 0;
    }
    length = i;
    pbegin++;
  }
  
  let it = size - length;
  while (it < size && b58[it] === 0) {
    it++;
  }
  
  let str = "";
  for (let i = 0; i < zeroes; i++) {
    str += B58_ALPHABET[0];
  }
  for (; it < size; it++) {
    str += B58_ALPHABET[b58[it]];
  }
  return str;
}

function base58Decode(source: string): Uint8Array {
  const cleaned = source.replace(/\s/g, "");
  if (cleaned.length === 0) return new Uint8Array(0);
  
  const b58Map = new Uint8Array(256);
  b58Map.fill(255);
  for (let i = 0; i < B58_ALPHABET.length; i++) {
    b58Map[B58_ALPHABET.charCodeAt(i)] = i;
  }
  
  let psz = 0;
  let zeroes = 0;
  while (psz < cleaned.length && cleaned[psz] === B58_ALPHABET[0]) {
    zeroes++;
    psz++;
  }
  
  const size = ((cleaned.length - psz) * 733 / 1000 + 1) | 0;
  const bin = new Uint8Array(size);
  
  let length = 0;
  while (psz < cleaned.length) {
    let carry = b58Map[cleaned.charCodeAt(psz)];
    if (carry === 255) {
      throw new Error(`Invalid Base58 character: ${cleaned[psz]}`);
    }
    let i = 0;
    for (let it = size - 1; (carry !== 0 || i < length) && it >= 0; it--, i++) {
      carry += 58 * bin[it];
      bin[it] = carry % 256;
      carry = (carry / 256) | 0;
    }
    length = i;
    psz++;
  }
  
  let it = size - length;
  while (it < size && bin[it] === 0) {
    it++;
  }
  
  const result = new Uint8Array(zeroes + (size - it));
  result.fill(0, 0, zeroes);
  let j = zeroes;
  for (; it < size; it++) {
    result[j++] = bin[it];
  }
  return result;
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

function bytesToString(bytes: Uint8Array, encoding: string): string {
  if (encoding === 'hex') {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  if (encoding === 'base64') {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  try {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(bytes);
  } catch (e) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }
}

const translations = {
  en: {
    title: 'Base58 Codec',
    subtitle: 'Encode to or decode from Base58 format easily and securely',
    encodeTab: 'Base58 Encode',
    decodeTab: 'Base58 Decode',
    inputText: 'Input Text',
    outputText: 'Output Text / Bytes',
    inputPlaceholderEncode: 'Enter text here to encode to Base58...',
    inputPlaceholderDecode: 'Enter Base58 string here to decode...',
    outputPlaceholder: 'Result will appear here...',
    encodingLabel: 'Encoding Option',
    autoUpdate: 'Auto Update',
    copy: 'Copy',
    download: 'Download File',
    copied: 'Copied to clipboard!',
    dragDrop: 'Drag & drop a file here, or click to select',
    selectedFile: 'Selected File:',
    fileSuccess: 'File processed successfully!',
    processBtn: 'Process',
    error: 'Error',
    sizeLimitMsg: 'File/input size exceeds the 20 KB limit to prevent browser freeze.',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'What is Base58?',
    faq1A: 'Base58 is a group of binary-to-text encoding schemes used to represent large integers as alphanumeric text. It is similar to Base64 but modified to avoid both non-alphanumeric characters (+, /) and letters that look ambiguous (0, O, I, l).',
    faq2Q: 'Why is there a 20 KB size limit?',
    faq2A: 'Base58 calculation performs division on extremely large numbers, resulting in O(N^2) complexity. Large files would block the single-threaded browser environment and cause it to crash.',
    faq3Q: 'Is Base58 used in Cryptocurrencies?',
    faq3A: 'Yes, it was originally designed for the Bitcoin network to make wallet addresses short, easily readable, and copyable without errors.',
  },
  es: {
    title: 'Codificador Base58',
    subtitle: 'Codifique o decodifique en formato Base58 de forma fácil y segura',
    encodeTab: 'Codificar Base58',
    decodeTab: 'Decodificar Base58',
    inputText: 'Texto de Entrada',
    outputText: 'Texto / Bytes de Salida',
    inputPlaceholderEncode: 'Ingrese texto aquí para codificar a Base58...',
    inputPlaceholderDecode: 'Ingrese la cadena Base58 aquí para decodificar...',
    outputPlaceholder: 'El resultado aparecerá aquí...',
    encodingLabel: 'Opción de Codificación',
    autoUpdate: 'Actualización Automática',
    copy: 'Copiar',
    download: 'Descargar Archivo',
    copied: '¡Copiado al portapapeles!',
    dragDrop: 'Arrastre y suelte un archivo aquí, o haga clic para seleccionar',
    selectedFile: 'Archivo Seleccionado:',
    fileSuccess: '¡Archivo procesado con éxito!',
    processBtn: 'Procesar',
    error: 'Error',
    sizeLimitMsg: 'El tamaño de entrada supera el límite de 20 KB para evitar que el navegador se congele.',
    faqTitle: 'Preguntas Frecuentes',
    faq1Q: '¿Qué es Base58?',
    faq1A: 'Base58 es un grupo de esquemas de codificación binaria a texto que se utiliza para representar números enteros grandes como texto alfanumérico. Es similar a Base64 pero modificado para evitar caracteres no alfanuméricos y letras ambiguas (0, O, I, l).',
    faq2Q: '¿Por qué hay un límite de 20 KB?',
    faq2A: 'El cálculo de Base58 realiza divisiones de números extremadamente grandes, lo que resulta en una complejidad de O(N^2). Los archivos grandes colgarían el navegador.',
    faq3Q: '¿Se usa Base58 en Criptomonedas?',
    faq3A: 'Sí, fue diseñado originalmente para la red Bitcoin para hacer que las direcciones de billetera sean cortas, legibles y copiables sin errores.',
  },
  fr: {
    title: 'Codec Base58',
    subtitle: 'Encodez ou décodez au format Base58 en toute simplicité',
    encodeTab: 'Encoder en Base58',
    decodeTab: 'Décoder en Base58',
    inputText: 'Texte d\'Entrée',
    outputText: 'Texte / Octets de Sortie',
    inputPlaceholderEncode: 'Entrez le texte ici à encoder en Base58...',
    inputPlaceholderDecode: 'Entrez la chaîne Base58 ici à décoder...',
    outputPlaceholder: 'Le résultat apparaîtra ici...',
    encodingLabel: 'Option d\'Encodage',
    autoUpdate: 'Mise à Jour Auto',
    copy: 'Copier',
    download: 'Télécharger le fichier',
    copied: 'Copié dans le presse-papiers !',
    dragDrop: 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner',
    selectedFile: 'Fichier Sélectionné :',
    fileSuccess: 'Fichier traité avec succès !',
    processBtn: 'Traiter',
    error: 'Erreur',
    sizeLimitMsg: 'La taille d\'entrée dépasse la limite de 20 Ko pour éviter le blocage du navigateur.',
    faqTitle: 'Questions Fréquemment Posées',
    faq1Q: 'Qu\'est-ce que le Base58 ?',
    faq1A: 'Le Base58 est un groupe de schémas d\'encodage binaire-texte utilisé pour représenter de grands entiers sous forme de texte alphanumérique. Il est similaire au Base64 mais évite les caractères ambigus (0, O, I, l) et non alphanumériques.',
    faq2Q: 'Pourquoi y a-t-il une limite de 20 Ko ?',
    faq2A: 'Le calcul du Base58 effectue des divisions sur de très grands nombres, entraînant une complexité O(N^2). Les fichiers volumineux bloqueraient le navigateur.',
    faq3Q: 'Le Base58 est-il utilisé dans les crypto-monnaies ?',
    faq3A: 'Oui, il a été conçu à l\'origine pour le réseau Bitcoin pour rendre les adresses de portefeuille plus courtes et plus faciles à copier sans erreur.',
  },
  'zh-CN': {
    title: 'Base58 编解码器',
    subtitle: '轻松、安全地进行 Base58 格式的编码或解码',
    encodeTab: 'Base58 编码',
    decodeTab: 'Base58 解码',
    inputText: '输入文本',
    outputText: '输出文本 / 字节',
    inputPlaceholderEncode: '在此处输入要编码为 Base58 的文本...',
    inputPlaceholderDecode: '在此处输入要解码的 Base58 字符串...',
    outputPlaceholder: '处理结果将显示在此处...',
    encodingLabel: '字符集选项',
    autoUpdate: '自动更新',
    copy: '复制',
    download: '下载文件',
    copied: '已复制到剪贴板！',
    dragDrop: '拖拽文件至此，或点击选择文件',
    selectedFile: '已选文件：',
    fileSuccess: '文件处理成功！',
    processBtn: '开始处理',
    error: '错误',
    sizeLimitMsg: '输入文件/数据大小超过 20 KB 限制，以防止浏览器卡死。',
    faqTitle: '常见问题解答',
    faq1Q: '什么是 Base58？',
    faq1A: 'Base58 是一种将二进制数据转换为文本的编码方案，常用于表示大整数。它与 Base64 类似，但去掉了非字母数字字符（+, /）以及易混淆字符（0, O, I, l）。',
    faq2Q: '为什么有 20 KB 的大小限制？',
    faq2A: 'Base58 计算涉及极大的数值除法运算，其时间复杂度为 O(N^2)。大文件会长时间阻塞浏览器的单线程环境，导致页面崩溃或无响应。',
    faq3Q: 'Base58 是否用于加密货币？',
    faq3A: '是的，它最初是为比特币网络设计的，目的是使钱包地址更加简短、易读，且在复制传播时不易出错。',
  },
};

export default function Base58Codec() {
  const [lang, setLang] = useState<'en' | 'es' | 'fr' | 'zh-CN'>('en');
  const [modeTab, setModeTab] = useState<number>(0); // 0: Encode, 1: Decode
  const [inputMode, setInputMode] = useState<number>(0); // 0: Text, 1: File
  const [inputText, setInputText] = useState<string>('');
  const [encodingOption, setEncodingOption] = useState<string>('utf-8');
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [output, setOutput] = useState<string>('');
  const [decodedBytes, setDecodedBytes] = useState<Uint8Array | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const t = translations[lang];

  const handleProcess = useCallback(() => {
    setAlertMsg(null);
    setDecodedBytes(null);

    // Check string size limit for text mode
    if (inputMode === 0 && inputText.length > SIZE_LIMIT) {
      setAlertMsg({ type: 'error', text: t.sizeLimitMsg });
      setOutput('');
      return;
    }

    if (modeTab === 0) {
      // ENCODE
      if (inputMode === 0) {
        if (!inputText) {
          setOutput('');
          return;
        }
        try {
          const bytes = stringToBytes(inputText, encodingOption);
          const encoded = base58Encode(bytes);
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
        if (file.size > SIZE_LIMIT) {
          setAlertMsg({ type: 'error', text: t.sizeLimitMsg });
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const bytes = new Uint8Array(arrayBuffer);
            const encoded = base58Encode(bytes);
            setOutput(encoded);
            setAlertMsg({ type: 'success', text: t.fileSuccess });
          } catch (err: any) {
            setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } else {
      // DECODE
      if (inputMode === 0) {
        if (!inputText) {
          setOutput('');
          return;
        }
        try {
          const bytes = base58Decode(inputText);
          setDecodedBytes(bytes);
          const decodedStr = bytesToString(bytes, encodingOption);
          setOutput(decodedStr);
        } catch (err: any) {
          setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
          setOutput('');
        }
      } else {
        if (!file) {
          setAlertMsg({ type: 'error', text: lang === 'zh-CN' ? '请选择一个文件' : 'Please select a file' });
          return;
        }
        if (file.size > SIZE_LIMIT) {
          setAlertMsg({ type: 'error', text: t.sizeLimitMsg });
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const bytes = base58Decode(text);
            setDecodedBytes(bytes);
            const decodedStr = bytesToString(bytes, encodingOption);
            setOutput(decodedStr);
            setAlertMsg({ type: 'success', text: t.fileSuccess });
          } catch (err: any) {
            setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
          }
        };
        reader.readAsText(file);
      }
    }
  }, [modeTab, inputMode, inputText, encodingOption, file, t, lang]);

  useEffect(() => {
    if (autoUpdate && inputMode === 0) {
      handleProcess();
    }
  }, [inputText, encodingOption, autoUpdate, modeTab, inputMode, handleProcess]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setAlertMsg({ type: 'success', text: t.copied });
    }
  };

  const handleDownload = () => {
    if (modeTab === 0) {
      // Encode output download (text)
      if (!output) return;
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file ? `${file.name}.base58.txt` : 'encoded.base58.txt';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Decode output download (binary or text)
      const data = decodedBytes || new TextEncoder().encode(output);
      if (!data || data.length === 0) return;
      const blob = new Blob([data as any], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file ? `${file.name}.decoded` : 'decoded_file.bin';
      link.click();
      URL.revokeObjectURL(url);
    }
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
        <Tabs
          value={modeTab}
          onChange={(_, val) => { setModeTab(val); setOutput(''); setDecodedBytes(null); setAlertMsg(null); }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t.encodeTab} />
          <Tab label={t.decodeTab} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <Tabs
            value={inputMode}
            onChange={(_, val) => { setInputMode(val); setOutput(''); setDecodedBytes(null); setAlertMsg(null); }}
            sx={{ mb: 3 }}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Text" />
            <Tab label="File" />
          </Tabs>

          {alertMsg && (
            <Alert severity={alertMsg.type} sx={{ mb: 3 }} onClose={() => setAlertMsg(null)}>
              {alertMsg.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Input column */}
            <Grid size={{ xs: 12, md: 6 }}>
              {inputMode === 0 ? (
                <Stack spacing={2}>
                  <TextField
                    label={t.inputText}
                    multiline
                    rows={8}
                    variant="outlined"
                    placeholder={modeTab === 0 ? t.inputPlaceholderEncode : t.inputPlaceholderDecode}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    fullWidth
                  />
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>{t.encodingLabel}</InputLabel>
                      <Select
                        value={encodingOption}
                        label={t.encodingLabel}
                        onChange={(e) => setEncodingOption(e.target.value)}
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

                  <Button variant="contained" color="primary" onClick={handleProcess} startIcon={<SwapHorizIcon />}>
                    {t.processBtn}
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
                  <IconButton onClick={handleDownload} disabled={modeTab === 0 ? !output : !decodedBytes} title={t.download}>
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
