'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Stack,
  LinearProgress,
  Tabs,
  Tab,
  SelectChangeEvent,
  Paper,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LanguageIcon from '@mui/icons-material/Language';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';

// ==================== Translations ====================
const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Advanced Hash Generator',
    subtitle: 'Generate Keccak, SHA-3, BLAKE2/3, RIPEMD, SHAKE, KMAC, CRC, and MD checksums locally in your browser.',
    inputLabel: 'Input Plain Text',
    placeholder: 'Enter text here...',
    fileLabel: 'File Hashing (Checksum)',
    fileHint: 'Select a file to compute its checksum. The file is processed locally and never uploaded to any server.',
    computeBtn: 'Compute Hashes',
    clearBtn: 'Clear Input',
    resultsTitle: 'Generated Hashes',
    progressLabel: 'Processing File...',
    copied: 'Copied to clipboard!',
    dragDrop: 'Click or drag file here to hash',
    autoUpdate: 'Auto Update',
    settings: 'Settings / Options',
    shakeLength: 'SHAKE Output Bits',
    kmacKey: 'KMAC Key (UTF-8 or Hex)',
    kmacCustom: 'KMAC Customization String',
    cshakeName: 'cSHAKE Function Name (N)',
    cshakeCustom: 'cSHAKE Customization (S)',
    selectedFile: 'Selected File',
    fileSize: 'File Size',
    textTab: 'Text Input',
    fileTab: 'File Input',
  },
  'zh-CN': {
    title: '高级哈希生成器',
    subtitle: '在浏览器本地生成 Keccak、SHA-3、BLAKE2/3、RIPEMD、SHAKE、KMAC、CRC 和 MD 校验和。',
    inputLabel: '输入明文文本',
    placeholder: '在此输入文本...',
    fileLabel: '文件哈希校验',
    fileHint: '选择文件以计算校验和。文件在本地处理，绝不会上传到任何服务器。',
    computeBtn: '计算哈希',
    clearBtn: '清除输入',
    resultsTitle: '生成的哈希结果',
    progressLabel: '正在处理文件...',
    copied: '已复制到剪贴板！',
    dragDrop: '点击或拖拽文件到此处进行哈希',
    autoUpdate: '自动更新',
    settings: '设置 / 选项',
    shakeLength: 'SHAKE 输出位数',
    kmacKey: 'KMAC 密钥 (UTF-8 或 Hex)',
    kmacCustom: 'KMAC 自定义字符串',
    cshakeName: 'cSHAKE 函数名称 (N)',
    cshakeCustom: 'cSHAKE 自定义字符串 (S)',
    selectedFile: '已选文件',
    fileSize: '文件大小',
    textTab: '文本输入',
    fileTab: '文件输入',
  },
  es: {
    title: 'Generador de Hash Avanzado',
    subtitle: 'Gere Keccak, SHA-3, BLAKE2/3, RIPEMD, SHAKE, KMAC, CRC y MD checksums localmente en su navegador.',
    inputLabel: 'Texto de entrada',
    placeholder: 'Ingrese el texto aquí...',
    fileLabel: 'Hash de archivo (Checksum)',
    fileHint: 'Seleccione un archivo para calcular su suma de comprobación. El archivo se procesa localmente y nunca se carga.',
    computeBtn: 'Calcular Hashes',
    clearBtn: 'Limpiar',
    resultsTitle: 'Hashes Generados',
    progressLabel: 'Procesando archivo...',
    copied: '¡Copiado al portapapeles!',
    dragDrop: 'Haga clic o arrastre el archivo aquí para calcular el hash',
    autoUpdate: 'Actualización automática',
    settings: 'Configuración / Opciones',
    shakeLength: 'Bits de salida SHAKE',
    kmacKey: 'Clave KMAC (UTF-8 o Hex)',
    kmacCustom: 'Cadena de personalización KMAC',
    cshakeName: 'Nombre de función cSHAKE (N)',
    cshakeCustom: 'Personalización cSHAKE (S)',
    selectedFile: 'Archivo seleccionado',
    fileSize: 'Tamaño del archivo',
    textTab: 'Entrada de Texto',
    fileTab: 'Entrada de Archivo',
  },
  fr: {
    title: 'Générateur de Hash Avancé',
    subtitle: 'Générez des sommes de contrôle Keccak, SHA-3, BLAKE2/3, RIPEMD, SHAKE, KMAC, CRC et MD localement dans votre navigateur.',
    inputLabel: 'Texte d\'entrée',
    placeholder: 'Saisissez le texte ici...',
    fileLabel: 'Hachage de fichier (Checksum)',
    fileHint: 'Sélectionnez un fichier pour calculer sa somme de contrôle. Le fichier est traité localement et n\'est jamais téléchargé.',
    computeBtn: 'Calculer les Hashs',
    clearBtn: 'Effacer',
    resultsTitle: 'Hashs Générés',
    progressLabel: 'Traitement du fichier...',
    copied: 'Copié dans le presse-papiers !',
    dragDrop: 'Cliquez ou glissez le fichier ici pour le hacher',
    autoUpdate: 'Mise à jour automatique',
    settings: 'Paramètres / Options',
    shakeLength: 'Bits de sortie SHAKE',
    kmacKey: 'Clé KMAC (UTF-8 ou Hex)',
    kmacCustom: 'Chaîne de personnalisation KMAC',
    cshakeName: 'Nom de fonction cSHAKE (N)',
    cshakeCustom: 'Personnalisation cSHAKE (S)',
    selectedFile: 'Fichier sélectionné',
    fileSize: 'Fichier taille',
    textTab: 'Saisie de Texte',
    fileTab: 'Fichier',
  },
};

// ==================== Hash Math implementations ====================

// Rotate left 32-bit
function rotl(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n));
}

// 32-bit rotate right
function rotr32(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

// 64-bit rotate right for BigInt
function rotr64(x: bigint, n: bigint): bigint {
  const mask = 0xffffffffffffffffn;
  const val = x & mask;
  return ((val >> n) | (val << (64n - n))) & mask;
}

// Keccak-f[1600] constants and permutation
const RC = new BigUint64Array([
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
]);

const KeccakR = [
  0,  1, 62, 28, 27,
  36, 44,  6, 55, 20,
  3, 10, 43, 25, 39,
  41, 45, 15, 21,  8,
  18,  2, 61, 56, 14
];

function keccakF1600(state: BigUint64Array) {
  const B = new BigUint64Array(25);
  const C = new BigUint64Array(5);
  const D = new BigUint64Array(5);

  for (let round = 0; round < 24; round++) {
    // Theta
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      const prev = C[(x + 4) % 5];
      const next = C[(x + 1) % 5];
      D[x] = prev ^ ((next << 1n) | (next >> 63n));
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x + y * 5] ^= D[x];
      }
    }

    // Rho & Pi
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const idx = x + y * 5;
        const rot = BigInt(KeccakR[idx]);
        const val = state[idx];
        const rotated = (val << rot) | (val >> (64n - rot));
        const newX = y;
        const newY = (2 * x + 3 * y) % 5;
        B[newX + newY * 5] = rotated;
      }
    }

    // Chi
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const idx = x + y * 5;
        state[idx] = B[idx] ^ ((~B[(x + 1) % 5 + y * 5]) & B[(x + 2) % 5 + y * 5]);
      }
    }

    // Iota
    state[0] ^= RC[round];
  }
}

