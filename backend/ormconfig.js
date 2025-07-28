require('dotenv').config();

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'ep-odd-dawn-a147pp4j-pooler.ap-southeast-1.aws.neon.tech',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'neondb_owner',
  password: process.env.DB_PASSWORD || 'npg_Mk8sLXjrBN7d',
  database: process.env.DB_DATABASE || 'neondb',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/migrations',
  },
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false, // Use migrations in production
  logging: true,
};
