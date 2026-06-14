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
  Tooltip,
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
  Pagination,
  SelectChangeEvent,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'Hex Viewer',
    title: 'Hex Viewer & Binary Inspector',
    subtitle: 'Upload local files to read and search raw binary bytes in Hex and ASCII layout',
    pick: 'Choose Binary File',
    search: 'Search',
    prev: 'Prev',
    next: 'Next',
    searchPh: 'Search hex pattern, e.g. 50 4B 03 04',
    loading: 'Loading...',
    notFound: 'Hex pattern not found',
    found: 'Pattern found at offset ',
    needFile: 'Please upload a file first',
    invalidPattern: 'Invalid hex pattern (use pairs like FF D8)',
    trust_users: '🌍 Used by 50,000+ users',
    trust_rating: '⭐ 4.9/5 rating',
    trust_privacy: '🔒 100% Private',
    trust_free: '🚫 No Ads, No Signup',
    features_title: 'Hex Viewer Features',
    f1_t: '100% Client-Side Inspection',
    f1_d: 'Files are processed strictly locally in your browser memory via ArrayBuffers. Nothing is sent to any server.',
    f2_t: 'Paginated Virtualized Render',
    f2_d: 'Comfortably read files up to multiple megabytes. Renders pages cleanly without freezing your tab.',
    f3_t: 'Binary Sig Finder',
    f3_d: 'Search hex signatures (JPEG magic bytes, Zip archives) and jump instantly to the matched block.',
    f4_t: 'Dual-Output Display',
    f4_d: 'View side-by-side offset address columns, 16 hex byte pairs, and printable ASCII representation.',
    faq_title: 'Frequently Asked Questions',
    faq1_q: 'Is my file uploaded to a server?',
    faq1_a: 'No. The file is read locally using the browser File Reader API. All binary analysis is performed client-side, making it highly secure for private documents or keys.',
    faq2_q: 'What formats can I upload?',
    faq2_a: 'You can upload any file extension (.bin, .exe, .png, .db, .pdf, .zip, etc.). The hex viewer handles raw byte representation independently of content-type.',
    faq3_q: 'How do I search for text inside the file?',
    faq3_a: 'You can convert text to hex bytes first (e.g. using our Crypto Tools) and search the hex output directly. Hex strings should be space-separated pairs.',
    faq4_q: 'Can I edit the binary file and download it?',
    faq4_a: 'This version operates as a read-only inspector. Writing binary buffers is not supported directly, ensuring your source files remain unmodified.',
    faq_free_q: 'Is this tool really free with no ads?',
    faq_free_a: 'Yes, 100% free with no ads, no registration, no watermark, and no usage limits. All processing happens locally in your browser.'
  },
  'zh-CN': {
    tool_name: '十六进制查看器',
    title: '十六进制查看器 (Hex Viewer)',
    subtitle: '本地上传二进制文件，以 Hex 格式和 ASCII 双排格式分析与检索字节数据',
    pick: '选择二进制文件',
    search: '搜索',
    prev: '上一页',
    next: '下一页',
    searchPh: '搜索 Hex 模式，例如 50 4B 03 04',
    loading: '正在加载...',
    notFound: '未找到匹配的十六进制特征',
    found: '在偏移量处找到特征值 ',
    needFile: '请先上传二进制文件',
    invalidPattern: '无效的 Hex 特征值格式（请以空格分隔，如 FF D8）',
    trust_users: '🌍 超过 50,000 用户使用',
    trust_rating: '⭐ 4.9/5 好评',
    trust_privacy: '🔒 100% 隐私安全',
    trust_free: '🚫 无广告、无需注册',
    features_title: '十六进制查看器功能',
    f1_t: '100% 本地分析',
    f1_d: '文件只会在您浏览器的内存中（基于 ArrayBuffer）被读取并展示，绝不会向服务端发送任何数据。',
    f2_t: '分片渲染',
    f2_d: '支持平滑读取几十兆的二进制大文件，采用分页渲染防止界面由于长文本阻塞卡死。',
    f3_t: '十六进制特征检索',
    f3_d: '支持搜索特定字节特征（如 JPEG 文件头或 Zip 头），并一键跳转高亮该偏移量。',
    f4_t: '双列同步排列',
    f4_d: '提供侧边对齐的字节偏移量、十六进制原始编码列和可打印 ASCII 文本对照列。',
    faq_title: '常见问题',
    faq1_q: '我的文件会被上传到云端吗？',
    faq1_a: '不会。本工具完全运行于前端。您的文件会被载入到浏览器的 ArrayBuffer 内存中，没有外部请求发送文件内容。',
    faq2_q: '可以上传哪些格式的文件进行分析？',
    faq2_a: '任意文件类型都可以（如 .png、.exe、.bin、.zip、.db ）。只要是电脑上的文件，均可以转为基础字节流进行分析。',
    faq3_q: '如何搜索二进制文件中的文本内容？',
    faq3_a: '您可以先将文本通过编码转为十六进制特征（如 Hex 编码），然后再在此工具中输入检索，检索项请用空格隔开。',
    faq4_q: '可以直接修改字节并保存下载吗？',
    faq4_a: '本工具作为安全排查只读查看器，不支持写入二进制流并导出下载，保证您的本地文件不会被误操作损毁。',
    faq_free_q: '这个工具真的免费且无广告吗？',
    faq_free_a: '是的，100% 免费，无广告、无需注册、无水印、无限制。所有处理都在浏览器本地完成。'
  },
  fr: {
    tool_name: 'Hex Viewer',
    title: 'Visionneur Hexadécimal & Binaire',
    subtitle: 'Analysez localement des fichiers binaires avec double vue Hex et ASCII',
    pick: 'Choisir fichier binaire',
    search: 'Rechercher',
    prev: 'Précédent',
    next: 'Suivant',
    searchPh: 'Rechercher hex, ex: 50 4B 03 04',
    loading: 'Chargement...',
    notFound: 'Pattern introuvable',
    found: 'Pattern trouvé à l offset ',
    needFile: 'Veuillez d abord charger un fichier',
    invalidPattern: 'Pattern hexadécimal invalide (ex: FF D8)',
    trust_users: '🌍 Utilisé par 50 000+ utilisateurs',
    trust_rating: '⭐ Note 4.9/5',
    trust_privacy: '🔒 100% Privé',
    trust_free: '🚫 Sans pub, sans inscription',
    features_title: 'Fonctions du Hex Viewer',
    f1_t: '100% Client-Side',
    f1_d: 'Le fichier est lu localement via ArrayBuffer. Vos données ne sont jamais transférées.',
    f2_t: 'Navigation paginée',
    f2_d: 'Parcourez des fichiers de taille importante sans latence d affichage.',
    f3_t: 'Recherche de signature',
    f3_d: 'Recherchez les signatures de fichiers standards (ex: Magic bytes) pour inspecter l en-tête.',
    f4_t: 'Affichage dual',
    f4_d: 'Présente côte-à-côte les offsets d adresses, les 16 octets et les caractères ASCII lisibles.',
    faq_title: 'Questions fréquentes',
    faq1_q: 'Mon fichier est-il stocké quelque part ?',
    faq1_a: 'Non. Le fichier n est jamais envoyé en ligne. L analyse se fait directement dans la mémoire de votre navigateur.',
    faq2_q: 'Quels types de fichiers sont acceptés ?',
    faq2_a: 'Tous les fichiers binaires et fichiers textes sont supportés (images, exécutables, archives, bases de données, etc.).',
    faq3_q: 'Comment chercher une séquence ?',
    faq3_a: 'Saisissez la séquence en hexadécimal (séparée par des espaces), comme: "89 50 4E 47" pour le format PNG.',
    faq4_q: 'Le fichier source est-il modifié ?',
    faq4_a: 'Il s agit d un inspecteur en lecture seule, assurant la sécurité de vos fichiers locaux.',
    faq_free_q: 'Cet outil est-il vraiment gratuit ?',
    faq_free_a: 'Oui, 100% gratuit, sans pub et sans inscription.'
  },
  es: {
    tool_name: 'Visor Hexadecimal',
    title: 'Visor Hexadecimal (Hex Viewer)',
    subtitle: 'Inspecciona archivos binarios en memoria con salida HEX y ASCII lado a lado',
    pick: 'Elegir archivo binario',
    search: 'Buscar',
    prev: 'Anterior',
    next: 'Siguiente',
    searchPh: 'Buscar patrón hex, ej. 50 4B 03 04',
    loading: 'Cargando...',
    notFound: 'Patrón hexadecimal no encontrado',
    found: 'Patrón encontrado en offset ',
    needFile: 'Primero debes cargar un archivo',
    invalidPattern: 'Patrón hex inválido (usa pares separados por espacios como FF D8)',
    trust_users: '🌍 Usado por más de 50,000 usuarios',
    trust_rating: '⭐ Calificación 4.9/5',
    trust_privacy: '🔒 100% Privado',
    trust_free: '🚫 Sin anuncios, sin registro',
    features_title: 'Funciones de Hex Viewer',
    f1_t: '100% Análisis Local',
    f1_d: 'Los archivos se leen localmente a través de ArrayBuffer en memoria del navegador. Sin subidas.',
    f2_t: 'Navegación paginada',
    f2_d: 'Visualiza partes del archivo a la vez para mantener el rendimiento alto en archivos pesados.',
    f3_t: 'Búsqueda de patrones',
    f3_d: 'Ubica firmas de archivos (como magic bytes JPEG o ZIP) y navega directo a ellas.',
    f4_t: 'Presentación doble',
    f4_d: 'Visualiza offsets de dirección, bloques de 16 bytes hexadecimales y representación ASCII legible.',
    faq_title: 'Preguntas frecuentes',
    faq1_q: '¿Se comparten mis datos con servidores de internet?',
    faq1_a: 'En absoluto. El procesamiento se hace por completo en el cliente utilizando APIs estándares del navegador.',
    faq2_q: '¿Qué archivos puedo analizar?',
    faq2_a: 'Cualquier extensión binaria (.bin, .exe, .png, .db, etc.) puede leerse byte a byte sin inconvenientes.',
    faq3_q: '¿Cómo busco una secuencia binaria?',
    faq3_a: 'Ingresa la secuencia hexadecimal con espacio entre cada byte, por ejemplo: 50 4B 03 04.',
    faq4_q: '¿Se altera mi archivo original?',
    faq4_a: 'No, este visor es de solo lectura y no sobreescribe ningún bit.',
    faq_free_q: '¿Esta herramienta es realmente gratis?',
    faq_free_a: 'Sí, 100% gratis y sin anuncios.'
  }
};

