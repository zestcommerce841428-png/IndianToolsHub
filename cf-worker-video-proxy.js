/**
 * Cloudflare Worker - 社交媒体视频下载代理
 *
 * 支持平台：TikTok, X, Instagram, Facebook, YouTube
 * - YouTube: 使用 RapidAPI YouTube Media Downloader
 * - 其他平台: 使用 Cobalt 社区实例
 * - 兜底方案: 返回外部服务链接
 *
 * 环境变量：
 * - RAPIDAPI_KEY: RapidAPI 密钥（用于 YouTube）
 */

// RapidAPI YouTube 配置
const RAPIDAPI_YOUTUBE = {
  host: 'youtube-media-downloader.p.rapidapi.com',
  endpoint: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
};

// Cobalt v7 社区实例（免费可用，按可靠性排序）
const COBALT_V7_INSTANCES = [
  'https://downloadapi.stuff.solutions/api/json',
];

// Cobalt v11 实例（可能需要认证，作为备用尝试）
const COBALT_V11_INSTANCES = [
  'https://cobalt-api.meowing.de/',
  'https://cobalt-backend.canine.tools/',
  'https://capi.3kh0.net/',
];

// 外部下载服务（兜底方案）
const EXTERNAL_SERVICES = {
  instagram: [
    { name: 'Cobalt', url: 'https://cobalt.tools/', icon: '⚡', desc: '开源、快速、支持高清' },
    { name: 'SnapSave', url: 'https://snapsave.app/zh/instagram-reels-video-download', icon: '💾', desc: '支持 Reels 和 Stories' },
    { name: 'FastDl', url: 'https://fastdl.app/zh/instagram-reels-downloader', icon: '🚀', desc: '快速下载' },
    { name: 'SaveInsta', url: 'https://saveinsta.io/zh', icon: '📥', desc: '备用选项' },
  ],
  facebook: [
    { name: 'Cobalt', url: 'https://cobalt.tools/', icon: '⚡', desc: '开源、快速、支持高清' },
    { name: 'SnapSave', url: 'https://snapsave.app/zh/facebook-video-downloader', icon: '💾', desc: '支持 Reels 和视频' },
    { name: 'FDown', url: 'https://fdown.net/zh/', icon: '📘', desc: '支持 HD 下载' },
    { name: 'SaveFrom', url: 'https://zh.savefrom.net/', icon: '📥', desc: '老牌下载服务' },
  ],
  youtube: [
    { name: 'Cobalt', url: 'https://cobalt.tools/?url={URL}', icon: '⚡', desc: '开源、快速、支持高清' },
    { name: 'Y2Mate', url: 'https://www.y2mate.com/zh-cn/youtube', icon: '🎬', desc: '支持多种格式（需手动粘贴）' },
    { name: 'SaveFrom', url: 'https://zh.savefrom.net/?url={URL}', icon: '📥', desc: '老牌下载服务' },
    { name: '9xbuddy', url: 'https://9xbuddy.com/process?url={URL}', icon: '🎵', desc: '支持音频提取' },
  ],
};

// 通用 CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { ...corsHeaders, 'Access-Control-Max-Age': '86400' },
      });
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return jsonResponse({ error: '只支持 POST 请求' }, 405);
    }

    try {
      const body = await request.json();
      const { url, platform } = body;

      if (!url) {
        return jsonResponse({ error: '缺少 url 参数' }, 400);
      }

      // YouTube 使用 RapidAPI
      if (platform === 'youtube') {
        const apiKey = env.RAPIDAPI_KEY;
        if (apiKey) {
          const result = await tryYouTubeAPI(url, apiKey);
          if (result.success) {
            return jsonResponse(result);
          }
        }
        // API 失败，返回外部服务
        return jsonResponse(buildExternalResponse(url, 'youtube'));
      }

      // 其他平台使用 Cobalt
      // 1. 先尝试 v7 实例
      for (const instance of COBALT_V7_INSTANCES) {
        const result = await tryInstance(instance, url, platform, 'v7');
        if (result.success) {
          return jsonResponse(result);
        }
      }

      // 2. 再尝试 v11 实例
      for (const instance of COBALT_V11_INSTANCES) {
        const result = await tryInstance(instance, url, platform, 'v11');
        if (result.success) {
          return jsonResponse(result);
        }
      }

      // 3. 所有实例都失败，返回外部服务链接
      return jsonResponse(buildExternalResponse(url, platform));

    } catch (error) {
      return jsonResponse({
        success: false,
        error: 'worker_error',
        message: error.message || '服务器内部错误',
      }, 500);
    }
  },
};

