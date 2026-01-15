import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Log learning progress for a topic
router.post('/topic',
  [
    body('roadmap_id').isInt(),
    body('roadmap_topic_id').isInt(),
    body('week_number').isInt({ min: 1 }),
    body('hours_studied').isFloat({ min: 0 }),
    body('completion_percentage').isInt({ min: 0, max: 100 }),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        roadmap_id,
        roadmap_topic_id,
        week_number,
        hours_studied,
        completion_percentage,
        notes
      } = req.body;

      // Verify roadmap belongs to user
      const roadmapCheck = await pool.query(
        'SELECT id FROM roadmaps WHERE id = $1 AND user_id = $2',
        [roadmap_id, req.user.userId]
      );

      if (roadmapCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      // Upsert progress
      const result = await pool.query(
        `INSERT INTO learning_progress 
         (user_id, roadmap_id, roadmap_topic_id, week_number, hours_studied, 
          completion_percentage, notes, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 
                CASE WHEN $6 = 100 THEN CURRENT_TIMESTAMP ELSE NULL END)
         ON CONFLICT (user_id, roadmap_topic_id, week_number)
         DO UPDATE SET
           hours_studied = EXCLUDED.hours_studied,
           completion_percentage = EXCLUDED.completion_percentage,
           notes = EXCLUDED.notes,
           completed_at = CASE WHEN EXCLUDED.completion_percentage = 100 THEN CURRENT_TIMESTAMP ELSE learning_progress.completed_at END,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          req.user.userId,
          roadmap_id,
          roadmap_topic_id,
          week_number,
          hours_studied,
          completion_percentage,
          notes || null
        ]
      );

      res.json({ progress: result.rows[0] });
    } catch (error) {
      console.error('Log progress error:', error);
      res.status(500).json({ error: 'Failed to log progress' });
    }
  }
);

// Get progress for a roadmap
router.get('/roadmap/:roadmapId', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { week_number } = req.query;

    // Verify roadmap belongs to user
    const roadmapCheck = await pool.query(
      'SELECT id FROM roadmaps WHERE id = $1 AND user_id = $2',
      [roadmapId, req.user.userId]
    );

    if (roadmapCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    let query = `
      SELECT lp.*, rt.topic_name, rt.order_index
      FROM learning_progress lp
      JOIN roadmap_topics rt ON lp.roadmap_topic_id = rt.id
      WHERE lp.user_id = $1 AND lp.roadmap_id = $2
    `;
    const params = [req.user.userId, roadmapId];

    if (week_number) {
      query += ' AND lp.week_number = $3';
      params.push(week_number);
    }

    query += ' ORDER BY rt.order_index, lp.week_number';

    const result = await pool.query(query, params);

    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update weekly progress summary
router.post('/weekly',
  [
    body('roadmap_id').isInt(),
    body('week_number').isInt({ min: 1 }),
    body('week_start_date').isISO8601(),
    body('total_hours_studied').isFloat({ min: 0 }),
    body('topics_completed').isInt({ min: 0 }),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        roadmap_id,
        week_number,
        week_start_date,
        total_hours_studied,
        topics_completed,
        notes
      } = req.body;

      // Verify roadmap belongs to user
      const roadmapCheck = await pool.query(
        'SELECT id FROM roadmaps WHERE id = $1 AND user_id = $2',
        [roadmap_id, req.user.userId]
      );

      if (roadmapCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      const result = await pool.query(
        `INSERT INTO weekly_progress 
         (user_id, roadmap_id, week_number, week_start_date, total_hours_studied, 
          topics_completed, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, roadmap_id, week_number)
         DO UPDATE SET
           total_hours_studied = EXCLUDED.total_hours_studied,
           topics_completed = EXCLUDED.topics_completed,
           notes = EXCLUDED.notes,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          req.user.userId,
          roadmap_id,
          week_number,
          week_start_date,
          total_hours_studied,
          topics_completed,
          notes || null
        ]
      );

      res.json({ weeklyProgress: result.rows[0] });
    } catch (error) {
      console.error('Update weekly progress error:', error);
      res.status(500).json({ error: 'Failed to update weekly progress' });
    }
  }
);

// Get weekly progress summaries
router.get('/weekly/:roadmapId', async (req, res) => {
  try {
    const { roadmapId } = req.params;

    // Verify roadmap belongs to user
    const roadmapCheck = await pool.query(
      'SELECT id FROM roadmaps WHERE id = $1 AND user_id = $2',
      [roadmapId, req.user.userId]
    );

    if (roadmapCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const result = await pool.query(
      `SELECT * FROM weekly_progress 
       WHERE user_id = $1 AND roadmap_id = $2
       ORDER BY week_number`,
      [req.user.userId, roadmapId]
    );

    res.json({ weeklyProgress: result.rows });
  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({ error: 'Failed to get weekly progress' });
  }
});

export default router;
