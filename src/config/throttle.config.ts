import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttleConfig = (): ThrottlerModuleOptions => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '60', 10), // Time window in seconds
  limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // Number of requests per time window
  skipIf: (context) => {
    // Skip rate limiting for certain endpoints
    const request = context.switchToHttp().getRequest();
    const whitelist = ['/health', '/api/docs'];
    return whitelist.some(path => request.url.startsWith(path));
  },
  errorMessage: 'Too many requests. Please try again later.',
  ignoreUserAgents: [
    // Ignore rate limiting for certain user agents (e.g., monitoring services)
    /googlebot/i,
    /bingbot/i,
    /monitoring/i,
  ],
});