function bytesToState(bytes: Uint8Array, state: BigUint64Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < 25; i++) {
    const low = view.getUint32(i * 8, true);
    const high = view.getUint32(i * 8 + 4, true);
    state[i] = BigInt(low) | (BigInt(high) << 32n);
  }
}

function stateToBytes(state: BigUint64Array, bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < 25; i++) {
    const val = state[i];
    const low = Number(val & 0xffffffffn);
    const high = Number((val >> 32n) & 0xffffffffn);
    view.setUint32(i * 8, low, true);
    view.setUint32(i * 8 + 4, high, true);
  }
}

function keccakSponge(msg: Uint8Array, rateBytes: number, outputBytes: number, padByte: number): Uint8Array {
  const state = new BigUint64Array(25);
  const stateBytes = new Uint8Array(200);
  
  let msgPos = 0;
  while (msgPos < msg.length) {
    const chunkLen = Math.min(msg.length - msgPos, rateBytes);
    for (let i = 0; i < chunkLen; i++) {
      stateBytes[i] ^= msg[msgPos + i];
    }
    msgPos += chunkLen;
    if (chunkLen === rateBytes) {
      bytesToState(stateBytes, state);
      keccakF1600(state);
      stateToBytes(state, stateBytes);
    }
  }
  
  const rem = msg.length % rateBytes;
  stateBytes[rem] ^= padByte;
  stateBytes[rateBytes - 1] ^= 0x80;
  
  bytesToState(stateBytes, state);
  keccakF1600(state);
  stateToBytes(state, stateBytes);
  
  const out = new Uint8Array(outputBytes);
  let outPos = 0;
  while (outPos < outputBytes) {
    const take = Math.min(outputBytes - outPos, rateBytes);
    out.set(stateBytes.subarray(0, take), outPos);
    outPos += take;
    if (outPos < outputBytes) {
      keccakF1600(state);
      stateToBytes(state, stateBytes);
    }
  }
  
  return out;
}

// Left and Right encode functions for NIST SP 800-185
function leftEncode(x: number | bigint): Uint8Array {
  let val = BigInt(x);
  const bytes: number[] = [];
  while (val > 0n) {
    bytes.unshift(Number(val & 0xffn));
    val >>= 8n;
  }
  if (bytes.length === 0) bytes.push(0);
  bytes.unshift(bytes.length);
  return new Uint8Array(bytes);
}

function rightEncode(x: number | bigint): Uint8Array {
  let val = BigInt(x);
  const bytes: number[] = [];
  while (val > 0n) {
    bytes.unshift(Number(val & 0xffn));
    val >>= 8n;
  }
  if (bytes.length === 0) bytes.push(0);
  bytes.push(bytes.length);
  return new Uint8Array(bytes);
}

function encodeString(s: Uint8Array): Uint8Array {
  const len = leftEncode(BigInt(s.length * 8));
  const res = new Uint8Array(len.length + s.length);
  res.set(len, 0);
  res.set(s, len.length);
  return res;
}

function bytepad(input: Uint8Array, w: number): Uint8Array {
  const prefix = leftEncode(BigInt(w));
  const z = new Uint8Array(prefix.length + input.length);
  z.set(prefix, 0);
  z.set(input, prefix.length);
  const rem = z.length % w;
  if (rem === 0) return z;
  const padded = new Uint8Array(z.length + (w - rem));
  padded.set(z, 0);
  return padded;
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const res = new Uint8Array(a.length + b.length);
  res.set(a, 0);
  res.set(b, a.length);
  return res;
}

function cSHAKE(msg: Uint8Array, rateBytes: number, outputBytes: number, N: Uint8Array, S: Uint8Array): Uint8Array {
  if (N.length === 0 && S.length === 0) {
    return keccakSponge(msg, rateBytes, outputBytes, 0x1f);
  }
  const prefix = bytepad(concatBytes(encodeString(N), encodeString(S)), rateBytes);
  const newMsg = concatBytes(prefix, msg);
  return keccakSponge(newMsg, rateBytes, outputBytes, 0x04);
}

function KMAC128(K: Uint8Array, X: Uint8Array, outputBytes: number, S: Uint8Array): Uint8Array {
  const prefix = bytepad(encodeString(K), 168);
  const suffix = rightEncode(BigInt(outputBytes * 8));
  const newX = new Uint8Array(prefix.length + X.length + suffix.length);
  newX.set(prefix, 0);
  newX.set(X, prefix.length);
  newX.set(suffix, prefix.length + X.length);
  return cSHAKE(newX, 168, outputBytes, new Uint8Array([75, 77, 65, 67]), S); // "KMAC"
}

function KMAC256(K: Uint8Array, X: Uint8Array, outputBytes: number, S: Uint8Array): Uint8Array {
  const prefix = bytepad(encodeString(K), 136);
  const suffix = rightEncode(BigInt(outputBytes * 8));
  const newX = new Uint8Array(prefix.length + X.length + suffix.length);
  newX.set(prefix, 0);
  newX.set(X, prefix.length);
  newX.set(suffix, prefix.length + X.length);
  return cSHAKE(newX, 136, outputBytes, new Uint8Array([75, 77, 65, 67]), S); // "KMAC"
}

// RIPEMD functions
const rL = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 15, 6, 13
];
const rR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];
const sL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
];
const sR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];

const KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

const ripemd_f1 = (x: number, y: number, z: number) => x ^ y ^ z;
const ripemd_f2 = (x: number, y: number, z: number) => (x & y) | (~x & z);
const ripemd_f3 = (x: number, y: number, z: number) => (x | ~y) ^ z;
const ripemd_f4 = (x: number, y: number, z: number) => (x & z) | (y & ~z);
const ripemd_f5 = (x: number, y: number, z: number) => x ^ (y | ~z);

