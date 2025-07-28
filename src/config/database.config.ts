// config/database.config.ts
import { registerAs } from '@nestjs/config';

const databaseConfig = registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  name: process.env.DB_NAME || 'tender_management',
  
  // TypeORM specific
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  
  // SSL Configuration
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  
  // Connection Pool
  extra: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  },
  
  // Retry Configuration
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS, 10) || 3,
  retryDelay: parseInt(process.env.DB_RETRY_DELAY, 10) || 3000,
  
  // Migration Configuration
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  migrationsTableName: 'migrations',
}));

export default databaseConfig;
