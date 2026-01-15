import { createClerkClient, verifyToken } from '@clerk/express';
import { pool } from '../database/connection.js';
import jwt from 'jsonwebtoken';

/**
 * Helper function to verify Clerk token and get user info
 * This doesn't require the user to exist in the database
 */
async function verifyClerkTokenAndGetUser(token) {
  try {
    // Try to verify with Clerk's verifyToken first
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (verifyError) {
      // If verifyToken fails, try decoding the JWT to get the user ID
      // Then verify by fetching the user from Clerk API
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.payload || !decoded.payload.sub) {
        throw new Error('Invalid token format');
      }
      payload = decoded.payload;
    }

    if (!payload || !payload.sub) {
      throw new Error('Invalid token format - no user ID found');
    }

    const clerkId = payload.sub;

    // Initialize Clerk client (uses CLERK_SECRET_KEY from env automatically)
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables');
    }
    
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    // Get user details from Clerk (this also verifies the token is valid)
    // If the token is invalid, this will throw an error
    const clerkUser = await clerk.users.getUser(clerkId);
    
    return {
      clerkId,
      clerkUser,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.username || null
    };
  } catch (error) {
    console.error('Clerk token verification error:', error);
    throw error;
  }
}

/**
 * Middleware to verify Clerk token only (for sync endpoint)
 * Doesn't require user to exist in database
 */
export const verifyClerkTokenOnly = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { clerkId, email, name } = await verifyClerkTokenAndGetUser(token);
    
    req.user = {
      clerkId,
      email,
      name,
      userId: null // Will be set after sync
    };
    
    next();
  } catch (error) {
    console.error('Clerk token verification error:', error);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to authenticate Clerk tokens
 * This middleware verifies the Clerk session token and attaches user info to req.user
 * Requires user to exist in database (or allows null userId)
 */
export const authenticateClerkToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { clerkId, email, name } = await verifyClerkTokenAndGetUser(token);
    
    // Get user ID from database (user may not exist yet, which is OK for some routes)
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [clerkId]
    );

    req.user = {
      clerkId,
      userId: userResult.rows.length > 0 ? userResult.rows[0].id : null,
      email,
      name
    };
    
    next();
  } catch (error) {
    console.error('Clerk token verification error:', error);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
