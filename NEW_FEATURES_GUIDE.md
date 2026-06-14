# 🚀 New Features Implementation Guide

**Date:** June 10, 2026  
**Version:** 2.1  
**Status:** All Features Implemented

---

## 📋 Table of Contents

1. [Rate Limiting & Cooldown](#rate-limiting--cooldown)
2. [Password Change with OTP](#password-change-with-otp)
3. [Password Reset (Forgot Password)](#password-reset-forgot-password)
4. [Sentry Error Monitoring](#sentry-error-monitoring)
5. [Google Analytics Integration](#google-analytics-integration)
6. [Environment Variables](#environment-variables)
7. [Testing Guide](#testing-guide)

---

## 🛡️ Rate Limiting & Cooldown

### Overview
Protects OTP endpoints from abuse with both rate limiting and cooldown periods.

### Implementation
**File:** [`src/utils/rateLimiter.ts`](src/utils/rateLimiter.ts:1)

### Features
- **Rate Limiting:** Maximum 3 OTP requests per 15 minutes
- **Cooldown:** 60 seconds between consecutive requests
- **Automatic Cleanup:** Old entries are garbage collected
- **Configurable:** Different limits for OTP, password reset, and login

### Configuration

```typescript
export const RATE_LIMIT_CONFIG = {
  OTP: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    cooldownMs: 60 * 1000, // 60 seconds
  },
  PASSWORD_RESET: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    cooldownMs: 60 * 1000, // 60 seconds
  },
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    cooldownMs: 5 * 1000, // 5 seconds
  },
};
```

### Usage

```typescript
import { withRateLimit } from '@/utils/rateLimiter';

const rateLimitCheck = withRateLimit(`otp:${email}`, 'OTP');
if (!rateLimitCheck.success) {
  return NextResponse.json(
    { error: rateLimitCheck.error },
    { status: rateLimitCheck.status || 429 }
  );
}
```

### Integrated Endpoints
✅ [`/api/auth/send-otp`](src/app/api/auth/send-otp/route.ts:1)  
✅ [`/api/auth/send-backup-otp`](src/app/api/auth/send-backup-otp/route.ts:1)  
✅ [`/api/auth/password/change`](src/app/api/auth/password/change/route.ts:1)  
✅ [`/api/auth/password/reset`](src/app/api/auth/password/reset/route.ts:1)

### Error Messages
- **Rate Limited:** "Too many attempts. Please try again in X minutes."
- **Cooldown:** "Please wait X seconds before requesting again."

---

## 🔐 Password Change with OTP

### Overview
Allows users to change their password securely with OTP verification.

### Implementation
**File:** [`src/app/api/auth/password/change/route.ts`](src/app/api/auth/password/change/route.ts:1)

### API Endpoints

#### 1. Send OTP
**POST** `/api/auth/password/change`

**Request Body:**
```json
{
  "email": "user@example.com",
  "userId": "firebase-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresIn": 600
}
```

#### 2. Verify OTP & Change Password
**PUT** `/api/auth/password/change`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123",
  "userId": "firebase-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Security Features
- ✅ OTP expires in 10 minutes
- ✅ Rate limiting (3 attempts per 15 minutes)
- ✅ 60-second cooldown between requests
- ✅ Password strength validation (minimum 6 characters)
- ✅ Security context logged (IP, browser, location)
- ✅ Confirmation email sent after successful change

### Frontend Integration Example

```typescript
// Send OTP
const sendPasswordChangeOTP = async (email: string, userId: string) => {
  const response = await fetch('/api/auth/password/change', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, userId }),
  });
  return response.json();
};

// Change password
const changePassword = async (email: string, otp: string, newPassword: string, userId: string) => {
  const response = await fetch('/api/auth/password/change', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword, userId }),
  });
  return response.json();
};
```

---

## 🔑 Password Reset (Forgot Password)

### Overview
Complete password reset flow for users who forgot their password.

### Implementation
**File:** [`src/app/api/auth/password/reset/route.ts`](src/app/api/auth/password/reset/route.ts:1)

### API Endpoints

#### 1. Request Password Reset
**POST** `/api/auth/password/reset`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email",
  "expiresIn": 900
}
```

#### 2. Verify OTP & Reset Password
**PUT** `/api/auth/password/reset`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email. Please check your inbox."
}
```

### Security Features
- ✅ OTP expires in 15 minutes
- ✅ Rate limiting (5 attempts per hour)
- ✅ 60-second cooldown between requests
- ✅ Email validation
- ✅ Uses Firebase password reset email (secure)
- ✅ Security context logged
- ✅ Rate limit reset after successful verification

### Flow
1. User requests password reset → OTP sent to email
2. User enters OTP → Verified
3. Firebase password reset link sent
4. User clicks link → Sets new password via Firebase

---

## 📊 Sentry Error Monitoring

### Overview
Comprehensive error tracking and performance monitoring using Sentry.

### Implementation
**Files:**
- [`src/utils/sentry.ts`](src/utils/sentry.ts:1) - Sentry utility
- [`SENTRY_SETUP.md`](SENTRY_SETUP.md:1) - Setup guide

### Installation

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Environment Variables

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
```

### Features
- ✅ Automatic error tracking
- ✅ Performance monitoring (10% sample rate)
- ✅ Session replay (10% sessions, 100% on errors)
- ✅ Sensitive data filtering (passwords, OTPs, tokens)
- ✅ User context tracking
- ✅ Custom breadcrumbs
- ✅ Production-only activation

### Usage Examples

```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from '@/utils/sentry';

// Capture errors
try {
  throw new Error('Something went wrong');
} catch (error) {
  captureException(error as Error, { userId: '123', action: 'submit' });
}

// Log messages
captureMessage('User completed checkout', 'info');

// Set user context
setUser({
  id: user.uid,
  email: user.email,
  username: user.displayName
});

// Add breadcrumb
addBreadcrumb('Button clicked', 'user-action', { buttonId: 'submit' });
```

### Dashboard
Access: https://sentry.io/organizations/[your-org]/issues/

---

## 📈 Google Analytics Integration

### Overview
Complete GA4 integration for tracking user behavior and engagement.

### Implementation
**Files:**
- [`src/utils/analytics.ts`](src/utils/analytics.ts:1) - Analytics utility
- [`src/components/GoogleAnalytics.tsx`](src/components/GoogleAnalytics.tsx:1) - Analytics component

### Environment Variable

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Setup

1. **Add to Root Layout** (`src/app/layout.tsx`):

```typescript
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
```

2. **Get Measurement ID:**
   - Go to https://analytics.google.com
   - Admin → Data Streams → Your Web Stream
   - Copy Measurement ID (starts with G-)

### Tracking Functions

#### Page Views
```typescript
import { trackPageView } from '@/utils/analytics';

trackPageView('/tools/calculator', 'Calculator Tool');
```

#### Custom Events
```typescript
import { trackEvent } from '@/utils/analytics';

trackEvent('button_click', 'Engagement', 'Download Button');
```

#### Tool Usage
```typescript
import { trackToolUsage } from '@/utils/analytics';

trackToolUsage('QR Code Generator', 'Utility');
```

#### User Actions
```typescript
import { 
  trackSignup, 
  trackLogin, 
  trackLogout,
  trackSearch 
} from '@/utils/analytics';

trackSignup('email'); // or 'google', 'github'
trackLogin('email');
trackLogout();
trackSearch('pdf converter');
```

#### File Operations
```typescript
import { trackFileOperation } from '@/utils/analytics';

trackFileOperation('upload', 'pdf');
trackFileOperation('convert', 'jpg-to-png');
```

#### Errors
```typescript
import { trackError } from '@/utils/analytics';

trackError('validation_error', 'signup_form');
```

### Available Tracking Functions
- ✅ `trackPageView()` - Page navigation
- ✅ `trackEvent()` - Custom events
- ✅ `trackToolUsage()` - Tool interactions
- ✅ `trackSignup()` - User registration
- ✅ `trackLogin()` / `trackLogout()` - Authentication
- ✅ `trackSearch()` - Search queries
- ✅ `trackFileOperation()` - File uploads/downloads
- ✅ `trackButtonClick()` - Button interactions
- ✅ `trackError()` - Error occurrences
- ✅ `trackFormSubmission()` - Form completions
- ✅ `trackShare()` - Social sharing
- ✅ `trackOutboundLink()` - External links
- ✅ `trackPerformance()` - Performance metrics
- ✅ `trackFeatureUsage()` - Feature adoption

---

## 🔧 Environment Variables

### Complete List

Add these to your `.env.local` and production environment:

```env
# Existing Variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password

# Hostinger API (for file uploads)
NEXT_PUBLIC_HOSTINGER_API_URL=your_hostinger_api_url
NEXT_PUBLIC_UPLOAD_SECRET=your_upload_secret

# NEW: Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_organization
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token

# NEW: Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Vercel Deployment

Add all environment variables in:
**Project Settings → Environment Variables**

---

## 🧪 Testing Guide

### 1. Rate Limiting Test

```bash
# Send multiple OTP requests quickly
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should get cooldown error after 1st request
# Should get rate limit error after 3rd request
```

### 2. Password Change Test

```typescript
// 1. Send OTP
const response1 = await fetch('/api/auth/password/change', {
  method: 'POST',
  body: JSON.stringify({ 
    email: 'test@example.com',
    userId: 'user-id'
  })
});

// 2. Check email for OTP

// 3. Change password
const response2 = await fetch('/api/auth/password/change', {
  method: 'PUT',
  body: JSON.stringify({ 
    email: 'test@example.com',
    otp: '123456',
    newPassword: 'NewPassword123',
    userId: 'user-id'
  })
});
```

### 3. Password Reset Test

```typescript
// 1. Request reset
const response1 = await fetch('/api/auth/password/reset', {
  method: 'POST',
  body: JSON.stringify({ email: 'test@example.com' })
});

// 2. Verify OTP
const response2 = await fetch('/api/auth/password/reset', {
  method: 'PUT',
  body: JSON.stringify({ 
    email: 'test@example.com',
    otp: '123456',
    newPassword: 'NewPassword123'
  })
});

// 3. Check email for Firebase reset link
```

### 4. Analytics Test

```typescript
import { trackToolUsage, trackEvent } from '@/utils/analytics';

// Open browser console
// Check for gtag calls
trackToolUsage('Test Tool', 'Test Category');
trackEvent('test_event', 'Testing', 'Test Label');

// Verify in GA4: Realtime → Events
```

### 5. Sentry Test

```typescript
import { captureException, captureMessage } from '@/utils/sentry';

// Trigger test error
try {
  throw new Error('Test error for Sentry');
} catch (error) {
  captureException(error as Error, { test: true });
}

captureMessage('Test message', 'info');

// Check Sentry dashboard for events
```

---

## 📦 Files Created

### New Files (11)
1. [`src/utils/rateLimiter.ts`](src/utils/rateLimiter.ts:1) - Rate limiting utility
2. [`src/app/api/auth/password/change/route.ts`](src/app/api/auth/password/change/route.ts:1) - Password change API
3. [`src/app/api/auth/password/reset/route.ts`](src/app/api/auth/password/reset/route.ts:1) - Password reset API
4. [`src/utils/sentry.ts`](src/utils/sentry.ts:1) - Sentry configuration
5. [`src/utils/analytics.ts`](src/utils/analytics.ts:1) - Google Analytics utility
6. [`src/components/GoogleAnalytics.tsx`](src/components/GoogleAnalytics.tsx:1) - Analytics component
7. [`SENTRY_SETUP.md`](SENTRY_SETUP.md:1) - Sentry setup guide
8. [`NEW_FEATURES_GUIDE.md`](NEW_FEATURES_GUIDE.md:1) - This document

### Modified Files (3)
1. [`src/app/api/auth/send-otp/route.ts`](src/app/api/auth/send-otp/route.ts:1) - Added rate limiting
2. [`src/app/api/auth/send-backup-otp/route.ts`](src/app/api/auth/send-backup-otp/route.ts:1) - Added rate limiting
3. [`package.json`](package.json:1) - Dependencies (to be updated)

---

## 🚀 Deployment Checklist

- [ ] Install Sentry: `npm install @sentry/nextjs`
- [ ] Run Sentry wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Add Google Analytics to layout
- [ ] Set all environment variables in Vercel
- [ ] Test rate limiting in staging
- [ ] Test password change flow
- [ ] Test password reset flow
- [ ] Verify Sentry dashboard
- [ ] Verify GA4 dashboard
- [ ] Deploy to production

---

## 📞 Support

For issues or questions:
- Check the setup guides
- Review error logs in Sentry
- Check analytics in GA4
- Contact: support@indiantoolshub.com

---

**Documentation Version:** 2.1  
**Last Updated:** June 10, 2026  
**Status:** ✅ All Features Documented
