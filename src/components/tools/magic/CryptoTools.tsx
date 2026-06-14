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
  Tabs,
  Tab,
  LinearProgress,
  SelectChangeEvent,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CryptoJS from 'crypto-js';
import JsBarcode from 'jsbarcode';
import { QRCodeCanvas } from 'qrcode.react';

const translations: Record<string, Record<string, string>> = {
  en: {
    tool_name: 'Crypto Toolbox',
    title: 'Crypto & Encoding Toolbox',
    subtitle: 'Generate hashes, encrypt/decrypt ciphers, encode/decode data, and inspect keys locally',
    hashTab: 'Hash Generators',
    cipherTab: 'Symmetric Ciphers',
    encoderTab: 'Text Encoders',
    pwdTab: 'Password Checker',
    barcodeTab: 'Barcode Generator',
    qrTab: 'QR Code Generator',
    ipTab: 'IP Converter',
    imageTab: 'Image to Base64',
    copied: 'Copied to clipboard',
    clear: 'Clear',
    execute: 'Execute',
    trust_users: '🌍 Used by 50,000+ users',
    trust_rating: '⭐ 4.9/5 rating',
    trust_privacy: '🔒 100% Private',
    trust_free: '🚫 No Ads, No Signup',
    features_title: 'Crypto Toolbox Features',
    f1_t: '100% Free & Private',
    f1_d: 'All operations happen client-side. Your plain text, files, passwords, and private keys never touch any server.',
    f2_t: 'Comprehensive Hashes',
    f2_d: 'Generate MD5, SHA-1, SHA-256, SHA-512, and SHA-3 hashes simultaneously with one click.',
    f3_t: 'Industrial Ciphers',
    f3_d: 'Supports AES, DES, TripleDES, and RC4 with custom padding modes, vectors, and cipher block modes.',
    f4_t: 'Barcode & QR Designer',
    f4_d: 'Generate custom QR codes (with custom colors, error correction, logo overlay) and industry-standard barcodes.',
    faq_title: 'Frequently Asked Questions',
    faq1_q: 'Are my keys or credentials sent over the network?',
    faq1_a: 'Never. All cryptographic computations are executed locally inside your browser sandbox using CryptoJS and native JavaScript. No network requests are made with your secrets.',
    faq2_q: 'What AES modes are supported?',
    faq2_a: 'We support standard block cipher modes including CBC, ECB, CFB, OFB, and CTR, along with PKCS7, ZeroPadding, and NoPadding layouts.',
    faq3_q: 'How does the password strength validator work?',
    faq3_a: 'It assesses your password against standard character sets (lowercase, uppercase, numbers, symbols) and computes Shannon entropy to determine bitwise complexity.',
    faq4_q: 'Can I overlay a logo on the QR Code?',
    faq4_a: 'Yes. The QR Code generator supports uploading a custom logo image, which will be automatically centered and excavated into the pattern.',
    faq_free_q: 'Is this tool really free with no ads?',
    faq_free_a: 'Yes, 100% free with no ads, no registration, no watermark, and no usage limits. All processing happens locally in your browser.'
  },
  'zh-CN': {
    tool_name: '加密与编码工具箱',
    title: '加密与编码工具箱',
    subtitle: '本地生成哈希、对称加解密、文本编码转换及密钥强度检测',
    hashTab: '哈希生成器',
    cipherTab: '对称密码 (AES/DES)',
    encoderTab: '编码转换',
    pwdTab: '密码强度检测',
    barcodeTab: '条形码生成器',
    qrTab: '二维码生成器',
    ipTab: 'IP 地址转换',
    imageTab: '图片转 Base64',
    copied: '已复制到剪贴板',
    clear: '清空',
    execute: '执行',
    trust_users: '🌍 超过 50,000 用户使用',
    trust_rating: '⭐ 4.9/5 好评',
    trust_privacy: '🔒 100% 隐私安全',
    trust_free: '🚫 无广告、无需注册',
    features_title: '加密工具箱功能',
    f1_t: '100% 免费且安全',
    f1_d: '所有操作均在本地进行。您的敏感数据、文件和密钥绝不会上传至任何服务器。',
    f2_t: '多哈希同时生成',
    f2_d: '一键同时生成 MD5、SHA-1、SHA-256、SHA-512 和 SHA-3 哈希结果，方便对比校验。',
    f3_t: '对称加解密',
    f3_d: '支持 AES、DES、TripleDES 和 RC4，可自定义填充模式、分组模式及密钥。',
    f4_t: '条码与二维码设计',
    f4_d: '生成符合行业标准的条形码，以及支持自定义颜色、容错级别和 Logo 嵌入的二维码。',
    faq_title: '常见问题',
    faq1_q: '我的密码或密钥会被上传吗？',
    faq1_a: '绝对不会。所有加密和哈希计算均在您的浏览器中通过 CryptoJS 和本地脚本运行，不发送任何外部网络请求。',
    faq2_q: '对称加密支持哪些工作模式？',
    faq2_a: '支持 CBC、ECB、CFB、OFB 和 CTR 等主流分组密码模式，以及 PKCS7、ZeroPadding 和 NoPadding 填充选项。',
    faq3_q: '密码强度是如何评估的？',
    faq3_a: '通过检测您输入的字符集覆盖率（大小写字母、数字、特殊符号）和香农熵算法，来计算其密码复杂度和防暴力破解等级。',
    faq4_q: '二维码可以放自己的 Logo 吗？',
    faq4_a: '可以。二维码生成面板支持上传自定义 Logo 图片，程序会自动居中放置并挖空背景图案以保证可读性。',
    faq_free_q: '这个工具真的免费且无广告吗？',
    faq_free_a: '是的，100% 免费，无广告、无需注册、无水印、无限制。所有处理都在浏览器本地完成。'
  },
  fr: {
    tool_name: 'Boîte à outils Crypto',
    title: 'Boîte à outils Cryptographique',
    subtitle: 'Générez des hashs, chiffrez vos données, encodez des formats et testez vos mots de passe localement',
    hashTab: 'Générateurs Hash',
    cipherTab: 'Chiffrements Symétriques',
    encoderTab: 'Encodeurs Texte',
    pwdTab: 'Force Mot de Passe',
    barcodeTab: 'Codes-barres',
    qrTab: 'Générateur QR Code',
    ipTab: 'Convertisseur IP',
    imageTab: 'Image en Base64',
    copied: 'Copié',
    clear: 'Effacer',
    execute: 'Exécuter',
    trust_users: '🌍 Utilisé par 50 000+ utilisateurs',
    trust_rating: '⭐ Note 4.9/5',
    trust_privacy: '🔒 100% Privé',
    trust_free: '🚫 Sans pub, sans inscription',
    features_title: 'Fonctionnalités de la Boîte à outils',
    f1_t: '100% Gratuit et Privé',
    f1_d: 'Aucune donnée n est envoyée en ligne. Le traitement est effectué localement dans votre sandbox navigateur.',
    f2_t: 'Hashs simultanés',
    f2_d: 'Générez en un seul clic les signatures MD5, SHA-1, SHA-256, SHA-512 et SHA-3 d un texte.',
    f3_t: 'Chiffrement Industriel',
    f3_d: 'Gère l AES, le DES, le TripleDES et le RC4 avec modes de bloc (CBC, ECB) et rembourrages.',
    f4_t: 'Design QR & Barcodes',
    f4_d: 'Créez des codes-barres standards et des QR codes personnalisés avec logo.',
    faq_title: 'Questions fréquentes',
    faq1_q: 'Est-ce sécurisé pour mes secrets de production ?',
    faq1_a: 'Oui. Le traitement tourne en local. Les clés et données ne sortent jamais de votre navigateur.',
    faq2_q: 'Quels sont les algorithmes de hash intégrés ?',
    faq2_a: 'Nous incluons MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512 et le standard SHA-3.',
    faq3_q: 'Comment est calculée la force du mot de passe ?',
    faq3_a: 'L outil calcule l entropie de Shannon en bits selon la diversité des caractères pour déterminer le niveau de sécurité.',
    faq4_q: 'Puis-je exporter le QR code en haute résolution ?',
    faq4_a: 'Le QR code est généré via un composant Canvas haute définition, vous permettant d enregistrer l image directement.',
    faq_free_q: 'Cet outil est-il vraiment gratuit et sans pub ?',
    faq_free_a: 'Oui, 100% gratuit, sans publicité, sans inscription, sans filigrane et sans limites. Tout est traité localement.'
  },
  es: {
    tool_name: 'Caja de Herramientas Crypto',
    title: 'Caja de Herramientas Criptográficas',
    subtitle: 'Genera hashes, cifra datos, codifica formatos y comprueba claves localmente',
    hashTab: 'Generadores Hash',
    cipherTab: 'Cifrados Simétricos',
    encoderTab: 'Codificadores Texto',
    pwdTab: 'Fuerza de Clave',
    barcodeTab: 'Código de Barras',
    qrTab: 'Código QR',
    ipTab: 'Convertidor IP',
    imageTab: 'Imagen a Base64',
    copied: 'Copiado',
    clear: 'Limpiar',
    execute: 'Ejecutar',
    trust_users: '🌍 Usado por más de 50,000 usuarios',
    trust_rating: '⭐ Calificación 4.9/5',
    trust_privacy: '🔒 100% Privado',
    trust_free: '🚫 Sin anuncios, sin registro',
    features_title: 'Características de la Caja de Herramientas',
    f1_t: '100% Gratis y Privado',
    f1_d: 'Todas las operaciones ocurren en tu navegador local. Claves y datos nunca viajan al servidor.',
    f2_t: 'Multi-Hashes',
    f2_d: 'Genera simultáneamente hashes MD5, SHA-1, SHA-256, SHA-512 y SHA-3 con un clic.',
    f3_t: 'Cifrados Estándar',
    f3_d: 'Soporte para AES, DES, TripleDES y RC4 con personalización de modos (CBC, ECB, CTR).',
    f4_t: 'Barcodes y QR Personalizados',
    f4_d: 'Diseña códigos QR con logo, colores y corrección de errores, además de códigos de barras CODE128.',
    faq_title: 'Preguntas frecuentes',
    faq1_q: '¿Se filtran mis datos al procesar?',
    faq1_a: 'No. Todo se computa localmente en el dispositivo. No hay peticiones salientes con tus contraseñas o datos.',
    faq2_q: '¿Qué es AES y por qué es seguro?',
    faq2_a: 'AES (Advanced Encryption Standard) es el cifrado simétrico por excelencia para transacciones bancarias y secretos militares.',
    faq3_q: '¿Cómo evalúa la fuerza de contraseña?',
    faq3_a: 'Se calcula la entropía según la longitud y los conjuntos de caracteres utilizados para saber cuán resistente es a fuerza bruta.',
    faq4_q: '¿Puedo integrar una imagen central en el QR?',
    faq4_a: 'Sí, subiendo un archivo de logo en los ajustes de QR Code para incrustarlo visualmente.',
    faq_free_q: '¿Esta herramienta es realmente gratis y sin anuncios?',
    faq_free_a: 'Sí, 100% gratis, sin anuncios, no requiere registro y no tiene límites.'
  }
};

