'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Paper,
  Snackbar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CompressIcon from '@mui/icons-material/Compress';
import WrapTextIcon from '@mui/icons-material/WrapText';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';

// JSON comment stripping helper
function stripJsonComments(jsonString: string) {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = '';

  while (i < jsonString.length) {
    const char = jsonString[i];
    const nextChar = jsonString[i + 1];

    if (inString) {
      result += char;
      if (char === '\\' && i + 1 < jsonString.length) {
        result += nextChar;
        i += 2;
        continue;
      }
      if (char === stringChar) {
        inString = false;
      }
      i++;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      result += char;
      i++;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      while (i < jsonString.length && jsonString[i] !== '\n') {
        i++;
      }
      continue;
    }

    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < jsonString.length - 1) {
        if (jsonString[i] === '*' && jsonString[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    result += char;
    i++;
  }
  return result;
}

// Strip trailing commas helper
function removeTrailingCommas(jsonString: string) {
  return jsonString.replace(/,(\s*[}\]])/g, '$1');
}

// Main preprocessing helper
function preprocessJson(input: string) {
  let processed = input;
  processed = stripJsonComments(processed);
  processed = removeTrailingCommas(processed);
  return processed;
}

// Calculate JSON stats helper
interface JsonStats {
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  maxDepth: number;
}

function calculateStats(data: any): JsonStats {
  const stats: JsonStats = {
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    maxDepth: 0,
  };

  function traverse(node: any, depth: number) {
    if (depth > stats.maxDepth) {
      stats.maxDepth = depth;
    }

    if (node === null) {
      stats.nulls++;
      return;
    }

    const t = typeof node;
    if (t === 'string') {
      stats.strings++;
    } else if (t === 'number') {
      stats.numbers++;
    } else if (t === 'boolean') {
      stats.booleans++;
    } else if (Array.isArray(node)) {
      stats.arrays++;
      for (const item of node) {
        traverse(item, depth + 1);
      }
    } else if (t === 'object') {
      stats.objects++;
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          traverse(node[key], depth + 1);
        }
      }
    }
  }

  traverse(data, 1);
  return stats;
}

// Collect all collapsible paths helper
function getAllCollapsiblePaths(data: any, path = '$'): string[] {
  const paths: string[] = [];
  if (data === null || typeof data !== 'object') {
    return paths;
  }
  paths.push(path);
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      paths.push(...getAllCollapsiblePaths(item, `${path}[${index}]`));
    });
  } else {
    Object.keys(data).forEach((key) => {
      paths.push(...getAllCollapsiblePaths(data[key], `${path}.${key}`));
    });
  }
  return paths;
}

// Count matches helper
function countMatches(data: any, query: string): number {
  if (!query) return 0;
  let count = 0;
  const q = query.toLowerCase();
  
  function check(val: any, keyOrIndex: string | number) {
    if (String(keyOrIndex).toLowerCase().includes(q)) {
      count++;
    } else if (val !== null && typeof val !== 'object' && String(val).toLowerCase().includes(q)) {
      count++;
    }
    
    if (val !== null && typeof val === 'object') {
      if (Array.isArray(val)) {
        val.forEach((item, idx) => check(item, idx));
      } else {
        Object.keys(val).forEach((key) => check(val[key], key));
      }
    }
  }

  if (data !== null && typeof data === 'object') {
    if (Array.isArray(data)) {
      data.forEach((item, idx) => check(item, idx));
    } else {
      Object.keys(data).forEach((key) => check(data[key], key));
    }
  } else {
    if (String(data).toLowerCase().includes(q)) {
      count++;
    }
  }
  return count;
}

