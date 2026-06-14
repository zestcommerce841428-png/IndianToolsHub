import { NextResponse } from 'next/server';

/**
 * GET /api/deployment-status
 * Check current deployment version and build information
 */
export async function GET() {
  return NextResponse.json({
    deployment: {
      commitHash: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
      commitShort: (process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown').substring(0, 7),
      timeAgo: process.env.NEXT_PUBLIC_BUILD_TIME_AGO || 'unknown',
      branch: process.env.NEXT_PUBLIC_BUILD_BRANCH || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      vercelUrl: process.env.VERCEL_URL || 'localhost',
    },
    buildTime: new Date().toISOString(),
    features: {
      accessibility: '80+ features',
      magicLink: 'enabled (check spam folder)',
      contact: 'enabled with WhatsApp',
      otp: 'enabled (check spam folder)',
    },
    latestCommits: [
      '5d30d8d - Phase 4-5: Complete Accessibility System (80+ Features)',
      '47371ff - Phase 2-3: Advanced Accessibility Features + Magic Link Fix',
      'b5c353f - Phase 1: Accessibility System V2 Foundation',
      '701af8e - Integrate contact page and WhatsApp',
    ],
    note: 'If you see old commit hash, hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)',
  });
}
