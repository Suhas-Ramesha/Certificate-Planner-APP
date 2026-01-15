import express from 'express';
import { pool } from '../database/connection.js';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.js';

const router = express.Router();

// Sync Firebase user with your database
router.post('/firebase', authenticateFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email, name FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (existingUser.rows.length > 0) {
      // User exists, add userId to req.user for compatibility
      req.user.userId = existingUser.rows[0].id;
      return res.json({ user: existingUser.rows[0] });
    }

    // Create new user
    const result = await pool.query(
      'INSERT INTO users (firebase_uid, email, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [uid, email, name || null]
    );

    // Add userId to req.user for compatibility
    req.user.userId = result.rows[0].id;

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Firebase auth sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE firebase_uid = $1',
      [req.user.uid]
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
