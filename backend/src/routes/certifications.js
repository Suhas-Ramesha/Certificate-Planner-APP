import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { recommendCertifications } from '../services/llmService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get recommended certifications for user
router.get('/recommended', async (req, res) => {
  try {
    // Return existing recommendations if already generated
    const existingRecs = await pool.query(
      `SELECT uc.*, c.name, c.provider, c.description, c.difficulty_level, 
              c.estimated_study_hours, c.category, c.website_url
       FROM user_certifications uc
       JOIN certifications c ON uc.certification_id = c.id
       WHERE uc.user_id = $1
       ORDER BY uc.priority DESC, uc.created_at DESC`,
      [req.user.userId]
    );

    if (existingRecs.rows.length > 0) {
      return res.json({ certifications: existingRecs.rows });
    }

    // Get user profile and latest roadmap
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(400).json({ error: 'User profile not found' });
    }

    const roadmapResult = await pool.query(
      `SELECT r.* FROM roadmaps r
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (roadmapResult.rows.length === 0) {
      return res.status(400).json({ error: 'No roadmap found. Please generate a roadmap first.' });
    }

    const roadmap = roadmapResult.rows[0];
    const topicsResult = await pool.query(
      'SELECT * FROM roadmap_topics WHERE roadmap_id = $1',
      [roadmap.id]
    );

    // Get recommendations from LLM
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'Recommendation service unavailable. Please try again later.' });
    }

    let recommendations;
    try {
      recommendations = await recommendCertifications(
        profileResult.rows[0],
        topicsResult.rows
      );
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return res.status(503).json({ error: 'Recommendation service unavailable. Please try again later.' });
    }

    // Ensure recommendations is an array
    const recsArray = Array.isArray(recommendations) ? recommendations : (recommendations.certifications || []);

    // Save or update recommendations
    for (const rec of recsArray) {
      // Check if certification exists
      let certResult = await pool.query(
        'SELECT id FROM certifications WHERE name = $1 AND provider = $2',
        [rec.name, rec.provider]
      );

      let certificationId;
      if (certResult.rows.length === 0) {
        // Create certification
        const newCert = await pool.query(
          `INSERT INTO certifications 
           (name, provider, description, difficulty_level, estimated_study_hours, category)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            rec.name,
            rec.provider,
            rec.description,
            rec.difficulty_level,
            rec.estimated_study_hours,
            rec.category || 'General'
          ]
        );
        certificationId = newCert.rows[0].id;
      } else {
        certificationId = certResult.rows[0].id;
      }

      // Check if user certification recommendation exists
      const existingRec = await pool.query(
        'SELECT id FROM user_certifications WHERE user_id = $1 AND certification_id = $2',
        [req.user.userId, certificationId]
      );

      if (existingRec.rows.length === 0) {
        await pool.query(
          `INSERT INTO user_certifications 
           (user_id, certification_id, roadmap_id, recommendation_reason, priority, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.userId,
            certificationId,
            roadmap.id,
            rec.recommendation_reason,
            rec.priority,
            'recommended'
          ]
        );
      }
    }

    // Return user certifications
    const userCertsResult = await pool.query(
      `SELECT uc.*, c.name, c.provider, c.description, c.difficulty_level, 
              c.estimated_study_hours, c.category, c.website_url
       FROM user_certifications uc
       JOIN certifications c ON uc.certification_id = c.id
       WHERE uc.user_id = $1
       ORDER BY uc.priority DESC, uc.created_at DESC`,
      [req.user.userId]
    );

    res.json({ certifications: userCertsResult.rows });
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to get certifications' });
  }
});

// Update certification status
router.patch('/:id/status',
  [
    body('status').isIn(['recommended', 'in_progress', 'completed', 'skipped'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;
      const updateData = { status, updated_at: new Date() };

      if (status === 'in_progress' && !req.body.started_at) {
        updateData.started_at = new Date();
      }

      if (status === 'completed') {
        updateData.completed_at = new Date();
      }

      const result = await pool.query(
        `UPDATE user_certifications 
         SET status = $1, 
             started_at = COALESCE($2, started_at),
             completed_at = COALESCE($3, completed_at)
         WHERE id = $4 AND user_id = $5
         RETURNING *`,
        [
          updateData.status,
          updateData.started_at,
          updateData.completed_at,
          req.params.id,
          req.user.userId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certification not found' });
      }

      res.json({ certification: result.rows[0] });
    } catch (error) {
      console.error('Update certification error:', error);
      res.status(500).json({ error: 'Failed to update certification' });
    }
  }
);

export default router;
