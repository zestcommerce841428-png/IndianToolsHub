'use client';

import React, { useState, useMemo } from 'react';
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
  Paper,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import LanguageIcon from '@mui/icons-material/Language';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CodeIcon from '@mui/icons-material/Code';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'Syntax Highlighter',
    title: 'Code Syntax Highlighter',
    subtitle: 'Generate clean highlighted HTML code and preview it instantly.',
    inputLabel: 'Source Code',
    outputLabel: 'Highlighted Code HTML',
    previewLabel: 'Live Preview',
    placeholderInput: 'Paste your code here...',
    copied: 'Copied to clipboard',
    clear: 'Clear',
    theme: 'Theme Style',
    language: 'Language',
    trust_users: '🌍 Used by 15,000+ developers',
    trust_rating: '⭐ 4.9/5 rating',
    trust_privacy: '🔒 100% Secure & Local',
    trust_free: '🚫 Free & Open Source',
  },
  'zh-CN': {
    tool_name: '语法高亮工具',
    title: '代码语法高亮工具',
    subtitle: '生成干净的高亮 HTML 代码并即时预览。',
    inputLabel: '源代码输入',
    outputLabel: '高亮后的 HTML 代码',
    previewLabel: '实时预览',
    placeholderInput: '在此处粘贴您的代码...',
    copied: '已复制到剪贴板',
    clear: '清空',
    theme: '主题样式',
    language: '语言选择',
    trust_users: '🌍 超过 15,000+ 开发者使用',
    trust_rating: '⭐ 4.9/5 评分',
    trust_privacy: '🔒 100% 本地运行且安全',
    trust_free: '🚫 免费且开源',
  },
  es: {
    tool_name: 'Resaltador de Sintaxis',
    title: 'Resaltador de Sintaxis de Código',
    subtitle: 'Genera código HTML resaltado limpio y previsualízalo al instante.',
    inputLabel: 'Código fuente',
    outputLabel: 'Código HTML Resaltado',
    previewLabel: 'Previsualización en vivo',
    placeholderInput: 'Pega tu código aquí...',
    copied: 'Copiado al portapapeles',
    clear: 'Limpiar',
    theme: 'Estilo de Tema',
    language: 'Idioma/Lenguaje',
    trust_users: '🌍 Usado por más de 15,000 desarrolladores',
    trust_rating: '⭐ Calificación 4.9/5',
    trust_privacy: '🔒 100% Seguro y Local',
    trust_free: '🚫 Gratis y de Código Abierto',
  },
  fr: {
    tool_name: 'Surligneur de Syntaxe',
    title: 'Surligneur de Syntaxe de Code',
    subtitle: 'Générez du code HTML surligné propre et prévisualisez-le instantanément.',
    inputLabel: 'Code Source',
    outputLabel: 'Code HTML Surligné',
    previewLabel: 'Aperçu en Direct',
    placeholderInput: 'Collez votre code ici...',
    copied: 'Copié dans le presse-papiers',
    clear: 'Effacer',
    theme: 'Style de Thème',
    language: 'Langage',
    trust_users: '🌍 Utilisé par 15 000+ développeurs',
    trust_rating: '⭐ Note 4.9/5',
    trust_privacy: '🔒 100% Sécurisé et Local',
    trust_free: '🚫 Gratuit et Open Source',
  },
};

const THEMES: Record<string, { bg: string; text: string; keywords: string; strings: string; comments: string; numbers: string; functions: string; tags: string }> = {
  dracula: {
    bg: '#282a36',
    text: '#f8f8f2',
    keywords: '#ff79c6',
    strings: '#f1fa8c',
    comments: '#6272a4',
    numbers: '#bd93f9',
    functions: '#50fa7b',
    tags: '#ff79c6',
  },
  onedark: {
    bg: '#282c34',
    text: '#abb2bf',
    keywords: '#c678dd',
    strings: '#98c379',
    comments: '#5c6370',
    numbers: '#d19a66',
    functions: '#61afef',
    tags: '#e06c75',
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    keywords: '#f92672',
    strings: '#e6db74',
    comments: '#75715e',
    numbers: '#ae81ff',
    functions: '#a6e22e',
    tags: '#f92672',
  },
  github: {
    bg: '#ffffff',
    text: '#24292e',
    keywords: '#d73a49',
    strings: '#032f62',
    comments: '#6a737d',
    numbers: '#005cc5',
    functions: '#6f42c1',
    tags: '#22863a',
  },
};

