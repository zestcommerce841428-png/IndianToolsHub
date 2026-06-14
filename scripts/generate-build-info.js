#!/usr/bin/env node

/**
 * Generate build information from Git
 * Sets environment variables for build version, time, and branch
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn(`Warning: Failed to execute "${command}":`, error.message);
    return '';
  }
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const commitDate = new Date(timestamp);
  const diffMs = now - commitDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'just now';
}

// Get git information
const commitHash = execCommand('git rev-parse HEAD') || 'dev-local';
const commitTimestamp = execCommand('git log -1 --format=%cd --date=iso');
const branch = execCommand('git rev-parse --abbrev-ref HEAD') || 'main';
const timeAgo = commitTimestamp ? getTimeAgo(commitTimestamp) : 'local build';

// Create .env.local file with build info
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

// Read existing .env.local if it exists
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  // Remove old build info
  envContent = envContent
    .split('\n')
    .filter(line => !line.startsWith('NEXT_PUBLIC_BUILD_'))
    .join('\n');
}

// Append new build info
const buildInfo = `
# Auto-generated build information (do not edit manually)
NEXT_PUBLIC_BUILD_VERSION=${commitHash}
NEXT_PUBLIC_BUILD_TIME_AGO=${timeAgo}
NEXT_PUBLIC_BUILD_BRANCH=${branch}
NEXT_PUBLIC_BUILD_TIMESTAMP=${new Date().toISOString()}
`;

envContent = (envContent.trim() + '\n' + buildInfo).trim() + '\n';

fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Build information generated successfully!');
console.log(`   Commit: ${commitHash.substring(0, 7)}`);
console.log(`   Branch: ${branch}`);
console.log(`   Updated: ${timeAgo}`);
