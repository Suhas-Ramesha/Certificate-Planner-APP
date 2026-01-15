import { pool } from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAllMigrations() {
  try {
    console.log('========================================');
    console.log('Running All Database Migrations');
    console.log('========================================\n');

    // Test connection first
    console.log('Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');
    console.log('Current time:', testResult.rows[0].now);
    console.log('');

    // 1. Run main schema migration
    console.log('----------------------------------------');
    console.log('Step 1: Running main schema migration');
    console.log('----------------------------------------');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✓ Main schema migration completed\n');

    // 2. Run Firebase migration (if needed)
    console.log('----------------------------------------');
    console.log('Step 2: Running Firebase migration');
    console.log('----------------------------------------');
    const firebaseMigrations = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL;`,
      `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`
    ];
    for (const sql of firebaseMigrations) {
      await pool.query(sql);
    }
    console.log('✓ Firebase migration completed\n');

    // 3. Run Clerk migration
    console.log('----------------------------------------');
    console.log('Step 3: Running Clerk migration');
    console.log('----------------------------------------');
    const clerkMigrations = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id) WHERE clerk_id IS NOT NULL;`,
      `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;` // Idempotent - safe to run again
    ];
    for (const sql of clerkMigrations) {
      console.log(`Executing: ${sql}`);
      await pool.query(sql);
      console.log('✓ Success');
    }
    console.log('✓ Clerk migration completed\n');

    // Verify all tables
    console.log('----------------------------------------');
    console.log('Verification: All Tables');
    console.log('----------------------------------------');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verify user table columns
    console.log('\n----------------------------------------');
    console.log('Verification: Users Table Columns');
    console.log('----------------------------------------');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY column_name
    `);
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\n========================================');
    console.log('✓ All migrations completed successfully');
    console.log('========================================\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.constraint) {
      console.error('Constraint:', error.constraint);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }

    await pool.end();
    process.exit(1);
  }
}

runAllMigrations();
