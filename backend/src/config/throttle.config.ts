import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
  limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  ignoreUserAgents: [/googlebot/gi, /bingbot/gi],
  skipIf: () => process.env.NODE_ENV === 'development',
}));