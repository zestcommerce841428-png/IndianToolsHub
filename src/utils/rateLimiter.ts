/**
 * Rate Limiter Utility
 * Prevents abuse of OTP endpoints and other sensitive operations
 * Implements both IP-based and email-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore: RateLimitStore = {};
const cooldownStore: RateLimitStore = {};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  OTP: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    cooldownMs: 60 * 1000, // 60 seconds between requests
  },
  PASSWORD_RESET: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    cooldownMs: 60 * 1000, // 60 seconds between requests
  },
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    cooldownMs: 5 * 1000, // 5 seconds between requests
  },
};

/**
 * Clean up old entries (garbage collection)
 */
function cleanupOldEntries(store: RateLimitStore, windowMs: number): void {
  const now = Date.now();
  for (const key in store) {
    if (now - store[key].firstAttempt > windowMs) {
      delete store[key];
    }
  }
}

/**
 * Check if an action is rate limited
 * @param identifier - Unique identifier (email, IP, or combination)
 * @param type - Type of action (OTP, PASSWORD_RESET, LOGIN)
 * @returns Object with isAllowed flag and remaining info
 */
export function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG = 'OTP'
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
} {
  const config = RATE_LIMIT_CONFIG[type];
  const now = Date.now();
  
  // Clean up old entries
  cleanupOldEntries(rateLimitStore, config.windowMs);
  
  // Check if entry exists
  const entry = rateLimitStore[identifier];
  
  if (!entry) {
    // First attempt - allow and create entry
    rateLimitStore[identifier] = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  // Check if window has expired
  if (now - entry.firstAttempt > config.windowMs) {
    // Reset the window
    rateLimitStore[identifier] = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  // Check if max attempts exceeded
  if (entry.count >= config.maxAttempts) {
    const resetTime = entry.firstAttempt + config.windowMs;
    const minutesRemaining = Math.ceil((resetTime - now) / 60000);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      error: `Too many attempts. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`,
    };
  }
  
  // Increment count and allow
  entry.count++;
  entry.lastAttempt = now;
  
  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.firstAttempt + config.windowMs,
  };
}

/**
 * Check cooldown period between requests
 * @param identifier - Unique identifier
 * @param type - Type of action
 * @returns Object with allowed flag and remaining cooldown time
 */
export function checkCooldown(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG = 'OTP'
): {
  allowed: boolean;
  remainingSeconds: number;
  error?: string;
} {
  const config = RATE_LIMIT_CONFIG[type];
  const now = Date.now();
  
  // Clean up old entries
  cleanupOldEntries(cooldownStore, config.cooldownMs);
  
  const entry = cooldownStore[identifier];
  
  if (!entry) {
    // First request - allow and create entry
    cooldownStore[identifier] = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    
    return {
      allowed: true,
      remainingSeconds: 0,
    };
  }
  
  const timeSinceLastAttempt = now - entry.lastAttempt;
  
  if (timeSinceLastAttempt < config.cooldownMs) {
    const remainingMs = config.cooldownMs - timeSinceLastAttempt;
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    return {
      allowed: false,
      remainingSeconds,
      error: `Please wait ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} before requesting again.`,
    };
  }
  
  // Update last attempt time
  entry.lastAttempt = now;
  
  return {
    allowed: true,
    remainingSeconds: 0,
  };
}

/**
 * Reset rate limit for an identifier (use sparingly, e.g., after successful verification)
 */
export function resetRateLimit(identifier: string): void {
  delete rateLimitStore[identifier];
  delete cooldownStore[identifier];
}

/**
 * Get current rate limit status for monitoring
 */
export function getRateLimitStatus(identifier: string): {
  inStore: boolean;
  attempts?: number;
  resetTime?: number;
} {
  const entry = rateLimitStore[identifier];
  
  if (!entry) {
    return { inStore: false };
  }
  
  return {
    inStore: true,
    attempts: entry.count,
    resetTime: entry.firstAttempt + RATE_LIMIT_CONFIG.OTP.windowMs,
  };
}

/**
 * Middleware helper for Next.js API routes
 * Returns a function that checks rate limits and returns appropriate response
 */
export function withRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG = 'OTP'
): { success: boolean; error?: string; status?: number } {
  // Check cooldown first
  const cooldown = checkCooldown(identifier, type);
  if (!cooldown.allowed) {
    return {
      success: false,
      error: cooldown.error,
      status: 429,
    };
  }
  
  // Check rate limit
  const rateLimit = checkRateLimit(identifier, type);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: rateLimit.error,
      status: 429,
    };
  }
  
  return { success: true };
}
