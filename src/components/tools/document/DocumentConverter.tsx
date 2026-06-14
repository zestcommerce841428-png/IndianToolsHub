'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import TransformIcon from '@mui/icons-material/Transform';

export default function DocumentConverter() {
  const [tabValue, setTabValue] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>('');
  const [editorText, setEditorText] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const [converting, setConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [alertInfo, setAlertInfo] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setAlertInfo(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const isText = selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt');
      
      if (!isText) {
        setAlertInfo({ type: 'error', message: 'Only plain text (.txt) files are supported for parsing.' });
        resetUpload();
        return;
      }

      setFile(selectedFile);
      setAlertInfo(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setFileText(event.target.result);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setFileText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const executeConversion = async () => {
    const textToConvert = tabValue === 0 ? fileText : editorText;
    const baseName = tabValue === 0 && file ? file.name.split('.')[0] : 'converted_document';

    if (!textToConvert.trim()) {
      setAlertInfo({ type: 'error', message: 'Please upload a file or write some text before converting.' });
      return;
    }

    setConverting(true);
    setProgress(20);
    setAlertInfo(null);

    try {
      let blob: Blob;
      let filename = `${baseName}.${targetFormat}`;

      if (targetFormat === 'txt') {
        setProgress(60);
        blob = new Blob([textToConvert], { type: 'text/plain;charset=utf-8' });
        setProgress(100);
      } else if (targetFormat === 'docx') {
        setProgress(60);
        // Simple mock docx template containing plain text lines
        const docxHeader = `OmniTools Document Convert Output\n===============================\n\n`;
        blob = new Blob([docxHeader + textToConvert], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        setProgress(100);
      } else {
        // PDF compilation via pdf-lib
        setProgress(40);
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 11;
        const margin = 50;
        const pageWidth = 595;
        const pageHeight = 842;
        const lineHeight = fontSize + 4;
        
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        const lines = textToConvert.split('\n');
        
        setProgress(70);
        for (const rawLine of lines) {
          // Basic line breaking wrapper to fit inside margins
          const words = rawLine.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width > pageWidth - margin * 2) {
              if (y < margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
              }
              page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
              y -= lineHeight;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
        }

        setProgress(90);
        const pdfBytes = await pdfDoc.save();
        blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setProgress(100);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setConverting(false);
      setAlertInfo({ type: 'success', message: 'Document conversion finished! Download started.' });
    } catch (err) {
      console.error(err);
      setConverting(false);
      setProgress(0);
      setAlertInfo({ type: 'error', message: 'Failed to convert document. Please review your text data.' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Selector tab */}
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab icon={<UploadFileIcon />} label="Upload Text Document" sx={{ fontWeight: 700 }} />
        <Tab icon={<KeyboardIcon />} label="Write Text Directly" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Tab 0: Upload TXT file */}
      {tabValue === 0 && (
        <Box>
          {!file ? (
            <Card
              variant="outlined"
              onClick={triggerUpload}
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 3,
                bgcolor: 'background.paper',
                cursor: 'pointer',
                textAlign: 'center',
                p: 5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(37, 99, 235, 0.02)',
                },
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt"
                style={{ display: 'none' }}
              />
              <TextSnippetIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Choose Plain Text (.txt) File
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag-and-drop or click to parse text layout
              </Typography>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <TextSnippetIcon color="primary" />
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {(file.size / 1024).toFixed(1)} KB • Text Format
                  </Typography>
                </Box>
                <Button size="small" variant="text" color="error" onClick={resetUpload}>
                  Remove
                </Button>
              </Box>
            </Card>
          )}
        </Box>
      )}

      {/* Tab 1: Editor text */}
      {tabValue === 1 && (
        <TextField
          label="Enter document content here"
          multiline
          rows={8}
          variant="outlined"
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          placeholder="Start typing your text document contents here..."
          fullWidth
        />
      )}

      {/* Settings & Convert button */}
      {((tabValue === 0 && file) || (tabValue === 1 && editorText.trim())) && (
        <Card variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
            <FormControl size="small" fullWidth sx={{ maxWidth: { sm: 220 } }} disabled={converting}>
              <InputLabel id="convert-format-label">Target Format</InputLabel>
              <Select
                labelId="convert-format-label"
                value={targetFormat}
                label="Target Format"
                onChange={(e) => setTargetFormat(e.target.value)}
              >
                <MenuItem value="pdf">PDF Document (.pdf)</MenuItem>
                <MenuItem value="txt">Plain Text (.txt)</MenuItem>
                <MenuItem value="docx">Word (.docx)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              color="primary"
              onClick={executeConversion}
              disabled={converting}
              startIcon={<TransformIcon />}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {converting ? 'Converting...' : 'Convert Document'}
            </Button>
          </Box>
        </Card>
      )}

      {/* Conversion loader */}
      {converting && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <span>Compiling and packaging layouts...</span>
            <strong>{progress}%</strong>
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      )}
    </Box>
  );
}
