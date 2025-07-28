// config/redis.config.ts
import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Connection options
  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS, 10) || 3,
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 3000,
  
  // Session configuration
  sessionTTL: parseInt(process.env.REDIS_SESSION_TTL, 10) || 86400, // 24 hours
  
  // Cache configuration
  cacheTTL: parseInt(process.env.REDIS_CACHE_TTL, 10) || 3600, // 1 hour
  
  // Queue configuration
  queuePrefix: process.env.REDIS_QUEUE_PREFIX || 'tender_queue',
  
  // Pub/Sub configuration
  pubsubPrefix: process.env.REDIS_PUBSUB_PREFIX || 'tender_pubsub',
  
  // Connection pool
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST, 10) || 3,
  lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
  keepAlive: parseInt(process.env.REDIS_KEEP_ALIVE, 10) || 30000,
  
  // Cluster configuration (if using Redis Cluster)
  cluster: {
    enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
    nodes: process.env.REDIS_CLUSTER_NODES ? 
      process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port, 10) };
      }) : [],
  },
}));

export default redisConfig;
