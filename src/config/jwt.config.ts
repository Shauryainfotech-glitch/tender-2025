// config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  // Access Token Configuration
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  
  // Refresh Token Configuration
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Token Configuration
  issuer: process.env.JWT_ISSUER || 'tender-management-system',
  audience: process.env.JWT_AUDIENCE || 'tender-management-users',
  
  // Security Options
  algorithm: process.env.JWT_ALGORITHM || 'HS256',
  ignoreExpiration: process.env.JWT_IGNORE_EXPIRATION === 'true',
  
  // Cookie Configuration (for web clients)
  cookieName: process.env.JWT_COOKIE_NAME || 'access_token',
  cookieOptions: {
    httpOnly: process.env.JWT_COOKIE_HTTP_ONLY !== 'false',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.JWT_COOKIE_SAME_SITE || 'strict',
    maxAge: parseInt(process.env.JWT_COOKIE_MAX_AGE, 10) || 900000, // 15 minutes
  },
  
  // Refresh Cookie Configuration
  refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'refresh_token',
  refreshCookieOptions: {
    httpOnly: process.env.JWT_REFRESH_COOKIE_HTTP_ONLY !== 'false',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.JWT_REFRESH_COOKIE_SAME_SITE || 'strict',
    maxAge: parseInt(process.env.JWT_REFRESH_COOKIE_MAX_AGE, 10) || 604800000, // 7 days
  },
  
  // Blacklist Configuration
  blacklistEnabled: process.env.JWT_BLACKLIST_ENABLED === 'true',
  blacklistTTL: parseInt(process.env.JWT_BLACKLIST_TTL, 10) || 86400, // 24 hours
  
  // Rate Limiting for Token Generation
  rateLimitEnabled: process.env.JWT_RATE_LIMIT_ENABLED === 'true',
  rateLimitMax: parseInt(process.env.JWT_RATE_LIMIT_MAX, 10) || 5,
  rateLimitTTL: parseInt(process.env.JWT_RATE_LIMIT_TTL, 10) || 900, // 15 minutes
}));

export default jwtConfig;
