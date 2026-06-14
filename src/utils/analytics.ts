/**
 * Google Analytics 4 (GA4) Integration
 * Tracks page views, events, and user interactions
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

// GA4 Measurement ID from environment
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Check if Google Analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production');
};

/**
 * Initialize Google Analytics
 */
export const initGA = (): void => {
  if (!isAnalyticsEnabled()) return;

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  });
};

/**
 * Track page views
 * @param url - Page URL
 * @param title - Page title
 */
export const trackPageView = (url: string, title?: string): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

/**
 * Track custom events
 * @param action - Event action
 * @param category - Event category
 * @param label - Event label
 * @param value - Event value (optional)
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Track tool usage
 */
export const trackToolUsage = (toolName: string, toolCategory: string): void => {
  trackEvent('tool_used', 'Tools', `${toolCategory}/${toolName}`);
};

/**
 * Track user signup
 */
export const trackSignup = (method: string): void => {
  trackEvent('sign_up', 'Authentication', method);
};

/**
 * Track user login
 */
export const trackLogin = (method: string): void => {
  trackEvent('login', 'Authentication', method);
};

/**
 * Track user logout
 */
export const trackLogout = (): void => {
  trackEvent('logout', 'Authentication');
};

/**
 * Track search queries
 */
export const trackSearch = (searchTerm: string): void => {
  trackEvent('search', 'Search', searchTerm);
};

/**
 * Track file operations
 */
export const trackFileOperation = (
  operation: 'upload' | 'download' | 'convert' | 'compress',
  fileType?: string
): void => {
  trackEvent(operation, 'File Operations', fileType);
};

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonName: string, location: string): void => {
  trackEvent('button_click', 'Engagement', `${location}/${buttonName}`);
};

/**
 * Track errors (non-sensitive data only)
 */
export const trackError = (errorType: string, errorLocation: string): void => {
  trackEvent('error', 'Errors', `${errorLocation}/${errorType}`);
};

/**
 * Track form submissions
 */
export const trackFormSubmission = (formName: string, success: boolean): void => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_failure',
    'Forms',
    formName
  );
};

/**
 * Track social sharing
 */
export const trackShare = (method: string, contentType: string): void => {
  trackEvent('share', 'Social', `${method}/${contentType}`);
};

/**
 * Track external link clicks
 */
export const trackOutboundLink = (url: string, label?: string): void => {
  trackEvent('outbound_link', 'Navigation', label || url);
};

/**
 * Set user properties (without PII)
 */
export const setUserProperties = (properties: {
  userType?: 'free' | 'premium' | 'admin';
  preferredLanguage?: string;
  theme?: 'light' | 'dark';
}): void => {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
};

/**
 * Track performance metrics
 */
export const trackPerformance = (metricName: string, value: number, unit: string): void => {
  trackEvent('performance_metric', 'Performance', `${metricName} (${unit})`, value);
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName: string): void => {
  trackEvent('feature_used', 'Features', featureName);
};

/**
 * Track tutorial progress
 */
export const trackTutorial = (action: 'start' | 'complete' | 'skip', tutorialName: string): void => {
  trackEvent(`tutorial_${action}`, 'Tutorials', tutorialName);
};

/**
 * Track notification interactions
 */
export const trackNotification = (action: 'shown' | 'clicked' | 'dismissed', notificationType: string): void => {
  trackEvent(`notification_${action}`, 'Notifications', notificationType);
};

// Export all functions
export default {
  initGA,
  trackPageView,
  trackEvent,
  trackToolUsage,
  trackSignup,
  trackLogin,
  trackLogout,
  trackSearch,
  trackFileOperation,
  trackButtonClick,
  trackError,
  trackFormSubmission,
  trackShare,
  trackOutboundLink,
  setUserProperties,
  trackPerformance,
  trackFeatureUsage,
  trackTutorial,
  trackNotification,
};
