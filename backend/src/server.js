import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { pool } from './database/connection.js';
import authRoutes from './routes/auth.js';
// import firebaseAuthRoutes from './routes/firebase-auth.js'; // Removed - using Clerk now
import clerkAuthRoutes from './routes/clerk-auth.js';
import userRoutes from './routes/users.js';
import roadmapRoutes from './routes/roadmaps.js';
import certificationRoutes from './routes/certifications.js';
import progressRoutes from './routes/progress.js';
import youtubeRoutes from './routes/youtube.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (needed for rate limiting behind reverse proxy like Render)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// API Routes
app.use('/api/auth', authRoutes); // Keep old JWT routes for backward compatibility
// app.use('/api/auth', firebaseAuthRoutes); // Firebase auth routes (deprecated - removed)
app.use('/api/auth', clerkAuthRoutes); // Clerk auth routes
app.use('/api/users', userRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/youtube', youtubeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
