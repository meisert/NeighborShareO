/**
 * Security & Attack Mitigation Utilities
 * Defense against XSS, input flooding (DoS), malicious protocol injections, and bot spam.
 */

// Basic HTML and script injection patterns
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /<iframe\b/gi,
];

/**
 * Sanitizes user-entered text by stripping executable tags,
 * escaping angle brackets, and capping max length to prevent payload inflation attacks.
 */
export function sanitizeText(input: string | undefined | null, maxLength = 2000): string {
  if (!input) return '';

  let sanitized = String(input);

  // Strip dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Escape HTML angle brackets to prevent DOM injection
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Truncate to maximum allowable length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Validates and cleans image / external URLs to prevent javascript: or data: injection.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const clean = url.trim();

  // Allow standard http/https URLs or safe local asset paths
  if (
    clean.startsWith('https://') ||
    clean.startsWith('http://') ||
    clean.startsWith('/') ||
    clean.startsWith('data:image/')
  ) {
    // Check for nested javascript or dangerous protocols
    if (/javascript:|data:text\/html/i.test(clean)) {
      return '';
    }
    return clean;
  }

  return '';
}

/**
 * Honeypot Bot Detector
 * Bots usually fill in every field in a form including hidden ones.
 * Real users never touch or see this field.
 */
export function isBotSubmission(honeypotValue: string | undefined | null): boolean {
  return Boolean(honeypotValue && honeypotValue.trim().length > 0);
}

/**
 * Client-Side Rate Limiter & Cooldown Manager
 * Tracks timestamps of user actions to prevent rapid spamming (Layer 7 click/request flooding).
 */
export class ClientRateLimiter {
  private static timestamps: Record<string, number[]> = {};

  /**
   * Checks if an action is allowed within a sliding time window.
   * @param key Unique action identifier (e.g. 'submit_borrow', 'post_iso')
   * @param maxHits Maximum permitted actions within the window
   * @param windowMs Window duration in milliseconds (default: 10 seconds)
   */
  public static isAllowed(key: string, maxHits = 5, windowMs = 10000): {
    allowed: boolean;
    remainingHits: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const hits = this.timestamps[key] || [];

    // Filter out expired timestamps
    const recentHits = hits.filter((t) => now - t < windowMs);

    if (recentHits.length >= maxHits) {
      const oldest = recentHits[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        allowed: false,
        remainingHits: 0,
        resetInSeconds,
      };
    }

    recentHits.push(now);
    this.timestamps[key] = recentHits;

    return {
      allowed: true,
      remainingHits: maxHits - recentHits.length,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  public static reset(key: string): void {
    delete this.timestamps[key];
  }
}