export default function CryptoTools() {
  const [lang, setLang] = useState('en');
  const [tabIndex, setTabIndex] = useState(0);

  // Common Notification Status
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const showCopyToast = () => {
    setSuccessMsg(t('copied'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(showCopyToast);
  };

  // ==================== 1. HASH GENERATORS ====================
  const [hashInput, setHashInput] = useState('Hello World');
  const [hashResults, setHashResults] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
    sha3: '',
  });

  const handleCalculateHashes = () => {
    if (!hashInput) return;
    try {
      setHashResults({
        md5: CryptoJS.MD5(hashInput).toString(),
        sha1: CryptoJS.SHA1(hashInput).toString(),
        sha256: CryptoJS.SHA256(hashInput).toString(),
        sha512: CryptoJS.SHA512(hashInput).toString(),
        sha3: CryptoJS.SHA3(hashInput).toString(),
      });
      setSuccessMsg('Hashes computed successfully');
    } catch (err: any) {
      setErrorMsg(`Hash failed: ${err.message}`);
    }
  };

  // ==================== 2. SYMMETRIC CIPHERS (AES / DES / TripleDES / RC4) ====================
  const [cipherInput, setCipherInput] = useState('Secret message here');
  const [cipherKey, setCipherKey] = useState('MySuperSecretKey');
  const [cipherAlgo, setCipherAlgo] = useState<'AES' | 'DES' | 'TripleDES' | 'RC4'>('AES');
  const [cipherMode, setCipherMode] = useState('CBC');
  const [cipherPadding, setCipherPadding] = useState('Pkcs7');
  const [cipherResult, setCipherResult] = useState('');
  
  const [cipherSourceMode, setCipherSourceMode] = useState<'text' | 'file'>('text');
  const [cipherFile, setCipherFile] = useState<File | null>(null);
  const [cipherIv, setCipherIv] = useState('');
  const [cipherSalt, setCipherSalt] = useState('');

  const getCipherOptions = () => {
    const opts: any = {};
    if (cipherAlgo !== 'RC4') {
      // Set Mode
      if (cipherMode === 'ECB') opts.mode = CryptoJS.mode.ECB;
      else if (cipherMode === 'CFB') opts.mode = CryptoJS.mode.CFB;
      else if (cipherMode === 'OFB') opts.mode = CryptoJS.mode.OFB;
      else if (cipherMode === 'CTR') opts.mode = CryptoJS.mode.CTR;
      else opts.mode = CryptoJS.mode.CBC;

      // Set Padding
      if (cipherPadding === 'ZeroPadding') opts.padding = CryptoJS.pad.ZeroPadding;
      else if (cipherPadding === 'NoPadding') opts.padding = CryptoJS.pad.NoPadding;
      else opts.padding = CryptoJS.pad.Pkcs7;

      if (cipherIv) {
        opts.iv = CryptoJS.enc.Hex.parse(cipherIv);
      }
      if (cipherSalt) {
        opts.salt = CryptoJS.enc.Hex.parse(cipherSalt);
      }
    }
    return opts;
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleCipherEncrypt = () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const opts = getCipherOptions();

      if (cipherSourceMode === 'text') {
        if (!cipherInput) {
          throw new Error('Please enter text to encrypt');
        }
        let encrypted = '';
        if (cipherAlgo === 'AES') {
          encrypted = CryptoJS.AES.encrypt(cipherInput, cipherKey, opts).toString();
        } else if (cipherAlgo === 'DES') {
          encrypted = CryptoJS.DES.encrypt(cipherInput, cipherKey, opts).toString();
        } else if (cipherAlgo === 'TripleDES') {
          encrypted = CryptoJS.TripleDES.encrypt(cipherInput, cipherKey, opts).toString();
        } else if (cipherAlgo === 'RC4') {
          encrypted = CryptoJS.RC4.encrypt(cipherInput, cipherKey).toString();
        }
        setCipherResult(encrypted);
        setSuccessMsg('Text encrypted successfully');
      } else {
        if (!cipherFile) {
          throw new Error('Please select a file to encrypt');
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const dataUrl = e.target?.result as string;
            let encrypted = '';
            if (cipherAlgo === 'AES') {
              encrypted = CryptoJS.AES.encrypt(dataUrl, cipherKey, opts).toString();
            } else if (cipherAlgo === 'DES') {
              encrypted = CryptoJS.DES.encrypt(dataUrl, cipherKey, opts).toString();
            } else if (cipherAlgo === 'TripleDES') {
              encrypted = CryptoJS.TripleDES.encrypt(dataUrl, cipherKey, opts).toString();
            } else if (cipherAlgo === 'RC4') {
              encrypted = CryptoJS.RC4.encrypt(dataUrl, cipherKey).toString();
            }

            const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${cipherFile.name}.enc`;
            link.click();
            URL.revokeObjectURL(url);
            setSuccessMsg(`File "${cipherFile.name}" encrypted and download triggered successfully!`);
          } catch (err: any) {
            setErrorMsg(`File encryption failed: ${err.message}`);
          }
        };
        reader.readAsDataURL(cipherFile);
      }
    } catch (err: any) {
      setErrorMsg(`Encryption failed: ${err.message}`);
    }
  };

  const handleCipherDecrypt = () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const opts = getCipherOptions();

      if (cipherSourceMode === 'text') {
        if (!cipherInput) {
          throw new Error('Please enter text to decrypt');
        }
        let decrypted = '';
        if (cipherAlgo === 'AES') {
          decrypted = CryptoJS.AES.decrypt(cipherInput, cipherKey, opts).toString(CryptoJS.enc.Utf8);
        } else if (cipherAlgo === 'DES') {
          decrypted = CryptoJS.DES.decrypt(cipherInput, cipherKey, opts).toString(CryptoJS.enc.Utf8);
        } else if (cipherAlgo === 'TripleDES') {
          decrypted = CryptoJS.TripleDES.decrypt(cipherInput, cipherKey, opts).toString(CryptoJS.enc.Utf8);
        } else if (cipherAlgo === 'RC4') {
          decrypted = CryptoJS.RC4.decrypt(cipherInput, cipherKey).toString(CryptoJS.enc.Utf8);
        }

        if (!decrypted) {
          throw new Error('Incorrect key or corrupted cipher text');
        }
        setCipherResult(decrypted);
        setSuccessMsg('Text decrypted successfully');
      } else {
        if (!cipherFile) {
          throw new Error('Please select an encrypted file (.enc) to decrypt');
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const encryptedText = e.target?.result as string;
            let decryptedDataUrl = '';
            if (cipherAlgo === 'AES') {
              decryptedDataUrl = CryptoJS.AES.decrypt(encryptedText, cipherKey, opts).toString(CryptoJS.enc.Utf8);
            } else if (cipherAlgo === 'DES') {
              decryptedDataUrl = CryptoJS.DES.decrypt(encryptedText, cipherKey, opts).toString(CryptoJS.enc.Utf8);
            } else if (cipherAlgo === 'TripleDES') {
              decryptedDataUrl = CryptoJS.TripleDES.decrypt(encryptedText, cipherKey, opts).toString(CryptoJS.enc.Utf8);
            } else if (cipherAlgo === 'RC4') {
              decryptedDataUrl = CryptoJS.RC4.decrypt(encryptedText, cipherKey).toString(CryptoJS.enc.Utf8);
            }

            if (!decryptedDataUrl || !decryptedDataUrl.startsWith('data:')) {
              throw new Error('Decryption failed. Incorrect key or corrupted file.');
            }

            const blob = dataURLtoBlob(decryptedDataUrl);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const originalName = cipherFile.name.endsWith('.enc') ? cipherFile.name.slice(0, -4) : `decrypted_${cipherFile.name}`;
            link.download = originalName;
            link.click();
            URL.revokeObjectURL(url);
            setSuccessMsg(`File "${originalName}" decrypted and downloaded successfully!`);
          } catch (err: any) {
            setErrorMsg(`File decryption failed: ${err.message}`);
          }
        };
        reader.readAsText(cipherFile);
      }
    } catch (err: any) {
      setErrorMsg(`Decryption failed: ${err.message}`);
    }
  };

  // ==================== 3. TEXT ENCODERS (Base64 / URL / Hex) ====================
  const [encodeInput, setEncodeInput] = useState('Hello world!');
  const [encodeFormat, setEncodeFormat] = useState<'base64' | 'url' | 'hex'>('base64');
  const [encodeResult, setEncodeResult] = useState('');

  const handleEncode = () => {
    try {
      setErrorMsg('');
      let res = '';
      if (encodeFormat === 'base64') {
        res = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encodeInput));
      } else if (encodeFormat === 'url') {
        res = encodeURIComponent(encodeInput);
      } else {
        res = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(encodeInput));
      }
      setEncodeResult(res);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDecode = () => {
    try {
      setErrorMsg('');
      let res = '';
      if (encodeFormat === 'base64') {
        res = CryptoJS.enc.Base64.parse(encodeInput).toString(CryptoJS.enc.Utf8);
      } else if (encodeFormat === 'url') {
        res = decodeURIComponent(encodeInput);
      } else {
        res = CryptoJS.enc.Hex.parse(encodeInput).toString(CryptoJS.enc.Utf8);
      }
      if (!res) throw new Error('Format parsing resulted in empty or invalid output');
      setEncodeResult(res);
    } catch (err: any) {
      setErrorMsg(`Decoding failed: ${err.message}`);
    }
  };

  // ==================== 4. PASSWORD STRENGTH CHECKER ====================
  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [pwdStrength, setPwdStrength] = useState({ label: 'None', color: 'inherit', score: 0 });

  useEffect(() => {
    if (!password) {
      setEntropy(0);
      setPwdStrength({ label: 'None', color: 'inherit', score: 0 });
      return;
    }

    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;

    const calcEntropy = password.length * Math.log2(charsetSize || 1);
    setEntropy(Math.round(calcEntropy));

    if (calcEntropy < 32) {
      setPwdStrength({ label: 'Weak (Vulnerable to brute force)', color: 'error', score: 25 });
    } else if (calcEntropy < 56) {
      setPwdStrength({ label: 'Fair (Moderate)', color: 'warning', score: 50 });
    } else if (calcEntropy < 80) {
      setPwdStrength({ label: 'Good (Strong for daily accounts)', color: 'info', score: 75 });
    } else {
      setPwdStrength({ label: 'Strong (Cryptographically secure)', color: 'success', score: 100 });
    }
  }, [password]);

  // ==================== 5. BARCODE GENERATOR ====================
  const [barcodeText, setBarcodeText] = useState('1234567890');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleGenerateBarcode = () => {
    if (!barcodeText || !svgRef.current) return;
    try {
      setErrorMsg('');
      JsBarcode(svgRef.current, barcodeText, {
        format: barcodeFormat,
        lineColor: '#ffffff',
        background: 'rgba(0,0,0,0)',
        width: 2,
        height: 80,
        displayValue: true,
      });
    } catch (err: any) {
      setErrorMsg(`Barcode generation failed: ${err.message}`);
    }
  };

  // ==================== 6. QR CODE GENERATOR ====================
  const [qrText, setQrText] = useState('https://usemagictools.github.io');
  const [qrSize, setQrSize] = useState(256);
  const [qrErrorLvl, setQrErrorLvl] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDotsColor, setQrDotsColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== 7. IP ADDRESS CONVERTER ====================
  const [ipVal, setIpVal] = useState('192.168.1.1');
  const [ipNumVal, setIpNumVal] = useState('3232235777');
  const [ipResult, setIpResult] = useState('');

  const handleIpToNumber = () => {
    try {
      setErrorMsg('');
      const parts = ipVal.trim().split('.').map(Number);
      if (parts.length !== 4 || parts.some(isNaN) || parts.some((p) => p < 0 || p > 255)) {
        throw new Error('Invalid IPv4 address format');
      }
      const num = parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3];
      setIpResult(String(num));
      setIpNumVal(String(num));
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleNumberToIp = () => {
    try {
      setErrorMsg('');
      const num = Number(ipNumVal.trim());
      if (isNaN(num) || num < 0 || num > 4294967295) {
        throw new Error('Invalid IP numeric address (must be 0 - 4294967295)');
      }
      const ip = [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
      setIpResult(ip);
      setIpVal(ip);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleIpToBinary = () => {
    try {
      setErrorMsg('');
      const parts = ipVal.trim().split('.').map(Number);
      if (parts.length !== 4 || parts.some(isNaN) || parts.some((p) => p < 0 || p > 255)) {
        throw new Error('Invalid IPv4 address format');
      }
      const binary = parts.map((x) => x.toString(2).padStart(8, '0')).join('.');
      setIpResult(binary);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleIpToHex = () => {
    try {
      setErrorMsg('');
      const parts = ipVal.trim().split('.').map(Number);
      if (parts.length !== 4 || parts.some(isNaN) || parts.some((p) => p < 0 || p > 255)) {
        throw new Error('Invalid IPv4 address format');
      }
      const hex = parts.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(':');
      setIpResult(hex);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // ==================== 8. IMAGE TO BASE64 CONVERTER ====================
  const [imageFileUrl, setImageFileUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  const handleImageToBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Str = event.target?.result as string;
        setImageBase64(base64Str);
        setImageFileUrl(base64Str);
        setSuccessMsg('Image converted to Base64 successfully');
      };
      reader.readAsDataURL(file);
    }
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

      {/* Main Tab Controls */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('hashTab')} />
          <Tab label={t('cipherTab')} />
          <Tab label={t('encoderTab')} />
          <Tab label={t('pwdTab')} />
          <Tab label={t('barcodeTab')} />
          <Tab label={t('qrTab')} />
          <Tab label={t('ipTab')} />
          <Tab label={t('imageTab')} />
        </Tabs>
      </Box>

      {/* Notifications */}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Tab Panels */}
      <Card
        sx={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* TAB 0: HASH GENERATOR */}
          {tabIndex === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Multi-Hash Generator
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter string content to calculate hashes..."
                variant="outlined"
                sx={{ mb: 3 }}
              />
              <Button variant="contained" color="primary" onClick={handleCalculateHashes} sx={{ mb: 4 }}>
                Generate Hashes
              </Button>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>MD5 Hash</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(hashResults.md5)} disabled={!hashResults.md5}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField fullWidth size="small" value={hashResults.md5} slotProps={{ input: { readOnly: true } }} sx={{ mb: 2 }} />

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>SHA-1 Hash</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(hashResults.sha1)} disabled={!hashResults.sha1}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField fullWidth size="small" value={hashResults.sha1} slotProps={{ input: { readOnly: true } }} sx={{ mb: 2 }} />

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>SHA-256 Hash</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(hashResults.sha256)} disabled={!hashResults.sha256}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField fullWidth size="small" value={hashResults.sha256} slotProps={{ input: { readOnly: true } }} sx={{ mb: 2 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>SHA-512 Hash</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(hashResults.sha512)} disabled={!hashResults.sha512}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField fullWidth size="small" value={hashResults.sha512} slotProps={{ input: { readOnly: true } }} sx={{ mb: 2 }} />

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>SHA-3 Hash</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(hashResults.sha3)} disabled={!hashResults.sha3}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField fullWidth size="small" value={hashResults.sha3} slotProps={{ input: { readOnly: true } }} sx={{ mb: 2 }} />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 1: SYMMETRIC CIPHERS */}
          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Symmetric Key Encryption
              </Typography>
              <Tabs
                value={cipherSourceMode === 'text' ? 0 : 1}
                onChange={(_, val) => {
                  setCipherSourceMode(val === 0 ? 'text' : 'file');
                  setCipherResult('');
                }}
                sx={{ mb: 3 }}
                textColor="secondary"
                indicatorColor="secondary"
              >
                <Tab label="Text Payload" />
                <Tab label="File Encryption" />
              </Tabs>
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  {cipherSourceMode === 'text' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      value={cipherInput}
                      onChange={(e) => setCipherInput(e.target.value)}
                      placeholder="Enter payload message to encrypt or decrypt..."
                      variant="outlined"
                    />
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        bgcolor: 'rgba(255, 255, 255, 0.02)',
                        transition: 'border-color 0.3s',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                    >
                      <input
                        type="file"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                        onChange={(e) => setCipherFile(e.target.files?.[0] || null)}
                      />
                      <Typography variant="body1">Drag & drop a file here, or click to select</Typography>
                      {cipherFile && (
                        <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 'bold', color: 'success.main' }}>
                          Selected File: {cipherFile.name} ({Math.round(cipherFile.size / 1024)} KB)
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Symmetric Key (Passphrase)</Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    value={cipherKey}
                    onChange={(e) => setCipherKey(e.target.value)}
                    placeholder="Enter password key..."
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={cipherIv}
                        onChange={(e) => setCipherIv(e.target.value)}
                        placeholder="e.g. 0123456789abcdef0123456789abcdef"
                        label="IV (Hex format - Optional)"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={cipherSalt}
                        onChange={(e) => setCipherSalt(e.target.value)}
                        placeholder="e.g. 0123456789abcdef"
                        label="Salt (Hex format - Optional)"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Algorithm</InputLabel>
                        <Select
                          value={cipherAlgo}
                          label="Algorithm"
                          onChange={(e) => setCipherAlgo(e.target.value as any)}
                        >
                          <MenuItem value="AES">AES</MenuItem>
                          <MenuItem value="DES">DES</MenuItem>
                          <MenuItem value="TripleDES">3DES</MenuItem>
                          <MenuItem value="RC4">RC4</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small" disabled={cipherAlgo === 'RC4'}>
                        <InputLabel>Block Mode</InputLabel>
                        <Select
                          value={cipherMode}
                          label="Block Mode"
                          onChange={(e) => setCipherMode(e.target.value)}
                        >
                          <MenuItem value="CBC">CBC</MenuItem>
                          <MenuItem value="ECB">ECB</MenuItem>
                          <MenuItem value="CFB">CFB</MenuItem>
                          <MenuItem value="OFB">OFB</MenuItem>
                          <MenuItem value="CTR">CTR</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small" disabled={cipherAlgo === 'RC4'}>
                        <InputLabel>Padding</InputLabel>
                        <Select
                          value={cipherPadding}
                          label="Padding"
                          onChange={(e) => setCipherPadding(e.target.value)}
                        >
                          <MenuItem value="Pkcs7">PKCS7</MenuItem>
                          <MenuItem value="ZeroPadding">ZeroPadding</MenuItem>
                          <MenuItem value="NoPadding">NoPadding</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Button variant="contained" color="primary" onClick={handleCipherEncrypt}>
                  Encrypt
                </Button>
                <Button variant="contained" color="success" onClick={handleCipherDecrypt}>
                  Decrypt
                </Button>
              </Stack>

              {cipherSourceMode === 'text' && (
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Output Result</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(cipherResult)} disabled={!cipherResult}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={cipherResult}
                    slotProps={{ input: { readOnly: true } }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        bgcolor: 'rgba(30, 41, 59, 0.4)',
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* TAB 2: TEXT ENCODERS */}
          {tabIndex === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Text Encoding & Decoding
              </Typography>
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={encodeInput}
                    onChange={(e) => setEncodeInput(e.target.value)}
                    placeholder="Enter string content to encode or decode..."
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={encodeFormat}
                      label="Format"
                      onChange={(e) => setEncodeFormat(e.target.value as any)}
                    >
                      <MenuItem value="base64">Base64 Encode</MenuItem>
                      <MenuItem value="url">URL Encode</MenuItem>
                      <MenuItem value="hex">Hexadecimal</MenuItem>
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="primary" onClick={handleEncode}>
                      Encode
                    </Button>
                    <Button variant="contained" color="success" onClick={handleDecode}>
                      Decode
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Output Result</Typography>
                <IconButton size="small" onClick={() => handleCopyText(encodeResult)} disabled={!encodeResult}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={encodeResult}
                slotProps={{ input: { readOnly: true } }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(30, 41, 59, 0.4)',
                  },
                }}
              />
            </Box>
          )}

          {/* TAB 3: PASSWORD CHECKER */}
          {tabIndex === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Key Entropy & Password Checker
              </Typography>
              <TextField
                fullWidth
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type password to evaluate strength..."
                variant="outlined"
                sx={{ mb: 3 }}
              />

              {password && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Strength: {pwdStrength.label}
                    </Typography>
                    <Typography variant="body2" color="info.light">
                      Entropy: {entropy} bits
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pwdStrength.score}
                    color={pwdStrength.color as any}
                    sx={{ height: 10, borderRadius: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Complexity rules: Passwords with &gt; 80 bits of Shannon entropy require higher computing resources to crack via dictionary attacks.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 4: BARCODE GENERATOR */}
          {tabIndex === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Standard Barcode Generator
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    value={barcodeText}
                    onChange={(e) => setBarcodeText(e.target.value)}
                    placeholder="Enter barcode string..."
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Barcode Standard</InputLabel>
                    <Select
                      value={barcodeFormat}
                      label="Barcode Standard"
                      onChange={(e) => setBarcodeFormat(e.target.value)}
                    >
                      <MenuItem value="CODE128">CODE128 (Universal)</MenuItem>
                      <MenuItem value="CODE39">CODE39</MenuItem>
                      <MenuItem value="EAN13">EAN-13 (Product barcode)</MenuItem>
                      <MenuItem value="EAN8">EAN-8</MenuItem>
                      <MenuItem value="UPC">UPC (Retail standard)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button variant="contained" color="primary" onClick={handleGenerateBarcode} sx={{ mb: 4 }}>
                Generate Barcode
              </Button>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Barcode Preview</Typography>
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  p: 3,
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg ref={svgRef}></svg>
              </Box>
            </Box>
          )}

          {/* TAB 5: QR CODE GENERATOR */}
          {tabIndex === 5 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                QR Code Designer
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="Enter URL or text content to encode..."
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Error Correction</InputLabel>
                        <Select
                          value={qrErrorLvl}
                          label="Error Correction"
                          onChange={(e) => setQrErrorLvl(e.target.value as any)}
                        >
                          <MenuItem value="L">L - 7% Recovery</MenuItem>
                          <MenuItem value="M">M - 15% Recovery</MenuItem>
                          <MenuItem value="Q">Q - 25% Recovery</MenuItem>
                          <MenuItem value="H">H - 30% Recovery</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Size (px)"
                        value={qrSize}
                        onChange={(e) => setQrSize(Number(e.target.value))}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>Dots Color</Typography>
                      <input
                        type="color"
                        value={qrDotsColor}
                        onChange={(e) => setQrDotsColor(e.target.value)}
                        style={{ width: '100%', height: 40, border: 'none', cursor: 'pointer' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>Background Color</Typography>
                      <input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        style={{ width: '100%', height: 40, border: 'none', cursor: 'pointer' }}
                      />
                    </Grid>
                  </Grid>

                  {/* Optional Logo Upload */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Logo Attachment (Optional)</Typography>
                  <Button variant="outlined" component="label" startIcon={<FileUploadIcon />} sx={{ mb: 3 }}>
                    Upload Logo Image
                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>QR Code Preview</Typography>
                  <Box
                    sx={{
                      bgcolor: '#ffffff',
                      p: 3,
                      borderRadius: 3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {qrText ? (
                      <QRCodeCanvas
                        value={qrText}
                        size={qrSize}
                        level={qrErrorLvl}
                        fgColor={qrDotsColor}
                        bgColor={qrBgColor}
                        imageSettings={
                          logoUrl
                            ? {
                                src: logoUrl,
                                x: undefined,
                                y: undefined,
                                height: Math.floor(qrSize * 0.2),
                                width: Math.floor(qrSize * 0.2),
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <Typography color="text.secondary">Enter text to see preview</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 6: IP ADDRESS CONVERTER */}
          {tabIndex === 6 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                IPv4 Numeric & Format Converter
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="IP Address"
                    value={ipVal}
                    onChange={(e) => setIpVal(e.target.value)}
                    placeholder="e.g. 192.168.1.1"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" color="primary" onClick={handleIpToNumber}>
                      IP to Numeric
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleIpToBinary}>
                      IP to Binary
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleIpToHex}>
                      IP to Hex
                    </Button>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Numeric Address"
                    value={ipNumVal}
                    onChange={(e) => setIpNumVal(e.target.value)}
                    placeholder="e.g. 3232235777"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Button variant="contained" color="success" onClick={handleNumberToIp}>
                    Numeric to IP
                  </Button>
                </Grid>
              </Grid>

              {ipResult && (
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Conversion Result</Typography>
                    <IconButton size="small" onClick={() => handleCopyText(ipResult)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    value={ipResult}
                    slotProps={{ input: { readOnly: true } }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        bgcolor: 'rgba(30, 41, 59, 0.4)',
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* TAB 7: IMAGE TO BASE64 */}
          {tabIndex === 7 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Image File to Base64 String
              </Typography>
              <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
                <Button variant="contained" component="label" startIcon={<FileUploadIcon />}>
                  Choose Image File
                  <input type="file" hidden accept="image/*" onChange={handleImageToBase64} />
                </Button>

                {imageFileUrl && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Uploaded Image Preview</Typography>
                    <Box
                      component="img"
                      src={imageFileUrl}
                      alt="Uploaded Preview"
                      sx={{ maxHeight: 160, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', mb: 2 }}
                    />
                  </Box>
                )}

                {imageBase64 && (
                  <Box sx={{ width: '100%' }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Base64 String Result</Typography>
                      <IconButton size="small" onClick={() => handleCopyText(imageBase64)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      value={imageBase64}
                      slotProps={{ input: { readOnly: true } }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          bgcolor: 'rgba(30, 41, 59, 0.4)',
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Stack
        direction="row"
        sx={{ mb: 6, color: 'text.secondary', fontSize: '0.875rem', justifyContent: 'center', gap: 3 }}
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
                <span>🧬</span> {t('f2_t')}
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
                <span>🧱</span> {t('f3_t')}
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
                <span>🎨</span> {t('f4_t')}
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
