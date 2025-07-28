import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?sslmode=require`;

  console.log('Testing connection to Neon PostgreSQL...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Database:', process.env.DB_DATABASE);
  console.log('Username:', process.env.DB_USERNAME);

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Neon PostgreSQL!');

    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);

    // Check database version
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL version:', versionResult.rows[0].version);

    // List existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nExisting tables:');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found. Database is empty.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
  } finally {
    await client.end();
  }
}

testConnection();
