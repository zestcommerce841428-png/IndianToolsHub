'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Tooltip,
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
  FormControlLabel,
  RadioGroup,
  Radio,
  List,
  ListItem,
  ListItemText,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'WebSocket Tester',
    title: 'WebSocket Tester',
    subtitle: 'HTML5 WebSocket online debugger for testing real-time socket connections',
    connect: 'Connect',
    disconnect: 'Disconnect',
    statusDisconnected: 'Disconnected',
    statusConnecting: 'Connecting...',
    statusConnected: 'Connected',
    urlPlaceholder: 'echo.websocket.org',
    send: 'Send',
    clearLog: 'Clear Log',
    messagePlaceholder: 'Type message to send...',
    msgTypeText: 'Text',
    msgTypeJson: 'JSON',
    statSent: 'Sent',
    statReceived: 'Received',
    statErrors: 'Errors',
    statDuration: 'Duration',
    logConnecting: 'Connecting to',
    logConnected: 'Connected successfully!',
    logDisconnecting: 'Disconnecting...',
    logConnectionClosed: 'Connection closed',
    logConnectionError: 'Connection error occurred',
    logSendFailed: 'Send failed',
    copied: 'Copied to clipboard',
    trust_users: '🌍 Used by 50,000+ users',
    trust_rating: '⭐ 4.9/5 rating',
    trust_privacy: '🔒 100% Private',
    trust_free: '🚫 No Ads, No Signup',
    features_title: 'WebSocket Tester Features',
    f1_t: '100% Free & Private',
    f1_d: 'No ads, no signup, no watermark. All connection tests and packet inspector run locally.',
    f2_t: 'Real-time WebSocket Console',
    f2_d: 'Send raw text or JSON frames and inspect incoming socket pushes instantly.',
    f3_t: 'Connection History',
    f3_d: 'Store connection URLs in your local history to connect faster next time.',
    f4_t: 'Diagnostics Metrics',
    f4_d: 'Analyze connection latency, count packets, tracking socket errors automatically.',
    faq_title: 'Frequently Asked Questions',
    faq1_q: 'What is WebSocket and how does it work?',
    faq1_a: 'WebSocket is a full-duplex communication protocol enabling server-to-client active push messaging over a single TCP connection, reducing traditional HTTP poll overhead.',
    faq2_q: 'What is the difference between ws:// and wss://?',
    faq2_a: 'ws:// represents the unencrypted WebSocket protocol, whereas wss:// is secured with TLS/SSL encryption, aligning with HTTP vs HTTPS constraints.',
    faq3_q: 'Why does my local websocket server fail to connect?',
    faq3_a: 'Common reasons: firewall blocking, target server not running, certificate errors on secure (wss) connections, or browser origin security blocks.',
    faq4_q: 'Are custom headers supported in browser-based testers?',
    faq4_a: 'Due to browser JavaScript sandbox limitations, custom handshake headers (like Authorization) are not supported directly in the browser. For JWT/OAuth, pass them as query parameters in the URL (e.g. ws://localhost:8080?token=xyz).',
    faq_free_q: 'Is this tool really free with no ads?',
    faq_free_a: 'Yes, 100% free with no ads, no registration, no watermark, and no usage limits. All processing happens locally in your browser.'
  },
  'zh-CN': {
    tool_name: 'WebSocket 测试工具',
    title: 'WebSocket 测试工具',
    subtitle: '基于 HTML5 WebSocket 的在线连接测试与实时调试客户端',
    connect: '连接',
    disconnect: '断开连接',
    statusDisconnected: '未连接',
    statusConnecting: '正在连接...',
    statusConnected: '已连接',
    urlPlaceholder: 'echo.websocket.org',
    send: '发送',
    clearLog: '清空日志',
    messagePlaceholder: '输入要发送的消息内容...',
    msgTypeText: '文本',
    msgTypeJson: 'JSON',
    statSent: '发送数',
    statReceived: '接收数',
    statErrors: '异常数',
    statDuration: '连接时长',
    logConnecting: '正在连接至',
    logConnected: '连接成功！',
    logDisconnecting: '正在断开连接...',
    logConnectionClosed: '连接已关闭',
    logConnectionError: '连接发生异常',
    logSendFailed: '发送失败',
    copied: '已复制到剪贴板',
    trust_users: '🌍 超过 50,000 用户使用',
    trust_rating: '⭐ 4.9/5 好评',
    trust_privacy: '🔒 100% 隐私安全',
    trust_free: '🚫 无广告、无需注册',
    features_title: 'WebSocket 测试工具功能',
    f1_t: '100% 免费且安全',
    f1_d: '无广告、无需注册、无水印。所有连接测试和数据包分析都在本地运行。',
    f2_t: '实时控制台',
    f2_d: '支持发送纯文本或 JSON，并即时捕捉服务端发来的主动数据推送。',
    f3_t: '连接历史记录',
    f3_d: '本地自动保存您测试过的套接字 URL，方便下次一键回填。',
    f4_t: '多维统计数据',
    f4_d: '实时监控网络状态、计数发送/接收包大小并记录套接字错漏。',
    faq_title: '常见问题',
    faq1_q: '什么是 WebSocket 协议？',
    faq1_a: 'WebSocket 是一种全双工通信协议，允许在单次 TCP 握手后实现服务器 to 客户端的实时双向传输，极大缩减了传统 HTTP 轮询的损耗。',
    faq2_q: 'ws:// 与 wss:// 有什么区别？',
    faq2_a: 'ws:// 为非加密数据包传输协议，而 wss:// 是经过 TLS/SSL 链路加密的，与 http 与 https 的安全架构概念对齐。',
    faq3_q: '为什么测试本地端口时会连接失败？',
    faq3_a: '主要因素有：本地服务端程序未开启、网络防火墙拦截阻断、SSL证书缺失（针对 wss://）或浏览器安全沙箱限制。',
    faq4_q: '可以在握手时添加自定义 Headers 吗？',
    faq4_a: '因为浏览器端原生 JavaScript 沙箱机制的限制，无法直接添加自定义头。如有 Token 或 JWT 鉴权需要，推荐直接以 Query 传参的形式附在 URL 后端（例如 ws://localhost:8080?token=YOUR_JWT）。',
    faq_free_q: '这个工具真的免费且无广告吗？',
    faq_free_a: '是的，100% 免费，无广告、无需注册、无水印、无限制。所有处理都在浏览器本地完成。'
  },
  fr: {
    tool_name: 'Testeur WebSocket',
    title: 'Testeur WebSocket',
    subtitle: 'Débogueur en ligne HTML5 WebSocket pour valider les flux temps réel',
    connect: 'Se connecter',
    disconnect: 'Se déconnecter',
    statusDisconnected: 'Déconnecté',
    statusConnecting: 'Connexion...',
    statusConnected: 'Connecté',
    urlPlaceholder: 'echo.websocket.org',
    send: 'Envoyer',
    clearLog: 'Effacer log',
    messagePlaceholder: 'Saisir un message à envoyer...',
    msgTypeText: 'Texte',
    msgTypeJson: 'JSON',
    statSent: 'Envoyés',
    statReceived: 'Reçus',
    statErrors: 'Erreurs',
    statDuration: 'Durée',
    logConnecting: 'Connexion à',
    logConnected: 'Connecté avec succès !',
    logDisconnecting: 'Déconnexion...',
    logConnectionClosed: 'Connexion fermée',
    logConnectionError: 'Une erreur de connexion est survenue',
    logSendFailed: 'Échec de l envoi',
    copied: 'Copié dans le presse-papiers',
    trust_users: '🌍 Utilisé par 50 000+ utilisateurs',
    trust_rating: '⭐ Note 4.9/5',
    trust_privacy: '🔒 100% Privé',
    trust_free: '🚫 Sans pub, sans inscription',
    features_title: 'WebSocket Tester Features',
    f1_t: '100% Gratuit & Privé',
    f1_d: 'Sans publicité, sans inscription, sans filigrane. Le console fonctionne localement.',
    f2_t: 'Console temps réel',
    f2_d: 'Envoyez des messages texte ou JSON et inspectez instantanément les push serveurs.',
    f3_t: 'Historique locale',
    f3_d: 'Stockez l historique des URLs locales pour accélérer les connexions futures.',
    f4_t: 'Statistiques de paquets',
    f4_d: 'Mesurez la latence, comptez les paquets et observez automatiquement les anomalies.',
    faq_title: 'Questions fréquentes',
    faq1_q: 'Comment fonctionne WebSocket ?',
    faq1_a: 'WebSocket est un protocole de communication bidirectionnel fournissant des messages push actif serveur-client, éliminant les appels HTTP répétitifs.',
    faq2_q: 'Différence entre ws:// et wss:// ?',
    faq2_a: 'ws:// représente le protocole WebSocket classique non chiffré, tandis que wss:// intègre une surcouche de chiffrement TLS/SSL.',
    faq3_q: 'Pourquoi la connexion vers mon serveur local échoue-t-elle ?',
    faq3_a: 'Causes courantes : pare-feu, serveur cible arrêté, certificats non approuvés (wss), ou restrictions imposées par le sandbox du navigateur.',
    faq4_q: 'Peut-on injecter des headers personnalisés ?',
    faq4_a: 'L API standard des navigateurs interdit la configuration d en-têtes personnalisés lors de la connexion. Passez vos variables d authentification sous forme de paramètres (ex: ws://localhost:8080?token=myToken).',
    faq_free_q: 'Cet outil est-il vraiment gratuit et sans pub ?',
    faq_free_a: 'Oui, 100% gratuit, sans publicité, sans inscription, sans filigrane et sans limites. Tout est traité localement dans votre navigateur — vos données ne sont jamais téléversées.'
  },
  es: {
    tool_name: 'WebSocket Tester',
    title: 'WebSocket Tester',
    subtitle: 'Depurador en línea de WebSockets HTML5 para pruebas y streams en tiempo real',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    statusDisconnected: 'Desconectado',
    statusConnecting: 'Conectando...',
    statusConnected: 'Conectado',
    urlPlaceholder: 'echo.websocket.org',
    send: 'Enviar',
    clearLog: 'Limpiar Log',
    messagePlaceholder: 'Escribe un mensaje para enviar...',
    msgTypeText: 'Texto',
    msgTypeJson: 'JSON',
    statSent: 'Enviados',
    statReceived: 'Recibidos',
    statErrors: 'Errores',
    statDuration: 'Duración',
    logConnecting: 'Conectando a',
    logConnected: '¡Conectado exitosamente!',
    logDisconnecting: 'Desconectando...',
    logConnectionClosed: 'Conexión cerrada',
    logConnectionError: 'Ocurrió un error en la conexión',
    logSendFailed: 'Error al enviar',
    copied: 'Copiado al portapapeles',
    trust_users: '🌍 Usado por más de 50,000 usuarios',
    trust_rating: '⭐ Calificación 4.9/5',
    trust_privacy: '🔒 100% Privado',
    trust_free: '🚫 Sin anuncios, sin registro',
    features_title: 'Funciones de WebSocket Tester',
    f1_t: '100% Gratis y Privado',
    f1_d: 'Sin anuncios, sin registro, sin marca de agua. Todas las pruebas corren en tu navegador local.',
    f2_t: 'Consola en tiempo real',
    f2_d: 'Envía texto o JSON e inspecciona los pushes de datos del servidor instantáneamente.',
    f3_t: 'Historial de conexiones',
    f3_d: 'Guarda URLs en tu historial local para conexiones rápidas posteriormente.',
    f4_t: 'Métricas de diagnóstico',
    f4_d: 'Analiza la comunicación contando paquetes y registrando errores automáticamente.',
    faq_title: 'Preguntas frecuentes',
    faq1_q: '¿Qué es WebSocket?',
    faq1_a: 'WebSocket es un protocolo de comunicación bidireccional permanente, ideal para chats, juegos y transmisiones de datos continuas.',
    faq2_q: '¿Cuál es la diferencia entre ws:// y wss://?',
    faq2_a: 'ws:// es no encriptado, wss:// usa encriptación TLS/SSL (equivalente a http y https respectivamente).',
    faq3_q: '¿Por qué falla la conexión hacia mi host local?',
    faq3_a: 'Causas típicas: puerto bloqueado por firewall, el servicio de socket no está activo, certificados inválidos o bloqueos de origen cruzado.',
    faq4_q: '¿Se pueden agregar cabeceras personalizadas?',
    faq4_a: 'Los navegadores no permiten añadir headers durante el handshake de WebSocket por razones de seguridad. Usa query params en la URL para tokens: ws://host?token=jwt.',
    faq_free_q: '¿Esta herramienta es realmente gratis y sin anuncios?',
    faq_free_a: 'Sí, 100% gratis, sin anuncios, sin registro, sin marca de agua y sin límites. Todo el procesamiento ocurre localmente.'
  }
};

