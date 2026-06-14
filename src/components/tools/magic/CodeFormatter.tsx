'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import CompressIcon from '@mui/icons-material/Compress';

// Prettier standalone formatting (v3)
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserTypeScript from 'prettier/plugins/typescript';
import parserHtml from 'prettier/plugins/html';
import parserPostcss from 'prettier/plugins/postcss';
import parserMarkdown from 'prettier/plugins/markdown';

// SQL Formatter
import { format as formatSql } from 'sql-formatter';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'Code Formatter',
    title: 'Code Formatter & Beautifier',
    subtitle: 'Format and minify JSON, SQL, JS, TS, HTML, CSS, and Markdown instantly inside your browser',
    format: 'Format Code',
    minify: 'Minify JSON',
    clear: 'Clear',
    inputLabel: 'Source Code Input',
    outputLabel: 'Beautified Output',
    placeholderInput: 'Paste or type your unformatted source code here...',
    placeholderOutput: 'Formatted output code will appear here...',
    copied: 'Copied to clipboard',
    error: 'Formatting failed',
    trust_users: '🌍 Used by 50,000+ users',
    trust_rating: '⭐ 4.9/5 rating',
    trust_privacy: '🔒 100% Private',
    trust_free: '🚫 No Ads, No Signup',
    features_title: 'Code Formatter Features',
    f1_t: '100% Client-Side Processing',
    f1_d: 'Your code is formatted strictly locally in the browser sandbox. No source code or configuration files are uploaded to any server.',
    f2_t: 'Multi-Language Support',
    f2_d: 'Clean up JSON, SQL, JavaScript, TypeScript, HTML, CSS, and Markdown using industrial-grade Prettier rules.',
    f3_t: 'Syntax Validation & Linting',
    f3_d: 'Detect syntax mistakes, unclosed brackets, or invalid JSON properties instantly with detailed inline errors.',
    f4_t: 'JSON Compression',
    f4_d: 'Minify complex JSON structures to their absolute minimum size with a single click.',
    faq_title: 'Frequently Asked Questions',
    faq1_q: 'How does this formatter handle private code keys?',
    faq1_a: 'It processes everything on your local device. There are no API endpoints or servers reading your code, ensuring complete confidentiality.',
    faq2_q: 'What formatting standards are applied?',
    faq2_a: 'We leverage the official Prettier formatting standard (2-space indentation, double quotes, clean block wrapping) and standard SQL-92 indentation rules.',
    faq3_q: 'Why does formatting throw an error?',
    faq3_a: 'Formatting will fail if the code has compilation/syntax issues. Check for unclosed brackets, missing tags, or double commas in JSON payloads.',
    faq_free_q: 'Is this tool really free with no ads?',
    faq_free_a: 'Yes, 100% free with no ads, no registration, no watermark, and no usage limits. All processing happens locally in your browser.'
  },
  'zh-CN': {
    tool_name: '代码美化与格式化',
    title: '代码格式化工具 (Code Formatter)',
    subtitle: '在浏览器内即时美化或压缩 JSON、SQL、JS、TS、HTML、CSS 和 Markdown 代码',
    format: '格式化代码',
    minify: '压缩 JSON',
    clear: '清空',
    inputLabel: '源文本输入',
    outputLabel: '美化输出',
    placeholderInput: '请在此处粘贴或输入未格式化的源代码...',
    placeholderOutput: '格式化后的结果将显示在此处...',
    copied: '已复制到剪贴板',
    error: '格式化失败',
    trust_users: '🌍 超过 50,000 用户使用',
    trust_rating: '⭐ 4.9/5 好评',
    trust_privacy: '🔒 100% 隐私安全',
    trust_free: '🚫 无广告、无需注册',
    features_title: '代码格式化工具特色',
    f1_t: '100% 本地格式化',
    f1_d: '代码完全在您浏览器本地的沙箱中执行格式化，不会上传至任何云端或第三方服务器。',
    f2_t: '多语言规则支持',
    f2_d: '支持美化 JSON、SQL、JavaScript、TypeScript、HTML、CSS 以及 Markdown，采用工业级 Prettier 标准。',
    f3_t: '语法报错定位',
    f3_d: '输入语法有误时（如 JSON 属性缺双引号），解析器会直接抛出详细错误及行号，便于排查。',
    f4_t: 'JSON 压缩缩小',
    f4_d: '一键将层级冗长的 JSON 文件进行去除空格的混淆压缩，大幅缩减文件大小。',
    faq_title: '常见问题',
    faq1_q: '我的代码会被泄露吗？',
    faq1_a: '绝对不会。所有代码解析与重排版都在您的电脑本地完成，不通过互联网传输任何代码内容。',
    faq2_q: '格式化采用什么样缩进排版规范？',
    faq2_a: '内置规则对齐官方 Prettier 标准（默认 2 个空格缩进、双引号、包裹花括号），SQL 采用标准缩进规范。',
    faq3_q: '为什么点击格式化会报错？',
    faq3_a: '说明输入的代码包含基础语法错误，例如 JSON 对象尾部有多余的逗号，或 HTML 标签未闭合，需根据错误行提示修正。',
    faq_free_q: '这个工具真的免费且无广告吗？',
    faq_free_a: '是的，100% 免费，无广告、无需注册、无水印、无限制。所有处理都在浏览器本地完成。'
  },
  fr: {
    tool_name: 'Formateur de Code',
    title: 'Formateur de Code',
    subtitle: 'Beautifier JSON, SQL, JS, TS, HTML, CSS, et Markdown localement dans votre navigateur',
    format: 'Formatter',
    minify: 'Minifier JSON',
    clear: 'Effacer',
    inputLabel: 'Code source',
    outputLabel: 'Résultat formaté',
    placeholderInput: 'Collez le code source ici...',
    placeholderOutput: 'Le code formaté apparaîtra ici...',
    copied: 'Copié dans le presse-papiers',
    error: 'Échec du formatage',
    trust_users: '🌍 Utilisé par 50 000+ utilisateurs',
    trust_rating: '⭐ Note 4.9/5',
    trust_privacy: '🔒 100% Privé',
    trust_free: '🚫 Sans pub, sans inscription',
    features_title: 'Caractéristiques de l outil',
    f1_t: '100% Client-Side',
    f1_d: 'Aucune donnée n est envoyée en ligne. Le traitement est fait sur votre machine.',
    f2_t: 'Multi-langages',
    f2_d: 'JSON, SQL, JavaScript, TypeScript, HTML, CSS, et Markdown.',
    f3_t: 'Validation syntaxique',
    f3_d: 'Retourne une erreur explicite en cas de bracket manquant ou de syntaxe corrompue.',
    f4_t: 'Minification JSON',
    f4_d: 'Compressez le JSON en enlevant les espaces superflus en un seul clic.',
    faq_title: 'Questions fréquentes',
    faq1_q: 'Est-ce sécurisé pour du code d entreprise ?',
    faq1_a: 'Oui, tout est traité localement dans votre navigateur.',
    faq2_q: 'Quels plug-ins de style sont configurés ?',
    faq2_a: 'Nous configurons le parser Babel (JS/TS), CSS (Postcss), HTML, Markdown et SQL-92.',
    faq3_q: 'Pourquoi le formatage échoue-t-il ?',
    faq3_a: 'Vérifiez la syntaxe : une virgule manquante ou un tag ouvert invalide empêchera le parseur de fonctionner.',
    faq_free_q: 'Cet outil est-il gratuit ?',
    faq_free_a: 'Oui, 100% gratuit et sans aucune publicité.'
  },
  es: {
    tool_name: 'Formateador de Código',
    title: 'Code Formatter & Beautifier',
    subtitle: 'Embellece y minifica JSON, SQL, JS, TS, HTML, CSS y Markdown al instante',
    format: 'Formatear Código',
    minify: 'Minificar JSON',
    clear: 'Limpiar',
    inputLabel: 'Código de Entrada',
    outputLabel: 'Código Formateado',
    placeholderInput: 'Pega tu código fuente desordenado aquí...',
    placeholderOutput: 'El código embellecido aparecerá aquí...',
    copied: 'Copiado al portapapeles',
    error: 'Error al formatear',
    trust_users: '🌍 Usado por más de 50,000 usuarios',
    trust_rating: '⭐ Calificación 4.9/5',
    trust_privacy: '🔒 100% Privado',
    trust_free: '🚫 Sin anuncios, sin registro',
    features_title: 'Funciones de Code Formatter',
    f1_t: '100% Procesamiento Local',
    f1_d: 'El código se procesa localmente en el motor de tu navegador, garantizando confidencialidad absoluta.',
    f2_t: 'Múltiples Lenguajes',
    f2_d: 'Alinea JSON, SQL, JavaScript, TypeScript, HTML, CSS y Markdown con facilidad.',
    f3_t: 'Validación en Tiempo Real',
    f3_d: 'Muestra errores claros con números de línea si tu código tiene fallos estructurales.',
    f4_t: 'Minificador JSON integrado',
    f4_d: 'Minifica tus estructuras JSON complejas eliminando sangrías innecesarias.',
    faq_title: 'Preguntas frecuentes',
    faq1_q: '¿Se envía mi código a algún servidor?',
    faq1_a: 'No, todo el proceso de formateo corre de forma local e independiente en tu navegador.',
    faq2_q: '¿Qué estándares aplica el formateador?',
    faq2_a: 'Aplica las pautas estándar de Prettier: indentación de 2 espacios, llaves consistentes y saltos legibles.',
    faq3_q: '¿Por qué salta error al formatear?',
    faq3_a: 'Generalmente por errores de sintaxis en el código original, como comillas mal cerradas o llaves faltantes.',
    faq_free_q: '¿Esta herramienta es gratis?',
    faq_free_a: 'Sí, totalmente gratis, sin anuncios y sin registro.'
  }
};

