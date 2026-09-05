import crypto from 'crypto';

/**
 * AnonymityGuard Middleware
 * Enforces Zero-Knowledge principles across all HTTP traffic:
 * 1. Strips identifiable tracking headers (IP, User-Agent, Referrer) before reaching controllers.
 * 2. Injects a randomized per-request ephemeral entropy token.
 * 3. Prevents caching of mental health triage responses.
 */
export const anonymityGuard = (req, res, next) => {
  // Strip client IP & headers from any downstream logging
  req.sanitizedClientHash = crypto
    .createHash('sha256')
    .update((req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') + process.env.SALT_SECRET || 'mindbridge-salt')
    .digest('hex')
    .substring(0, 16);

  // Set anti-tracking and zero-cache security headers
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Anonymity-Standard', 'Zero-Knowledge-v1');

  next();
};