function ripemdPad(msg: Uint8Array): Uint8Array {
  const originalBitLen = msg.length * 8;
  const padLen = (msg.length % 64 < 56) ? (56 - msg.length % 64) : (120 - msg.length % 64);
  const padded = new Uint8Array(msg.length + padLen + 8);
  padded.set(msg, 0);
  padded[msg.length] = 0x80;
  
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const lowBits = originalBitLen & 0xffffffff;
  const highBits = Math.floor(originalBitLen / 0x100000000);
  view.setUint32(padded.length - 8, lowBits, true);
  view.setUint32(padded.length - 4, highBits, true);
  return padded;
}

function ripemd128(msg: Uint8Array): Uint8Array {
  const padded = ripemdPad(msg);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const X = new Uint32Array(16);
  
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      X[i] = view.getUint32(offset + i * 4, true);
    }
    
    let al = h0, bl = h1, cl = h2, dl = h3;
    let ar = h0, br = h1, cr = h2, dr = h3;
    
    for (let i = 0; i < 64; i++) {
      // Left round
      let fL = 0, kL = 0;
      if (i < 16) { fL = ripemd_f1(bl, cl, dl); kL = KL[0]; }
      else if (i < 32) { fL = ripemd_f2(bl, cl, dl); kL = KL[1]; }
      else if (i < 48) { fL = ripemd_f3(bl, cl, dl); kL = KL[2]; }
      else { fL = ripemd_f4(bl, cl, dl); kL = KL[3]; }
      let T = (al + fL + X[rL[i]] + kL) | 0;
      T = rotl(T, sL[i]);
      al = dl; dl = cl; cl = bl; bl = T;
      
      // Right round
      let fR = 0, kR = 0;
      if (i < 16) { fR = ripemd_f4(br, cr, dr); kR = KR[0]; }
      else if (i < 32) { fR = ripemd_f3(br, cr, dr); kR = KR[1]; }
      else if (i < 48) { fR = ripemd_f2(br, cr, dr); kR = KR[2]; }
      else { fR = ripemd_f1(br, cr, dr); kR = KR[3]; }
      T = (ar + fR + X[rR[i]] + kR) | 0;
      T = rotl(T, sR[i]);
      ar = dr; dr = cr; cr = br; br = T;
    }
    
    const T = (h1 + cl + dr) | 0;
    h1 = (h2 + dl + ar) | 0;
    h2 = (h3 + al + br) | 0;
    h3 = (h0 + bl + cr) | 0;
    h0 = T;
  }
  
  const digest = new Uint8Array(16);
  const outView = new DataView(digest.buffer);
  outView.setUint32(0, h0, true);
  outView.setUint32(4, h1, true);
  outView.setUint32(8, h2, true);
  outView.setUint32(12, h3, true);
  return digest;
}

function ripemd160(msg: Uint8Array): Uint8Array {
  const padded = ripemdPad(msg);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3a2e1d0;
  
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const X = new Uint32Array(16);
  
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      X[i] = view.getUint32(offset + i * 4, true);
    }
    
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;
    
    for (let i = 0; i < 80; i++) {
      let fL = 0, kL = 0;
      if (i < 16) { fL = ripemd_f1(bl, cl, dl); kL = KL[0]; }
      else if (i < 32) { fL = ripemd_f2(bl, cl, dl); kL = KL[1]; }
      else if (i < 48) { fL = ripemd_f3(bl, cl, dl); kL = KL[2]; }
      else if (i < 64) { fL = ripemd_f4(bl, cl, dl); kL = KL[3]; }
      else { fL = ripemd_f5(bl, cl, dl); kL = KL[4]; }
      let T = (al + fL + X[rL[i]] + kL) | 0;
      T = (rotl(T, sL[i]) + el) | 0;
      al = el; el = dl; dl = rotl(cl, 10); cl = bl; bl = T;
      
      let fR = 0, kR = 0;
      if (i < 16) { fR = ripemd_f5(br, cr, dr); kR = KR[0]; }
      else if (i < 32) { fR = ripemd_f4(br, cr, dr); kR = KR[1]; }
      else if (i < 48) { fR = ripemd_f3(br, cr, dr); kR = KR[2]; }
      else if (i < 64) { fR = ripemd_f2(br, cr, dr); kR = KR[3]; }
      else { fR = ripemd_f1(br, cr, dr); kR = KR[4]; }
      T = (ar + fR + X[rR[i]] + kR) | 0;
      T = (rotl(T, sR[i]) + er) | 0;
      ar = er; er = dr; dr = rotl(cr, 10); cr = br; br = T;
    }
    
    const T = (h1 + cl + dr) | 0;
    h1 = (h2 + dl + er) | 0;
    h2 = (h3 + el + ar) | 0;
    h3 = (h4 + al + br) | 0;
    h4 = (h0 + bl + cr) | 0;
    h0 = T;
  }
  
  const digest = new Uint8Array(20);
  const outView = new DataView(digest.buffer);
  outView.setUint32(0, h0, true);
  outView.setUint32(4, h1, true);
  outView.setUint32(8, h2, true);
  outView.setUint32(12, h3, true);
  outView.setUint32(16, h4, true);
  return digest;
}

function ripemd256(msg: Uint8Array): Uint8Array {
  const padded = ripemdPad(msg);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0x76543210;
  let h5 = 0xfedcba98;
  let h6 = 0x89abcdef;
  let h7 = 0x01234567;
  
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const X = new Uint32Array(16);
  
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      X[i] = view.getUint32(offset + i * 4, true);
    }
    
    let al = h0, bl = h1, cl = h2, dl = h3;
    let ar = h4, br = h5, cr = h6, dr = h7;
    
    for (let i = 0; i < 64; i++) {
      let fL = 0, kL = 0;
      if (i < 16) { fL = ripemd_f1(bl, cl, dl); kL = KL[0]; }
      else if (i < 32) { fL = ripemd_f2(bl, cl, dl); kL = KL[1]; }
      else if (i < 48) { fL = ripemd_f3(bl, cl, dl); kL = KL[2]; }
      else { fL = ripemd_f4(bl, cl, dl); kL = KL[3]; }
      let T = (al + fL + X[rL[i]] + kL) | 0;
      T = rotl(T, sL[i]);
      al = dl; dl = cl; cl = bl; bl = T;
      
      let fR = 0, kR = 0;
      if (i < 16) { fR = ripemd_f4(br, cr, dr); kR = KR[0]; }
      else if (i < 32) { fR = ripemd_f3(br, cr, dr); kR = KR[1]; }
      else if (i < 48) { fR = ripemd_f2(br, cr, dr); kR = KR[2]; }
      else { fR = ripemd_f1(br, cr, dr); kR = KR[3]; }
      T = (ar + fR + X[rR[i]] + kR) | 0;
      T = rotl(T, sR[i]);
      ar = dr; dr = cr; cr = br; br = T;
    }
    
    const T = (h1 + cl + dr) | 0;
    h1 = (h2 + dl + ar) | 0;
    h2 = (h3 + al + br) | 0;
    h3 = (h0 + bl + cr) | 0;
    h4 = (h5 + cl + dr) | 0;
    h5 = (h6 + dl + ar) | 0;
    h6 = (h7 + al + br) | 0;
    h7 = (h4 + bl + cr) | 0;
    h0 = T;
  }
  
  const digest = new Uint8Array(32);
  const outView = new DataView(digest.buffer);
  outView.setUint32(0, h0, true);
  outView.setUint32(4, h1, true);
  outView.setUint32(8, h2, true);
  outView.setUint32(12, h3, true);
  outView.setUint32(16, h4, true);
  outView.setUint32(20, h5, true);
  outView.setUint32(24, h6, true);
  outView.setUint32(28, h7, true);
  return digest;
}

