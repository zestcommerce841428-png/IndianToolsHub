'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Paper,
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';

const WORKER_URL = 'https://videoproxyapi.usemagictools.com/';
const HISTORY_KEY = 'social_video_history';

// Platform detection patterns
const PATTERNS = {
  tiktok: /(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/(?:@[\w.]+\/video\/)?(\d+)?/i,
  x: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
  instagram: /(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv|stories)\/[\w-]+/i,
  facebook: /(?:facebook\.com|fb\.com|fb\.watch)\/(?:share\/r\/|watch\/?\?v=|reel\/|[\w.]+\/videos\/|video\.php\?v=)?[\w-]+/i,
  youtube: /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]+/i
};

// Interface definitions
interface DownloadItem {
  type: string;
  label: string;
  quality: string;
  url: string;
  badge?: string | null;
}

interface ExternalService {
  name: string;
  url: string;
  icon?: string;
  desc?: string;
}

interface WorkerResult {
  success: boolean;
  platform?: string;
  title?: string;
  author?: string;
  thumbnail?: string;
  duration?: string;
  isExternal?: boolean;
  externalServices?: ExternalService[];
  downloadUrl?: string;
  picker?: { url: string; type?: string }[];
  status?: string;
  videos?: { quality?: string; url: string }[];
  audios?: { quality?: string; url: string }[];
  downloads?: DownloadItem[];
  error?: string;
}

interface HistoryItem {
  url: string;
  platform: string;
  time: number;
}

const translations = {
  en: {
    title: 'Social Video Downloader',
    subtitle: 'Free, fast, and no watermark. Download videos from TikTok, X (Twitter), Instagram, Facebook, and YouTube.',
    inputLabel: 'Video Link',
    inputPlaceholder: 'Paste X, TikTok, Instagram, Facebook or YouTube video link...',
    pasteBtn: 'Paste',
    parseBtn: 'Parse Video',
    parsingBtn: 'Parsing...',
    errorEmptyUrl: 'Please enter a video link',
    errorInvalidUrl: 'Please enter a valid video link',
    errorParseFailed: 'Parsing failed, please check the link and try again.',
    previewTitle: 'Video Preview',
    noPreview: 'No Preview Available',
    downloadsTitle: 'Download Options',
    externalTitle: 'Alternative Download Services',
    historyTitle: 'History',
    clearHistory: 'Clear History',
    faqTitle: 'Frequently Asked Questions',
    howToTitle: 'How to Download',
    steps: [
      'Copy the sharing link of the video from your social platform.',
      'Paste the link in the input field above.',
      'Click "Parse Video" to analyze and display the download links.',
      'Choose your preferred quality or format to save the video.'
    ],
    faqs: [
      {
        q: 'Which platforms are supported?',
        a: 'We support X (Twitter), TikTok, Instagram, Facebook, and YouTube. We regularly update the parsing backend to maintain high success rates.'
      },
      {
        q: 'Why does YouTube downloading redirect to external services?',
        a: 'Direct YouTube download links have strict IP and geoblocking restrictions set by YouTube. We recommend using Cobalt or other free listed services.'
      },
      {
        q: 'Is there a watermark on the downloaded videos?',
        a: 'Our downloader parses and extracts watermark-free original videos whenever possible (e.g., TikTok, Instagram, Facebook).'
      },
      {
        q: 'Is my data safe?',
        a: 'Yes, all processing is done client-side or proxied directly without storing your private history on any server.'
      }
    ],
    directDownload: 'Direct Download',
    audioFile: 'Audio File',
    videoFile: 'Video File',
    mediaFile: 'Media File',
    openExternal: 'Open Service',
    copiedClipboard: 'Copied from clipboard!',
    clipboardError: 'Could not access clipboard.',
    startDownload: 'Starting download...',
  },
  'zh-CN': {
    title: '社交视频下载器',
    subtitle: '免费、快速、无水印。支持从 TikTok、X (Twitter)、Instagram、Facebook 和 YouTube 下载视频。',
    inputLabel: '视频链接',
    inputPlaceholder: '粘贴 X、TikTok、Instagram、Facebook 或 YouTube 视频链接...',
    pasteBtn: '粘贴',
    parseBtn: '解析视频',
    parsingBtn: '解析中...',
    errorEmptyUrl: '请输入视频链接',
    errorInvalidUrl: '请输入有效的视频链接',
    errorParseFailed: '解析失败，请检查链接后重试。',
    previewTitle: '视频预览',
    noPreview: '暂无预览',
    downloadsTitle: '下载选项',
    externalTitle: '备用下载服务',
    historyTitle: '历史记录',
    clearHistory: '清空历史',
    faqTitle: '常见问题解答',
    howToTitle: '如何下载',
    steps: [
      '从社交平台复制视频的分享链接。',
      '将链接粘贴到上方的输入框中。',
      '点击“解析视频”按钮来分析并显示下载链接。',
      '选择您喜欢的画质或格式来保存视频。'
    ],
    faqs: [
      {
        q: '支持哪些平台？',
        a: '我们支持 X (Twitter)、TikTok、Instagram、Facebook 和 YouTube。我们会定期更新解析后端以保持高成功率。'
      },
      {
        q: '为什么 YouTube 下载需要跳转到外部服务？',
        a: 'YouTube 对直接下载链接有严格的 IP 和地理限制。我们建议使用 Cobalt 或其他列出的免费服务。'
      },
      {
        q: '下载的视频有水印吗？',
        a: '我们的下载器会尽可能提取无水印的原视频（例如 TikTok、Instagram、Facebook）。'
      },
      {
        q: '我的数据安全吗？',
        a: '安全。所有处理均在客户端完成或直接代理，不会在任何服务器上存储您的私人历史记录。'
      }
    ],
    directDownload: '直接下载',
    audioFile: '音频文件',
    videoFile: '视频文件',
    mediaFile: '媒体文件',
    openExternal: '打开服务',
    copiedClipboard: '已粘贴剪贴板内容！',
    clipboardError: '无法访问剪贴板。',
    startDownload: '开始下载...',
  }
};

