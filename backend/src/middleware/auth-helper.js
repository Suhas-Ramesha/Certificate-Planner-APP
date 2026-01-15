import { authenticateToken } from './auth.js';
import { authenticateFirebaseToken } from './firebase-auth.js';

/**
 * Universal auth middleware that supports both JWT and Firebase tokens
 * Tries Firebase first, falls back to JWT if Firebase fails
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Try Firebase auth first
  try {
    await authenticateFirebaseToken(req, res, () => {
      // Firebase auth succeeded, get user ID from database
      getUserIdFromFirebaseUid(req, res, next);
    });
  } catch (error) {
    // Firebase auth failed, try JWT
    try {
      await authenticateToken(req, res, next);
    } catch (jwtError) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
};

/**
 * Helper to get user ID from Firebase UID
 */
async function getUserIdFromFirebaseUid(req, res, next) {
  try {
    const { pool } = await import('../database/connection.js');
    const result = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Add userId to req.user for compatibility with existing routes
    req.user.userId = result.rows[0].id;
    next();
  } catch (error) {
    console.error('Error getting user ID from Firebase UID:', error);
    return res.status(500).json({ error: 'Failed to get user ID' });
  }
}