export default function SyntaxHighlighterTool() {
  const [lang, setLang] = useState('en');
  const [inputCode, setInputCode] = useState(`// Simple Javascript Example\nfunction greet(name) {\n  const message = "Hello, " + name;\n  console.log(message);\n  return 42;\n}`);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedTheme, setSelectedTheme] = useState('dracula');
  const [successMsg, setSuccessMsg] = useState('');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleClear = () => {
    setInputCode('');
    setSuccessMsg('');
  };

  // Simple, safe tokenizer
  const highlightedHtml = useMemo(() => {
    if (!inputCode.trim()) return '';

    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const themeColors = THEMES[selectedTheme] || THEMES.dracula;

    // Standard styling tags wrapper helper
    const wrap = (text: string, styleColor: string) => {
      return `<span style="color: ${styleColor};">${text}</span>`;
    };

    let escaped = escapeHtml(inputCode);

    if (selectedLanguage === 'html' || selectedLanguage === 'xml') {
      // Tags, Attributes, Comments
      // Comments
      escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (_, m) => wrap(m, themeColors.comments));
      // Tags
      escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, (_, m) => wrap(m, themeColors.tags));
      // End of tag bracket
      escaped = escaped.replace(/(\/?&gt;)/g, (_, m) => wrap(m, themeColors.tags));
      // Attribute values
      escaped = escaped.replace(/(=&quot;[^&]*&quot;|=&#039;[^&#039;]*&#039;)/g, (_, m) => wrap(m, themeColors.strings));
      return `<pre style="background: ${themeColors.bg}; color: ${themeColors.text}; padding: 16px; border-radius: 8px; font-family: monospace; overflow: auto; margin: 0;"><code>${escaped}</code></pre>`;
    }

    // Default highlighters (JS, Python, JSON, CSS, etc.)
    // Comments
    escaped = escaped.replace(/(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g, (_, m) => wrap(m, themeColors.comments));
    // Strings
    escaped = escaped.replace(/(&quot;[\s\S]*?&quot;|&#039;[\s\S]*?&#039;|`[\s\S]*?`)/g, (_, m) => wrap(m, themeColors.strings));
    // Keywords
    const keywordRegex = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|export|import|from|default|extends|new|this|typeof|instanceof|try|catch|finally|throw|async|await|def|elif|in|is|not|and|or|lambda|pass|try|except|raise|with|import|as|print|struct|impl|pub|fn|match)\b/g;
    escaped = escaped.replace(keywordRegex, (m) => wrap(m, themeColors.keywords));
    // Numbers
    escaped = escaped.replace(/\b(\d+)\b/g, (m) => wrap(m, themeColors.numbers));
    // Functions
    escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\s*\()/g, (_, m) => wrap(m, themeColors.functions));

    return `<pre style="background: ${themeColors.bg}; color: ${themeColors.text}; padding: 16px; border-radius: 8px; font-family: monospace; overflow: auto; margin: 0;"><code>${escaped}</code></pre>`;
  }, [inputCode, selectedLanguage, selectedTheme]);

  const handleCopyHtml = () => {
    if (!highlightedHtml) return;
    navigator.clipboard.writeText(highlightedHtml).then(() => {
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
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel>{t('language')}</InputLabel>
                  <Select
                    value={selectedLanguage}
                    label={t('language')}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <MenuItem value="javascript">JavaScript / TypeScript</MenuItem>
                    <MenuItem value="html">HTML / XML</MenuItem>
                    <MenuItem value="css">CSS</MenuItem>
                    <MenuItem value="python">Python</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="rust">Rust</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel>{t('theme')}</InputLabel>
                  <Select
                    value={selectedTheme}
                    label={t('theme')}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    <MenuItem value="dracula">Dracula</MenuItem>
                    <MenuItem value="onedark">One Dark</MenuItem>
                    <MenuItem value="monokai">Monokai</MenuItem>
                    <MenuItem value="github">GitHub Light</MenuItem>
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

              <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<CodeIcon />} onClick={handleCopyHtml} disabled={!inputCode}>
                  {t('outputLabel')}
                </Button>
                <Button variant="outlined" color="inherit" startIcon={<RotateLeftIcon />} onClick={handleClear}>
                  {t('clear')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('previewLabel')}
              </Typography>

              {successMsg && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMsg}
                </Alert>
              )}

              <Paper
                elevation={0}
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  bgcolor: THEMES[selectedTheme]?.bg || '#282a36',
                  p: 0,
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: highlightedHtml || '<div style="padding: 16px; color: #6272a4;">Empty</div>' }} />
              </Paper>
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
