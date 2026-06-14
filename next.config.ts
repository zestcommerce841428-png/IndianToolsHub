import type { NextConfig } from "next";
import { execSync } from 'child_process';
import { withSentryConfig } from '@sentry/nextjs';

const getGitInfo = () => {
  try {
    const commitHash = execSync('git log -1 --format="%h"', { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim().replace(/['"]/g, '');
    const timeAgo = execSync('git log -1 --format="%cr"', { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim().replace(/['"]/g, '');
    let branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim().replace(/['"]/g, '');
    if (branch === 'main') branch = 'Main';
    if (branch === 'master') branch = 'Master';
    return { commitHash, timeAgo, branch };
  } catch (e) {
    // Return default values when git is not available (e.g., in Vercel build environment)
    // Use VERCEL_GIT environment variables as fallback
    return {
      commitHash: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'latest',
      timeAgo: 'just now',
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'Main'
    };
  }
};

const gitInfo = getGitInfo();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_VERSION: gitInfo.commitHash,
    NEXT_PUBLIC_BUILD_TIME_AGO: gitInfo.timeAgo,
    NEXT_PUBLIC_BUILD_BRANCH: gitInfo.branch,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "default-org",
  project: process.env.SENTRY_PROJECT || "default-project",
  
  // Disable source map upload if auth token is not set
  ...(process.env.SENTRY_AUTH_TOKEN ? {} : { disableServerWebpackPlugin: true, disableClientWebpackPlugin: true }),

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
