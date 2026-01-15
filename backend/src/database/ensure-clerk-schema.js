import { pool } from './connection.js';

export async function ensureClerkSchema() {
  const migrations = [
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id) WHERE clerk_id IS NOT NULL;',
    'ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;'
  ];

  for (const sql of migrations) {
    await pool.query(sql);
  }
}