function ripemd320(msg: Uint8Array): Uint8Array {
  const padded = ripemdPad(msg);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3a2e1d0;
  let h5 = 0x76543210;
  let h6 = 0xfedcba98;
  let h7 = 0x89abcdef;
  let h8 = 0x01234567;
  let h9 = 0x3c2d1e0f;
  
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const X = new Uint32Array(16);
  
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      X[i] = view.getUint32(offset + i * 4, true);
    }
    
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h5, br = h6, cr = h7, dr = h8, er = h9;
    
    for (let i = 0; i < 80; i++) {
      let fL = 0, kL = 0;
      if (i < 16) { fL = ripemd_f1(bl, cl, dl); kL = KL[0]; }
      else if (i < 32) { fL = ripemd_f2(bl, cl, dl); kL = KL[1]; }
      else if (i < 48) { fL = ripemd_f3(bl, cl, dl); kL = KL[2]; }
      else if (i < 64) { fL = ripemd_f4(bl, cl, dl); kL = KL[3]; }
      else { fL = ripemd_f5(bl, cl, dl); kL = KL[4]; }
      let T = (al + fL + X[rL[i]] + kL) | 0;
      T = (rotl(T, sL[i]) + el) | 0;
      al = el; el = dl; dl = rotl(cl, 10); cl = bl; bl = T;
      
      let fR = 0, kR = 0;
      if (i < 16) { fR = ripemd_f5(br, cr, dr); kR = KR[0]; }
      else if (i < 32) { fR = ripemd_f4(br, cr, dr); kR = KR[1]; }
      else if (i < 48) { fR = ripemd_f3(br, cr, dr); kR = KR[2]; }
      else if (i < 64) { fR = ripemd_f2(br, cr, dr); kR = KR[3]; }
      else { fR = ripemd_f1(br, cr, dr); kR = KR[4]; }
      T = (ar + fR + X[rR[i]] + kR) | 0;
      T = (rotl(T, sR[i]) + er) | 0;
      ar = er; er = dr; dr = rotl(cr, 10); cr = br; br = T;
    }
    
    const T = (h1 + cl + dr) | 0;
    h1 = (h2 + dl + er) | 0;
    h2 = (h3 + el + ar) | 0;
    h3 = (h4 + al + br) | 0;
    h4 = (h5 + bl + cr) | 0;
    h5 = (h6 + cl + dr) | 0;
    h6 = (h7 + dl + er) | 0;
    h7 = (h8 + el + ar) | 0;
    h8 = (h9 + al + br) | 0;
    h9 = (h0 + bl + cr) | 0;
    h0 = T;
  }
  
  const digest = new Uint8Array(40);
  const outView = new DataView(digest.buffer);
  outView.setUint32(0, h0, true);
  outView.setUint32(4, h1, true);
  outView.setUint32(8, h2, true);
  outView.setUint32(12, h3, true);
  outView.setUint32(16, h4, true);
  outView.setUint32(20, h5, true);
  outView.setUint32(24, h6, true);
  outView.setUint32(28, h7, true);
  outView.setUint32(32, h8, true);
  outView.setUint32(36, h9, true);
  return digest;
}

// BLAKE2b/s
const SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
];

const BLAKE2B_IV = new BigUint64Array([
  0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n
]);

function blake2b_G(v: BigUint64Array, a: number, b: number, c: number, d: number, x: bigint, y: bigint) {
  const mask = 0xffffffffffffffffn;
  v[a] = (v[a] + v[b] + x) & mask;
  v[d] = rotr64(v[d] ^ v[a], 32n);
  v[c] = (v[c] + v[d]) & mask;
  v[b] = rotr64(v[b] ^ v[c], 24n);
  v[a] = (v[a] + v[b] + y) & mask;
  v[d] = rotr64(v[d] ^ v[a], 16n);
  v[c] = (v[c] + v[d]) & mask;
  v[b] = rotr64(v[b] ^ v[c], 63n);
}

