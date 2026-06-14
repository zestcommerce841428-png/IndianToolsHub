'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

interface AnalyzedTags {
  title: string;
  titleLength: number;
  titleStatus: 'good' | 'warning' | 'error';
  titleMessage: string;

  description: string;
  descriptionLength: number;
  descriptionStatus: 'good' | 'warning' | 'error';
  descriptionMessage: string;

  keywords: string;
  author: string;
  charset: string;
  viewport: string;
  canonical: string;
  robots: string;

  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;

  // Twitter
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;

  // Score
  seoScore: number;
}

export default function MetaTagAnalyzer() {
  const [tabValue, setTabValue] = useState<number>(0);
  const [url, setUrl] = useState<string>('');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzedTags | null>(null);

  const analyzeHtml = (htmlText: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Helper functions
      const getMeta = (query: string): string => {
        const el = doc.querySelector(query);
        return el ? el.getAttribute('content') || '' : '';
      };

      const title = doc.querySelector('title')?.innerText || '';
      const titleLength = title.length;
      let titleStatus: 'good' | 'warning' | 'error' = 'good';
      let titleMessage = '';

      if (titleLength === 0) {
        titleStatus = 'error';
        titleMessage = 'Missing title tag. Title tags are critical for search engine rankings.';
      } else if (titleLength < 30) {
        titleStatus = 'warning';
        titleMessage = `Title tag is too short (${titleLength} chars). Aim for 50-60 characters for maximum search engine compatibility.`;
      } else if (titleLength > 60) {
        titleStatus = 'warning';
        titleMessage = `Title tag is too long (${titleLength} chars). Search engines will truncate it. Aim for 50-60 characters.`;
      } else {
        titleMessage = `Title is optimized! Ideal length is 50-60 chars (${titleLength} chars).`;
      }

      const description = getMeta('meta[name="description"]');
      const descriptionLength = description.length;
      let descriptionStatus: 'good' | 'warning' | 'error' = 'good';
      let descriptionMessage = '';

      if (descriptionLength === 0) {
        descriptionStatus = 'error';
        descriptionMessage = 'Missing meta description. It attracts clicks from search results.';
      } else if (descriptionLength < 110) {
        descriptionStatus = 'warning';
        descriptionMessage = `Meta description is short (${descriptionLength} chars). Try using 150-160 characters to describe your page.`;
      } else if (descriptionLength > 160) {
        descriptionStatus = 'warning';
        descriptionMessage = `Meta description is long (${descriptionLength} chars). It may be cut off. Aim for 150-160 characters.`;
      } else {
        descriptionMessage = `Meta description is optimized! Ideal length is 150-160 chars (${descriptionLength} chars).`;
      }

      const keywords = getMeta('meta[name="keywords"]');
      const author = getMeta('meta[name="author"]');
      const charset = doc.querySelector('meta[charset]')?.getAttribute('charset') || '';
      const viewport = getMeta('meta[name="viewport"]');
      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      const robots = getMeta('meta[name="robots"]');

      // Open Graph
      const ogTitle = getMeta('meta[property="og:title"]');
      const ogDescription = getMeta('meta[property="og:description"]');
      const ogImage = getMeta('meta[property="og:image"]');
      const ogUrl = getMeta('meta[property="og:url"]');
      const ogType = getMeta('meta[property="og:type"]');

      // Twitter Cards
      const twitterCard = getMeta('meta[name="twitter:card"]');
      const twitterTitle = getMeta('meta[name="twitter:title"]');
      const twitterDescription = getMeta('meta[name="twitter:description"]');
      const twitterImage = getMeta('meta[name="twitter:image"]');

      // SEO Health score calculation
      let score = 100;
      if (titleLength === 0) score -= 25;
      else if (titleStatus === 'warning') score -= 10;

      if (descriptionLength === 0) score -= 25;
      else if (descriptionStatus === 'warning') score -= 10;

      if (!viewport) score -= 10;
      if (!canonical) score -= 10;
      if (!robots) score -= 10;
      if (!ogTitle || !ogDescription) score -= 10;
      if (!twitterTitle || !twitterDescription) score -= 10;

      const seoScore = Math.max(0, score);

      setResults({
        title,
        titleLength,
        titleStatus,
        titleMessage,
        description,
        descriptionLength,
        descriptionStatus,
        descriptionMessage,
        keywords,
        author,
        charset,
        viewport,
        canonical,
        robots,
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        ogType,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        seoScore,
      });
    } catch (err) {
      setError('Unable to parse HTML. Please check the code format.');
    }
  };

  const handleAnalyzeUrl = async () => {
    setError(null);
    setResults(null);

    let targetUrl = url.trim();
    if (!targetUrl) {
      setError('Please enter a website URL.');
      return;
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);

    try {
      // Fetch via CORS Proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Proxy request failed.');
      }
      const htmlText = await response.text();
      analyzeHtml(htmlText);
    } catch (err) {
      setError(
        'Could not fetch meta tags directly from the URL (this is usually caused by CORS block on the website or network restrictions). Please try copying the page source code (right-click -> View Page Source) and paste it into the "Paste HTML Code" tab instead.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCode = () => {
    setError(null);
    setResults(null);

    if (!htmlCode.trim()) {
      setError('Please paste raw HTML code.');
      return;
    }

    analyzeHtml(htmlCode);
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="Analyze Website URL" icon={<SearchIcon />} iconPosition="start" />
          <Tab label="Paste HTML Code" icon={<CodeIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 9 }}>
            <TextField
              label="Website URL"
              placeholder="e.g. example.com or https://example.com"
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyzeUrl();
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAnalyzeUrl}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Analyze URL
            </Button>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Paste HTML Source Code"
              multiline
              rows={8}
              fullWidth
              placeholder="Paste HTML <head> code here..."
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" color="primary" fullWidth onClick={handleAnalyzeCode}>
              Analyze Code
            </Button>
          </Grid>
        </Grid>
      )}

      {results && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Divider />

          {/* Core Results Block */}
          <Grid container spacing={3}>
            {/* SEO Score Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  SEO Tags Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={results.seoScore}
                    size={100}
                    thickness={8}
                    color={results.seoScore > 75 ? 'success' : results.seoScore > 40 ? 'warning' : 'error'}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" component="div" sx={{ fontWeight: 800 }}>
                      {results.seoScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center">
                  Score is based on existence and optimization of tags.
                </Typography>
              </Card>
            </Grid>

            {/* Validation Feedback List */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Critical Checks
                  </Typography>
                  <List>
                    <ListItem sx={{ p: 1 }}>
                      <ListItemIcon>{getStatusIcon(results.titleStatus)}</ListItemIcon>
                      <ListItemText
                        primary="Meta Title"
                        secondary={results.titleMessage}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem sx={{ p: 1 }}>
                      <ListItemIcon>{getStatusIcon(results.descriptionStatus)}</ListItemIcon>
                      <ListItemText
                        primary="Meta Description"
                        secondary={results.descriptionMessage}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem sx={{ p: 1 }}>
                      <ListItemIcon>
                        {results.viewport ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <WarningIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Mobile Viewport"
                        secondary={
                          results.viewport
                            ? 'Viewport tag found (supports mobile layouts).'
                            : 'Missing Viewport tag. Pages without it may render poorly on mobile screens.'
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detail Tables */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Extracted Meta Information
            </Typography>

            <Tabs defaultValue={0}>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 600, width: 220 }}>Tag Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    </TableRow>
                    
                    {/* General tags */}
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Title</TableCell>
                      <TableCell>{results.title || <Chip label="Missing" color="error" size="small" />}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Description</TableCell>
                      <TableCell>{results.description || <Chip label="Missing" color="error" size="small" />}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Keywords</TableCell>
                      <TableCell>{results.keywords || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Author</TableCell>
                      <TableCell>{results.author || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Canonical URL</TableCell>
                      <TableCell>{results.canonical || <Chip label="Not Found" color="warning" size="small" />}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Robots Instruction</TableCell>
                      <TableCell>{results.robots || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>Charset</TableCell>
                      <TableCell>{results.charset || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Tabs>
          </Box>

          {/* Social Meta tags (Open Graph & Twitter) */}
          <Grid container spacing={3}>
            {/* Open Graph Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" /> Open Graph (Facebook/LinkedIn)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>og:title</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.ogTitle || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>og:description</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.ogDescription || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>og:url</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.ogUrl || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>og:image</TableCell>
                          <TableCell sx={{ borderBottom: 'none', wordBreak: 'break-all' }}>{results.ogImage || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>og:type</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.ogType || 'Missing'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Twitter Cards Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" /> Twitter Cards Meta
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>twitter:card</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.twitterCard || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>twitter:title</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.twitterTitle || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>twitter:description</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>{results.twitterDescription || 'Missing'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, borderBottom: 'none', pl: 0 }}>twitter:image</TableCell>
                          <TableCell sx={{ borderBottom: 'none', wordBreak: 'break-all' }}>{results.twitterImage || 'Missing'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
