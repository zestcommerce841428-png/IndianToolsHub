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

// Base32 Decoder Logic
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Uint8Array {
  const cleaned = input.toUpperCase().replace(/\s/g, "").replace(/=+$/, "");
  if (!cleaned) return new Uint8Array(0);

  const alphabetMap: { [key: string]: number } = {};
  for (let i = 0; i < BASE32_ALPHABET.length; i++) {
    alphabetMap[BASE32_ALPHABET[i]] = i;
  }

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (!(char in alphabetMap)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    value = (value << 5) | alphabetMap[char];
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
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
    title: 'Base32 Decode',
    subtitle: 'Decode Base32 encoded text or files back to original data',
    textTab: 'Text Decode',
    fileTab: 'File Decode',
    inputText: 'Input Base32 Text',
    outputText: 'Output Text / Bytes',
    inputPlaceholder: 'Enter Base32 text here to decode...',
    outputPlaceholder: 'Decoded result will appear here...',
    outputEncoding: 'Output Encoding',
    autoUpdate: 'Auto Update',
    copy: 'Copy',
    download: 'Download Bin / File',
    copied: 'Copied to clipboard!',
    dragDrop: 'Drag & drop a Base32 file here, or click to select',
    selectedFile: 'Selected File:',
    fileSuccess: 'File decoded successfully!',
    decodeBtn: 'Decode',
    error: 'Error',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'How does Base32 decoding work?',
    faq1A: 'Base32 decoding reverses the encoding process by reading characters from a 32-symbol set and translating them back into the original 8-bit bytes.',
    faq2Q: 'What happens to the padding characters?',
    faq2A: 'Any trailing "=" characters are discarded during the decoding process as they only align the encoded string to 8-character blocks.',
    faq3Q: 'Can I decode to binary files?',
    faq3A: 'Yes. In the "File Decode" tab, you can input a Base32 string or load a file containing Base32, decode it, and download the resulting binary file.',
  },
  es: {
    title: 'Decodificación Base32',
    subtitle: 'Decodifique texto o archivos codificados en Base32 a sus datos originales',
    textTab: 'Decodificar Texto',
    fileTab: 'Decodificar Archivo',
    inputText: 'Texto Base32 de Entrada',
    outputText: 'Texto / Bytes de Salida',
    inputPlaceholder: 'Ingrese el texto Base32 aquí para decodificar...',
    outputPlaceholder: 'El resultado decodificado aparecerá aquí...',
    outputEncoding: 'Codificación de Salida',
    autoUpdate: 'Actualización Automática',
    copy: 'Copiar',
    download: 'Descargar Archivo / Bin',
    copied: '¡Copiado al portapapeles!',
    dragDrop: 'Arrastre y suelte un archivo Base32 aquí, o haga clic para seleccionar',
    selectedFile: 'Archivo Seleccionado:',
    fileSuccess: '¡Archivo decodificado con éxito!',
    decodeBtn: 'Decodificar',
    error: 'Error',
    faqTitle: 'Preguntas Frecuentes',
    faq1Q: '¿Cómo funciona la decodificación Base32?',
    faq1A: 'La decodificación Base32 invierte el proceso de codificación leyendo caracteres de un conjunto de 32 símbolos y traduciéndolos de nuevo a los bytes de 8 bits originales.',
    faq2Q: '¿Qué pasa con los caracteres de relleno?',
    faq2A: 'Cualquier carácter "=" al final se descarta durante el proceso de decodificación, ya que solo alinean la cadena codificada a bloques de 8 caracteres.',
    faq3Q: '¿Puedo decodificar a archivos binarios?',
    faq3A: 'Sí. En la pestaña de codificación de archivos, puede ingresar una cadena Base32 o cargar un archivo con Base32, decodificarlo y descargar el archivo binario resultante.',
  },
  fr: {
    title: 'Décodage Base32',
    subtitle: 'Décodez le texte ou les fichiers encodés en Base32 vers les données d\'origine',
    textTab: 'Décoder du Texte',
    fileTab: 'Décoder un Fichier',
    inputText: 'Texte Base32 d\'Entrée',
    outputText: 'Texte / Octets de Sortie',
    inputPlaceholder: 'Entrez le texte Base32 ici à décoder...',
    outputPlaceholder: 'Le résultat décodé apparaîtra ici...',
    outputEncoding: 'Encodage de Sortie',
    autoUpdate: 'Mise à Jour Auto',
    copy: 'Copier',
    download: 'Télécharger le fichier',
    copied: 'Copié dans le presse-papiers !',
    dragDrop: 'Glissez-déposez un fichier Base32 ici, ou cliquez pour sélectionner',
    selectedFile: 'Fichier Sélectionné :',
    fileSuccess: 'Fichier décodé avec succès !',
    decodeBtn: 'Décoder',
    error: 'Erreur',
    faqTitle: 'Questions Fréquemment Posées',
    faq1Q: 'Comment fonctionne le décodage Base32 ?',
    faq1A: 'Le décodage Base32 inverse le processus d\'encodage en lisant les caractères d\'un jeu de 32 symboles et en les traduisant à nouveau en octets 8 bits d\'origine.',
    faq2Q: 'Qu\'advient-il des caractères de remplissage ?',
    faq2A: 'Tous les caractères "=" de fin sont ignorés lors du décodage car ils ne servent qu\'à aligner la chaîne encodée sur des blocs de 8 caractères.',
    faq3Q: 'Puis-je décoder des fichiers binaires ?',
    faq3A: 'Oui. Dans l\'onglet "Décoder un Fichier", vous pouvez entrer une chaîne Base32 ou charger un fichier contenant du Base32, le décoder et télécharger le fichier binaire obtenu.',
  },
  'zh-CN': {
    title: 'Base32 解码',
    subtitle: '将 Base32 编码的文本或文件还原为原始数据',
    textTab: '文本解码',
    fileTab: '文件解码',
    inputText: '输入 Base32 文本',
    outputText: '输出文本 / 字节',
    inputPlaceholder: '在此处输入要解码的 Base32 文本...',
    outputPlaceholder: '解码结果将显示在此处...',
    outputEncoding: '输出字符集',
    autoUpdate: '自动更新',
    copy: '复制',
    download: '下载二进制文件',
    copied: '已复制到剪贴板！',
    dragDrop: '拖拽 Base32 文件至此，或点击选择文件',
    selectedFile: '已选文件：',
    fileSuccess: '文件解码成功！',
    decodeBtn: '解码',
    error: '错误',
    faqTitle: '常见问题解答',
    faq1Q: 'Base32 解码是如何工作的？',
    faq1A: 'Base32 解码是编码的逆过程，通过读取 32 字符集中的字符，并将其转换回原始的 8 位字节。',
    faq2Q: '填充字符会发生什么？',
    faq2A: '尾部的 "=" 字符在解码过程中会被丢弃，因为它们仅用于将编码后的字符串对齐至 8 字符块。',
    faq3Q: '我可以解码为二进制文件吗？',
    faq3A: '可以。在“文件解码”标签页中，您可以直接输入 Base32 字符串或加载含有 Base32 的文件，解码后即可下载对应的二进制文件。',
  },
};

