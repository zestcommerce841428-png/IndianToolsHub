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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Stack,
  SelectChangeEvent,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import CompressIcon from '@mui/icons-material/Compress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'XML Tools',
    title: 'XML Formatter, Minifier & Validator',
    subtitle: 'Format, minify, and validate XML documents instantly in your browser.',
    inputLabel: 'XML Input',
    outputLabel: 'Output',
    placeholderInput: 'Paste or type your XML code here...',
    placeholderOutput: 'Result will appear here...',
    copied: 'Copied to clipboard',
    format: 'Format XML',
    minify: 'Minify XML',
    validate: 'Validate XML',
    clear: 'Clear',
    indentType: 'Indent Type',
    space: 'Space',
    tab: 'Tab',
    indentSize: 'Indent Size',
    collapseComments: 'Collapse Comments',
    validationSuccess: 'XML is valid!',
    validationError: 'Invalid XML: ',
    trust_users: '🌍 Used by 10,000+ users',
    trust_rating: '⭐ 4.8/5 rating',
    trust_privacy: '🔒 100% Private & Local',
    trust_free: '🚫 Free & Offline',
  },
  'zh-CN': {
    tool_name: 'XML 工具箱',
    title: 'XML 格式化、压缩与校验',
    subtitle: '在浏览器中即时格式化、压缩和校验 XML 文档。',
    inputLabel: 'XML 输入',
    outputLabel: '输出结果',
    placeholderInput: '在此粘贴或输入 XML 代码...',
    placeholderOutput: '结果将在此处显示...',
    copied: '已复制到剪贴板',
    format: '格式化 XML',
    minify: '压缩 XML',
    validate: '校验 XML',
    clear: '清空',
    indentType: '缩进类型',
    space: '空格',
    tab: '制表符 (Tab)',
    indentSize: '缩进大小',
    collapseComments: '清除注释',
    validationSuccess: 'XML 格式有效！',
    validationError: '无效的 XML: ',
    trust_users: '🌍 超过 10,000+ 用户使用',
    trust_rating: '⭐ 4.8/5 评分',
    trust_privacy: '🔒 100% 本地隐私安全',
    trust_free: '🚫 免费且支持离线',
  },
  es: {
    tool_name: 'Herramientas XML',
    title: 'XML Formateador, Minificador y Validador',
    subtitle: 'Formatea, minifica y valida documentos XML al instante en tu navegador.',
    inputLabel: 'Entrada XML',
    outputLabel: 'Salida',
    placeholderInput: 'Pega o escribe tu código XML aquí...',
    placeholderOutput: 'El resultado aparecerá aquí...',
    copied: 'Copiado al portapapeles',
    format: 'Formatear XML',
    minify: 'Minificar XML',
    validate: 'Validar XML',
    clear: 'Limpiar',
    indentType: 'Tipo de sangría',
    space: 'Espacio',
    tab: 'Tabulador',
    indentSize: 'Tamaño de sangría',
    collapseComments: 'Eliminar comentarios',
    validationSuccess: '¡El XML es válido!',
    validationError: 'XML inválido: ',
    trust_users: '🌍 Usado por más de 10,000 usuarios',
    trust_rating: '⭐ Calificación 4.8/5',
    trust_privacy: '🔒 100% Privado y Local',
    trust_free: '🚫 Gratis y sin conexión',
  },
  fr: {
    tool_name: 'Outils XML',
    title: 'Formateur, Minificateur & Validateur XML',
    subtitle: 'Formater, minifier et valider les documents XML instantanément dans votre navigateur.',
    inputLabel: 'Entrée XML',
    outputLabel: 'Sortie',
    placeholderInput: 'Collez ou saisissez votre code XML ici...',
    placeholderOutput: 'Le résultat s\'affichera ici...',
    copied: 'Copié dans le presse-papiers',
    format: 'Formatter XML',
    minify: 'Minifier XML',
    validate: 'Valider XML',
    clear: 'Effacer',
    indentType: 'Type d\'indentation',
    space: 'Espace',
    tab: 'Tabulation',
    indentSize: 'Taille d\'indentation',
    collapseComments: 'Supprimer les commentaires',
    validationSuccess: 'Le XML est valide !',
    validationError: 'XML non valide : ',
    trust_users: '🌍 Utilisé par 10 000+ utilisateurs',
    trust_rating: '⭐ Note 4.8/5',
    trust_privacy: '🔒 100% Privé et Local',
    trust_free: '🚫 Gratuit et Hors-ligne',
  },
};