function blake2b(msg: Uint8Array, outLen: number = 64, key: Uint8Array = new Uint8Array(0)): Uint8Array {
  const h = new BigUint64Array(BLAKE2B_IV);
  const keyLen = key.length;
  h[0] ^= BigInt(outLen | (keyLen << 8) | 0x01010000);
  
  let paddedMsg = msg;
  if (keyLen > 0) {
    const kBlock = new Uint8Array(128);
    kBlock.set(key, 0);
    paddedMsg = new Uint8Array(128 + msg.length);
    paddedMsg.set(kBlock, 0);
    paddedMsg.set(msg, 128);
  }
  
  const blockCount = Math.ceil(paddedMsg.length / 128) || 1;
  const v = new BigUint64Array(16);
  const m = new BigUint64Array(16);
  
  let t = 0n;
  for (let i = 0; i < blockCount; i++) {
    const isLast = (i === blockCount - 1);
    const chunkLen = isLast ? (paddedMsg.length - i * 128) : 128;
    t += BigInt(chunkLen);
    
    const blockBytes = new Uint8Array(128);
    blockBytes.set(paddedMsg.subarray(i * 128, i * 128 + chunkLen), 0);
    const blockView = new DataView(blockBytes.buffer);
    for (let j = 0; j < 16; j++) {
      const low = blockView.getUint32(j * 8, true);
      const high = blockView.getUint32(j * 8 + 4, true);
      m[j] = BigInt(low) | (BigInt(high) << 32n);
    }
    
    v.set(h, 0);
    v.set(BLAKE2B_IV, 8);
    v[12] ^= t;
    if (isLast) {
      v[14] ^= 0xffffffffffffffffn;
    }
    
    for (let round = 0; round < 12; round++) {
      const s = SIGMA[round % 10];
      blake2b_G(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
      blake2b_G(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
      blake2b_G(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
      blake2b_G(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
      blake2b_G(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
      blake2b_G(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
      blake2b_G(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
      blake2b_G(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
    }
    
    for (let j = 0; j < 8; j++) {
      h[j] ^= v[j] ^ v[j + 8];
    }
  }
  
  const digest = new Uint8Array(outLen);
  const digestView = new DataView(digest.buffer);
  for (let j = 0; j < Math.ceil(outLen / 8); j++) {
    const val = h[j];
    const low = Number(val & 0xffffffffn);
    const high = Number((val >> 32n) & 0xffffffffn);
    const pos = j * 8;
    if (pos < outLen) {
      if (outLen - pos >= 8) {
        digestView.setUint32(pos, low, true);
        digestView.setUint32(pos + 4, high, true);
      } else {
        const temp = new Uint8Array(8);
        const tv = new DataView(temp.buffer);
        tv.setUint32(0, low, true);
        tv.setUint32(4, high, true);
        digest.set(temp.subarray(0, outLen - pos), pos);
      }
    }
  }
  return digest;
}

const BLAKE2S_IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

function blake2s_G(v: Uint32Array, a: number, b: number, c: number, d: number, x: number, y: number) {
  v[a] = (v[a] + v[b] + x) | 0;
  v[d] = rotr32(v[d] ^ v[a], 16);
  v[c] = (v[c] + v[d]) | 0;
  v[b] = rotr32(v[b] ^ v[c], 12);
  v[a] = (v[a] + v[b] + y) | 0;
  v[d] = rotr32(v[d] ^ v[a], 8);
  v[c] = (v[c] + v[d]) | 0;
  v[b] = rotr32(v[b] ^ v[c], 7);
}

function blake2s(msg: Uint8Array, outLen: number = 32, key: Uint8Array = new Uint8Array(0)): Uint8Array {
  const h = new Uint32Array(BLAKE2S_IV);
  const keyLen = key.length;
  h[0] ^= outLen | (keyLen << 8) | 0x01010000;
  
  let paddedMsg = msg;
  if (keyLen > 0) {
    const kBlock = new Uint8Array(64);
    kBlock.set(key, 0);
    paddedMsg = new Uint8Array(64 + msg.length);
    paddedMsg.set(kBlock, 0);
    paddedMsg.set(msg, 64);
  }
  
  const blockCount = Math.ceil(paddedMsg.length / 64) || 1;
  const v = new Uint32Array(16);
  const m = new Uint32Array(16);
  
  let t = 0;
  for (let i = 0; i < blockCount; i++) {
    const isLast = (i === blockCount - 1);
    const chunkLen = isLast ? (paddedMsg.length - i * 64) : 64;
    t += chunkLen;
    
    const blockBytes = new Uint8Array(64);
    blockBytes.set(paddedMsg.subarray(i * 64, i * 64 + chunkLen), 0);
    const blockView = new DataView(blockBytes.buffer);
    for (let j = 0; j < 16; j++) {
      m[j] = blockView.getUint32(j * 4, true);
    }
    
    v.set(h, 0);
    v.set(BLAKE2S_IV, 8);
    v[12] ^= t;
    if (isLast) {
      v[14] ^= 0xffffffff;
    }
    
    for (let round = 0; round < 10; round++) {
      const s = SIGMA[round];
      blake2s_G(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
      blake2s_G(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
      blake2s_G(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
      blake2s_G(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
      blake2s_G(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
      blake2s_G(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
      blake2s_G(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
      blake2s_G(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
    }
    
    for (let j = 0; j < 8; j++) {
      h[j] ^= v[j] ^ v[j + 8];
    }
  }
  
  const digest = new Uint8Array(outLen);
  const digestView = new DataView(digest.buffer);
  for (let j = 0; j < Math.ceil(outLen / 4); j++) {
    const val = h[j];
    const pos = j * 4;
    if (pos < outLen) {
      if (outLen - pos >= 4) {
        digestView.setUint32(pos, val, true);
      } else {
        const temp = new Uint8Array(4);
        const tv = new DataView(temp.buffer);
        tv.setUint32(0, val, true);
        digest.set(temp.subarray(0, outLen - pos), pos);
      }
    }
  }
  return digest;
}

// BLAKE3 (Standard sequential)
const BLAKE3_IV = new Uint32Array([
  0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
  0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
]);

const MSG_PERMUTATION = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];

function blake3_G(v: Uint32Array, a: number, b: number, c: number, d: number, mx: number, my: number) {
  v[a] = (v[a] + v[b] + mx) | 0;
  v[d] = rotr32(v[d] ^ v[a], 16);
  v[c] = (v[c] + v[d]) | 0;
  v[b] = rotr32(v[b] ^ v[c], 12);
  v[a] = (v[a] + v[b] + my) | 0;
  v[d] = rotr32(v[d] ^ v[a], 8);
  v[c] = (v[c] + v[d]) | 0;
  v[b] = rotr32(v[b] ^ v[c], 7);
}

function blake3Compress(
  cv: Uint32Array,
  block: Uint32Array,
  blockLen: number,
  counter: bigint,
  flags: number
): Uint32Array {
  const v = new Uint32Array(16);
  v.set(cv, 0);
  v.set(BLAKE3_IV, 8);
  v[12] = Number(counter & 0xffffffffn);
  v[13] = Number((counter >> 32n) & 0xffffffffn);
  v[14] = blockLen;
  v[15] = flags;

  let m = new Uint32Array(block);
  for (let round = 0; round < 7; round++) {
    blake3_G(v, 0, 4, 8, 12, m[0], m[1]);
    blake3_G(v, 1, 5, 9, 13, m[2], m[3]);
    blake3_G(v, 2, 6, 10, 14, m[4], m[5]);
    blake3_G(v, 3, 7, 11, 15, m[6], m[7]);
    blake3_G(v, 0, 5, 10, 15, m[8], m[9]);
    blake3_G(v, 1, 6, 11, 12, m[10], m[11]);
    blake3_G(v, 2, 7, 8, 13, m[12], m[13]);
    blake3_G(v, 3, 4, 9, 14, m[14], m[15]);

    const nextM = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      nextM[j] = m[MSG_PERMUTATION[j]];
    }
    m = nextM;
  }

  const out = new Uint32Array(16);
  for (let i = 0; i < 8; i++) {
    out[i] = v[i] ^ v[i + 8];
    out[i + 8] = v[i + 8] ^ cv[i];
  }
  return out;
}

function blake3(msg: Uint8Array, outLen: number = 32): Uint8Array {
  const CHUNK_SIZE = 1024;
  const chunkCount = Math.ceil(msg.length / CHUNK_SIZE) || 1;
  const chunkCvs = new Uint32Array(chunkCount * 8);

  for (let i = 0; i < chunkCount; i++) {
    const chunkStart = i * CHUNK_SIZE;
    const chunkEnd = Math.min(msg.length, chunkStart + CHUNK_SIZE);
    const chunkLen = chunkEnd - chunkStart;

    let cv = new Uint32Array(BLAKE3_IV);
    const blockCount = Math.ceil(chunkLen / 64) || 1;

    for (let j = 0; j < blockCount; j++) {
      const blockStart = chunkStart + j * 64;
      const blockEnd = Math.min(chunkEnd, blockStart + 64);
      const blockLen = blockEnd - blockStart;

      const blockBytes = new Uint8Array(64);
      blockBytes.set(msg.subarray(blockStart, blockEnd), 0);
      const blockView = new DataView(blockBytes.buffer);
      const blockWords = new Uint32Array(16);
      for (let k = 0; k < 16; k++) {
        blockWords[k] = blockView.getUint32(k * 4, true);
      }

      let flags = 0;
      if (j === 0) flags |= 1; 
      if (j === blockCount - 1) flags |= 2; 
      if (chunkCount === 1 && j === blockCount - 1) flags |= 8; 

      const out = blake3Compress(cv, blockWords, blockLen, BigInt(i), flags);
      cv = out.subarray(0, 8) as any;
    }
    chunkCvs.set(cv, i * 8);
  }

  let cvs = chunkCvs;
  let len = chunkCount;
  while (len > 1) {
    const nextLen = Math.ceil(len / 2);
    const nextCvs = new Uint32Array(nextLen * 8);
    for (let i = 0; i < nextLen; i++) {
      const left = cvs.subarray(i * 16, i * 16 + 8);
      let right = cvs.subarray(i * 16 + 8, i * 16 + 16);
      if (right.length === 0) {
        nextCvs.set(left, i * 8);
        continue;
      }
      const parentBlock = new Uint32Array(16);
      parentBlock.set(left, 0);
      parentBlock.set(right, 8);
      
      let flags = 4; 
      if (nextLen === 1) flags |= 8; 

      const out = blake3Compress(BLAKE3_IV, parentBlock, 64, 0n, flags);
      nextCvs.set(out.subarray(0, 8), i * 8);
    }
    cvs = nextCvs;
    len = nextLen;
  }

  const finalCv = cvs.subarray(0, 8);
  const digest = new Uint8Array(outLen);
  const outView = new DataView(digest.buffer);
  for (let i = 0; i < Math.min(8, Math.ceil(outLen / 4)); i++) {
    outView.setUint32(i * 4, finalCv[i], true);
  }
  return digest;
}

// CRC16 and CRC32
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    let byte = bytes[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function crc16(bytes: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) {
    let byte = bytes[i];
    for (let j = 0; j < 8; j++) {
      const bit = (crc ^ (byte >>> j)) & 1;
      if (bit) {
        crc = (crc >>> 1) ^ 0xa001; 
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return crc & 0xffff;
}

// MD2 and MD4
const MD2_S = new Uint8Array([
  0x29, 0x2E, 0x43, 0xC9, 0xA2, 0xD8, 0x7C, 0x01, 0x3D, 0x36, 0x54, 0xA1, 0xEC, 0xF0, 0x06, 0x13,
  0x62, 0xA7, 0x05, 0xF3, 0xC0, 0xC7, 0x73, 0x8C, 0x98, 0x93, 0x2B, 0xD9, 0xBC, 0x4C, 0x82, 0xCA,
  0x1E, 0x9B, 0x57, 0x3C, 0xFD, 0xD4, 0xE0, 0x16, 0x67, 0x42, 0x6F, 0x18, 0x8A, 0x17, 0xE5, 0x12,
  0xBE, 0x4E, 0xC4, 0xD6, 0xDA, 0x9E, 0xDE, 0x49, 0xA0, 0xFB, 0xF5, 0x8E, 0xBB, 0x2F, 0xEE, 0x7A,
  0xA9, 0x68, 0x79, 0x91, 0x15, 0xB2, 0x07, 0x3F, 0x94, 0xC2, 0x10, 0x89, 0x0B, 0x22, 0x5F, 0x21,
  0x80, 0x7F, 0x5D, 0x9A, 0x5A, 0x90, 0x32, 0x27, 0x35, 0x3E, 0xCC, 0xE7, 0xBF, 0xF7, 0x97, 0x03,
  0xFF, 0x19, 0x30, 0xB3, 0x48, 0xA5, 0xB5, 0xD1, 0xD7, 0x5E, 0x92, 0x2A, 0xAC, 0x56, 0xAA, 0xC6,
  0x4F, 0xB8, 0x38, 0xD2, 0x96, 0xA4, 0x7D, 0xB6, 0x76, 0xFC, 0x6B, 0xE2, 0x9C, 0x74, 0x04, 0xF1,
  0x45, 0x9D, 0x70, 0x59, 0x64, 0x71, 0x87, 0x20, 0x86, 0x5B, 0xCF, 0x65, 0xE6, 0x2D, 0xA8, 0x02,
  0x1B, 0x60, 0x25, 0xAD, 0xAE, 0xB0, 0xB9, 0xF6, 0x1C, 0x46, 0x61, 0x69, 0x34, 0x40, 0x7E, 0x0F,
  0x55, 0x47, 0xA3, 0x23, 0xDD, 0x51, 0xAF, 0x3A, 0xC3, 0x5C, 0xF9, 0xCE, 0xBA, 0xC5, 0xEA, 0x26,
  0x2C, 0x53, 0x0D, 0x6E, 0x85, 0x28, 0x84, 0x09, 0xD3, 0xDF, 0xCD, 0xF4, 0x41, 0x81, 0x4D, 0x52,
  0x6A, 0xDC, 0x37, 0xC8, 0x6C, 0xC1, 0xAB, 0xFA, 0x24, 0xE1, 0x7B, 0x08, 0x0C, 0xBD, 0xB1, 0x4A,
  0x78, 0x88, 0x95, 0x8B, 0xE3, 0x63, 0xE8, 0x6D, 0xE9, 0xCB, 0xD5, 0xFE, 0x3B, 0x00, 0x1D, 0x39,
  0xF2, 0xEF, 0xB7, 0x0E, 0x66, 0x58, 0xD0, 0xE4, 0xA6, 0x77, 0x72, 0xF8, 0xEB, 0x75, 0x4B, 0x0A,
  0x31, 0x44, 0x50, 0xB4, 0x8F, 0xED, 0x1F, 0x1A, 0xDB, 0x99, 0x8D, 0x33, 0x9F, 0x11, 0x83, 0x14
]);

function md2(msg: Uint8Array): Uint8Array {
  const padLen = 16 - (msg.length % 16);
  const padded = new Uint8Array(msg.length + padLen + 16);
  padded.set(msg, 0);
  for (let i = 0; i < padLen; i++) {
    padded[msg.length + i] = padLen;
  }
  
  const C = new Uint8Array(16);
  let L = 0;
  for (let i = 0; i < (padded.length - 16) / 16; i++) {
    for (let j = 0; j < 16; j++) {
      const c = padded[i * 16 + j];
      L = C[j] = MD2_S[c ^ L] ^ C[j];
    }
  }
  padded.set(C, padded.length - 16);
  
  const X = new Uint8Array(48);
  const digest = new Uint8Array(16);
  for (let i = 0; i < padded.length / 16; i++) {
    for (let j = 0; j < 16; j++) {
      X[16 + j] = padded[i * 16 + j];
      X[32 + j] = X[16 + j] ^ X[j];
    }
    let t = 0;
    for (let round = 0; round < 18; round++) {
      for (let j = 0; j < 48; j++) {
        t = X[j] = X[j] ^ MD2_S[t];
      }
      t = (t + round) & 0xff;
    }
  }
  
  digest.set(X.subarray(0, 16));
  return digest;
}

function md4(msg: Uint8Array): Uint8Array {
  const originalBitLen = msg.length * 8;
  const padLen = (msg.length % 64 < 56) ? (56 - msg.length % 64) : (120 - msg.length % 64);
  const padded = new Uint8Array(msg.length + padLen + 8);
  padded.set(msg, 0);
  padded[msg.length] = 0x80;
  
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const lowBits = originalBitLen & 0xffffffff;
  const highBits = Math.floor(originalBitLen / 0x100000000);
  view.setUint32(padded.length - 8, lowBits, true);
  view.setUint32(padded.length - 4, highBits, true);
  
  let A = 0x67452301;
  let B = 0xefcdab89;
  let C = 0x98badcfe;
  let D = 0x10325476;
  
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & y) | (x & z) | (y & z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  
  for (let offset = 0; offset < padded.length; offset += 64) {
    const X = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      X[i] = view.getUint32(offset + i * 4, true);
    }
    
    let a = A;
    let b = B;
    let c = C;
    let d = D;
    
    // Round 1
    const r1 = [0, 4, 8, 12];
    for (let i = 0; i < 4; i++) {
      const idx = r1[i];
      a = rotl((a + F(b, c, d) + X[idx]) & 0xffffffff, 3);
      d = rotl((d + F(a, b, c) + X[idx + 1]) & 0xffffffff, 7);
      c = rotl((c + F(d, a, b) + X[idx + 2]) & 0xffffffff, 11);
      b = rotl((b + F(c, d, a) + X[idx + 3]) & 0xffffffff, 19);
    }
    
    // Round 2
    const r2_indices = [
      0, 4, 8, 12,
      1, 5, 9, 13,
      2, 6, 10, 14,
      3, 7, 11, 15
    ];
    for (let i = 0; i < 4; i++) {
      a = rotl((a + G(b, c, d) + X[r2_indices[i * 4]] + 0x5a827999) & 0xffffffff, 3);
      d = rotl((d + G(a, b, c) + X[r2_indices[i * 4 + 1]] + 0x5a827999) & 0xffffffff, 5);
      c = rotl((c + G(d, a, b) + X[r2_indices[i * 4 + 2]] + 0x5a827999) & 0xffffffff, 9);
      b = rotl((b + G(c, d, a) + X[r2_indices[i * 4 + 3]] + 0x5a827999) & 0xffffffff, 13);
    }
    
    // Round 3
    const r3_indices = [
      0, 8, 4, 12,
      2, 10, 6, 14,
      1, 9, 5, 13,
      3, 11, 7, 15
    ];
    for (let i = 0; i < 4; i++) {
      a = rotl((a + H(b, c, d) + X[r3_indices[i * 4]] + 0x6ed9eba1) & 0xffffffff, 3);
      d = rotl((d + H(a, b, c) + X[r3_indices[i * 4 + 1]] + 0x6ed9eba1) & 0xffffffff, 9);
      c = rotl((c + H(d, a, b) + X[r3_indices[i * 4 + 2]] + 0x6ed9eba1) & 0xffffffff, 11);
      b = rotl((b + H(c, d, a) + X[r3_indices[i * 4 + 3]] + 0x6ed9eba1) & 0xffffffff, 15);
    }
    
    A = (A + a) & 0xffffffff;
    B = (B + b) & 0xffffffff;
    C = (C + c) & 0xffffffff;
    D = (D + d) & 0xffffffff;
  }
  
  const digest = new Uint8Array(16);
  const outView = new DataView(digest.buffer);
  outView.setUint32(0, A, true);
  outView.setUint32(4, B, true);
  outView.setUint32(8, C, true);
  outView.setUint32(12, D, true);
  return digest;
}

// Convert bytes to hex
function toHex(bytes: Uint8Array): string {
  return Array.prototype.map.call(bytes, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Parse custom Key helper for KMAC / cSHAKE
function parseInputBytes(str: string): Uint8Array {
  if (/^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0) {
    const bytes = new Uint8Array(str.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(str.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
  return new TextEncoder().encode(str);
}

// ==================== React UI Component ====================
export default function AdvancedHashGenerator() {
  const [lang, setLang] = useState('en');
  const [tabIndex, setTabIndex] = useState(0);
  
  // Inputs
  const [textInput, setTextInput] = useState('The quick brown fox jumps over the lazy dog');
  const [file, setFile] = useState<File | null>(null);
  
  // Settings
  const [shakeBits, setShakeBits] = useState(256);
  const [kmacKey, setKmacKey] = useState('key');
  const [kmacCustom, setKmacCustom] = useState('');
  const [cshakeName, setCshakeName] = useState('');
  const [cshakeCustom, setCshakeCustom] = useState('');

  // Execution states
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [results, setResults] = useState<Record<string, string>>({});

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setLang(e.target.value);
  };

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setResults({});
    setSuccessMsg('');
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setSuccessMsg(t('copied'));
      setTimeout(() => setSuccessMsg(''), 3000);
    });
  };

  const clearInputs = () => {
    setTextInput('');
    setFile(null);
    setResults({});
    setSuccessMsg('');
    setProgress(0);
  };

  const runHashing = (data: Uint8Array) => {
    const nextResults: Record<string, string> = {};

    // 1. Keccak and SHA3
    nextResults['SHA3-224'] = toHex(keccakSponge(data, 144, 28, 0x06));
    nextResults['SHA3-256'] = toHex(keccakSponge(data, 136, 32, 0x06));
    nextResults['SHA3-384'] = toHex(keccakSponge(data, 104, 48, 0x06));
    nextResults['SHA3-512'] = toHex(keccakSponge(data, 72, 64, 0x06));

    nextResults['Keccak-224'] = toHex(keccakSponge(data, 144, 28, 0x01));
    nextResults['Keccak-256'] = toHex(keccakSponge(data, 136, 32, 0x01));
    nextResults['Keccak-384'] = toHex(keccakSponge(data, 104, 48, 0x01));
    nextResults['Keccak-512'] = toHex(keccakSponge(data, 72, 64, 0x01));

    // 2. SHAKE & cSHAKE
    const shakeLenBytes = Math.ceil(shakeBits / 8) || 32;
    nextResults[`SHAKE128 (${shakeBits} bits)`] = toHex(keccakSponge(data, 168, shakeLenBytes, 0x1f));
    nextResults[`SHAKE256 (${shakeBits} bits)`] = toHex(keccakSponge(data, 136, shakeLenBytes, 0x1f));

    const csNameBytes = new TextEncoder().encode(cshakeName);
    const csCustomBytes = new TextEncoder().encode(cshakeCustom);
    nextResults[`cSHAKE128 (${shakeBits} bits)`] = toHex(cSHAKE(data, 168, shakeLenBytes, csNameBytes, csCustomBytes));
    nextResults[`cSHAKE256 (${shakeBits} bits)`] = toHex(cSHAKE(data, 136, shakeLenBytes, csNameBytes, csCustomBytes));

    // 3. KMAC
    const kKey = parseInputBytes(kmacKey);
    const kCustom = new TextEncoder().encode(kmacCustom);
    nextResults[`KMAC128 (${shakeBits} bits)`] = toHex(KMAC128(kKey, data, shakeLenBytes, kCustom));
    nextResults[`KMAC256 (${shakeBits} bits)`] = toHex(KMAC256(kKey, data, shakeLenBytes, kCustom));

    // 4. RIPEMD
    nextResults['RIPEMD-128'] = toHex(ripemd128(data));
    nextResults['RIPEMD-160'] = toHex(ripemd160(data));
    nextResults['RIPEMD-256'] = toHex(ripemd256(data));
    nextResults['RIPEMD-320'] = toHex(ripemd320(data));

    // 5. BLAKE
    nextResults['BLAKE2b'] = toHex(blake2b(data, 64));
    nextResults['BLAKE2s'] = toHex(blake2s(data, 32));
    nextResults['BLAKE3'] = toHex(blake3(data, 32));

    // 6. Checksums
    nextResults['CRC16'] = crc16(data).toString(16).padStart(4, '0').toUpperCase();
    nextResults['CRC32'] = crc32(data).toString(16).padStart(8, '0').toUpperCase();
    nextResults['MD2'] = toHex(md2(data));
    nextResults['MD4'] = toHex(md4(data));

    setResults(nextResults);
  };

  const handleCompute = () => {
    setIsProcessing(true);
    setProgress(10);
    try {
      if (tabIndex === 0) {
        const data = new TextEncoder().encode(textInput);
        setProgress(50);
        runHashing(data);
        setProgress(100);
      } else {
        if (!file) return;
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        reader.onload = (e) => {
          const buf = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(buf);
          runHashing(data);
          setProgress(100);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LanguageIcon color="action" />
            <Select value={lang} onChange={handleLanguageChange}>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="zh-CN">简体中文</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
            </Select>
          </Stack>
        </FormControl>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label={t('textTab')} />
          <Tab label={t('fileTab')} />
        </Tabs>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side: Input area and settings */}
        <Grid size={{ xs: 12, md: 7 }} container={false}>
          {tabIndex === 0 ? (
            <TextField
              fullWidth
              multiline
              rows={6}
              label={t('inputLabel')}
              placeholder={t('placeholder')}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
            />
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                {t('fileLabel')}
              </Typography>
              <Paper
                variant="outlined"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderStyle: 'dashed',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <FileUploadIcon sx={{ fontSize: 48, mb: 1, opacity: 0.7 }} />
                <Typography>{t('dragDrop')}</Typography>
              </Paper>

              {file && (
                <Card sx={{ mt: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {t('selectedFile')}: {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('fileSize')}: {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={() => setFile(null)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {t('fileHint')}
              </Typography>
            </Box>
          )}

          {/* Settings Panel */}
          <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('settings')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }} container={false}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={t('shakeLength')}
                    value={shakeBits}
                    onChange={(e) => setShakeBits(Math.max(8, parseInt(e.target.value) || 256))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} container={false}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('kmacKey')}
                    value={kmacKey}
                    onChange={(e) => setKmacKey(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }} container={false}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('kmacCustom')}
                    value={kmacCustom}
                    onChange={(e) => setKmacCustom(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} container={false}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('cshakeName')}
                    value={cshakeName}
                    onChange={(e) => setCshakeName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} container={false}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('cshakeCustom')}
                    value={cshakeCustom}
                    onChange={(e) => setCshakeCustom(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              disabled={isProcessing || (tabIndex === 1 && !file)}
              onClick={handleCompute}
            >
              {t('computeBtn')}
            </Button>
            <Button variant="outlined" color="secondary" onClick={clearInputs}>
              {t('clearBtn')}
            </Button>
          </Stack>

          {isProcessing && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="caption">{t('progressLabel')}</Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}
        </Grid>

        {/* Right Side: Results output */}
        <Grid size={{ xs: 12, md: 5 }} container={false}>
          <Card sx={{ height: '100%', bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('resultsTitle')}
              </Typography>
              <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                {Object.keys(results).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hashes generated yet. Fill the inputs and click &quot;Compute Hashes&quot;.
                  </Typography>
                ) : (
                  Object.entries(results).map(([algo, hash]) => (
                      <Box key={algo} sx={{ mb: 2 }}>
                      <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {algo}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(hash)}>
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.2)',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      >
                        {hash}
                      </Paper>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
