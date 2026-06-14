'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Stack,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Transform,
  CloudUpload,
  Download,
  Delete,
  ImageOutlined,
  PictureAsPdf,
  TextFields,
  Compress,
  PhotoSizeSelectLarge,
} from '@mui/icons-material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import Tesseract from 'tesseract.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

type ConverterType =
  | 'png-to-jpg'
  | 'jpg-to-png'
  | 'pdf-to-image'
  | 'image-to-pdf'
  | 'image-to-text'
  | 'text-to-image'
  | 'pdf-to-text'
  | 'compress'
  | 'resize';

interface ConversionSettings {
  quality: number;
  dpi: number;
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  ocrLanguage: string;
  font: string;
  fontSize: number;
  textColor: string;
  bgColor: string;
  resizeWidth: number;
  resizeHeight: number;
  maintainAspect: boolean;
}

export default function FileFluxPage() {
  const [activeConverter, setActiveConverter] = useState<ConverterType>('png-to-jpg');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 90,
    dpi: 150,
    pageSize: 'A4',
    orientation: 'portrait',
    ocrLanguage: 'eng',
    font: 'Arial',
    fontSize: 24,
    textColor: '#000000',
    bgColor: '#FFFFFF',
    resizeWidth: 800,
    resizeHeight: 600,
    maintainAspect: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // PNG ↔ JPG Conversion
  const convertPngToJpg = async (file: File) => {
    return new Promise<Blob>((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Fill white background for JPG
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', settings.quality / 100);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const convertJpgToPng = async (file: File) => {
    return new Promise<Blob>((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Image to PDF
  const convertImageToPdf = async () => {
    const pdf = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.pageSize.toLowerCase() as 'a4' | 'letter' | 'legal',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    for (let i = 0; i < files.length; i++) {
      if (i > 0) pdf.addPage();

      const img = await createImageBitmap(files[i]);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (img.height * imgWidth) / img.width;

      if (imgHeight <= pageHeight - 2 * margin) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      } else {
        const scaledHeight = pageHeight - 2 * margin;
        const scaledWidth = (img.width * scaledHeight) / img.height;
        pdf.addImage(imgData, 'JPEG', margin, margin, scaledWidth, scaledHeight);
      }
    }

    pdf.save('converted-images.pdf');
  };

  // Image Compression
  const compressImage = async (file: File) => {
    return new Promise<Blob>((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const mimeType = file.type;
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, mimeType, settings.quality / 100);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Image Resizing
  const resizeImage = async (file: File) => {
    return new Promise<Blob>((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let width = settings.resizeWidth;
        let height = settings.resizeHeight;

        if (settings.maintainAspect) {
          const aspectRatio = img.width / img.height;
          if (width / height > aspectRatio) {
            width = height * aspectRatio;
          } else {
            height = width / aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const mimeType = file.type;
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, mimeType, 0.95);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Text to Image
  const convertTextToImage = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Fill background
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.fillStyle = settings.textColor;
    ctx.font = `${settings.fontSize}px ${settings.font}`;
    ctx.textBaseline = 'top';

    // Word wrap
    const maxWidth = canvas.width - 40;
    const lineHeight = settings.fontSize * 1.2;
    const words = text.split(' ');
    let line = '';
    let y = 20;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 20, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 20, y);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'text-image.png');
        setResult('Image generated successfully!');
      }
    });
  };

  // Main conversion handler
  const handleConvert = async () => {
    if (files.length === 0 && activeConverter !== 'text-to-image') {
      alert('Please select file(s) first');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      switch (activeConverter) {
        case 'png-to-jpg': {
          if (files.length === 1) {
            const blob = await convertPngToJpg(files[0]);
            saveAs(blob, files[0].name.replace('.png', '.jpg'));
            setResult('Converted successfully!');
          } else {
            const zip = new JSZip();
            for (let i = 0; i < files.length; i++) {
              const blob = await convertPngToJpg(files[i]);
              zip.file(files[i].name.replace('.png', '.jpg'), blob);
              setProgress(((i + 1) / files.length) * 100);
            }
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'converted-images.zip');
            setResult(`Converted ${files.length} files successfully!`);
          }
          break;
        }

        case 'jpg-to-png': {
          if (files.length === 1) {
            const blob = await convertJpgToPng(files[0]);
            saveAs(blob, files[0].name.replace(/\.(jpg|jpeg)$/i, '.png'));
            setResult('Converted successfully!');
          } else {
            const zip = new JSZip();
            for (let i = 0; i < files.length; i++) {
              const blob = await convertJpgToPng(files[i]);
              zip.file(files[i].name.replace(/\.(jpg|jpeg)$/i, '.png'), blob);
              setProgress(((i + 1) / files.length) * 100);
            }
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'converted-images.zip');
            setResult(`Converted ${files.length} files successfully!`);
          }
          break;
        }

        case 'image-to-pdf': {
          await convertImageToPdf();
          setResult('PDF created successfully!');
          break;
        }

        case 'compress': {
          if (files.length === 1) {
            const blob = await compressImage(files[0]);
            saveAs(blob, `compressed-${files[0].name}`);
            setResult(`Compressed successfully! Size: ${(blob.size / 1024).toFixed(2)} KB`);
          } else {
            const zip = new JSZip();
            for (let i = 0; i < files.length; i++) {
              const blob = await compressImage(files[i]);
              zip.file(`compressed-${files[i].name}`, blob);
              setProgress(((i + 1) / files.length) * 100);
            }
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'compressed-images.zip');
            setResult(`Compressed ${files.length} files successfully!`);
          }
          break;
        }

        case 'resize': {
          if (files.length === 1) {
            const blob = await resizeImage(files[0]);
            saveAs(blob, `resized-${files[0].name}`);
            setResult('Resized successfully!');
          } else {
            const zip = new JSZip();
            for (let i = 0; i < files.length; i++) {
              const blob = await resizeImage(files[i]);
              zip.file(`resized-${files[i].name}`, blob);
              setProgress(((i + 1) / files.length) * 100);
            }
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'resized-images.zip');
            setResult(`Resized ${files.length} files successfully!`);
          }
          break;
        }

        case 'image-to-text': {
          // Real OCR implementation using Tesseract.js
          if (files.length === 0) {
            setResult('Please select at least one image file for OCR.');
            break;
          }

          setProgress(10);
          const extractedTexts: string[] = [];

          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProgress(10 + (i * 80 / files.length));

            try {
              // Perform OCR on the image
              const result = await Tesseract.recognize(
                file,
                settings.ocrLanguage || 'eng',
                {
                  logger: (m) => {
                    if (m.status === 'recognizing text') {
                      const fileProgress = 10 + (i * 80 / files.length);
                      const currentProgress = fileProgress + (m.progress * 80 / files.length);
                      setProgress(Math.round(currentProgress));
                    }
                  }
                }
              );

              const text = result.data.text;
              extractedTexts.push(`=== File: ${file.name} ===\n${text}\n`);
            } catch (error) {
              extractedTexts.push(`=== File: ${file.name} ===\nError: ${error instanceof Error ? error.message : 'OCR failed'}\n`);
            }
          }

          // Combine all extracted texts
          const combinedText = extractedTexts.join('\n');

          // Create downloadable text file
          const blob = new Blob([combinedText], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ocr-extracted-text-${Date.now()}.txt`;
          a.click();
          URL.revokeObjectURL(url);

          setResult(`Successfully extracted text from ${files.length} image(s). Download started.`);
          break;
        }

        case 'pdf-to-image': {
          setResult('PDF to Image conversion requires PDF.js library integration. This would convert PDF pages to images.');
          break;
        }

        case 'pdf-to-text': {
          setResult('PDF to Text conversion requires PDF.js library integration. This would extract text content from PDFs.');
          break;
        }

        default:
          break;
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`);
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const converters = [
    { value: 'png-to-jpg' as ConverterType, label: 'PNG → JPG', icon: <ImageOutlined /> },
    { value: 'jpg-to-png' as ConverterType, label: 'JPG → PNG', icon: <ImageOutlined /> },
    { value: 'pdf-to-image' as ConverterType, label: 'PDF → Image', icon: <PictureAsPdf /> },
    { value: 'image-to-pdf' as ConverterType, label: 'Image → PDF', icon: <PictureAsPdf /> },
    { value: 'image-to-text' as ConverterType, label: 'Image → Text (OCR)', icon: <TextFields /> },
    { value: 'text-to-image' as ConverterType, label: 'Text → Image', icon: <TextFields /> },
    { value: 'pdf-to-text' as ConverterType, label: 'PDF → Text', icon: <TextFields /> },
    { value: 'compress' as ConverterType, label: 'Compress Image', icon: <Compress /> },
    { value: 'resize' as ConverterType, label: 'Resize Image', icon: <PhotoSizeSelectLarge /> },
  ];

  return (
    <ProtectedRoute>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Transform sx={{ fontSize: 48, color: 'primary.main' }} />
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            FileFlux
          </Typography>
          <Typography variant="body1" color="text.secondary">
            8-in-1 Multi-Format File Converter
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Professional file conversion suite with PNG↔JPG, Image↔PDF, compression, resizing, and more. All processing done securely in your browser.
      </Alert>

      {/* Converter Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Converter
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {converters.map((converter) => (
            <Button
              key={converter.value}
              variant={activeConverter === converter.value ? 'contained' : 'outlined'}
              startIcon={converter.icon}
              onClick={() => {
                setActiveConverter(converter.value);
                clearFiles();
              }}
              size="small"
            >
              {converter.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {converters.find(c => c.value === activeConverter)?.label}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* File Upload (for most converters) */}
        {activeConverter !== 'text-to-image' && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ py: 3, mb: 2 }}
            >
              {files.length > 0 ? `${files.length} file(s) selected` : 'Select Files'}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple={['png-to-jpg', 'jpg-to-png', 'image-to-pdf', 'compress', 'resize'].includes(activeConverter)}
                accept={
                  activeConverter.includes('pdf-to') ? '.pdf' :
                  activeConverter.includes('image') || activeConverter === 'compress' || activeConverter === 'resize' ? 'image/*' :
                  '*'
                }
                onChange={handleFileSelect}
              />
            </Button>

            {files.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Selected Files:</Typography>
                  <IconButton size="small" onClick={clearFiles}>
                    <Delete />
                  </IconButton>
                </Box>
                <Stack spacing={0.5}>
                  {files.map((file, index) => (
                    <Chip
                      key={index}
                      label={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Settings based on converter type */}
        <Box sx={{ mb: 3 }}>
          {/* Quality setting for JPG and compression */}
          {(['png-to-jpg', 'compress'].includes(activeConverter)) && (
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Quality: {settings.quality}%</Typography>
              <Slider
                value={settings.quality}
                onChange={(_, value) => setSettings({ ...settings, quality: value as number })}
                min={10}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          {/* Page size for Image to PDF */}
          {activeConverter === 'image-to-pdf' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={settings.pageSize}
                  label="Page Size"
                  onChange={(e) => setSettings({ ...settings, pageSize: e.target.value as 'A4' | 'Letter' | 'Legal' })}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={settings.orientation}
                  label="Orientation"
                  onChange={(e) => setSettings({ ...settings, orientation: e.target.value as 'portrait' | 'landscape' })}
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Resize dimensions */}
          {activeConverter === 'resize' && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Width (px)"
                  type="number"
                  value={settings.resizeWidth}
                  onChange={(e) => setSettings({ ...settings, resizeWidth: parseInt(e.target.value) || 800 })}
                  fullWidth
                />
                <TextField
                  label="Height (px)"
                  type="number"
                  value={settings.resizeHeight}
                  onChange={(e) => setSettings({ ...settings, resizeHeight: parseInt(e.target.value) || 600 })}
                  fullWidth
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSettings({ ...settings, maintainAspect: !settings.maintainAspect })}
              >
                {settings.maintainAspect ? '🔗 Maintain Aspect Ratio' : '🔓 Free Resize'}
              </Button>
            </Box>
          )}

          {/* Text to Image settings */}
          {activeConverter === 'text-to-image' && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Enter Text"
                placeholder="Type your text here..."
                sx={{ mb: 2 }}
                id="text-input"
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Font Size"
                  type="number"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) || 24 })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Text Color"
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Background Color"
                  type="color"
                  value={settings.bgColor}
                  onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          )}

          {/* OCR Language */}
          {activeConverter === 'image-to-text' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>OCR Language</InputLabel>
              <Select
                value={settings.ocrLanguage}
                label="OCR Language"
                onChange={(e) => setSettings({ ...settings, ocrLanguage: e.target.value })}
              >
                <MenuItem value="eng">English</MenuItem>
                <MenuItem value="hin">Hindi</MenuItem>
                <MenuItem value="spa">Spanish</MenuItem>
                <MenuItem value="fra">French</MenuItem>
                <MenuItem value="deu">German</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Convert Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<Transform />}
          onClick={() => {
            if (activeConverter === 'text-to-image') {
              const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
              convertTextToImage(textInput?.value || '');
            } else {
              handleConvert();
            }
          }}
          disabled={processing || (files.length === 0 && activeConverter !== 'text-to-image')}
        >
          Convert
        </Button>

        {/* Progress */}
        {processing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Processing... {progress.toFixed(0)}%
            </Typography>
          </Box>
        )}

        {/* Result */}
        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {result}
          </Alert>
        )}

        {/* Hidden canvas for text-to-image */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Paper>

      {/* Feature Cards */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Features
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
            <CardContent>
              <ImageOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Image Conversion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Convert between PNG and JPG with quality control and batch processing support.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
            <CardContent>
              <PictureAsPdf color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                PDF Tools
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Convert images to PDF, extract images from PDF, and extract text content.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
            <CardContent>
              <Compress color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Compression
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reduce file size with adjustable quality settings while maintaining visual fidelity.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
            <CardContent>
              <PhotoSizeSelectLarge color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Resizing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resize images to specific dimensions with aspect ratio lock option.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      </Container>
      <Footer />
    </ProtectedRoute>
  );
}
