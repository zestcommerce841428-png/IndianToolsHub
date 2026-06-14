'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Divider,
} from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface MergeFileItem {
  id: string;
  file: File;
  pageCount: number;
  bytes: ArrayBuffer;
}

export default function PdfMergeSplitter() {
  const [tabValue, setTabValue] = useState<number>(0);
  const [alertInfo, setAlertInfo] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Merge state
  const [mergeList, setMergeList] = useState<MergeFileItem[]>([]);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPageCount, setSplitPageCount] = useState<number>(0);
  const [splitBytes, setSplitBytes] = useState<ArrayBuffer | null>(null);
  const [splitRange, setSplitRange] = useState<string>('1');
  const splitInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setAlertInfo(null);
    setProgress(0);
    setProcessing(false);
  };

  // --- MERGE LOGIC ---
  const handleMergeFilesAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems: MergeFileItem[] = [];

      for (const f of filesArray) {
        if (f.type !== 'application/pdf') {
          setAlertInfo({ type: 'error', message: 'Only PDF files are supported.' });
          continue;
        }

        try {
          const bytes = await f.arrayBuffer();
          const doc = await PDFDocument.load(bytes);
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file: f,
            pageCount: doc.getPageCount(),
            bytes,
          });
        } catch (err) {
          console.error(err);
          setAlertInfo({ type: 'error', message: `Failed to load ${f.name}. It may be protected or corrupted.` });
        }
      }

      setMergeList((prev) => [...prev, ...newItems]);
      setAlertInfo(null);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= mergeList.length) return;

    const list = [...mergeList];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;
    setMergeList(list);
  };

  const removeItem = (id: string) => {
    setMergeList((prev) => prev.filter((item) => item.id !== id));
  };

  const triggerMergeUpload = () => {
    mergeInputRef.current?.click();
  };

  const processMerge = async () => {
    if (mergeList.length < 2) {
      setAlertInfo({ type: 'error', message: 'Please upload at least 2 PDF files to merge.' });
      return;
    }

    setProcessing(true);
    setProgress(20);
    setAlertInfo(null);

    try {
      const mergedPdf = await PDFDocument.create();
      let currentIdx = 0;

      for (const item of mergeList) {
        const doc = await PDFDocument.load(item.bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        currentIdx++;
        setProgress(Math.round(20 + (currentIdx / mergeList.length) * 60));
      }

      setProgress(90);
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setProcessing(false);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAlertInfo({ type: 'success', message: 'PDFs merged successfully! Download started.' });
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setAlertInfo({ type: 'error', message: 'An error occurred during PDF merging. Ensure files are not encrypted.' });
    }
  };

  // --- SPLIT LOGIC ---
  const handleSplitFileAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setAlertInfo({ type: 'error', message: 'Please select a valid PDF file.' });
        resetSplit();
        return;
      }

      try {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        setSplitFile(file);
        setSplitPageCount(doc.getPageCount());
        setSplitBytes(bytes);
        setSplitRange(`1-${doc.getPageCount()}`);
        setAlertInfo(null);
      } catch (err) {
        console.error(err);
        setAlertInfo({ type: 'error', message: 'Failed to load PDF. It may be encrypted or corrupted.' });
        resetSplit();
      }
    }
  };

  const resetSplit = () => {
    setSplitFile(null);
    setSplitPageCount(0);
    setSplitBytes(null);
    setSplitRange('1');
    if (splitInputRef.current) {
      splitInputRef.current.value = '';
    }
  };

  const triggerSplitUpload = () => {
    splitInputRef.current?.click();
  };

  const parsePageInput = (input: string, maxPages: number): number[] => {
    const ranges = input.split(',');
    const pages = new Set<number>();

    for (const range of ranges) {
      const trimmed = range.trim();
      if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        const start = parseInt(parts[0]?.trim(), 10) - 1;
        const end = parseInt(parts[1]?.trim(), 10) - 1;

        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.min(start, end);
          const to = Math.max(start, end);
          for (let i = from; i <= to && i < maxPages; i++) {
            if (i >= 0) pages.add(i);
          }
        }
      } else {
        const index = parseInt(trimmed, 10) - 1;
        if (!isNaN(index) && index >= 0 && index < maxPages) {
          pages.add(index);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const processSplit = async () => {
    if (!splitFile || !splitBytes) {
      setAlertInfo({ type: 'error', message: 'Please upload a PDF file first.' });
      return;
    }

    const pageIndices = parsePageInput(splitRange, splitPageCount);
    if (pageIndices.length === 0) {
      setAlertInfo({ type: 'error', message: 'Invalid page range selection. Examples: 1, 3-5, 7' });
      return;
    }

    setProcessing(true);
    setProgress(30);
    setAlertInfo(null);

    try {
      const doc = await PDFDocument.load(splitBytes);
      const splitPdf = await PDFDocument.create();

      setProgress(60);
      const copiedPages = await splitPdf.copyPages(doc, pageIndices);
      copiedPages.forEach((page) => splitPdf.addPage(page));

      setProgress(85);
      const outputBytes = await splitPdf.save();
      const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setProcessing(false);

      const a = document.createElement('a');
      a.href = url;
      const originalNameWithoutExt = splitFile.name.substring(0, splitFile.name.lastIndexOf('.')) || splitFile.name;
      a.download = `${originalNameWithoutExt}_split.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAlertInfo({ type: 'success', message: `Extracted ${pageIndices.length} page(s) successfully! Download started.` });
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setAlertInfo({ type: 'error', message: 'An error occurred during splitting.' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Mode tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab icon={<CallMergeIcon />} label="Merge PDFs" sx={{ fontWeight: 700 }} />
        <Tab icon={<CallSplitIcon />} label="Split PDF" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* TAB 0: MERGE PDFs */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* File Picker Card */}
          <Card
            variant="outlined"
            onClick={triggerMergeUpload}
            sx={{
              border: '2px dashed #cbd5e1',
              borderRadius: 3,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              textAlign: 'center',
              p: 4,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(37, 99, 235, 0.02)',
              },
            }}
          >
            <input
              type="file"
              ref={mergeInputRef}
              onChange={handleMergeFilesAdded}
              accept="application/pdf"
              multiple
              style={{ display: 'none' }}
            />
            <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Choose PDF Files to Merge
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select multiple PDFs from your device (Order can be adjusted below)
            </Typography>
          </Card>

          {/* Merge list */}
          {mergeList.length > 0 && (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, px: 1 }}>
                PDF Order List ({mergeList.length} files)
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <List>
                {mergeList.map((item, index) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
                        <IconButton
                          edge="end"
                          aria-label="move up"
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0 || processing}
                          size="small"
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="move down"
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === mergeList.length - 1 || processing}
                          size="small"
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          color="error"
                          onClick={() => removeItem(item.id)}
                          disabled={processing}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.01)',
                      mb: 1,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <PictureAsPdfIcon sx={{ color: '#ef4444', mr: 2 }} />
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 2 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: 150, sm: 300 } }}>
                        {item.file.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {`${(item.file.size / 1024).toFixed(1)} KB • ${item.pageCount} page(s)`}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setMergeList([])}
                  disabled={processing}
                >
                  Clear List
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={processMerge}
                  disabled={processing || mergeList.length < 2}
                  startIcon={<CallMergeIcon />}
                >
                  {processing ? 'Merging...' : 'Merge PDFs'}
                </Button>
              </Box>
            </Card>
          )}
        </Box>
      )}

      {/* TAB 1: SPLIT PDF */}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* File Picker */}
          {!splitFile ? (
            <Card
              variant="outlined"
              onClick={triggerSplitUpload}
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 3,
                bgcolor: 'background.paper',
                cursor: 'pointer',
                textAlign: 'center',
                p: 5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(37, 99, 235, 0.02)',
                },
              }}
            >
              <input
                type="file"
                ref={splitInputRef}
                onChange={handleSplitFileAdded}
                accept="application/pdf"
                style={{ display: 'none' }}
              />
              <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Choose PDF File to Split
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a single PDF to extract specific pages
              </Typography>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2.5, alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PictureAsPdfIcon />
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, textOverflow: 'ellipsis' }}>
                    {splitFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {(splitFile.size / 1024).toFixed(1)} KB • Total Pages: {splitPageCount}
                  </Typography>
                </Box>
                <Button size="small" variant="text" color="error" onClick={resetSplit} disabled={processing}>
                  Remove
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Select Pages to Extract"
                  variant="outlined"
                  placeholder="e.g., 1, 3-5, 8"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  disabled={processing}
                  fullWidth
                  helperText={`Enter comma-separated values or page ranges. Max page is ${splitPageCount}.`}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={processSplit}
                    disabled={processing || !splitRange}
                    startIcon={<CallSplitIcon />}
                  >
                    {processing ? 'Processing...' : 'Split PDF'}
                  </Button>
                </Box>
              </Box>
            </Card>
          )}
        </Box>
      )}

      {/* Processing Progress Bar */}
      {processing && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <span>Processing PDF data...</span>
            <strong>{progress}%</strong>
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      )}
    </Box>
  );
}
