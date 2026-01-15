import { pool } from './connection.js';

async function runClerkMigration() {
  try {
    console.log('Running Clerk migration...');
    
    // Migration SQL commands
    const migrations = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id) WHERE clerk_id IS NOT NULL;`,
      `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;` // Make password_hash nullable for Clerk users
    ];
    
    for (const sql of migrations) {
      console.log(`Executing: ${sql}`);
      await pool.query(sql);
      console.log('✓ Success');
    }
    
    console.log('\n✓ Clerk migration completed successfully');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'clerk_id'
    `);
    
    if (result.rows.length > 0) {
      console.log('\nVerified column:');
      console.log(`  - clerk_id: ${result.rows[0].data_type}`);
    }
    
    // Check index
    const indexResult = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'users' AND indexname = 'idx_users_clerk_id'
    `);
    
    if (indexResult.rows.length > 0) {
      console.log('  - Index idx_users_clerk_id: ✓ Created');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    await pool.end();
    process.exit(1);
  }
}

runClerkMigration();
