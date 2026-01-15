import admin from '../config/firebase-admin.js';

import admin from '../config/firebase-admin.js';
import { pool } from '../database/connection.js';

export const authenticateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user ID from database
    const userResult = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database. Please register first.' });
    }

    req.user = {
      uid: decodedToken.uid,
      userId: userResult.rows[0].id, // Add userId for compatibility with existing routes
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.display_name
    };
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    
    // Check if it's an admin initialization error
    if (error.message && error.message.includes('initializeApp')) {
      return res.status(500).json({ error: 'Firebase Admin not initialized. Check backend configuration.' });
    }
    
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
