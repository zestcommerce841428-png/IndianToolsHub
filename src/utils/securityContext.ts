// Security context detection utilities

export interface SecurityContext {
  ip: string;
  browser: string;
  location: string;
  timestamp: string;
  userAgent: string;
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: Request): string {
  // Try multiple headers as different proxies use different ones
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  const vercelForwardedFor = req.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  return 'Unknown';
}

/**
 * Parse user agent to get browser information
 */
export function getBrowserInfo(userAgent: string): string {
  if (!userAgent) return 'Unknown Browser';

  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return match ? `Chrome ${match[1]}` : 'Chrome';
  }

  // Edge
  if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return match ? `Edge ${match[1]}` : 'Edge';
  }

  // Firefox
  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return match ? `Firefox ${match[1]}` : 'Firefox';
  }

  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return match ? `Safari ${match[1]}` : 'Safari';
  }

  // Opera
  if (userAgent.includes('OPR')) {
    const match = userAgent.match(/OPR\/(\d+)/);
    return match ? `Opera ${match[1]}` : 'Opera';
  }

  return 'Unknown Browser';
}

/**
 * Get device and OS information
 */
export function getDeviceInfo(userAgent: string): string {
  if (!userAgent) return '';

  // Mobile detection
  if (/Mobile|Android|iPhone|iPad|iPod/.test(userAgent)) {
    if (userAgent.includes('Android')) {
      return ' on Android';
    }
    if (userAgent.includes('iPhone')) {
      return ' on iPhone';
    }
    if (userAgent.includes('iPad')) {
      return ' on iPad';
    }
    return ' on Mobile';
  }

  // Desktop OS detection
  if (userAgent.includes('Win')) {
    return ' on Windows';
  }
  if (userAgent.includes('Mac')) {
    return ' on macOS';
  }
  if (userAgent.includes('Linux')) {
    return ' on Linux';
  }

  return '';
}

/**
 * Get location from IP address (simplified - returns country/city if available)
 */
export async function getLocationFromIP(ip: string): Promise<string> {
  try {
    // Skip for local/private IPs
    if (ip === 'Unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1' || ip === '::1') {
      return 'Local Network';
    }

    // Using ip-api.com free API (100 requests per minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return 'Unknown Location';
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      const parts = [];
      if (data.city) parts.push(data.city);
      if (data.regionName) parts.push(data.regionName);
      if (data.country) parts.push(data.country);
      return parts.join(', ') || 'Unknown Location';
    }

    return 'Unknown Location';
  } catch (error) {
    console.error('Location detection error:', error);
    return 'Unknown Location';
  }
}

/**
 * Get complete security context from request
 */
export async function getSecurityContext(req: Request): Promise<SecurityContext> {
  const userAgent = req.headers.get('user-agent') || '';
  const ip = getClientIP(req);
  const browser = getBrowserInfo(userAgent) + getDeviceInfo(userAgent);
  const location = await getLocationFromIP(ip);
  const timestamp = new Date().toISOString();

  return {
    ip,
    browser,
    location,
    timestamp,
    userAgent
  };
}
