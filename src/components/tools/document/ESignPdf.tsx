'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DrawIcon from '@mui/icons-material/Draw';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';

export default function ESignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Signature source tabs: 0 = Draw, 1 = Type
  const [sigTab, setSigTab] = useState<number>(0);
  const [signatureText, setSignatureText] = useState<string>('');
  const [penColor, setPenColor] = useState<string>('#000000');
  const [fontFamily, setFontFamily] = useState<string>('cursive');
  
  // Placement settings
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [positionPreset, setPositionPreset] = useState<string>('bottom-right');
  const [customX, setCustomX] = useState<number>(50);
  const [customY, setCustomY] = useState<number>(50);
  const [sigWidth, setSigWidth] = useState<number>(150);
  const [sigHeight, setSigHeight] = useState<number>(75);

  const [signing, setSigning] = useState<boolean>(false);
  const [alertInfo, setAlertInfo] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  // Clear or render signature when tabs, text, color, or font change
  useEffect(() => {
    if (sigTab === 1) {
      renderTypedSignature();
    }
  }, [sigTab, signatureText, penColor, fontFamily]);

  const renderTypedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Choose font family style
    let fontName = 'cursive';
    if (fontFamily === 'dancing') fontName = '"Dancing Script", cursive';
    else if (fontFamily === 'pacifico') fontName = '"Pacifico", cursive';
    else if (fontFamily === 'brush') fontName = '"Brush Script MT", cursive';

    ctx.font = `italic 36px ${fontName}`;
    ctx.fillText(signatureText || 'Your Signature', canvas.width / 2, canvas.height / 2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setAlertInfo({ type: 'error', message: 'Please upload a valid PDF document.' });
        resetAll();
        return;
      }

      try {
        const bytes = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        setFile(selectedFile);
        setPdfBytes(bytes);
        setTotalPages(pdfDoc.getPageCount());
        setAlertInfo(null);
      } catch (err) {
        console.error(err);
        setAlertInfo({ type: 'error', message: 'Failed to load PDF file. It may be locked or corrupted.' });
        resetAll();
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Canvas Mouse / Touch events for drawing
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Touch event coordinates
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      // Map correctly based on bounding dimensions and canvas element width/height
      return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height,
      };
    }
    
    // Mouse event coordinates
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (sigTab !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    lastXRef.current = x;
    lastYRef.current = y;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || sigTab !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;

    ctx.lineTo(x, y);
    ctx.stroke();

    lastXRef.current = x;
    lastYRef.current = y;
  };

  const handleStopDraw = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (sigTab === 1) {
      setSignatureText('');
    }
  };

  const isCanvasEmpty = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    // Check pixel buffer content
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return !buffer.some((pixel) => pixel !== 0);
  };

  const signPdfDocument = async () => {
    if (!pdfBytes || !file) {
      setAlertInfo({ type: 'error', message: 'Please upload a PDF document first.' });
      return;
    }

    if (isCanvasEmpty()) {
      setAlertInfo({ type: 'error', message: 'Please sign or enter a signature style first.' });
      return;
    }

    setSigning(true);
    setAlertInfo(null);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas element missing');

      // Convert canvas drawing to PNG data url bytes
      const pngUrl = canvas.toDataURL('image/png');
      const pngBytes = await fetch(pngUrl).then((r) => r.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(pngBytes);

      const pages = pdfDoc.getPages();
      const pageIndex = Math.min(Math.max(selectedPage - 1, 0), pages.length - 1);
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      // Calculate absolute coordinate positions on PDF page boundaries
      let targetX = customX;
      let targetY = customY;

      if (positionPreset === 'bottom-right') {
        targetX = width - sigWidth - 30;
        targetY = 30;
      } else if (positionPreset === 'bottom-left') {
        targetX = 30;
        targetY = 30;
      } else if (positionPreset === 'top-right') {
        targetX = width - sigWidth - 30;
        targetY = height - sigHeight - 30;
      } else if (positionPreset === 'top-left') {
        targetX = 30;
        targetY = height - sigHeight - 30;
      } else if (positionPreset === 'center') {
        targetX = (width - sigWidth) / 2;
        targetY = (height - sigHeight) / 2;
      }

      page.drawImage(sigImage, {
        x: targetX,
        y: targetY,
        width: sigWidth,
        height: sigHeight,
      });

      const signedBytes = await pdfDoc.save();
      const blob = new Blob([signedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      a.download = `${originalNameWithoutExt}_signed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSigning(false);
      setAlertInfo({ type: 'success', message: 'PDF signed and downloaded successfully!' });
    } catch (err) {
      console.error(err);
      setSigning(false);
      setAlertInfo({ type: 'error', message: 'An error occurred while signing the PDF document.' });
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfBytes(null);
    setTotalPages(0);
    setSignatureText('');
    setAlertInfo(null);
    setSelectedPage(1);
    setPositionPreset('bottom-right');
    clearCanvas();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* PDF Picker */}
      {!file ? (
        <Card
          variant="outlined"
          onClick={triggerFileInput}
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
            accept="application/pdf"
            style={{ display: 'none' }}
          />
          <UploadFileIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Upload PDF Document
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag-and-drop or click to browse files
          </Typography>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PictureAsPdfIcon />
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {(file.size / 1024).toFixed(1)} KB • Pages: {totalPages}
              </Typography>
            </Box>
            {!signing && (
              <Button size="small" variant="text" color="error" onClick={resetAll}>
                Remove
              </Button>
            )}
          </Box>
        </Card>
      )}

      {file && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Signature Creator Column */}
          <Box>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Signature Pad
                </Typography>

                <Tabs value={sigTab} onChange={(_, v) => { setSigTab(v); clearCanvas(); }} variant="fullWidth">
                  <Tab icon={<DrawIcon />} label="Draw" sx={{ fontWeight: 700 }} />
                  <Tab icon={<TextFieldsIcon />} label="Type" sx={{ fontWeight: 700 }} />
                </Tabs>

                {sigTab === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                      label="Type Name"
                      variant="outlined"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      fullWidth
                    />

                    <FormControl size="small" fullWidth>
                      <InputLabel id="font-select-label">Cursive Font</InputLabel>
                      <Select
                        labelId="font-select-label"
                        value={fontFamily}
                        label="Cursive Font"
                        onChange={(e) => setFontFamily(e.target.value)}
                      >
                        <MenuItem value="cursive">Standard Cursive</MenuItem>
                        <MenuItem value="dancing">Dancing Script</MenuItem>
                        <MenuItem value="pacifico">Pacifico Style</MenuItem>
                        <MenuItem value="brush">Brush Script</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Canvas Drawing container */}
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'grey.50',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    mt: 1,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleDrawing}
                    onMouseUp={handleStopDraw}
                    onMouseLeave={handleStopDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleDrawing}
                    onTouchEnd={handleStopDraw}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '200px',
                      cursor: sigTab === 0 ? 'crosshair' : 'default',
                      touchAction: 'none',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                  <ToggleButtonGroup
                    value={penColor}
                    exclusive
                    onChange={(_, color) => color && setPenColor(color)}
                    size="small"
                  >
                    <ToggleButton value="#000000" sx={{ px: 2, py: 0.5, color: '#000000', fontWeight: 'bold' }}>
                      Black
                    </ToggleButton>
                    <ToggleButton value="#0000ff" sx={{ px: 2, py: 0.5, color: '#0000ff', fontWeight: 'bold' }}>
                      Blue
                    </ToggleButton>
                    <ToggleButton value="#ff0000" sx={{ px: 2, py: 0.5, color: '#ff0000', fontWeight: 'bold' }}>
                      Red
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={clearCanvas}
                  >
                    Clear
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Placement Settings Column */}
          <Box>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Signature Placement
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="page-select-label">Sign Page</InputLabel>
                    <Select
                      labelId="page-select-label"
                      value={selectedPage}
                      label="Sign Page"
                      onChange={(e) => setSelectedPage(Number(e.target.value))}
                    >
                      {Array.from({ length: totalPages }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          Page {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel id="preset-select-label">Position Preset</InputLabel>
                    <Select
                      labelId="preset-select-label"
                      value={positionPreset}
                      label="Position Preset"
                      onChange={(e) => setPositionPreset(e.target.value)}
                    >
                      <MenuItem value="bottom-right">Bottom Right</MenuItem>
                      <MenuItem value="bottom-left">Bottom Left</MenuItem>
                      <MenuItem value="top-right">Top Right</MenuItem>
                      <MenuItem value="top-left">Top Left</MenuItem>
                      <MenuItem value="center">Center</MenuItem>
                      <MenuItem value="custom">Custom Coordinates</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {positionPreset === 'custom' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Horizontal Position (X coordinate)</Typography>
                      <Slider
                        value={customX}
                        onChange={(_, v) => setCustomX(v as number)}
                        min={0}
                        max={600}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vertical Position (Y coordinate)</Typography>
                      <Slider
                        value={customY}
                        onChange={(_, v) => setCustomY(v as number)}
                        min={0}
                        max={800}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Signature Width ({sigWidth}px)</Typography>
                    <Slider
                      value={sigWidth}
                      onChange={(_, v) => setSigWidth(v as number)}
                      min={50}
                      max={350}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Signature Height ({sigHeight}px)</Typography>
                    <Slider
                      value={sigHeight}
                      onChange={(_, v) => setSigHeight(v as number)}
                      min={25}
                      max={180}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={signPdfDocument}
                    disabled={signing}
                    startIcon={<GetAppIcon />}
                    fullWidth
                  >
                    {signing ? 'Signing PDF...' : 'Download Signed PDF'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}
