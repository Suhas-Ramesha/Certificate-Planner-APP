import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    // Test connection first
    console.log('Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');
    console.log('Current time:', testResult.rows[0].now);
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('\nExecuting database migration...');
    
    // Execute the entire schema as one query
    // PostgreSQL can handle multiple statements in one query
    await pool.query(schema);
    
    console.log('✓ Database migration completed successfully');
    console.log('\nCreated tables:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.hostname) {
      console.error('Hostname:', error.hostname);
    }
    
    // Provide helpful error messages
    if (error.code === 'ENOTFOUND') {
      console.error('\nTroubleshooting:');
      console.error('- Check your DATABASE_URL in .env file');
      console.error('- Make sure the hostname is correct');
      console.error('- For Render, use the Internal Database URL');
      console.error('- Connection string format: postgresql://user:password@host:port/database');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nTroubleshooting:');
      console.error('- Database server is not accessible');
      console.error('- Check if your Render database is running (not paused)');
      console.error('- Verify firewall/network settings');
    } else if (error.code === '28P01' || error.message.includes('password')) {
      console.error('\nTroubleshooting:');
      console.error('- Check database username and password');
      console.error('- Verify credentials in .env file');
    }
    
    await pool.end();
    process.exit(1);
  }
}

migrate();
