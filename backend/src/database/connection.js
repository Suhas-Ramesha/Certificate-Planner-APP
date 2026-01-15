import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Support both connection string (DATABASE_URL) and individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (common with Render, Heroku, etc.)
  let connectionString = process.env.DATABASE_URL;
  
  // Fix Render connection strings that might be missing port or domain
  // Pattern: postgresql://user:pass@dpg-xxxxx-a/database
  // Should be: postgresql://user:pass@dpg-xxxxx-a.render.com:5432/database
  if (connectionString.includes('@dpg-') && !connectionString.includes('.render.com')) {
    // Add .render.com and port if missing
    const match = connectionString.match(/@(dpg-[^\/]+)\/(.+)$/);
    if (match) {
      const host = match[1];
      const db = match[2];
      // Check if port is already in host
      if (!host.includes(':')) {
        connectionString = connectionString.replace(
          `@${host}/${db}`,
          `@${host}.render.com:5432/${db}`
        );
      } else {
        connectionString = connectionString.replace(
          `@${host}/${db}`,
          `@${host.split(':')[0]}.render.com:${host.split(':')[1] || '5432'}/${db}`
        );
      }
    }
  }
  
  // If connection string doesn't have a port number, add default PostgreSQL port
  if (!connectionString.match(/:\d+\//)) {
    // Insert port before the database name (after hostname)
    connectionString = connectionString.replace(/(@[^\/]+)\/(.+)$/, '$1:5432/$2');
  }
  
  console.log('Connecting to database...');
  if (process.env.NODE_ENV !== 'production') {
    // Mask password in logs
    const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
    console.log('Connection string:', maskedUrl);
  }
  
  poolConfig = {
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Render requires SSL for all connections
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Increased timeout for cloud connections
  };
} else {
  // Use individual parameters
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432');
  const database = process.env.DB_NAME || 'learning_planner';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  
  console.log('Connecting to database...');
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Host: ${host}, Port: ${port}, Database: ${database}, User: ${user}`);
  }
  
  poolConfig = {
    host: host,
    port: port,
    database: database,
    user: user,
    password: password,
    ssl: host.includes('render.com') ? { rejectUnauthorized: false } : false, // SSL for Render
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Increased timeout for cloud connections
  };
}

export const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
