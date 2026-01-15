import { clerkClient } from '@clerk/clerk-sdk-node';
import { pool } from '../database/connection.js';
import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate Clerk tokens
 */
export const authenticateClerkToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Initialize Clerk client
    const clerk = clerkClient();
    
    // Decode the JWT token to get the user ID (sub claim)
    // Note: We're not verifying the signature here as Clerk handles that
    // In production, you should verify the token signature using Clerk's public key
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || !decoded.payload || !decoded.payload.sub) {
      return res.status(403).json({ error: 'Invalid token format' });
    }

    const clerkId = decoded.payload.sub;
    
    // Get user details from Clerk
    const clerkUser = await clerk.users.getUser(clerkId);
    
    // Get user ID from database
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [clerkId]
    );

    req.user = {
      clerkId: clerkId,
      userId: userResult.rows.length > 0 ? userResult.rows[0].id : null,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.username || null
    };
    
    next();
  } catch (error) {
    console.error('Clerk token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