// YouTube API 调用
async function tryYouTubeAPI(url, apiKey) {
  try {
    // 从 URL 提取视频 ID
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      console.log('YouTube: 无法提取视频 ID');
      return { success: false };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15秒超时

    const response = await fetch(`${RAPIDAPI_YOUTUBE.endpoint}?videoId=${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_YOUTUBE.host,
        'x-rapidapi-key': apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`YouTube API: HTTP ${response.status}`);
      return { success: false };
    }

    const data = await response.json();

    if (data.errorId !== 'Success' || !data.videos?.items) {
      console.log('YouTube API: 解析失败');
      return { success: false };
    }

    // 提取视频下载选项
    const videos = data.videos.items
      .filter(v => v.url && v.quality)
      .map(v => ({
        quality: v.quality,
        url: v.url,
        format: v.extension || 'mp4',
        hasAudio: v.hasAudio !== false,
      }))
      // 按画质排序（高到低）
      .sort((a, b) => {
        const getQualityNum = q => parseInt(q) || 0;
        return getQualityNum(b.quality) - getQualityNum(a.quality);
      })
      // 取前 6 个选项
      .slice(0, 6);

    // 提取音频选项
    const audios = (data.audios?.items || [])
      .filter(a => a.url)
      .map(a => ({
        quality: a.quality || '128kbps',
        url: a.url,
        format: a.extension || 'mp3',
      }))
      .slice(0, 2);

    // 获取缩略图
    const thumbnail = data.thumbnails?.[0]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return {
      success: true,
      platform: 'youtube',
      title: data.title || 'YouTube 视频',
      author: data.channelTitle || '',
      thumbnail: thumbnail,
      duration: formatDuration(data.lengthSeconds),
      videos: videos,
      audios: audios,
    };

  } catch (error) {
    console.log(`YouTube API 错误: ${error.message}`);
    return { success: false };
  }
}

// 从 YouTube URL 提取视频 ID
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// 格式化时长
function formatDuration(seconds) {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 尝试单个 Cobalt 实例
async function tryInstance(instance, url, platform, version) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const requestBody = version === 'v7'
      ? { url, vQuality: '1080', filenamePattern: 'pretty' }
      : { url, videoQuality: '1080', filenameStyle: 'pretty' };

    const response = await fetch(instance, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'video-proxy/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { success: false };
    }

    const data = await response.json();

    if (data.status === 'error') {
      return { success: false };
    }

    if (data.status === 'redirect' || data.status === 'stream' || data.status === 'tunnel') {
      return {
        success: true,
        platform: platform || 'unknown',
        status: data.status,
        downloadUrl: data.url,
        filename: data.filename || '视频',
        instance: instance,
      };
    }

    if (data.status === 'picker' && data.picker) {
      return {
        success: true,
        platform: platform || 'unknown',
        status: 'picker',
        picker: data.picker.map(item => ({
          type: item.type || 'video',
          url: item.url,
          thumb: item.thumb,
        })),
        instance: instance,
      };
    }

    return { success: false };

  } catch (error) {
    return { success: false };
  }
}

// 构建外部服务响应
function buildExternalResponse(url, platform) {
  const services = EXTERNAL_SERVICES[platform] || EXTERNAL_SERVICES.instagram;
  return {
    success: true,
    platform: platform || 'unknown',
    isExternal: true,
    externalServices: services.map(s => ({
      ...s,
      url: s.url.includes('{URL}')
        ? s.url.replace('{URL}', encodeURIComponent(url))
        : s.url + '?url=' + encodeURIComponent(url),
    })),
  };
}

// JSON 响应辅助函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}
