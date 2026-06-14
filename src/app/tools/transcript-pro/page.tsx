'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  YouTube,
  ContentCopy,
  Download,
  Search,
  Clear,
  Refresh,
  AccessTime,
  TextFields,
} from '@mui/icons-material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

interface TranscriptData {
  transcript: TranscriptSegment[];
  plainText: string;
  timestampedText: string;
  metadata: {
    wordCount: number;
    duration: string;
    totalSegments: number;
  };
}

export default function TranscriptProPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ open: false, message: '' });
  const [videoId, setVideoId] = useState('');

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Handle extract
  const handleExtract = async () => {
    const id = extractVideoId(url);
    if (!id) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }

    setError('');
    setLoading(true);
    setVideoId(id);

    try {
      const response = await fetch('/api/transcript/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract transcript');
      }

      setTranscriptData(data.data);
      setError('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract transcript';
      setError(errorMessage);
      setTranscriptData(null);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast({ open: true, message: `${label} copied to clipboard!` });
  };

  // Download as .txt
  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ open: true, message: 'Transcript downloaded!' });
  };

  // Highlight search results
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 2px;">$1</mark>');
  };

  // Get display text based on active tab
  const getDisplayText = () => {
    if (!transcriptData) return '';
    const text = activeTab === 0 ? transcriptData.plainText : transcriptData.timestampedText;
    return searchQuery ? highlightText(text, searchQuery) : text;
  };

  return (
    <ProtectedRoute>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <YouTube sx={{ fontSize: 40, color: '#FF0000' }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            Transcript<span style={{ color: '#2563eb' }}>Pro</span>
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          YouTube Transcript Extractor
        </Typography>
        <Typography color="text.secondary">
          Extract YouTube video transcripts instantly. Get full text with or without timestamps.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label="100% Free" color="success" size="small" />
          <Chip label="No Sign-up" color="primary" size="small" />
          <Chip label="Instant Extract" color="secondary" size="small" />
        </Box>
      </Box>

      {/* Input Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Paste YouTube video URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
          disabled={loading}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <YouTube color="error" />
                </InputAdornment>
              ),
              endAdornment: url ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setUrl('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label="youtube.com/watch?v=" size="small" variant="outlined" />
          <Chip label="youtu.be/" size="small" variant="outlined" />
          <Chip label="youtube.com/shorts/" size="small" variant="outlined" />
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleExtract}
          disabled={loading || !url}
          startIcon={loading ? <CircularProgress size={20} /> : <YouTube />}
        >
          {loading ? 'Extracting...' : 'Extract Transcript'}
        </Button>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Fetching transcript...</Typography>
          <Typography color="text.secondary">Processing video captions</Typography>
        </Paper>
      )}

      {/* Results Section */}
      {transcriptData && !loading && (
        <>
          {/* Video Info */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {videoId && (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    style={{ width: 120, height: 90, borderRadius: 8, objectFit: 'cover' }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Transcript Extracted Successfully
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<TextFields />}
                      label={`${transcriptData.metadata.wordCount} words`}
                      size="small"
                    />
                    <Chip
                      icon={<AccessTime />}
                      label={transcriptData.metadata.duration}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Controls */}
          <Paper elevation={2} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, p: 2 }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab label="Plain Text" />
                <Tab label="With Timestamps" />
              </Tabs>
              <TextField
                size="small"
                placeholder="Search in transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: { xs: '100%', sm: 300 } }}
              />
            </Box>
          </Paper>

          {/* Transcript Display */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 2,
              maxHeight: 500,
              overflow: 'auto',
              bgcolor: 'grey.50',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: getDisplayText() }} />
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<ContentCopy />}
              onClick={() => handleCopy(
                activeTab === 0 ? transcriptData.plainText : transcriptData.timestampedText,
                activeTab === 0 ? 'Plain text' : 'Timestamped text'
              )}
            >
              Copy {activeTab === 0 ? 'Plain' : 'Timestamped'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleDownload(
                activeTab === 0 ? transcriptData.plainText : transcriptData.timestampedText,
                `transcript-${videoId}-${activeTab === 0 ? 'plain' : 'timestamped'}.txt`
              )}
            >
              Download .txt
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setTranscriptData(null);
                setUrl('');
                setSearchQuery('');
                setError('');
              }}
            >
              New Extract
            </Button>
          </Box>
        </>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
      />
      </Container>
      <Footer />
    </ProtectedRoute>
  );
}
