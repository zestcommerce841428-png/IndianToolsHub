'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function TimestampConverter() {
  const [currentTs, setCurrentTs] = useState<number>(Math.floor(Date.now() / 1000));
  const [activeTab, setActiveTab] = useState<number>(0);

  // Unix to Human state
  const [unixIn, setUnixIn] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [localOut, setLocalOut] = useState<string>('');
  const [utcOut, setUtcOut] = useState<string>('');
  const [isoOut, setIsoOut] = useState<string>('');

  // Human to Unix state
  const [dateIn, setDateIn] = useState<string>('');
  const [unixOut, setUnixOut] = useState<string>('');

  const [copiedCur, setCopiedCur] = useState<boolean>(false);
  const [copiedRes, setCopiedRes] = useState<boolean>(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize inputs
  useEffect(() => {
    const now = new Date();
    // format as YYYY-MM-DDThh:mm
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
    setDateIn(localISOTime);
  }, []);

  const handleUnixToHuman = () => {
    const ts = parseInt(unixIn);
    if (isNaN(ts)) {
      setLocalOut('Invalid timestamp');
      setUtcOut('Invalid timestamp');
      setIsoOut('Invalid timestamp');
      return;
    }
    const d = new Date(ts * 1000);
    setLocalOut(d.toLocaleString());
    setUtcOut(d.toUTCString());
    setIsoOut(d.toISOString());
  };

  const handleHumanToUnix = () => {
    if (!dateIn) return;
    const d = new Date(dateIn);
    const ts = Math.floor(d.getTime() / 1000);
    if (isNaN(ts)) {
      setUnixOut('Invalid date format');
      return;
    }
    setUnixOut(ts.toString());
  };

  useEffect(() => {
    handleUnixToHuman();
  }, [unixIn]);

  useEffect(() => {
    handleHumanToUnix();
  }, [dateIn]);

  const copyCurrentTs = () => {
    navigator.clipboard.writeText(currentTs.toString());
    setCopiedCur(true);
    setTimeout(() => setCopiedCur(false), 2000);
  };

  const copyResult = (text: string) => {
    if (!text || text.includes('Invalid')) return;
    navigator.clipboard.writeText(text);
    setCopiedRes(true);
    setTimeout(() => setCopiedRes(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Live Current Timestamp Widget */}
      <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Current Unix Timestamp
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace', mt: 0.5 }}>
              {currentTs}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            color={copiedCur ? 'success' : 'primary'}
            startIcon={<ContentCopyIcon />}
            onClick={copyCurrentTs}
          >
            {copiedCur ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
      </Paper>

      {/* Conversion Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Unix Timestamp to Date" />
          <Tab label="Date to Unix Timestamp" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="Unix Timestamp"
              size="small"
              value={unixIn}
              onChange={(e) => setUnixIn(e.target.value)}
              placeholder="e.g. 1700000000"
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleUnixToHuman}>
              Convert
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  LOCAL TIME (YOUR BROWSER TIMEZONE)
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {localOut || '—'}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  UTC GREENWICH TIME
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                  {utcOut || '—'}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    ISO 8601 DATE STRING
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                    {isoOut || '—'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  color={copiedRes ? 'success' : 'primary'}
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyResult(isoOut)}
                >
                  {copiedRes ? 'Copied' : 'Copy ISO'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="Date & Time"
              type="datetime-local"
              size="small"
              value={dateIn}
              onChange={(e) => setDateIn(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleHumanToUnix}>
              Convert
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  CALCULATED UNIX TIMESTAMP (SECONDS)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', fontFamily: 'monospace', mt: 0.5 }}>
                  {unixOut || '—'}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                color={copiedRes ? 'success' : 'primary'}
                startIcon={<ContentCopyIcon />}
                onClick={() => copyResult(unixOut)}
              >
                {copiedRes ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
