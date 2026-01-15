-- Migration: Add Firebase UID support to users table
-- This allows users to authenticate with Firebase while keeping existing JWT users

-- Add firebase_uid column to users table (nullable, so existing users still work)
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);

-- Create unique index for Firebase UID (only one user per Firebase UID)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL;

-- Make password_hash nullable (Firebase users don't need password_hash)
-- Note: Existing users will still have password_hash, new Firebase users won't
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID. NULL for JWT-authenticated users.';
