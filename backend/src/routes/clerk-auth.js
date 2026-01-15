import express from 'express';
import { pool } from '../database/connection.js';
import { authenticateClerkToken, verifyClerkTokenOnly } from '../middleware/clerk-auth.js';

const router = express.Router();

// Sync Clerk user with your database
// This endpoint verifies the token but doesn't require the user to exist in DB yet
router.post('/clerk', verifyClerkTokenOnly, async (req, res) => {
  try {
    const { clerkId, email, name } = req.user;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email, name FROM users WHERE clerk_id = $1',
      [clerkId]
    );

    if (existingUser.rows.length > 0) {
      // User exists, add userId to req.user for compatibility
      req.user.userId = existingUser.rows[0].id;
      return res.json({ user: existingUser.rows[0] });
    }

    // Create new user
    const result = await pool.query(
      'INSERT INTO users (clerk_id, email, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [clerkId, email, name || null]
    );

    // Add userId to req.user for compatibility
    req.user.userId = result.rows[0].id;

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Clerk auth sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateClerkToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE clerk_id = $1',
      [req.user.clerkId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
