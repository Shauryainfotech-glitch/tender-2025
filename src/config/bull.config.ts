import { registerAs } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';

const bullConfig = registerAs('bull', (): BullModuleOptions => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    
    // Connection options
    connectTimeout: 10000,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    
    // Connection pool
    family: 4,
    keepAlive: true,
  },
  
  // Default job options
  defaultJobOptions: {
    removeOnComplete: parseInt(process.env.BULL_REMOVE_ON_COMPLETE, 10) || 100,
    removeOnFail: parseInt(process.env.BULL_REMOVE_ON_FAIL, 10) || 50,
    attempts: parseInt(process.env.BULL_ATTEMPTS, 10) || 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
  
  // Settings
  settings: {
    stalledInterval: 30000,
    maxStalledCount: 1,
  },
}));

export default bullConfig;
