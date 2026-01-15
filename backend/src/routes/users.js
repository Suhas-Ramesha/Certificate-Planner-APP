import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require JWT authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT up.*, u.email, u.name 
       FROM user_profiles up 
       JOIN users u ON up.user_id = u.id 
       WHERE up.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ profile: null });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Create or update user profile
router.post('/profile',
  [
    body('background').optional().trim(),
    body('current_skills').optional().isArray(),
    body('learning_goals').optional().trim(),
    body('time_availability_hours_per_week').optional().isInt({ min: 1, max: 168 }),
    body('preferred_learning_style').optional().trim(),
    body('target_industry').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        background,
        current_skills,
        learning_goals,
        time_availability_hours_per_week,
        preferred_learning_style,
        target_industry
      } = req.body;

      // Check if profile exists
      const existing = await pool.query(
        'SELECT id FROM user_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      let result;
      if (existing.rows.length > 0) {
        // Update existing profile
        result = await pool.query(
          `UPDATE user_profiles 
           SET background = COALESCE($1, background),
               current_skills = COALESCE($2, current_skills),
               learning_goals = COALESCE($3, learning_goals),
               time_availability_hours_per_week = COALESCE($4, time_availability_hours_per_week),
               preferred_learning_style = COALESCE($5, preferred_learning_style),
               target_industry = COALESCE($6, target_industry),
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $7
           RETURNING *`,
          [background, current_skills, learning_goals, time_availability_hours_per_week, 
           preferred_learning_style, target_industry, req.user.userId]
        );
      } else {
        // Create new profile
        result = await pool.query(
          `INSERT INTO user_profiles 
           (user_id, background, current_skills, learning_goals, time_availability_hours_per_week, 
            preferred_learning_style, target_industry)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [req.user.userId, background, current_skills, learning_goals, 
           time_availability_hours_per_week, preferred_learning_style, target_industry]
        );
      }

      res.json({ profile: result.rows[0] });
    } catch (error) {
      console.error('Save profile error:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
  }
);

export default router;