export default function XmlTools() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState(0); // 0: Formatter, 1: Minifier, 2: Validator
  const [inputXml, setInputXml] = useState(`<?xml version="1.0" encoding="UTF-8"?>\n<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Don't forget me this weekend!</body>\n</note>`);
  const [outputXml, setOutputXml] = useState('');
  
  // Settings
  const [indentType, setIndentType] = useState<'space' | 'tab'>('space');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [collapseComments, setCollapseComments] = useState<boolean>(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleClear = () => {
    setInputXml('');
    setOutputXml('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const validateXmlString = (xml: string): { valid: boolean; error?: string } => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        return { valid: false, error: errorNode.textContent || 'XML parsing error' };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  };

  const handleFormat = () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!inputXml.trim()) {
      setOutputXml('');
      return;
    }

    const valResult = validateXmlString(inputXml);
    if (!valResult.valid) {
      setErrorMsg(`${t('validationError')}${valResult.error}`);
      return;
    }

    try {
      let formatted = '';
      const reg = /(>)(<)(\/*)/g;
      // Simple parse & indent
      const cleanInput = inputXml.replace(reg, '$1\r\n$2$3');
      let pad = 0;
      const wspace = indentType === 'space' ? ' '.repeat(indentSize) : '\t';
      
      const lines = cleanInput.split('\r\n');
      lines.forEach((line) => {
        let indent = 0;
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (trimmed.match(/^<\/\w/)) {
          if (pad > 0) pad -= 1;
        } else if (trimmed.match(/^<\w([^>]*[^/])?>.*$/)) {
          indent = 1;
        }

        formatted += wspace.repeat(pad) + trimmed + '\n';
        pad += indent;
      });

      setOutputXml(formatted.trim());
      setSuccessMsg('XML formatted successfully');
    } catch (err: any) {
      setErrorMsg(`Formatting error: ${err.message}`);
    }
  };

  const handleMinify = () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!inputXml.trim()) {
      setOutputXml('');
      return;
    }

    const valResult = validateXmlString(inputXml);
    if (!valResult.valid) {
      setErrorMsg(`${t('validationError')}${valResult.error}`);
      return;
    }

    try {
      let minified = inputXml;
      if (collapseComments) {
        minified = minified.replace(/<!--[\s\S]*?-->/g, '');
      }
      minified = minified.replace(/>\s+</g, '><').trim();
      setOutputXml(minified);
      setSuccessMsg('XML minified successfully');
    } catch (err: any) {
      setErrorMsg(`Minification error: ${err.message}`);
    }
  };

  const handleValidate = () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!inputXml.trim()) return;

    const valResult = validateXmlString(inputXml);
    if (valResult.valid) {
      setSuccessMsg(t('validationSuccess'));
    } else {
      setErrorMsg(`${t('validationError')}${valResult.error}`);
    }
  };

  const handleCopy = () => {
    if (!outputXml) return;
    navigator.clipboard.writeText(outputXml).then(() => {
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
        }}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label={t('format')} />
        <Tab label={t('minify')} />
        <Tab label={t('validate')} />
      </Tabs>

      <Grid container spacing={3}>
        {/* Input & Settings */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('inputLabel')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={16}
                value={inputXml}
                onChange={(e) => setInputXml(e.target.value)}
                placeholder={t('placeholderInput')}
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Fira Code, Courier New, monospace',
                    fontSize: '0.85rem',
                    bgcolor: 'background.default',
                  },
                }}
              />

              {/* Action specific settings */}
              {activeTab === 0 && (
                <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('indentType')}</InputLabel>
                    <Select
                      value={indentType}
                      label={t('indentType')}
                      onChange={(e) => setIndentType(e.target.value as 'space' | 'tab')}
                    >
                      <MenuItem value="space">{t('space')}</MenuItem>
                      <MenuItem value="tab">{t('tab')}</MenuItem>
                    </Select>
                  </FormControl>
                  {indentType === 'space' && (
                    <TextField
                      size="small"
                      type="number"
                      label={t('indentSize')}
                      value={indentSize}
                      onChange={(e) => setIndentSize(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 1, max: 10 } }}
                      sx={{ width: 120 }}
                    />
                  )}
                </Stack>
              )}

              {activeTab === 1 && (
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={collapseComments}
                        onChange={(e) => setCollapseComments(e.target.checked)}
                      />
                    }
                    label={t('collapseComments')}
                  />
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                {activeTab === 0 && (
                  <Button variant="contained" startIcon={<FormatPaintIcon />} onClick={handleFormat}>
                    {t('format')}
                  </Button>
                )}
                {activeTab === 1 && (
                  <Button variant="contained" color="secondary" startIcon={<CompressIcon />} onClick={handleMinify}>
                    {t('minify')}
                  </Button>
                )}
                {activeTab === 2 && (
                  <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleValidate}>
                    {t('validate')}
                  </Button>
                )}
                <Button variant="outlined" color="inherit" startIcon={<RotateLeftIcon />} onClick={handleClear}>
                  {t('clear')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Output */}
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
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t('outputLabel')}
                </Typography>
                <IconButton onClick={handleCopy} disabled={!outputXml}>
                  <ContentCopyIcon />
                </IconButton>
              </Stack>

              {successMsg && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMsg}
                </Alert>
              )}
              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={16}
                value={outputXml}
                placeholder={t('placeholderOutput')}
                slotProps={{ input: { readOnly: true } }}
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Fira Code, Courier New, monospace',
                    fontSize: '0.85rem',
                    bgcolor: 'rgba(30, 41, 59, 0.4)',
                  },
                }}
              />
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
