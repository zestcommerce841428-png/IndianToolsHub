# Sentry Setup Guide

## Installation

To enable Sentry error monitoring, follow these steps:

### 1. Install Sentry Dependencies

```bash
npm install @sentry/nextjs
# or
yarn add @sentry/nextjs
```

### 2. Configure Sentry

Run the Sentry wizard to set up configuration:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will create the following files:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` (updated)

### 3. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

Get your DSN from: https://sentry.io/settings/[your-org]/projects/[your-project]/keys/

### 4. Sentry Configuration

The Sentry utility file is located at: `src/utils/sentry.ts`

It includes:
- Automatic error tracking
- Performance monitoring
- Session replay
- User context tracking
- Sensitive data filtering

### 5. Usage in Code

```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from '@/utils/sentry';

// Capture errors
try {
  // your code
} catch (error) {
  captureException(error as Error, { context: 'additional info' });
}

// Log messages
captureMessage('User completed signup', 'info');

// Set user context
setUser({
  id: user.uid,
  email: user.email,
  username: user.displayName
});

// Add breadcrumbs for tracking
addBreadcrumb('Button clicked', 'user-action', { buttonId: 'submit' });
```

### 6. Production Deployment

Add these environment variables to your Vercel/hosting platform:
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (for source maps)
- `SENTRY_ORG`
- `SENTRY_PROJECT`

### Features Enabled

✅ Error tracking
✅ Performance monitoring (10% sample rate)
✅ Session replay (10% of sessions, 100% on errors)
✅ Sensitive data filtering (passwords, OTPs, tokens)
✅ User context tracking
✅ Custom breadcrumbs

### Dashboard Access

Access your Sentry dashboard at: https://sentry.io/organizations/[your-org]/issues/

## Cost

Sentry offers a free tier:
- 5,000 errors per month
- 10,000 performance units
- 50 replays per month

For production use, consider upgrading based on traffic.