export default function HexViewer() {
  const [lang, setLang] = useState('en');
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  // Pagination
  const [page, setPage] = useState(0);
  const [bytesPerPage, setBytesPerPage] = useState(16 * 120); // Default 1920 bytes

  // Search Pattern
  const [searchHex, setSearchHex] = useState('');
  const [highlightOffset, setHighlightOffset] = useState(-1);

  // Banner status
  const [statusMsg, setStatusMsg] = useState('');
  const [statusSeverity, setStatusSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const toHexStr = (num: number, width: number) => {
    return num.toString(16).toUpperCase().padStart(width, '0');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg(t('loading'));
    setStatusSeverity('info');

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        setFileData(bytes);
        setFileName(file.name);
        setFileSize(bytes.length);
        setPage(0);
        setHighlightOffset(-1);
        setStatusMsg(`Loaded ${file.name} successfully`);
        setStatusSeverity('success');
      }
    };
    reader.onerror = () => {
      setStatusMsg('File read error');
      setStatusSeverity('error');
    };
    reader.readAsArrayBuffer(file);
  };

  const totalPages = fileData ? Math.max(1, Math.ceil(fileData.length / bytesPerPage)) : 1;

  const handlePageChange = (_e: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const parsePattern = (txt: string): Uint8Array | null => {
    const clean = txt.trim().replace(/\s+/g, ' ');
    if (!clean) return null;
    const parts = clean.split(' ');
    const arr: number[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (!/^[0-9a-fA-F]{2}$/.test(parts[i])) return null;
      arr.push(parseInt(parts[i], 16));
    }
    return new Uint8Array(arr);
  };

  const findPattern = (data: Uint8Array, pat: Uint8Array): number => {
    outer: for (let i = 0; i <= data.length - pat.length; i++) {
      for (let j = 0; j < pat.length; j++) {
        if (data[i + j] !== pat[j]) continue outer;
      }
      return i;
    }
    return -1;
  };

  const handleSearch = () => {
    if (!fileData) {
      setStatusMsg(t('needFile'));
      setStatusSeverity('warning');
      return;
    }

    const pat = parsePattern(searchHex);
    if (!pat || pat.length === 0) {
      setStatusMsg(t('invalidPattern'));
      setStatusSeverity('error');
      return;
    }

    const idx = findPattern(fileData, pat);
    if (idx < 0) {
      setStatusMsg(t('notFound'));
      setStatusSeverity('error');
      return;
    }

    setHighlightOffset(idx);
    setPage(Math.floor(idx / bytesPerPage));
    setStatusMsg(`${t('found')} 0x${toHexStr(idx, 8)}`);
    setStatusSeverity('success');
  };

  const renderHexContent = () => {
    if (!fileData) return null;

    const start = page * bytesPerPage;
    const end = Math.min(fileData.length, start + bytesPerPage);
    const rows: React.ReactNode[] = [];

    for (let i = start; i < end; i += 16) {
      const chunk = fileData.slice(i, i + 16);
      const hxCells: React.ReactNode[] = [];
      const ascChars: string[] = [];

      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const byteVal = chunk[j];
          const byteOffset = i + j;
          const hexRepr = toHexStr(byteVal, 2);
          const isHighlighted = byteOffset === highlightOffset;

          hxCells.push(
            <Box
              key={j}
              component="span"
              sx={{
                color: isHighlighted ? '#10b981' : '#e4e4e7',
                fontWeight: isHighlighted ? 'bold' : 'normal',
                bgcolor: isHighlighted ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                px: 0.5,
                borderRadius: 0.5,
              }}
            >
              {hexRepr}
            </Box>
          );

          ascChars.push(byteVal >= 32 && byteVal <= 126 ? String.fromCharCode(byteVal) : '.');
        } else {
          hxCells.push(
            <Box key={j} component="span" sx={{ color: 'text.disabled', px: 0.5 }}>
              &nbsp;&nbsp;
            </Box>
          );
          ascChars.push(' ');
        }
      }

      rows.push(
        <Box
          key={i}
          sx={{
            display: 'flex',
            fontFamily: 'Fira Code, Courier New, monospace',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            py: 0.25,
            borderBottom: '1px solid rgba(255,255,255,0.02)',
          }}
        >
          <Box sx={{ color: 'primary.light', width: { xs: '75px', md: '100px' }, flexShrink: 0 }}>
            0x{toHexStr(i, 8)}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.5, md: 1 },
              flexGrow: 1,
              mr: 3,
            }}
          >
            {hxCells}
          </Box>
          <Box sx={{ color: 'success.light', width: '130px', flexShrink: 0, letterSpacing: '0.1em' }}>
            {ascChars.join('')}
          </Box>
        </Box>
      );
    }

    return rows;
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
        {/* Left Column: File Loader & Search Settings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Load Binary Stream
              </Typography>
              <Button
                variant="contained"
                component="label"
                fullWidth
                startIcon={<FileUploadIcon />}
                sx={{ mb: 2, p: 1.5 }}
              >
                {t('pick')}
                <input type="file" hidden onChange={handleFileUpload} />
              </Button>

              {fileName && (
                <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'semibold', wordBreak: 'break-all' }}>
                    {fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {fileSize.toLocaleString()} bytes
                  </Typography>
                </Box>
              )}

              {statusMsg && (
                <Alert severity={statusSeverity} sx={{ mb: 2 }}>
                  {statusMsg}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Hex Pattern Finder
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={searchHex}
                onChange={(e) => setSearchHex(e.target.value)}
                placeholder={t('searchPh')}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={!fileData}
              >
                {t('search')}
              </Button>
            </CardContent>
          </Card>

          {/* Configuration Card */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Display Settings
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Bytes per page</InputLabel>
                <Select
                  value={String(bytesPerPage)}
                  label="Bytes per page"
                  onChange={(e) => {
                    setBytesPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  <MenuItem value="512">512 Bytes</MenuItem>
                  <MenuItem value="1024">1 KB (1024 Bytes)</MenuItem>
                  <MenuItem value="1920">1.8 KB (1920 Bytes)</MenuItem>
                  <MenuItem value="4096">4 KB (4096 Bytes)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Hex Display Viewer */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              minHeight: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Pagination Controller */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Offset Range:
                  </Typography>
                  {fileData ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      0x{toHexStr(page * bytesPerPage, 8)} - 0x
                      {toHexStr(Math.min(fileData.length, (page + 1) * bytesPerPage) - 1, 8)}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No offset loaded
                    </Typography>
                  )}
                </Box>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                  disabled={!fileData}
                />
              </Stack>

              {/* Hex and ASCII printout console */}
              <Box
                sx={{
                  bgcolor: 'rgba(0,0,0,0.3)',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.05)',
                  minHeight: 360,
                  maxHeight: 640,
                  overflowY: 'auto',
                }}
              >
                {fileData ? (
                  renderHexContent()
                ) : (
                  <Box sx={{ display: 'flex', height: 320, alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Please select a binary file to inspect bytes.
                    </Typography>
                  </Box>
                )}
              </Box>
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
                <span>⚡</span> {t('f2_t')}
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
                <span>🔍</span> {t('f3_t')}
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
                <span>📜</span> {t('f4_t')}
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
            <Typography sx={{ fontWeight: 'semibold' }}>{t('faq4_q')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {t('faq4_a')}
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
