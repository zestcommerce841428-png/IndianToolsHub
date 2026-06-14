'use client';

import React, { useState } from 'react';
import { Box, Typography, Chip, Tooltip, IconButton, Collapse } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface BuildInfoProps {
  variant?: 'full' | 'compact';
}

export default function BuildInfo({ variant = 'full' }: BuildInfoProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Get build info with proper fallbacks
  const commitHash = process.env.NEXT_PUBLIC_BUILD_VERSION || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev-local';
  const timeAgo = process.env.NEXT_PUBLIC_BUILD_TIME_AGO || 'just now';
  const branch = process.env.NEXT_PUBLIC_BUILD_BRANCH || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'main';
  
  // Build environment info
  const nodeEnv = process.env.NODE_ENV || 'development';
  const buildTime = typeof window !== 'undefined'
    ? new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toISOString().split('T')[0];
  
  if (variant === 'compact') {
    const displayHash = commitHash.length > 7 ? commitHash.substring(0, 7) : commitHash;
    return (
      <Tooltip title={`Version ${commitHash} • ${branch} branch • Built ${timeAgo}`}>
        <Chip
          icon={<CodeIcon sx={{ fontSize: 16 }} />}
          label={`v${displayHash}`}
          size="small"
          sx={{
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: '0.75rem',
            '& .MuiChip-icon': { color: '#2563eb' },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-end' },
        }}
      >
        <Tooltip title="Git Commit Hash">
          <Chip
            icon={<CodeIcon sx={{ fontSize: 14 }} />}
            label={commitHash.substring(0, 7)}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'rgba(37, 99, 235, 0.3)',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              '& .MuiChip-icon': { color: '#2563eb' },
            }}
          />
        </Tooltip>

        <Tooltip title="Last Commit Time">
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
            label={timeAgo}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.7rem',
              '& .MuiChip-icon': { color: '#10b981' },
            }}
          />
        </Tooltip>

        <Tooltip title="Git Branch">
          <Chip
            icon={<AccountTreeIcon sx={{ fontSize: 14 }} />}
            label={branch}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'capitalize',
              '& .MuiChip-icon': { color: '#f59e0b' },
            }}
          />
        </Tooltip>

        <Tooltip title={expanded ? 'Hide build details' : 'Show build details'}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: '#64748b',
              width: 24,
              height: 24,
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'rgba(15, 23, 42, 0.02)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(148, 163, 184, 0.1)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#64748b',
              fontWeight: 700,
              mb: 1,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 14 }} />
            Build Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              <strong>Commit:</strong> {commitHash}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              <strong>Branch:</strong> {branch}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              <strong>Updated:</strong> {timeAgo}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              <strong>Environment:</strong> {nodeEnv}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              <strong>Build Date:</strong> {buildTime}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              <strong>Platform:</strong> Vercel (Next.js 16.2.7)
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
