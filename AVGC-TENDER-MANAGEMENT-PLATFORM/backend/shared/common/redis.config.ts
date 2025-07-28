// config/redis.config.ts
import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Connection Options
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Connection Pool
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES, 10) || 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Key Prefixes
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'tender:',
  
  // TTL Settings
  defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL, 10) || 3600, // 1 hour
  sessionTTL: parseInt(process.env.REDIS_SESSION_TTL, 10) || 86400, // 24 hours
  cacheTTL: parseInt(process.env.REDIS_CACHE_TTL, 10) || 300, // 5 minutes
  
  // Cluster Configuration (if using Redis Cluster)
  cluster: process.env.REDIS_CLUSTER === 'true' ? {
    nodes: process.env.REDIS_CLUSTER_NODES?.split(',').map(node => {
      const [host, port] = node.split(':');
      return { host, port: parseInt(port, 10) };
    }) || [],
  } : null,
}));
