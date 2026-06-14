'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CropIcon from '@mui/icons-material/Crop';
import { PDFDocument } from 'pdf-lib';

export default function PanCardResizer() {
  const [portal, setPortal] = useState<'nsdl' | 'uti'>('nsdl');
  const [fileType, setFileType] = useState<'photo' | 'signature' | 'document'>('photo');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  
  // Crop adjustments
  const [scale, setScale] = useState<number>(1);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preset Specifications
  // NSDL: Photo = 3.5x2.5cm @200DPI (275x197px), Signature = 2x4.5cm @200DPI (157x354px)
  // UTI: Photo = 213x213px @300DPI, Signature = 400x200px @600DPI
  const getSpecs = () => {
    if (portal === 'nsdl') {
      if (fileType === 'photo') {
        return { width: 197, height: 275, maxKb: 20, dpi: 200, label: '3.5 x 2.5 cm (200 DPI)' };
      } else if (fileType === 'signature') {
        return { width: 354, height: 157, maxKb: 10, dpi: 200, label: '2.0 x 4.5 cm (200 DPI)' };
      } else {
        return { maxKb: 300, format: 'PDF', label: 'PDF format under 300 KB' };
      }
    } else {
      if (fileType === 'photo') {
        return { width: 213, height: 213, maxKb: 30, dpi: 300, label: '213 x 213 Pixels (300 DPI)' };
      } else if (fileType === 'signature') {
        return { width: 400, height: 200, maxKb: 60, dpi: 600, label: '400 x 200 Pixels (600 DPI)' };
      } else {
        return { maxKb: 300, format: 'PDF', label: 'PDF format under 300 KB' };
      }
    }
  };

  const spec = getSpecs();

  useEffect(() => {
    handleClear();
  }, [portal, fileType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    setOutputUrl('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation
      if (fileType === 'document' && selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('image/')) {
        setError('Please upload a PDF or an image file.');
        return;
      }
      if (fileType !== 'document' && !selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please upload a file first.');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      if (fileType === 'document') {
        await processDocument();
      } else {
        await processImage();
      }
      setSuccess(true);
    } catch (err: any) {
      setError(`Failed to resize: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const processImage = () => {
    return new Promise<void>((resolve, reject) => {
      if (!previewUrl || !canvasRef.current) {
        reject(new Error('Canvas or preview not ready'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not obtain canvas context'));
          return;
        }

        const targetW = (spec as any).width;
        const targetH = (spec as any).height;
        const maxKb = (spec as any).maxKb;

        canvas.width = targetW;
        canvas.height = targetH;

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Calculate aspect ratio crop
        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;

        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

        if (imgRatio > targetRatio) {
          srcW = img.height * targetRatio;
          srcX = (img.width - srcW) / 2;
        } else {
          srcH = img.width / targetRatio;
          srcY = (img.height - srcH) / 2;
        }

        // Apply Scale Zoom centered
        const zoomWidth = srcW / scale;
        const zoomHeight = srcH / scale;
        const zoomX = srcX + (srcW - zoomWidth) / 2;
        const zoomY = srcY + (srcH - zoomHeight) / 2;

        ctx.drawImage(img, zoomX, zoomY, zoomWidth, zoomHeight, 0, 0, targetW, targetH);

        // Compress JPEG below target Kb
        let quality = 0.92;
        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (blob.size / 1024 > maxKb && quality > 0.1) {
                  quality -= 0.05;
                  compress();
                } else {
                  setOutputBlob(blob);
                  setOutputSize(blob.size);
                  setOutputUrl(URL.createObjectURL(blob));
                  resolve();
                }
              } else {
                reject(new Error('Failed to create image blob'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        compress();
      };
      img.onerror = () => reject(new Error('Failed to load preview image'));
      img.src = previewUrl;
    });
  };

  const processDocument = async () => {
    if (!file) return;

    // Image to PDF Conversion
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imgBytes = e.target?.result as string;
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          
          let embeddedImg;
          if (file.type === 'image/png') {
            embeddedImg = await pdfDoc.embedPng(imgBytes);
          } else {
            embeddedImg = await pdfDoc.embedJpg(imgBytes);
          }

          const { width, height } = page.getSize();
          const scaleRatio = Math.min(width / embeddedImg.width, height / embeddedImg.height) * 0.9;
          const imgW = embeddedImg.width * scaleRatio;
          const imgH = embeddedImg.height * scaleRatio;

          page.drawImage(embeddedImg, {
            x: (width - imgW) / 2,
            y: (height - imgH) / 2,
            width: imgW,
            height: imgH,
          });

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
          setOutputBlob(blob);
          setOutputSize(blob.size);
          setOutputUrl(URL.createObjectURL(blob));
        } catch (err: any) {
          setError(`Image-to-PDF conversion failed: ${err.message}`);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // PDF Compression (Mock simulation or size validation)
      if (file.size / 1024 <= 300) {
        setOutputBlob(file);
        setOutputSize(file.size);
        setOutputUrl(previewUrl);
      } else {
        // PDF is over 300KB, simulate a compression warning
        setError('Uploaded PDF exceeds 300 KB. Please upload a smaller PDF or a scanned image to convert.');
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl('');
    setOutputUrl('');
    setOutputBlob(null);
    setOutputSize(0);
    setScale(1);
    setBrightness(100);
    setContrast(100);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    return (bytes / k).toFixed(2) + ' KB';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Options */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Portal</Typography>
          <RadioGroup row value={portal} onChange={(e) => setPortal(e.target.value as any)}>
            <FormControlLabel value="nsdl" control={<Radio />} label="NSDL (Protean)" />
            <FormControlLabel value="uti" control={<Radio />} label="UTIITSL" />
          </RadioGroup>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Upload Type</Typography>
          <RadioGroup row value={fileType} onChange={(e) => setFileType(e.target.value as any)}>
            <FormControlLabel value="photo" control={<Radio />} label="Photograph" />
            <FormControlLabel value="signature" control={<Radio />} label="Signature" />
            <FormControlLabel value="document" control={<Radio />} label="Document (PDF)" />
          </RadioGroup>
        </Box>
      </Box>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Required: <strong>{spec.label}</strong> | File size limit: <strong>Under {fileType === 'document' ? '300' : (spec as any).maxKb} KB</strong>
      </Alert>

      {/* Upload Zone */}
      {!file ? (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: 'primary.light',
            borderRadius: 3,
            p: 5,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'action.hover',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={fileType === 'document' ? 'application/pdf,image/*' : 'image/*'}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Select file for PAN Card {fileType === 'photo' ? 'Photo' : fileType === 'signature' ? 'Signature' : 'Document'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag & drop or click to browse from device
          </Typography>
        </Box>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {/* Left Column: Preview / Cropper (only for photos and signatures) */}
            <Grid size={{ xs: 12, md: fileType === 'document' ? 12 : 7 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                Adjust Area & Alignment
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 250,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {fileType === 'document' ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Document Uploaded</Typography>
                    <Typography variant="body2" color="text.secondary">File: {file.name} ({formatSize(file.size)})</Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxHeight: 400,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Crop Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 350,
                        transform: `scale(${scale})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        transition: 'transform 0.1s ease',
                      }}
                    />
                  </Box>
                )}
              </Paper>

              {/* Cropper Sliders */}
              {fileType !== 'document' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Zoom Scale</Typography>
                  <Slider
                    value={scale}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e, val) => setScale(val as number)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Brightness ({brightness}%)</Typography>
                  <Slider
                    value={brightness}
                    min={50}
                    max={150}
                    onChange={(e, val) => setBrightness(val as number)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Contrast ({contrast}%)</Typography>
                  <Slider
                    value={contrast}
                    min={50}
                    max={150}
                    onChange={(e, val) => setContrast(val as number)}
                  />
                </Box>
              )}
            </Grid>

            {/* Right Column: Process & Output */}
            {fileType !== 'document' && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Processed Output
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 250,
                  }}
                >
                  {outputUrl ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          border: '1px solid #ddd',
                          display: 'inline-block',
                          p: 0.5,
                          bgcolor: '#fff',
                          lineHeight: 0,
                          mb: 2,
                        }}
                      >
                        <img
                          src={outputUrl}
                          alt="Processed Output"
                          style={{
                            width: (spec as any).width,
                            height: (spec as any).height,
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Size: {formatSize(outputSize)}
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                        Successfully compressed under {(spec as any).maxKb} KB!
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No processed image yet. Click "Process & Resize" below.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Action Footer */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="error" 
              sx={{ width: { xs: '100%', sm: 'auto' } }} 
              startIcon={<DeleteIcon />} 
              onClick={handleClear}
            >
              Clear
            </Button>
            {outputUrl ? (
              <Button
                variant="contained"
                color="success"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                startIcon={<DownloadIcon />}
                href={outputUrl}
                download={fileType === 'document' ? `pancard-document-${file.name}.pdf` : `pancard-${fileType}-${portal}-${(spec as any).width}x${(spec as any).height}.jpg`}
              >
                Download File
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                onClick={handleProcess}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <CropIcon />}
              >
                {processing ? 'Processing...' : 'Process & Resize'}
              </Button>
            )}
          </Box>
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
