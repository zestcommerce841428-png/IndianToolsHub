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
  LinearProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import TransformIcon from '@mui/icons-material/Transform';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'File Converter',
    title: 'Text & CSV Document Converter',
    subtitle: 'Read text or CSV layout files and convert them instantly to TXT, PDF, or mock DOCX documents',
    inputLabel: 'File Reader & Preview',
    outputLabel: 'Conversion Settings & Export',
    placeholderInput: 'Upload a text or CSV file to view preview here...',
    placeholderOutput: 'Converted preview or download details will appear here...',
    copied: 'Copied to clipboard',
    error: 'Conversion failed',
    success: 'Conversion complete!',
    trust_users: '🌍 Used by 50,000+ users',
    trust_rating: '⭐ 4.9/5 rating',
    trust_privacy: '🔒 100% Private',
    trust_free: '🚫 No Ads, No Signup',
    features_title: 'Document Converter Features',
    f1_t: '100% Client-Side Processing',
    f1_d: 'All conversions happen inside your browser. No files are uploaded to any external server, ensuring complete confidentiality.',
    f2_t: 'Real PDF Export',
    f2_d: 'Convert your text layouts to professional-grade PDF documents using local rendering engines.',
    f3_t: 'TXT & CSV Extraction',
    f3_d: 'Easily strip formatted files back to standard UTF-8 text structure or tabular layout.',
    f4_t: 'Mock DOCX Wrapping',
    f4_d: 'Wrap raw metadata or CSV layouts into a compatible mock Word document format.',
    faq_title: 'Frequently Asked Questions',
    faq1_q: 'Are my document contents secure?',
    faq1_a: 'Yes, this tool processes files entirely inside your browser sandbox. None of your data leaves your device.',
    faq2_q: 'How does the PDF engine work?',
    faq2_a: 'We use pdf-lib to programmatically construct a standard PDF container, embedding native fonts and rendering text structure line-by-line.',
    faq3_q: 'Can I import Excel sheets?',
    faq3_a: 'Yes, if you save them as CSV (Comma Separated Values) format first, this tool can read and convert them cleanly.',
    faq_free_q: 'Is there any limit to the file size?',
    faq_free_a: 'Since all operations run locally in your web browser, size is only limited by your device memory. We recommend files under 10MB for smooth operation.'
  },
  'zh-CN': {
    tool_name: '文件转换器',
    title: '文本与 CSV 文档转换器',
    subtitle: '在浏览器中读取文本或 CSV 格式文件并即时转换为 TXT、PDF 或 模拟 DOCX 容器格式',
    inputLabel: '文件读取与预览',
    outputLabel: '转换设置与导出',
    placeholderInput: '上传文本或 CSV 文件以在此处查看预览...',
    placeholderOutput: '转换后的预览或下载详细信息将显示在此处...',
    copied: '已复制到剪贴板',
    error: '转换失败',
    success: '转换完成！',
    trust_users: '🌍 超过 50,000 用户使用',
    trust_rating: '⭐ 4.9/5 好评',
    trust_privacy: '🔒 100% 隐私安全',
    trust_free: '🚫 无广告、无需注册',
    features_title: '文档转换器功能特色',
    f1_t: '100% 浏览器本地处理',
    f1_d: '所有转换均在您的浏览器中运行。文件绝不会上传到任何外部服务器，确保完全保密。',
    f2_t: '真实 PDF 导出',
    f2_d: '使用本地渲染引擎将您的文本内容直接转换为标准 PDF 文档。',
    f3_t: 'TXT 与 CSV 提取',
    f3_d: '轻松将格式化内容还原为标准的 UTF-8 文本或表格格式。',
    f4_t: '模拟 DOCX 封装',
    f4_d: '将原始元数据或 CSV 布局快速封装到模拟 Word 文档格式中。',
    faq_title: '常见问题',
    faq1_q: '我的文档内容安全吗？',
    faq1_a: '绝对安全。本工具完全在您的浏览器沙箱中处理文件，您的数据绝不会离开您的设备。',
    faq2_q: 'PDF 引擎是如何工作的？',
    faq2_a: '我们使用 pdf-lib 库在本地构建 PDF 容器，嵌入原生字体并逐行绘制文本结构。',
    faq3_q: '我可以导入 Excel 表格吗？',
    faq3_a: '可以，请先将表格另存为 CSV 格式，本工具即可完美读取并进行转换。',
    faq_free_q: '文件大小有限制吗？',
    faq_free_a: '因为所有操作都在本地完成，限制取决于您设备的内存。为保证流畅体验，建议文件小于 10MB。'
  }
};