// Single JSON Tree Node Component
interface JsonNodeProps {
  name: string | number | undefined;
  value: any;
  isLast: boolean;
  depth: number;
  path: string;
  searchQuery: string;
  collapsedPaths: Record<string, boolean>;
  onTogglePath: (path: string) => void;
  onCopyPath: (path: string) => void;
  onCopyValue: (value: any) => void;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  isLast,
  depth,
  path,
  searchQuery,
  collapsedPaths,
  onTogglePath,
  onCopyPath,
  onCopyValue,
}) => {
  const isCollapsed = collapsedPaths[path] || false;
  const type = value === null ? 'null' : typeof value;
  const isObject = type === 'object' && value !== null;
  const isArray = Array.isArray(value);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePath(path);
  };

  const renderKey = () => {
    if (name === undefined) return null;
    const keyStr = typeof name === 'number' ? `${name}` : `"${name}"`;
    const matches = searchQuery && keyStr.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      <span
        style={{
          color: '#881391',
          fontWeight: 'bold',
          backgroundColor: matches ? '#ffe082' : 'transparent',
          marginRight: '4px',
        }}
      >
        {keyStr}
      </span>
    );
  };

  const renderValue = () => {
    if (value === null) {
      const matches = searchQuery && 'null'.includes(searchQuery.toLowerCase());
      return <span style={{ color: '#808080', backgroundColor: matches ? '#ffe082' : 'transparent' }}>null</span>;
    }

    if (type === 'string') {
      const displayStr = `"${value}"`;
      const matches = searchQuery && displayStr.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        <span
          style={{
            color: '#c41a16',
            wordBreak: 'break-all',
            backgroundColor: matches ? '#ffe082' : 'transparent',
          }}
        >
          {displayStr}
        </span>
      );
    }

    if (type === 'number') {
      const matches = searchQuery && String(value).toLowerCase().includes(searchQuery.toLowerCase());
      return <span style={{ color: '#1c00cf', backgroundColor: matches ? '#ffe082' : 'transparent' }}>{String(value)}</span>;
    }

    if (type === 'boolean') {
      const matches = searchQuery && String(value).toLowerCase().includes(searchQuery.toLowerCase());
      return (
        <span
          style={{
            color: '#0d904f',
            fontWeight: 'bold',
            backgroundColor: matches ? '#ffe082' : 'transparent',
          }}
        >
          {String(value)}
        </span>
      );
    }

    return null;
  };

  const renderActionButtons = () => {
    return (
      <span
        className="node-actions"
        style={{
          marginLeft: '12px',
          opacity: 0,
          transition: 'opacity 0.2s',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <Tooltip title="Copy Path">
          <IconButton
            size="small"
            sx={{ p: 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              onCopyPath(path);
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy Value">
          <IconButton
            size="small"
            sx={{ p: 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              onCopyValue(value);
            }}
          >
            <WrapTextIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </span>
    );
  };

  if (isObject || isArray) {
    const keys = isArray ? value : Object.keys(value);
    const size = keys.length;
    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';
    const sizeLabel = isArray ? `${size} items` : `${size} keys`;

    return (
      <Box
        sx={{
          pl: depth > 0 ? 2 : 0,
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          '&:hover > .node-header .node-actions': { opacity: 1 },
        }}
      >
        <Box
          className="node-header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            py: 0.2,
          }}
          onClick={handleToggle}
        >
          <IconButton size="small" sx={{ p: 0, mr: 0.5 }} onClick={handleToggle}>
            {isCollapsed ? <ChevronRightIcon sx={{ fontSize: 15 }} /> : <ExpandMoreIcon sx={{ fontSize: 15 }} />}
          </IconButton>
          {renderKey()}
          {name !== undefined && <span style={{ marginRight: '6px' }}>:</span>}
          <span style={{ color: '#333333', fontWeight: 'bold' }}>{openBracket}</span>
          {isCollapsed && (
            <span
              style={{
                background: '#eceff1',
                borderRadius: '4px',
                padding: '0 4px',
                fontSize: '11px',
                color: '#546e7a',
                marginLeft: '4px',
                cursor: 'pointer',
              }}
              onClick={handleToggle}
            >
              ... {sizeLabel} ...
            </span>
          )}
          {isCollapsed && <span style={{ color: '#333333', fontWeight: 'bold' }}>{closeBracket}</span>}
          {isCollapsed && !isLast && <span>,</span>}
          {renderActionButtons()}
        </Box>

        {!isCollapsed && (
          <Box sx={{ borderLeft: '1px dashed #cfd8dc', ml: 1 }}>
            {keys.map((key: any, index: number) => {
              const childName = isArray ? index : key;
              const childValue = isArray ? key : value[key];
              const childIsLast = index === size - 1;
              const childPath = isArray ? `${path}[${index}]` : `${path}.${key}`;

              return (
                <JsonNode
                  key={childPath}
                  name={childName}
                  value={childValue}
                  isLast={childIsLast}
                  depth={depth + 1}
                  path={childPath}
                  searchQuery={searchQuery}
                  collapsedPaths={collapsedPaths}
                  onTogglePath={onTogglePath}
                  onCopyPath={onCopyPath}
                  onCopyValue={onCopyValue}
                />
              );
            })}
          </Box>
        )}

        {!isCollapsed && (
          <Box sx={{ pl: 2, py: 0.2 }}>
            <span style={{ color: '#333333', fontWeight: 'bold' }}>{closeBracket}</span>
            {!isLast && <span>,</span>}
          </Box>
        )}
      </Box>
    );
  }

  // Primitive value node
  return (
    <Box
      sx={{
        pl: depth > 0 ? 2 : 0,
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '1.6',
        py: 0.2,
        display: 'flex',
        alignItems: 'center',
        '&:hover .node-actions': { opacity: 1 },
      }}
    >
      <span style={{ width: '20px' }} />
      {renderKey()}
      {name !== undefined && <span style={{ marginRight: '6px' }}>:</span>}
      {renderValue()}
      {!isLast && <span>,</span>}
      {renderActionButtons()}
    </Box>
  );
};

// Main Component
export default function JsonViewer() {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>({});
  
  // Notification Snackbar State
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'info' | 'error' = 'success') => {
    setToast({ open: true, message, severity });
  };

  // Pre-load a sample on mount if empty
  useEffect(() => {
    handleLoadSample();
  }, []);

  const handleLoadSample = () => {
    const sample = {
      name: "Nakul Tools JSON Viewer",
      version: "1.0.0",
      description: "Interactive visual tree editor for JSON files",
      active: true,
      statistics: {
        stars: 5,
        rating: 4.9,
        users: 50000
      },
      features: [
        "Interactive structured tree view",
        "Folding/Collapsing tree nodes",
        "Escape and unescape utility",
        "Real-time value search",
        "Comment and trailing comma stripping",
        "Statistics dashboard"
      ],
      emptyValue: null
    };
    const sampleStr = JSON.stringify(sample, null, 2);
    setInputText(sampleStr);
    try {
      setParsedData(sample);
      setErrorMsg(null);
      setCollapsedPaths({});
    } catch (e) {}
  };

  const handleFormat = () => {
    if (!inputText.trim()) {
      showToast('Please enter JSON data first', 'error');
      return;
    }
    try {
      const cleaned = preprocessJson(inputText);
      const parsed = JSON.parse(cleaned);
      setParsedData(parsed);
      setInputText(JSON.stringify(parsed, null, 2));
      setErrorMsg(null);
      showToast('JSON Parsed & Formatted successfully');
    } catch (e: any) {
      setErrorMsg(e.message);
      setParsedData(null);
      showToast('Failed to parse JSON', 'error');
    }
  };

  const handleMinify = () => {
    if (!inputText.trim()) {
      showToast('Please enter JSON data first', 'error');
      return;
    }
    try {
      const cleaned = preprocessJson(inputText);
      const parsed = JSON.parse(cleaned);
      setInputText(JSON.stringify(parsed));
      setParsedData(parsed);
      setErrorMsg(null);
      showToast('JSON Minified successfully');
    } catch (e: any) {
      setErrorMsg(e.message);
      setParsedData(null);
      showToast('Failed to parse JSON', 'error');
    }
  };

  const handleEscape = () => {
    if (!inputText.trim()) return;
    try {
      const escaped = inputText
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      setInputText(escaped);
      showToast('JSON escaped successfully');
    } catch (e: any) {
      showToast('Escape failed', 'error');
    }
  };

  const handleUnescape = () => {
    if (!inputText.trim()) return;
    try {
      const unescaped = inputText
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      setInputText(unescaped);
      showToast('JSON unescaped successfully');
    } catch (e: any) {
      showToast('Unescape failed', 'error');
    }
  };

  const handleClear = () => {
    setInputText('');
    setParsedData(null);
    setErrorMsg(null);
    setSearchQuery('');
    setCollapsedPaths({});
    showToast('Cleared all data', 'info');
  };

  const handleDownload = () => {
    if (!inputText) return;
    try {
      const blob = new Blob([inputText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('JSON download started');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      try {
        const cleaned = preprocessJson(text);
        const parsed = JSON.parse(cleaned);
        setParsedData(parsed);
        setErrorMsg(null);
        showToast(`Loaded ${file.name} successfully`);
      } catch (err: any) {
        setErrorMsg(err.message);
        setParsedData(null);
        showToast('JSON syntax error in uploaded file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleTogglePath = (path: string) => {
    setCollapsedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    showToast(`Path copied: ${path}`);
  };

  const handleCopyValue = (val: any) => {
    const copyText = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
    navigator.clipboard.writeText(copyText);
    showToast('Value copied to clipboard');
  };

  const handleCollapseAll = () => {
    if (!parsedData) return;
    const allPaths = getAllCollapsiblePaths(parsedData);
    const map: Record<string, boolean> = {};
    allPaths.forEach((p) => {
      map[p] = true;
    });
    setCollapsedPaths(map);
    showToast('Collapsed all nodes', 'info');
  };

  const handleExpandAll = () => {
    setCollapsedPaths({});
    showToast('Expanded all nodes', 'info');
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      try {
        const cleaned = preprocessJson(text);
        const parsed = JSON.parse(cleaned);
        setParsedData(parsed);
        setErrorMsg(null);
        showToast(`Dropped and loaded ${file.name}`);
      } catch (err: any) {
        setErrorMsg(err.message);
        setParsedData(null);
        showToast('Invalid JSON file dropped', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Compile real-time stats
  const stats = parsedData ? calculateStats(parsedData) : null;
  const matchCount = parsedData && searchQuery ? countMatches(parsedData, searchQuery) : 0;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Statistics layout grid */}
      {stats && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Objects</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>{stats.objects}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Arrays</Typography>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold' }}>{stats.arrays}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Strings</Typography>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>{stats.strings}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Numbers</Typography>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>{stats.numbers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Booleans</Typography>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>{stats.booleans}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Nulls</Typography>
                <Typography variant="h6" color="text.disabled" sx={{ fontWeight: 'bold' }}>{stats.nulls}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 1.8 }}>
            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Max Depth</Typography>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>{stats.maxDepth}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ fontFamily: 'monospace' }}>
          <strong>JSON Syntax Error:</strong> {errorMsg}
        </Alert>
      )}

      {/* Main interface workspace grid */}
      <Grid container spacing={3}>
        {/* Left Side: Inputs and Quick Action Toolbar */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon fontSize="small" /> Input JSON Data
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<CloudUploadIcon />}
              >
                Upload File
                <input type="file" accept=".json,application/json" hidden onChange={handleFileUpload} />
              </Button>
            </Box>

            <TextField
              multiline
              rows={16}
              fullWidth
              placeholder="Paste raw JSON here, or drag and drop a JSON file..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '13px',
                },
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="primary" size="small" startIcon={<AutoFixHighIcon />} onClick={handleFormat}>
                  Format
                </Button>
                <Button variant="outlined" color="primary" size="small" startIcon={<CompressIcon />} onClick={handleMinify}>
                  Minify
                </Button>
                <Button variant="outlined" color="secondary" size="small" onClick={handleEscape}>
                  Escape
                </Button>
                <Button variant="outlined" color="secondary" size="small" onClick={handleUnescape}>
                  Unescape
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="text" color="primary" size="small" onClick={handleLoadSample}>
                  Sample
                </Button>
                <Button variant="text" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleClear}>
                  Clear
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Interactive Visual Tree & Controls */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: '480px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TerminalIcon fontSize="small" /> Interactive Tree View
              </Typography>
              {parsedData && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="text" onClick={handleExpandAll}>
                    Expand All
                  </Button>
                  <Button size="small" variant="text" onClick={handleCollapseAll}>
                    Collapse All
                  </Button>
                  <IconButton size="small" color="primary" onClick={handleDownload} title="Download Formatted JSON">
                    <FileDownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {parsedData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                {/* Real-time search matching input */}
                <TextField
                  size="small"
                  fullWidth
                  placeholder="🔍 Search keys or values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: searchQuery ? (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1, whiteSpace: 'nowrap' }}>
                          {matchCount} match{matchCount !== 1 ? 'es' : ''}
                        </Typography>
                      ) : null,
                    },
                  }}
                />

                <Box
                  sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    maxHeight: '450px',
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <JsonNode
                    name={undefined}
                    value={parsedData}
                    isLast={true}
                    depth={0}
                    path="$"
                    searchQuery={searchQuery}
                    collapsedPaths={collapsedPaths}
                    onTogglePath={handleTogglePath}
                    onCopyPath={handleCopyPath}
                    onCopyValue={handleCopyValue}
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Paste JSON on the left and click &quot;Format&quot; to inspect the interactive tree hierarchy.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
      />
    </Box>
  );
}
