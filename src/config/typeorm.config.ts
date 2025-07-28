import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT'), 10) || 5432,
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || 'postgres',
  database: configService.get('DB_NAME') || 'tender_management',
  
  // Entity and migration paths
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  
  // Migration settings
  migrationsTableName: 'migrations',
  migrationsRun: false,
  
  // Synchronization (only for development)
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('DB_LOGGING') === 'true',
  
  // SSL Configuration
  ssl: configService.get('DB_SSL') === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  
  // Connection pool settings
  extra: {
    max: parseInt(configService.get('DB_POOL_MAX'), 10) || 10,
    min: parseInt(configService.get('DB_POOL_MIN'), 10) || 2,
  },
});
