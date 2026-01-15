import { clerkClient, verifyToken } from '@clerk/express';
import { pool } from '../database/connection.js';

/**
 * Middleware to authenticate Clerk tokens
 * This middleware verifies the Clerk session token and attaches user info to req.user
 */
export const authenticateClerkToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify the token with Clerk
    // verifyToken returns the decoded JWT payload
    const payload = await verifyToken(token);
    
    if (!payload || !payload.sub) {
      return res.status(403).json({ error: 'Invalid token format' });
    }

    const clerkId = payload.sub;

    // Initialize Clerk client (uses CLERK_SECRET_KEY from env automatically)
    const clerk = clerkClient();
    
    // Get user details from Clerk
    const clerkUser = await clerk.users.getUser(clerkId);
    
    // Get user ID from database (user may not exist yet, which is OK)
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
    console.error('Error details:', error.message);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