export default function Base32Decode() {
  const [lang, setLang] = useState<'en' | 'es' | 'fr' | 'zh-CN'>('en');
  const [tab, setTab] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [outputEncoding, setOutputEncoding] = useState<string>('utf-8');
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [output, setOutput] = useState<string>('');
  const [decodedBytes, setDecodedBytes] = useState<Uint8Array | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const t = translations[lang];

  const handleDecode = useCallback(() => {
    setAlertMsg(null);
    setDecodedBytes(null);
    
    let base32Str = '';
    if (tab === 0) {
      base32Str = inputText;
    } else {
      if (!file) {
        setAlertMsg({ type: 'error', text: lang === 'zh-CN' ? '请选择一个文件' : 'Please select a file' });
        return;
      }
      // If a file is uploaded in tab 1, we read it as text (the base32 string)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const bytes = base32Decode(text);
          setDecodedBytes(bytes);
          setAlertMsg({ type: 'success', text: t.fileSuccess });
        } catch (err: any) {
          setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
        }
      };
      reader.onerror = () => {
        setAlertMsg({ type: 'error', text: lang === 'zh-CN' ? '文件读取失败' : 'Failed to read file' });
      };
      reader.readAsText(file);
      return;
    }

    if (!base32Str) {
      setOutput('');
      return;
    }

    try {
      const bytes = base32Decode(base32Str);
      setDecodedBytes(bytes);
      const str = bytesToString(bytes, outputEncoding);
      setOutput(str);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: `${t.error}: ${err.message}` });
      setOutput('');
    }
  }, [tab, inputText, outputEncoding, file, t, lang]);

  useEffect(() => {
    if (autoUpdate && tab === 0) {
      handleDecode();
    }
  }, [inputText, outputEncoding, autoUpdate, tab, handleDecode]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setAlertMsg({ type: 'success', text: t.copied });
    }
  };

  const handleDownload = () => {
    if (!decodedBytes || decodedBytes.length === 0) return;
    const blob = new Blob([decodedBytes as any], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file ? `${file.name}.decoded` : 'decoded_file.bin';
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
        <Tabs value={tab} onChange={(_, val) => { setTab(val); setOutput(''); setDecodedBytes(null); setAlertMsg(null); }} sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                      <InputLabel>{t.outputEncoding}</InputLabel>
                      <Select
                        value={outputEncoding}
                        label={t.outputEncoding}
                        onChange={(e) => setOutputEncoding(e.target.value)}
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

                  <Button variant="contained" color="primary" onClick={handleDecode} startIcon={<SwapHorizIcon />}>
                    {t.decodeBtn}
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
                  <IconButton onClick={handleDownload} disabled={!decodedBytes} title={t.download}>
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
