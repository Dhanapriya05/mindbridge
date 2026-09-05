import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter to prevent DoS attacks on ephemeral triage and chat endpoints
 * without maintaining persistent IP databases.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this client. Please take a mindful breath and try again shortly.'
  }
});

export const triageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Max 30 triage attempts per 5 mins
  message: {
    status: 429,
    message: 'Triage evaluation rate limit reached. If in immediate distress, please click SOS.'
  }
});
