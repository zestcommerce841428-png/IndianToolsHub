'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Slider,
  Divider,
  Alert,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DownloadIcon from '@mui/icons-material/Download';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function QrCodeGeneratorScanner() {
  const [tabValue, setTabValue] = useState<number>(0);

  // Generator State
  const [qrType, setQrType] = useState<string>('text');
  const [qrText, setQrText] = useState<string>('');
  
  // Wi-Fi details
  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [wifiEncryption, setWifiEncryption] = useState<string>('WPA');

  // Email details
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');

  // SMS details
  const [smsPhone, setSmsPhone] = useState<string>('');
  const [smsMessage, setSmsMessage] = useState<string>('');

  // vCard details
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactOrg, setContactOrg] = useState<string>('');

  // QR Customizations
  const [size, setSize] = useState<number>(256);
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  // Scanner State
  const [scanMethod, setScanMethod] = useState<'upload' | 'camera'>('upload');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate string to put inside QR code based on type
  const getQrValue = () => {
    switch (qrType) {
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'email':
        return `mailto:${emailRecipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `smsto:${smsPhone}:${smsMessage}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${contactName}\nFN:${contactName}\nORG:${contactOrg}\nTEL;TYPE=CELL:${contactPhone}\nEMAIL;TYPE=PREF,INTERNET:${contactEmail}\nEND:VCARD`;
      case 'text':
      default:
        return qrText;
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas-download') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'omnitools-qrcode.png';
    link.href = url;
    link.click();
  };

  // Image scanning
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanResult(null);
    setScanError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setScanResult(code.data);
        } else {
          setScanError('No QR code found in this image. Please check image resolution or clarity.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Camera scanning
  const startCamera = async () => {
    setScanResult(null);
    setScanError(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
      }

      // Check frames
      scanIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              setScanResult(code.data);
              stopCamera();
            }
          }
        }
      }, 300);
    } catch (err) {
      setScanError('Unable to access camera. Please allow camera permissions or upload an image instead.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => {
          setTabValue(val);
          stopCamera();
        }}>
          <Tab label="Generate QR Code" icon={<QrCodeIcon />} iconPosition="start" />
          <Tab label="Scan QR Code" icon={<QrCodeScannerIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Generator Section */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  QR Code Type & Input
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel>QR Code Type</InputLabel>
                  <Select
                    value={qrType}
                    label="QR Code Type"
                    onChange={(e) => setQrType(e.target.value)}
                  >
                    <MenuItem value="text">Text / Website URL</MenuItem>
                    <MenuItem value="wifi">Wi-Fi Connection</MenuItem>
                    <MenuItem value="email">Email Draft</MenuItem>
                    <MenuItem value="sms">SMS Message</MenuItem>
                    <MenuItem value="vcard">Contact Card (vCard)</MenuItem>
                  </Select>
                </FormControl>

                {/* Conditional Inputs */}
                {qrType === 'text' && (
                  <TextField
                    label="Text or Website URL"
                    placeholder="Enter website link (e.g. https://google.com) or text"
                    fullWidth
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}

                {qrType === 'wifi' && (
                  <Stack spacing={2}>
                    <TextField
                      label="Wi-Fi SSID (Name)"
                      placeholder="e.g. Home_Network"
                      fullWidth
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Wi-Fi Password"
                      placeholder="Security password"
                      fullWidth
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel>Security Type</InputLabel>
                      <Select
                        value={wifiEncryption}
                        label="Security Type"
                        onChange={(e) => setWifiEncryption(e.target.value)}
                      >
                        <MenuItem value="WPA">WPA/WPA2</MenuItem>
                        <MenuItem value="WEP">WEP</MenuItem>
                        <MenuItem value="nopass">None (Unsecured)</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                )}

                {qrType === 'email' && (
                  <Stack spacing={2}>
                    <TextField
                      label="Recipient Email"
                      placeholder="e.g. contact@omnitools.com"
                      fullWidth
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Subject"
                      placeholder="Email subject"
                      fullWidth
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Message Body"
                      placeholder="Type email body content here..."
                      multiline
                      rows={3}
                      fullWidth
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                )}

                {qrType === 'sms' && (
                  <Stack spacing={2}>
                    <TextField
                      label="Phone Number"
                      placeholder="e.g. +1234567890"
                      fullWidth
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Message"
                      placeholder="SMS text body..."
                      multiline
                      rows={3}
                      fullWidth
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                )}

                {qrType === 'vcard' && (
                  <Stack spacing={2}>
                    <TextField
                      label="Full Name"
                      placeholder="e.g. John Doe"
                      fullWidth
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Phone Number"
                      placeholder="e.g. +1234567890"
                      fullWidth
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Email Address"
                      placeholder="e.g. john@company.com"
                      fullWidth
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Company/Organization"
                      placeholder="e.g. Acme Corp"
                      fullWidth
                      value={contactOrg}
                      onChange={(e) => setContactOrg(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                )}

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Customization
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Foreground Color"
                      type="color"
                      fullWidth
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Background Color"
                      type="color"
                      fullWidth
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography id="size-slider-label" variant="caption" color="text.secondary">
                      Size: {size}px x {size}px
                    </Typography>
                    <Slider
                      aria-labelledby="size-slider-label"
                      value={size}
                      min={128}
                      max={512}
                      step={32}
                      onChange={(_, val) => setSize(val as number)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Error Correction Level</InputLabel>
                      <Select
                        value={errorLevel}
                        label="Error Correction Level"
                        onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                      >
                        <MenuItem value="L">L (Low - 7%)</MenuItem>
                        <MenuItem value="M">M (Medium - 15%)</MenuItem>
                        <MenuItem value="Q">Q (Quartile - 25%)</MenuItem>
                        <MenuItem value="H">H (High - 30%)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
              {getQrValue() ? (
                <Stack spacing={3} sx={{ width: '100%', alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      bgcolor: bgColor,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <QRCodeCanvas
                      id="qr-canvas-download"
                      value={getQrValue()}
                      size={200}
                      level={errorLevel}
                      fgColor={fgColor}
                      bgColor={bgColor}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" align="center" sx={{ wordBreak: 'break-all', px: 2 }}>
                    Content: {getQrValue()}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download QR Code
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Fill in the input details to preview and download your QR Code.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Scanner Section */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Scanning Method
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant={scanMethod === 'upload' ? 'contained' : 'outlined'}
                    startIcon={<UploadFileIcon />}
                    onClick={() => {
                      setScanMethod('upload');
                      stopCamera();
                    }}
                    fullWidth
                  >
                    Upload Image
                  </Button>
                  <Button
                    variant={scanMethod === 'camera' ? 'contained' : 'outlined'}
                    startIcon={<CameraAltIcon />}
                    onClick={() => setScanMethod('camera')}
                    fullWidth
                  >
                    Use Camera
                  </Button>
                </Stack>

                {scanMethod === 'upload' && (
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                    <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Click or drag a QR code image file
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports PNG, JPG, JPEG, WEBP
                    </Typography>
                  </Box>
                )}

                {scanMethod === 'camera' && (
                  <Box sx={{ width: '100%', textAlign: 'center' }}>
                    {!isScanning ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CameraAltIcon />}
                        onClick={startCamera}
                      >
                        Start Camera Scan
                      </Button>
                    ) : (
                      <Button variant="outlined" color="error" onClick={stopCamera}>
                        Stop Camera Scan
                      </Button>
                    )}

                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 320,
                        height: 240,
                        mx: 'auto',
                        mt: 2.5,
                        bgcolor: '#000',
                        borderRadius: 2,
                        overflow: 'hidden',
                        display: isScanning ? 'block' : 'none',
                      }}
                    >
                      <video
                        ref={videoRef}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      
                      {/* Aim target overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '15%',
                          left: '15%',
                          width: '70%',
                          height: '70%',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          borderRadius: 2,
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {scanError && <Alert severity="error">{scanError}</Alert>}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Scan Results
              </Typography>
              
              {scanResult ? (
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                  <Alert severity="success">QR Code Decoded Successfully!</Alert>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Decoded Content:
                    </Typography>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {scanResult}
                    </pre>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigator.clipboard.writeText(scanResult);
                      alert('Copied results to clipboard!');
                    }}
                  >
                    Copy Decoded Content
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Upload an image or use the camera to scan a QR code. Results will be shown here.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
