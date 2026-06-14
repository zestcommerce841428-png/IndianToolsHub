/**
 * Sentry Configuration for Application Monitoring
 * Tracks errors, performance, and user interactions
 */

import * as Sentry from '@sentry/nextjs';

// Initialize Sentry only in production
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    
    // Capture 100% of errors
    sampleRate: 1.0,
    
    // Set the environment
    environment: process.env.NODE_ENV,
    
    // Enable Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        // Trace all navigation and interactions
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.vercel\.app/,
          /^https:\/\/indian-tools-hub\.vercel\.app/,
        ],
      }),
      new Sentry.Replay({
        // Mask all text content for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events with passwords or tokens
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'object') {
          delete data.password;
          delete data.newPassword;
          delete data.otp;
          delete data.token;
          delete data.secret;
        }
      }
      
      // Filter out breadcrumbs with sensitive data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            delete breadcrumb.data.password;
            delete breadcrumb.data.otp;
            delete breadcrumb.data.token;
          }
          return breadcrumb;
        });
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'Non-Error promise rejection captured',
      // Network errors (common and not actionable)
      'NetworkError',
      'Failed to fetch',
      // React hydration mismatches (usually harmless)
      'Hydration failed',
      'There was an error while hydrating',
    ],
  });
}

// Helper functions for manual error tracking

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
}

/**
 * Capture a message (info, warning, error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: 'info',
      data,
    });
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): Sentry.Transaction | null {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          captureException(error, context);
          throw error;
        });
      }
      return result;
    } catch (error) {
      captureException(error as Error, context);
      throw error;
    }
  }) as T;
}

export default Sentry;