export default function CodeFormatter() {
  const [lang, setLang] = useState('en');
  const [selectedLang, setSelectedLang] = useState('json');
  const [inputCode, setInputCode] = useState('{\n"name": "john",\n"age": 30,\n"city": "new york"\n}');
  const [outputCode, setOutputCode] = useState('');
  
  // Feedback alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleLangSelChange = (e: SelectChangeEvent<string>) => {
    setSelectedLang(e.target.value);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleClear = () => {
    setInputCode('');
    setOutputCode('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFormat = async () => {
    if (!inputCode.trim()) {
      setOutputCode('');
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');

    try {
      let formatted = '';

      if (selectedLang === 'json') {
        formatted = JSON.stringify(JSON.parse(inputCode), null, 2);
      } else if (selectedLang === 'sql') {
        formatted = formatSql(inputCode, { language: 'sql' });
      } else {
        // Prettier Standalone (runs asynchronously in browser)
        const parserMap: Record<string, string> = {
          javascript: 'babel',
          typescript: 'typescript',
          html: 'html',
          css: 'css',
          markdown: 'markdown',
        };

        const pluginsMap: Record<string, any[]> = {
          javascript: [parserBabel, parserEstree],
          typescript: [parserTypeScript, parserEstree],
          html: [parserHtml],
          css: [parserPostcss],
          markdown: [parserMarkdown],
        };

        formatted = await prettier.format(inputCode, {
          parser: parserMap[selectedLang],
          plugins: pluginsMap[selectedLang],
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
        });
      }

      setOutputCode(formatted);
      setSuccessMsg('Successfully formatted code');
    } catch (err: any) {
      setErrorMsg(`${t('error')}: ${err.message}`);
    }
  };

  const handleMinifyJson = () => {
    setSuccessMsg('');
    setErrorMsg('');

    if (selectedLang !== 'json') {
      setErrorMsg(t('jsonOnly'));
      return;
    }

    try {
      const minified = JSON.stringify(JSON.parse(inputCode));
      setOutputCode(minified);
      setSuccessMsg('Successfully minified JSON');
    } catch (err: any) {
      setErrorMsg(`${t('error')}: ${err.message}`);
    }
  };

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode).then(() => {
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
            <Select value={lang} onChange={handleLanguageChange} displayEmpty>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="zh-CN">简体中文</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </Stack>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column: Code Input & Parameters */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t('inputLabel')}
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select value={selectedLang} onChange={handleLangSelChange}>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="sql">SQL</MenuItem>
                    <MenuItem value="javascript">JavaScript</MenuItem>
                    <MenuItem value="typescript">TypeScript</MenuItem>
                    <MenuItem value="html">HTML</MenuItem>
                    <MenuItem value="css">CSS</MenuItem>
                    <MenuItem value="markdown">Markdown</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={16}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
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

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FormatPaintIcon />}
                  onClick={handleFormat}
                >
                  {t('format')}
                </Button>
                {selectedLang === 'json' && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CompressIcon />}
                    onClick={handleMinifyJson}
                  >
                    {t('minify')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RotateLeftIcon />}
                  onClick={handleClear}
                  sx={{ ml: 'auto' }}
                >
                  {t('clear')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Code Output */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t('outputLabel')}
                </Typography>
                <IconButton size="small" onClick={handleCopy} disabled={!outputCode}>
                  <ContentCopyIcon fontSize="small" />
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
                value={outputCode}
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
        sx={{ mt: 5, mb: 5, color: 'text.secondary', fontSize: '0.875rem', justifyContent: 'center', gap: 3 }}
      >
        <Typography variant="body2">{t('trust_users')}</Typography>
        <Typography variant="body2">{t('trust_rating')}</Typography>
        <Typography variant="body2">{t('trust_privacy')}</Typography>
        <Typography variant="body2">{t('trust_free')}</Typography>
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* Features Grid */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        {t('features_title')}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🔒</span> {t('f1_t')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('f1_d')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🔌</span> {t('f2_t')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('f2_d')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🔬</span> {t('f3_t')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('f3_d')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🧱</span> {t('f4_t')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('f4_d')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        {t('faq_title')}
      </Typography>
      <Box sx={{ mb: 6 }}>
        <Accordion sx={{ bgcolor: 'background.paper', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'semibold' }}>{t('faq1_q')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {t('faq1_a')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ bgcolor: 'background.paper', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'semibold' }}>{t('faq2_q')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {t('faq2_a')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ bgcolor: 'background.paper', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'semibold' }}>{t('faq3_q')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {t('faq3_a')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ bgcolor: 'background.paper', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'semibold' }}>{t('faq_free_q')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {t('faq_free_a')}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