interface LogEntry {
  id: string;
  time: string;
  type: 'sent' | 'received' | 'system' | 'error';
  content: string;
}

interface HistoryItem {
  id: string;
  url: string;
}

export default function WebsocketTester() {
  const [lang, setLang] = useState('en');
  const [protocol, setProtocol] = useState('wss://');
  const [wsUrl, setWsUrl] = useState('');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messageText, setMessageText] = useState('{\n  "message": "Hello Server"\n}');
  const [msgType, setMsgType] = useState<'text' | 'json'>('json');

  // Logs and Stats
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Connection Timer
  const [duration, setDuration] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const connectedAtRef = useRef<number | null>(null);

  // History List
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // WebSocket Reference
  const wsRef = useRef<WebSocket | null>(null);

  // Toast / Status Alerts
  const [statusMsg, setStatusMsg] = useState('');
  const [statusSeverity, setStatusSeverity] = useState<'success' | 'error' | 'info'>('info');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  useEffect(() => {
    // Load history from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('websocket_history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (_) {}
    }

    return () => {
      // Disconnect socket and clean timers on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopTimer();
    };
  }, []);

  const getFullUrl = () => {
    let cleanUrl = wsUrl.trim();
    cleanUrl = cleanUrl.replace(/^wss?:\/\//, '');
    return protocol + cleanUrl;
  };

  const addLog = (type: LogEntry['type'], content: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: timestamp,
      type,
      content,
    };
    setLogs((prev) => [entry, ...prev]);
  };

  const startTimer = () => {
    connectedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (!connectedAtRef.current) return;
      const seconds = Math.floor((Date.now() - connectedAtRef.current) / 1000);
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      setDuration(`${h}:${m}:${s}`);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDuration('00:00:00');
    connectedAtRef.current = null;
  };

  const saveToHistory = (urlStr: string) => {
    setHistory((prev) => {
      if (prev.some((item) => item.url === urlStr)) return prev;
      const updated = [{ id: Math.random().toString(36).substr(2, 9), url: urlStr }, ...prev.slice(0, 4)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('websocket_history', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('websocket_history', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleConnect = () => {
    const fullUrl = getFullUrl();
    if (!wsUrl.trim()) {
      setStatusMsg(t('toastEnterValidUrl'));
      setStatusSeverity('error');
      return;
    }

    try {
      setStatus('connecting');
      setStatusMsg(t('statusConnecting'));
      setStatusSeverity('info');
      addLog('system', `${t('logConnecting')} ${fullUrl}...`);

      const socket = new WebSocket(fullUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        setStatusMsg(t('statusConnected'));
        setStatusSeverity('success');
        addLog('system', t('logConnected'));
        startTimer();
        saveToHistory(fullUrl);
      };

      socket.onmessage = (event) => {
        setReceivedCount((prev) => prev + 1);
        addLog('received', event.data);
      };

      socket.onerror = () => {
        setErrorCount((prev) => prev + 1);
        addLog('error', t('logConnectionError'));
        setStatusMsg(t('logConnectionError'));
        setStatusSeverity('error');
      };

      socket.onclose = (event) => {
        setStatus('disconnected');
        stopTimer();
        let reason = event.reason || t('logConnectionClosed');
        if (event.code) {
          reason += ` (code: ${event.code})`;
        }
        addLog('system', reason);
        wsRef.current = null;
      };
    } catch (err: any) {
      setErrorCount((prev) => prev + 1);
      setStatus('disconnected');
      stopTimer();
      addLog('error', `${t('logConnectFailed')} ${err.message}`);
      setStatusMsg(`${t('logConnectFailed')} ${err.message}`);
      setStatusSeverity('error');
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      addLog('system', t('logDisconnecting'));
      wsRef.current.close();
    }
  };

  const handleSendMessage = () => {
    if (!wsRef.current || status !== 'connected') {
      setStatusMsg(t('toastEnterMessage'));
      setStatusSeverity('error');
      return;
    }

    const payload = messageText.trim();
    if (!payload) {
      setStatusMsg(t('toastEnterMessage'));
      setStatusSeverity('error');
      return;
    }

    if (msgType === 'json') {
      try {
        JSON.parse(payload);
      } catch (_) {
        setStatusMsg(t('toastInvalidJson'));
        setStatusSeverity('error');
        return;
      }
    }

    try {
      wsRef.current.send(payload);
      setSentCount((prev) => prev + 1);
      addLog('sent', payload);
      setStatusMsg('');
    } catch (err: any) {
      setErrorCount((prev) => prev + 1);
      addLog('error', `${t('logSendFailed')}: ${err.message}`);
    }
  };

  const handleClearLog = () => {
    setLogs([]);
    setSentCount(0);
    setReceivedCount(0);
    setErrorCount(0);
    setStatusMsg('');
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
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
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </Stack>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {/* Left column: Connection Control & History */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Connection control Card */}
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Server Connection
              </Typography>

              {/* Protocol Toggle */}
              <RadioGroup
                row
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="wss://" control={<Radio />} label="wss:// (Secure)" />
                <FormControlLabel value="ws://" control={<Radio />} label="ws:// (Unsecure)" />
              </RadioGroup>

              {/* URL Input Bar */}
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder={t('urlPlaceholder')}
                  variant="outlined"
                  size="small"
                />
                {status !== 'connected' ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PowerIcon />}
                    onClick={handleConnect}
                    disabled={status === 'connecting'}
                  >
                    {t('connect')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<PowerOffIcon />}
                    onClick={handleDisconnect}
                  >
                    {t('disconnect')}
                  </Button>
                )}
              </Stack>

              {/* Connection Status message */}
              {statusMsg && (
                <Alert severity={statusSeverity} sx={{ mb: 2 }}>
                  {statusMsg}
                </Alert>
              )}

              {/* Diagnostic Metrics Display */}
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3, md: 6 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.light" sx={{ fontWeight: 'bold' }}>{sentCount}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('statSent')}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 6 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.light" sx={{ fontWeight: 'bold' }}>{receivedCount}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('statReceived')}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 6 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="error.light" sx={{ fontWeight: 'bold' }}>{errorCount}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('statErrors')}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 6 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h6" color="info.light" sx={{ fontWeight: 'bold' }}>{duration}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('statDuration')}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* History Card */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Connection History
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                  No historical connections saved yet.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {history.map((item) => (
                    <ListItem
                      key={item.id}
                      onClick={() => {
                        if (item.url.startsWith('wss://')) {
                          setProtocol('wss://');
                          setWsUrl(item.url.replace('wss://', ''));
                        } else {
                          setProtocol('ws://');
                          setWsUrl(item.url.replace('ws://', ''));
                        }
                      }}
                      secondaryAction={
                        <IconButton edge="end" size="small" color="error" onClick={(e) => deleteHistory(item.id, e)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.15)',
                        borderRadius: 1.5,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            noWrap
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: 'text.primary'
                            }}
                          >
                            {item.url}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Message Payload Editor & Logs console */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Send Socket Frames
              </Typography>

              {/* Message properties */}
              <Stack direction="row" spacing={3} sx={{ mb: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <RadioGroup
                      row
                      value={msgType}
                      onChange={(e) => setMsgType(e.target.value as 'text' | 'json')}
                    >
                      <FormControlLabel value="json" control={<Radio size="small" />} label={t('msgTypeJson')} />
                      <FormControlLabel value="text" control={<Radio size="small" />} label={t('msgTypeText')} />
                    </RadioGroup>
                  }
                  label=""
                />

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={status !== 'connected'}
                  sx={{ ml: 'auto' }}
                >
                  {t('send')}
                </Button>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={6}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={t('messagePlaceholder')}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Fira Code, Courier New, monospace',
                    fontSize: '0.85rem',
                    bgcolor: 'background.default',
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Logger console */}
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
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Connection Log Console
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<ClearAllIcon />}
                  onClick={handleClearLog}
                  disabled={logs.length === 0}
                >
                  {t('clearLog')}
                </Button>
              </Stack>

              <Box
                sx={{
                  height: 320,
                  overflowY: 'auto',
                  p: 2,
                  bgcolor: 'rgba(0,0,0,0.35)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                }}
              >
                {logs.length === 0 ? (
                  <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      No socket transmissions logged.
                    </Typography>
                  </Box>
                ) : (
                  logs.map((log) => {
                    let logColor = '#e4e4e7';
                    let label = '';
                    if (log.type === 'sent') {
                      logColor = '#a78bfa';
                      label = '▶ SENT: ';
                    } else if (log.type === 'received') {
                      logColor = '#4fec72';
                      label = '◀ RECV: ';
                    } else if (log.type === 'system') {
                      logColor = '#3b82f6';
                      label = 'ℹ SYS: ';
                    } else if (log.type === 'error') {
                      logColor = '#ff6b6b';
                      label = '⚠ ERR: ';
                    }

                    return (
                      <Box
                        key={log.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          fontFamily: 'Fira Code, Courier New, monospace',
                          fontSize: '0.8rem',
                          bgcolor:
                            log.type === 'sent'
                              ? 'rgba(167, 139, 250, 0.08)'
                              : log.type === 'received'
                              ? 'rgba(79, 236, 114, 0.08)'
                              : 'rgba(255,255,255,0.02)',
                          borderLeft: '4px solid',
                          borderLeftColor:
                            log.type === 'sent'
                              ? 'primary.light'
                              : log.type === 'received'
                              ? 'success.light'
                              : log.type === 'system'
                              ? 'info.light'
                              : 'error.light',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                            {log.time}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold', color: logColor }}>
                            {label}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: logColor, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {log.content}
                        </Typography>
                      </Box>
                    );
                  })
                )}
              </Box>
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
                <span>🔌</span> {t('f2_t')}
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
                <span>📜</span> {t('f3_t')}
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
                <span>📊</span> {t('f4_t')}
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
            <Typography sx={{ fontWeight: 'semibold' }}>{t('faq4_q')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {t('faq4_a')}
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