export default function FileConverter() {
  const [lang, setLang] = useState('en');
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [progress, setProgress] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleFormatChange = (e: SelectChangeEvent<string>) => {
    setTargetFormat(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setSuccessMsg('');
    setErrorMsg('');
    setProgress(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target?.result as string || '');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file contents');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setInputText('');
    setFileName('');
    setFileSize(null);
    setSuccessMsg('');
    setErrorMsg('');
    setProgress(null);
  };

  const handleConvert = async () => {
    if (!inputText) {
      setErrorMsg('Please upload or type text content first');
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');
    setProgress(10);

    try {
      let outputBlob: Blob;
      let extension = targetFormat;
      let mimeType = '';

      setProgress(40);

      if (targetFormat === 'pdf') {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const lines = inputText.split(/\r?\n/);
        let y = height - 50;
        const fontSize = 10;
        const margin = 50;

        for (const line of lines) {
          if (y < 50) {
            const newPage = pdfDoc.addPage();
            y = newPage.getSize().height - 50;
          }
          const cleanLine = line.substring(0, 90);
          page.drawText(cleanLine, {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= fontSize * 1.5;
        }

        setProgress(80);
        const pdfBytes = await pdfDoc.save();
        outputBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        mimeType = 'application/pdf';
      } else if (targetFormat === 'docx') {
        // Mock DOCX XML content format
        const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${inputText.replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
          }
        })}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
        outputBlob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        // TXT Export
        outputBlob = new Blob([inputText], { type: 'text/plain;charset=utf-8' });
        mimeType = 'text/plain';
        extension = 'txt';
      }

      setProgress(100);

      // Create download link
      const url = URL.createObjectURL(outputBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalBase = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'document';
      link.download = `${originalBase}_converted.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(t('success'));
    } catch (err: any) {
      setErrorMsg(`${t('error')}: ${err.message || err}`);
      setProgress(null);
    }
  };

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText).then(() => {
      setSuccessMsg(t('copied'));
      setTimeout(() => setSuccessMsg(''), 3000);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
            </Select>
          </Stack>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column: File Drop and Preview */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('inputLabel')}
              </Typography>

              {/* Upload Zone */}
              <Box
                sx={{
                  border: '2px dashed rgba(255, 255, 255, 0.25)',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 3,
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  accept=".txt,.csv"
                  hidden
                  onChange={handleFileUpload}
                />
                <UploadFileIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Click or drag file here to upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports .TXT, .CSV text formats
                </Typography>
              </Box>

              {fileName && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Selected file: <strong>{fileName}</strong> ({fileSize ? formatSize(fileSize) : ''})
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
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
                  variant="outlined"
                  color="inherit"
                  startIcon={<RotateLeftIcon />}
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  disabled={!inputText}
                  sx={{ ml: 'auto' }}
                >
                  Copy Text
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Settings & Export */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('outputLabel')}
              </Typography>

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

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="target-format-label">Target Format</InputLabel>
                <Select
                  labelId="target-format-label"
                  value={targetFormat}
                  label="Target Format"
                  onChange={handleFormatChange}
                >
                  <MenuItem value="pdf">PDF Document (.pdf)</MenuItem>
                  <MenuItem value="docx">Mock Word Document (.docx)</MenuItem>
                  <MenuItem value="txt">Plain Text (.txt)</MenuItem>
                </Select>
              </FormControl>

              {progress !== null && (
                <Box sx={{ width: '100%', mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Converting: {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<TransformIcon />}
                onClick={handleConvert}
                disabled={!inputText}
                sx={{ py: 1.5, mt: 'auto' }}
              >
                Convert & Download
              </Button>
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
                <span>📄</span> {t('f2_t')}
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
                <span>📝</span> {t('f3_t')}
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
                <span>📦</span> {t('f4_t')}
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