export default function SocialVideoDownloader() {
  const [lang, setLang] = useState<'en' | 'zh-CN'>('en');
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<WorkerResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const t = translations[lang];

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setErrorMsg(null);
      showToast(t.copiedClipboard, 'success');
    } catch (err) {
      showToast(t.clipboardError, 'error');
    }
  };

  const detectPlatform = (videoUrl: string): string | null => {
    if (PATTERNS.tiktok.test(videoUrl)) return 'tiktok';
    if (PATTERNS.x.test(videoUrl)) return 'x';
    if (PATTERNS.instagram.test(videoUrl)) return 'instagram';
    if (PATTERNS.facebook.test(videoUrl)) return 'facebook';
    if (PATTERNS.youtube.test(videoUrl)) return 'youtube';
    return null;
  };

  // Direct download handler
  const handleDownloadFile = async (downloadUrl: string, filename: string) => {
    try {
      showToast(t.startDownload, 'success');
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename.replace(/[^\w\u4e00-\u9fa5]/g, '_') + '.mp4';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(downloadUrl, '_blank');
    }
  };

  // Cobalt client fallback API
  const fetchViaCobalt = async (videoUrl: string, platform: string): Promise<WorkerResult> => {
    const instances = [
      'https://cobaltapi.squair.xyz',
      'https://api.qwkuns.me',
      'https://api.dl.woof.monster'
    ];

    for (const instance of instances) {
      try {
        const response = await fetch(`${instance}/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: videoUrl,
            videoQuality: '1080',
            filenameStyle: 'basic'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'tunnel' || data.status === 'redirect') {
            return {
              success: true,
              platform,
              author: 'Cobalt',
              title: data.filename || `${platform} Video`,
              downloads: [{
                type: 'video',
                label: 'HD Video',
                quality: 'HD',
                url: data.url,
                badge: 'Recommended'
              }]
            };
          } else if (data.status === 'picker' && data.picker) {
            return {
              success: true,
              platform,
              author: 'Cobalt',
              title: `${platform} Video`,
              downloads: data.picker.map((item: any, idx: number) => ({
                type: item.type || 'video',
                label: `Media ${idx + 1}`,
                quality: item.type === 'photo' ? 'Image' : 'HD',
                url: item.url,
                badge: idx === 0 ? 'Recommended' : null
              }))
            };
          }
        }
      } catch (err: any) {
        console.log(`Cobalt instance ${instance} failed for ${platform}:`, err.message);
      }
    }
    return { success: false };
  };

  // Local helper endpoints parsing
  const fetchTikTokTikwm = async (videoUrl: string): Promise<WorkerResult> => {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
    const data = await response.json();
    if (data.code === 0 && data.data) {
      const video = data.data;
      return {
        success: true,
        platform: 'tiktok',
        title: video.title || 'TikTok Video',
        author: video.author?.nickname || video.author?.unique_id || 'TikTok User',
        thumbnail: video.cover || video.origin_cover,
        duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : undefined,
        downloads: [
          {
            type: 'video',
            label: 'No Watermark Video',
            quality: 'HD',
            url: video.play,
            badge: 'Recommended'
          },
          {
            type: 'video',
            label: 'Original Video',
            quality: 'Watermarked',
            url: video.wmplay
          },
          {
            type: 'audio',
            label: 'Audio Track',
            quality: 'MP3',
            url: video.music
          }
        ].filter(d => d.url)
      };
    }
    return { success: false, error: data.msg || 'TikWM parsing failed' };
  };

  const fetchTikTokTikcdn = async (videoUrl: string): Promise<WorkerResult> => {
    const apiUrl = `https://tikcdn.io/ssstik/${encodeURIComponent(videoUrl)}`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      return {
        success: true,
        platform: 'tiktok',
        title: 'TikTok Video',
        author: 'No Watermark Version',
        downloads: [
          {
            type: 'video',
            label: 'No Watermark Video',
            quality: 'HD',
            url: apiUrl,
            badge: 'Recommended'
          }
        ]
      };
    }
    return { success: false, error: 'TikCDN parsing failed' };
  };

  const fetchXTwitsave = async (videoUrl: string): Promise<WorkerResult> => {
    const targetUrl = `https://twitsave.com/info?url=${encodeURIComponent(videoUrl)}`;
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();
    const videoMatch = html.match(/https:\/\/video\.twimg\.com\/[^"'\s]+\.mp4[^"'\s]*/g);
    if (videoMatch && videoMatch.length > 0) {
      const uniqueUrls = Array.from(new Set(videoMatch));
      return {
        success: true,
        platform: 'x',
        title: 'X (Twitter) Video',
        downloads: uniqueUrls.slice(0, 3).map((vUrl, idx) => ({
          type: 'video',
          label: idx === 0 ? 'Highest Quality' : `Quality Option ${idx + 1}`,
          quality: idx === 0 ? 'HD' : 'SD',
          url: vUrl.replace(/&amp;/g, '&'),
          badge: idx === 0 ? 'Recommended' : null
        }))
      };
    }
    return { success: false };
  };

  const fetchXTwitterVid = async (tweetId: string): Promise<WorkerResult> => {
    const targetUrl = `https://twittervid.com/api/video/${tweetId}`;
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    if (data && data.videos && data.videos.length > 0) {
      return {
        success: true,
        platform: 'x',
        title: 'X (Twitter) Video',
        thumbnail: data.thumbnail,
        downloads: data.videos.map((video: any, idx: number) => ({
          type: 'video',
          label: video.quality || `Quality Option ${idx + 1}`,
          quality: video.quality || 'HD',
          url: video.url,
          badge: idx === 0 ? 'Recommended' : null
        }))
      };
    }
    return { success: false };
  };

  // Cloudflare worker request
  const fetchViaWorker = async (videoUrl: string, platform: string): Promise<WorkerResult> => {
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl, platform }),
      });
      const data = await response.json();
      return data;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const handleParse = async (targetUrl?: string) => {
    const urlToParse = (targetUrl || url).trim();
    if (!urlToParse) {
      setErrorMsg(t.errorEmptyUrl);
      return;
    }

    const platform = detectPlatform(urlToParse);
    if (!platform) {
      setErrorMsg(t.errorInvalidUrl);
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setResult(null);

    try {
      let finalResult: WorkerResult | null = null;

      // Platform-specific parse flow
      if (platform === 'tiktok') {
        try {
          const res = await fetchTikTokTikwm(urlToParse);
          if (res.success) finalResult = res;
        } catch {
          // ignore
        }
        if (!finalResult) {
          try {
            const res = await fetchTikTokTikcdn(urlToParse);
            if (res.success) finalResult = res;
          } catch {
            // ignore
          }
        }
        if (!finalResult) {
          // Worker fallback
          const workerRes = await fetchViaWorker(urlToParse, 'tiktok');
          if (workerRes.success) finalResult = workerRes;
        }
        if (!finalResult) {
          // External fallback
          finalResult = {
            success: true,
            platform: 'tiktok',
            title: 'TikTok Video',
            author: 'TikTok User',
            isExternal: true,
            externalServices: [
              { name: 'SnapTik', url: `https://snaptik.app/zh?url=${encodeURIComponent(urlToParse)}`, icon: '🎵' },
              { name: 'SSSTik', url: `https://ssstik.io/zh?url=${encodeURIComponent(urlToParse)}`, icon: '💾' },
              { name: 'TikMate', url: `https://tikmate.app/?url=${encodeURIComponent(urlToParse)}`, icon: '📥' }
            ]
          };
        }
      } else if (platform === 'x') {
        const match = urlToParse.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/i);
        const username = match ? match[1] : 'User';
        const tweetId = match ? match[2] : '';

        // Try cobalt first
        const cob = await fetchViaCobalt(urlToParse, 'x');
        if (cob.success) finalResult = cob;

        if (!finalResult) {
          const twitSave = await fetchXTwitsave(urlToParse);
          if (twitSave.success) finalResult = twitSave;
        }

        if (!finalResult && tweetId) {
          const twitVid = await fetchXTwitterVid(tweetId);
          if (twitVid.success) finalResult = twitVid;
        }

        if (!finalResult) {
          finalResult = {
            success: true,
            platform: 'x',
            title: 'X (Twitter) Video',
            author: username,
            isExternal: true,
            externalServices: [
              { name: 'Cobalt', url: `https://cobalt.tools/?url=${encodeURIComponent(urlToParse)}`, icon: '⚡' },
              { name: 'SaveTwitter', url: `https://ssstwitter.com/zh?url=${encodeURIComponent(urlToParse)}`, icon: '🔗' },
              { name: 'TwitterVid', url: `https://twittervid.com/?url=${encodeURIComponent(urlToParse)}`, icon: '💾' }
            ]
          };
        }
      } else {
        // Instagram, Facebook, YouTube
        const workerRes = await fetchViaWorker(urlToParse, platform);
        if (workerRes.success) {
          finalResult = workerRes;
        } else {
          const cob = await fetchViaCobalt(urlToParse, platform);
          if (cob.success) {
            finalResult = cob;
          } else {
            // External Fallback
            const externalMaps: Record<string, ExternalService[]> = {
              instagram: [
                { name: 'Cobalt', url: `https://cobalt.tools/?url=${encodeURIComponent(urlToParse)}`, icon: '⚡', desc: 'Fast, open-source HD' },
                { name: 'SnapSave', url: `https://snapsave.app/zh/instagram-reels-video-download?url=${encodeURIComponent(urlToParse)}`, icon: '💾', desc: 'Reels and Stories' },
                { name: 'FastDl', url: `https://fastdl.app/zh/instagram-reels-downloader?url=${encodeURIComponent(urlToParse)}`, icon: '🚀' }
              ],
              facebook: [
                { name: 'Cobalt', url: `https://cobalt.tools/?url=${encodeURIComponent(urlToParse)}`, icon: '⚡', desc: 'Fast, open-source HD' },
                { name: 'SnapSave', url: `https://snapsave.app/zh/facebook-video-downloader?url=${encodeURIComponent(urlToParse)}`, icon: '💾' },
                { name: 'FDown', url: `https://fdown.net/zh/?url=${encodeURIComponent(urlToParse)}`, icon: '📘' }
              ],
              youtube: [
                { name: 'Cobalt', url: `https://cobalt.tools/?url=${encodeURIComponent(urlToParse)}`, icon: '⚡', desc: 'Recommended direct option' },
                { name: 'Y2Mate', url: 'https://www.y2mate.com/zh-cn/youtube', icon: '🎬', desc: 'Paste manually for all sizes' },
                { name: '9xbuddy', url: `https://9xbuddy.com/process?url=${encodeURIComponent(urlToParse)}`, icon: '🎵', desc: 'Audio and video formats' }
              ]
            };
            finalResult = {
              success: true,
              platform,
              title: `${platform.toUpperCase()} Video`,
              author: 'Social Media User',
              isExternal: true,
              externalServices: externalMaps[platform] || []
            };
          }
        }
      }

      if (finalResult && finalResult.success) {
        setResult(finalResult);
        addToHistory(urlToParse, platform);
      } else {
        setErrorMsg(t.errorParseFailed);
      }
    } catch (e) {
      setErrorMsg(t.errorParseFailed);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (videoUrl: string, platform: string) => {
    const item: HistoryItem = {
      url: videoUrl,
      platform,
      time: Date.now()
    };

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.url !== videoUrl);
      const updated = [item, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history to storage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history from storage', e);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <YouTubeIcon sx={{ color: '#ff0000' }} />;
      case 'facebook':
        return <FacebookIcon sx={{ color: '#1877f2' }} />;
      case 'instagram':
        return <InstagramIcon sx={{ color: '#e1306c' }} />;
      case 'x':
        return <TwitterIcon sx={{ color: '#1da1f2' }} />;
      default:
        return <MusicNoteIcon sx={{ color: '#00f2fe' }} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
          <Alert severity={toastMsg.type} variant="filled">
            {toastMsg.text}
          </Alert>
        </Box>
      )}

      {/* Header Grid */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
            {t.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t.subtitle}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select value={lang} label="Language" onChange={(e) => setLang(e.target.value as 'en' | 'zh-CN')}>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="zh-CN">简体中文</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Input section Card */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
              {errorMsg}
            </Alert>
          )}

          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label={t.inputLabel}
                placeholder={t.inputPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                variant="outlined"
              />
              <Button
                variant="outlined"
                color="secondary"
                onClick={handlePaste}
                startIcon={<ContentPasteIcon />}
                sx={{ px: 3, display: { xs: 'none', sm: 'flex' } }}
              >
                {t.pasteBtn}
              </Button>
            </Box>

            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleParse()}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                fullWidth
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? t.parsingBtn : t.parseBtn}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Result Section */}
      {result && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Preview Panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {t.previewTitle}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    flex: 1,
                    minHeight: '260px',
                    borderRadius: 1,
                    overflow: 'hidden',
                    background: '#121212',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {result.thumbnail ? (
                    <Box
                      component="img"
                      src={result.thumbnail}
                      alt="Thumbnail"
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : result.downloads && result.downloads.length > 0 && result.downloads[0].url ? (
                    <Box
                      component="video"
                      controls
                      src={result.downloads[0].url}
                      sx={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Stack spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                      <VideoLibraryIcon sx={{ fontSize: 48 }} />
                      <Typography variant="body2">{t.noPreview}</Typography>
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Info and Download links Panel */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      icon={getPlatformIcon(result.platform || '')}
                      label={(result.platform || 'video').toUpperCase()}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                    {result.duration && <Chip label={result.duration} size="small" />}
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {result.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    @{result.author || 'User'}
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {result.isExternal ? t.externalTitle : t.downloadsTitle}
                </Typography>

                <Stack spacing={2}>
                  {result.isExternal ? (
                    result.externalServices?.map((service, idx) => (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{ p: 2, display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}
                      >
                        <Stack spacing={0.5} sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{service.icon}</span> {service.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.desc || 'Click to jump and download from third-party.'}
                          </Typography>
                        </Stack>
                        <Button
                          variant="contained"
                          color="secondary"
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<LaunchIcon />}
                        >
                          {t.openExternal}
                        </Button>
                      </Paper>
                    ))
                  ) : (
                    <>
                      {result.downloadUrl && (
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                          <Stack spacing={0.5} sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {t.directDownload} (HD)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t.videoFile}
                            </Typography>
                          </Stack>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleDownloadFile(result.downloadUrl || '', result.title || 'Video')}
                            startIcon={<DownloadIcon />}
                          >
                            {t.directDownload}
                          </Button>
                        </Paper>
                      )}

                      {result.picker && result.picker.map((item, idx) => {
                        const isVideo = item.type === 'video';
                        return (
                          <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <ListItemIcon>
                              {isVideo ? <VideoLibraryIcon color="primary" /> : <ImageIcon color="secondary" />}
                            </ListItemIcon>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {isVideo ? t.videoFile : t.mediaFile} {idx + 1}
                              </Typography>
                            </Stack>
                            <Button
                              variant="outlined"
                              onClick={() => handleDownloadFile(item.url, `${result.title || 'Media'}_${idx + 1}`)}
                              startIcon={<DownloadIcon />}
                            >
                              Download
                            </Button>
                          </Paper>
                        );
                      })}

                      {result.downloads && result.downloads.map((item, idx) => {
                        const isAudio = item.type === 'audio';
                        return (
                          <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <ListItemIcon>
                              {isAudio ? <MusicNoteIcon color="primary" /> : <VideoLibraryIcon color="secondary" />}
                            </ListItemIcon>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.label} {item.badge && <Chip label={item.badge} color="success" size="small" />}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.quality}
                              </Typography>
                            </Stack>
                            <Button
                              variant="contained"
                              onClick={() => handleDownloadFile(item.url, `${result.title || 'Media'}_${idx + 1}`)}
                              startIcon={<DownloadIcon />}
                            >
                              Download
                            </Button>
                          </Paper>
                        );
                      })}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* History and FAQ Layout */}
      <Grid container spacing={4}>
        {/* History Section */}
        {history.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon /> {t.historyTitle}
                  </Typography>
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearHistory}
                  >
                    {t.clearHistory}
                  </Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <List disablePadding>
                  {history.map((item, idx) => (
                    <ListItem key={idx} disablePadding divider={idx < history.length - 1}>
                      <ListItemButton
                        onClick={() => {
                          setUrl(item.url);
                          handleParse(item.url);
                        }}
                      >
                        <ListItemIcon>
                          {getPlatformIcon(item.platform)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              noWrap
                              variant="body2"
                              sx={{ maxWidth: { xs: '200px', sm: '320px' } }}
                            >
                              {item.url}
                            </Typography>
                          }
                          secondary={new Date(item.time).toLocaleString(lang === 'zh-CN' ? 'zh-CN' : 'en-US')}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* How to use */}
        <Grid size={{ xs: 12, md: history.length > 0 ? 6 : 12 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon /> {t.howToTitle}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {t.steps.map((step, idx) => (
                  <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                    <ListItemText primary={`${idx + 1}. ${step}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ Section */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', p: 3, borderRadius: 2, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }} gutterBottom>
          <InfoIcon /> {t.faqTitle}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={3}>
          {t.faqs.map((faq, idx) => (
            <Box key={idx}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary.main">
                {faq.q}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {faq.a}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
