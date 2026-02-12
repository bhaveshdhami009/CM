import rateLimit from 'express-rate-limit';

// 1. General Limiter: Applied to all routes
// Allow 1000 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 1000, 
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// 2. Auth Limiter: Applied ONLY to Login/Register
// Allow 10 attempts per 5 min per IP
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10, // Limit each IP to 10 create account/login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many login attempts from this IP, please try again after an hour'
  }
});