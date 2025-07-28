import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'ep-odd-dawn-a147pp4j-pooler.ap-southeast-1.aws.neon.tech',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'neondb_owner',
  password: process.env.DB_PASSWORD || 'npg_Mk8sLXjrBN7d',
  database: process.env.DB_DATABASE || 'neondb',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false',
  } : false,
  // Neon specific settings for connection pooling
  extra: {
    max: 10, // Max number of clients in the pool
    min: 2,  // Min number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  // Enable better error messages
  autoLoadEntities: true,
  // Retry strategy for connection
  retryAttempts: 3,
  retryDelay: 3000,
}));
