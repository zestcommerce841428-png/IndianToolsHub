'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import NativeToolWrapper from '@/components/tools/NativeToolWrapper';

// Dynamically import all tool components with SSR disabled (safe for browser-only APIs)
const toolComponentMap: Record<string, React.ComponentType> = {
  // Image Tools
  'image-converter': dynamic(() => import('@/components/tools/image/ImageConverter'), { ssr: false }),
  'image-compressor': dynamic(() => import('@/components/tools/image/ImageCompressor'), { ssr: false }),
  'image-resizer': dynamic(() => import('@/components/tools/image/ImageResizer'), { ssr: false }),
  'image-cropper': dynamic(() => import('@/components/tools/image/ImageCropper'), { ssr: false }),
  'image-to-text': dynamic(() => import('@/components/tools/image/ImageToText'), { ssr: false }),
  'image-rotator': dynamic(() => import('@/components/tools/image/ImageRotator'), { ssr: false }),

  // Document Tools
  'pdf-to-word': dynamic(() => import('@/components/tools/document/PdfToWord'), { ssr: false }),
  'pdf-compressor': dynamic(() => import('@/components/tools/document/PdfCompressor'), { ssr: false }),
  'pdf-merge-splitter': dynamic(() => import('@/components/tools/document/PdfMergeSplitter'), { ssr: false }),
  'document-converter': dynamic(() => import('@/components/tools/document/DocumentConverter'), { ssr: false }),
  'pdf-lock-unlock': dynamic(() => import('@/components/tools/document/PdfLockUnlock'), { ssr: false }),
  'e-sign-pdf': dynamic(() => import('@/components/tools/document/ESignPdf'), { ssr: false }),

  // Calculator Tools
  'scientific-calculator': dynamic(() => import('@/components/tools/calculator/ScientificCalculator'), { ssr: false }),
  'age-calculator': dynamic(() => import('@/components/tools/calculator/AgeCalculator'), { ssr: false }),
  'bmi-calculator': dynamic(() => import('@/components/tools/calculator/BmiCalculator'), { ssr: false }),
  'loan-emi-calculator': dynamic(() => import('@/components/tools/calculator/LoanEmiCalculator'), { ssr: false }),
  'gst-calculator': dynamic(() => import('@/components/tools/calculator/GstCalculator'), { ssr: false }),
  'currency-converter': dynamic(() => import('@/components/tools/calculator/CurrencyConverter'), { ssr: false }),
  'tip-calculator': dynamic(() => import('@/components/tools/calculator/TipCalculator'), { ssr: false }),

  // Text Tools
  'text-case-converter': dynamic(() => import('@/components/tools/text/TextCaseConverter'), { ssr: false }),
  'word-character-counter': dynamic(() => import('@/components/tools/text/WordCharacterCounter'), { ssr: false }),
  'remove-duplicate-lines': dynamic(() => import('@/components/tools/text/RemoveDuplicateLines'), { ssr: false }),
  'text-sorter': dynamic(() => import('@/components/tools/text/TextSorter'), { ssr: false }),
  'text-reverser': dynamic(() => import('@/components/tools/text/TextReverser'), { ssr: false }),
  'text-encryptor-decryptor': dynamic(() => import('@/components/tools/text/TextEncryptorDecryptor'), { ssr: false }),
  'markdown-preview': dynamic(() => import('@/components/tools/text/MarkdownPreview'), { ssr: false }),

  // Web/Developer Tools
  'minifier': dynamic(() => import('@/components/tools/developer/Minifier'), { ssr: false }),
  'json-formatter-validator': dynamic(() => import('@/components/tools/developer/JsonFormatterValidator'), { ssr: false }),
  'base64-encoder-decoder': dynamic(() => import('@/components/tools/developer/Base64EncoderDecoder'), { ssr: false }),
  'url-encoder-decoder': dynamic(() => import('@/components/tools/developer/UrlEncoderDecoder'), { ssr: false }),
  'color-picker-converter': dynamic(() => import('@/components/tools/developer/ColorPickerConverter'), { ssr: false }),
  'regex-tester': dynamic(() => import('@/components/tools/developer/RegexTester'), { ssr: false }),
  'number-base-converter': dynamic(() => import('@/components/tools/developer/NumberBaseConverter'), { ssr: false }),
  'timestamp-converter': dynamic(() => import('@/components/tools/developer/TimestampConverter'), { ssr: false }),

  // Color Tools
  'color-picker-from-image': dynamic(() => import('@/components/tools/color/ColorPickerFromImage'), { ssr: false }),
  'hex-to-rgb-converter': dynamic(() => import('@/components/tools/color/HexToRgbConverter'), { ssr: false }),
  'gradient-generator': dynamic(() => import('@/components/tools/color/GradientGenerator'), { ssr: false }),
  'contrast-checker': dynamic(() => import('@/components/tools/color/ContrastChecker'), { ssr: false }),
  'palette-generator': dynamic(() => import('@/components/tools/color/PaletteGenerator'), { ssr: false }),
  'color-blindness-simulator': dynamic(() => import('@/components/tools/color/ColorBlindnessSimulator'), { ssr: false }),

  // SEO & Marketing Tools
  'keyword-density-checker': dynamic(() => import('@/components/tools/seo/KeywordDensityChecker'), { ssr: false }),
  'meta-tag-analyzer': dynamic(() => import('@/components/tools/seo/MetaTagAnalyzer'), { ssr: false }),
  'word-counter': dynamic(() => import('@/components/tools/seo/WordCounter'), { ssr: false }),

  // Utility Tools
  'qr-code-generator-scanner': dynamic(() => import('@/components/tools/utility/QrCodeGeneratorScanner'), { ssr: false }),
  'barcode-generator': dynamic(() => import('@/components/tools/utility/BarcodeGenerator'), { ssr: false }),
  'uuid-generator': dynamic(() => import('@/components/tools/utility/UuidGenerator'), { ssr: false }),
  'unit-converter': dynamic(() => import('@/components/tools/utility/UnitConverter'), { ssr: false }),
  'time-zone-converter': dynamic(() => import('@/components/tools/utility/TimeZoneConverter'), { ssr: false }),
  'random-password-generator': dynamic(() => import('@/components/tools/utility/RandomPasswordGenerator'), { ssr: false }),
  'pan-card-resizer': dynamic(() => import('@/components/tools/utility/PanCardResizer'), { ssr: false }),
  'lorem-ipsum-generator': dynamic(() => import('@/components/tools/utility/LoremIpsumGenerator'), { ssr: false }),

  // New Native Tools from usemagictools
  'paint-board': dynamic(() => import('@/components/tools/magic/PaintBoard'), { ssr: false }),
  'ico-maker': dynamic(() => import('@/components/tools/magic/IcoMaker'), { ssr: false }),
  'id-photo-tool': dynamic(() => import('@/components/tools/magic/IdPhotoTool'), { ssr: false }),
  'bg-remover': dynamic(() => import('@/components/tools/magic/BgRemover'), { ssr: false }),
  'watermark-tool': dynamic(() => import('@/components/tools/magic/WatermarkTool'), { ssr: false }),
  'transparent-png': dynamic(() => import('@/components/tools/magic/TransparentPng'), { ssr: false }),
  'image-to-pdf': dynamic(() => import('@/components/tools/magic/ImageToPdf'), { ssr: false }),
  'pdf-to-image': dynamic(() => import('@/components/tools/magic/PdfToImage'), { ssr: false }),
  'sqlite-viewer': dynamic(() => import('@/components/tools/magic/SqliteViewer'), { ssr: false }),
  'websocket-tester': dynamic(() => import('@/components/tools/magic/WebsocketTester'), { ssr: false }),
  'whois-query': dynamic(() => import('@/components/tools/magic/WhoisQuery'), { ssr: false }),
  'ip-lookup': dynamic(() => import('@/components/tools/magic/IpLookup'), { ssr: false }),
  'cron-generator': dynamic(() => import('@/components/tools/magic/CronGenerator'), { ssr: false }),
  'api-tester': dynamic(() => import('@/components/tools/magic/ApiTester'), { ssr: false }),
  'hex-viewer': dynamic(() => import('@/components/tools/magic/HexViewer'), { ssr: false }),
  'code-formatter': dynamic(() => import('@/components/tools/magic/CodeFormatter'), { ssr: false }),
  'yaml-editor': dynamic(() => import('@/components/tools/magic/YamlEditor'), { ssr: false }),
  'keyboard-tester': dynamic(() => import('@/components/tools/magic/KeyboardTester'), { ssr: false }),
  'chinese-converter': dynamic(() => import('@/components/tools/magic/ChineseConverter'), { ssr: false }),
  'text-diff': dynamic(() => import('@/components/tools/magic/TextDiff'), { ssr: false }),
  'm3u8-downloader': dynamic(() => import('@/components/tools/magic/M3u8Downloader'), { ssr: false }),
  'audio-cutter': dynamic(() => import('@/components/tools/magic/AudioCutter'), { ssr: false }),
  'screen-recorder': dynamic(() => import('@/components/tools/magic/ScreenRecorder'), { ssr: false }),
  'social-video-downloader': dynamic(() => import('@/components/tools/magic/SocialVideoDownloader'), { ssr: false }),
  'world-clock': dynamic(() => import('@/components/tools/magic/WorldClock'), { ssr: false }),
  'page-refresher': dynamic(() => import('@/components/tools/magic/PageRefresher'), { ssr: false }),
  'file-renamer': dynamic(() => import('@/components/tools/magic/FileRenamer'), { ssr: false }),
  'handheld-danmaku': dynamic(() => import('@/components/tools/magic/HandheldDanmaku'), { ssr: false }),
  'metronome': dynamic(() => import('@/components/tools/magic/Metronome'), { ssr: false }),
  'relative-calculator': dynamic(() => import('@/components/tools/magic/RelativeCalculator'), { ssr: false }),
  'claude-history-viewer': dynamic(() => import('@/components/tools/magic/ClaudeHistoryViewer'), { ssr: false }),
  'invoice-generator': dynamic(() => import('@/components/tools/magic/InvoiceGenerator'), { ssr: false }),
  'angel-number': dynamic(() => import('@/components/tools/magic/AngelNumber'), { ssr: false }),
  'numerology': dynamic(() => import('@/components/tools/magic/Numerology'), { ssr: false }),
  'crypto-tools': dynamic(() => import('@/components/tools/magic/CryptoTools'), { ssr: false }),
  'csv-json': dynamic(() => import('@/components/tools/magic/CsvJson'), { ssr: false }),

  // Additional tools migrated from UseMagicTools
  'pomodoro': dynamic(() => import('@/components/tools/magic/Pomodoro'), { ssr: false }),
  'snow-day-calculator': dynamic(() => import('@/components/tools/magic/SnowDayCalculator'), { ssr: false }),
  'image-editor': dynamic(() => import('@/components/tools/magic/ImageEditor'), { ssr: false }),
  'json-viewer': dynamic(() => import('@/components/tools/magic/JsonViewer'), { ssr: false }),
  'calculator': dynamic(() => import('@/components/tools/magic/Calculator'), { ssr: false }),
  'color-palette': dynamic(() => import('@/components/tools/magic/ColorPalette'), { ssr: false }),
  'file-converter': dynamic(() => import('@/components/tools/magic/FileConverter'), { ssr: false }),

  // Tools migrated from online-tools-master
  'base32-encode': dynamic(() => import('@/components/tools/magic/Base32Encode'), { ssr: false }),
  'base32-decode': dynamic(() => import('@/components/tools/magic/Base32Decode'), { ssr: false }),
  'base58-codec': dynamic(() => import('@/components/tools/magic/Base58Codec'), { ssr: false }),
  'ecdsa-tools': dynamic(() => import('@/components/tools/magic/EcdsaTools'), { ssr: false }),
  'rsa-tools': dynamic(() => import('@/components/tools/magic/RsaTools'), { ssr: false }),
  'xml-tools': dynamic(() => import('@/components/tools/magic/XmlTools'), { ssr: false }),
  'syntax-highlighter': dynamic(() => import('@/components/tools/magic/SyntaxHighlighterTool'), { ssr: false }),
  'advanced-hash-generator': dynamic(() => import('@/components/tools/magic/AdvancedHashGenerator'), { ssr: false }),
  'hex-encoder-decoder': dynamic(() => import('@/components/tools/magic/HexEncoderDecoder'), { ssr: false }),
  'html-entity-codec': dynamic(() => import('@/components/tools/magic/HtmlEntityCodec'), { ssr: false }),
  'double-sha256': dynamic(() => import('@/components/tools/magic/DoubleSha256'), { ssr: false }),
};

interface ToolRendererProps {
  slug: string;
}

export default function ToolRenderer({ slug }: ToolRendererProps) {
  const ToolComponent = toolComponentMap[slug];

  if (ToolComponent) {
    return <ToolComponent />;
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary">
        Tool implementation coming soon!
      </Typography>
    </Box>
  );
}
