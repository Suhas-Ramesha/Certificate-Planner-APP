import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { generatePersonalizedRoadmap } from '../services/llmService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate personalized roadmap
router.post('/generate', async (req, res) => {
  try {
    // Get user profile
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(400).json({ error: 'User profile not found. Please complete your profile first.' });
    }

    const userProfile = profileResult.rows[0];

    // Generate roadmap using LLM
    const roadmapData = await generatePersonalizedRoadmap(userProfile);

    // Save roadmap to database
    const roadmapResult = await pool.query(
      `INSERT INTO roadmaps (user_id, title, description, roadmap_data, estimated_duration_weeks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.userId,
        roadmapData.title,
        roadmapData.description,
        JSON.stringify(roadmapData),
        roadmapData.estimated_duration_weeks
      ]
    );

    const roadmap = roadmapResult.rows[0];

    // Save topics
    if (roadmapData.topics && Array.isArray(roadmapData.topics)) {
      for (let i = 0; i < roadmapData.topics.length; i++) {
        const topic = roadmapData.topics[i];
        await pool.query(
          `INSERT INTO roadmap_topics 
           (roadmap_id, topic_name, description, order_index, estimated_hours, prerequisites)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            roadmap.id,
            topic.topic_name,
            topic.description,
            i + 1,
            topic.estimated_hours,
            topic.prerequisites || []
          ]
        );
      }
    }

    // Fetch the complete roadmap with topics
    const completeRoadmap = await getRoadmapWithTopics(roadmap.id);

    res.status(201).json({ roadmap: completeRoadmap });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate roadmap' });
  }
});

// Get all roadmaps for user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
              (SELECT COUNT(*) FROM roadmap_topics rt WHERE rt.roadmap_id = r.id) as topic_count
       FROM roadmaps r
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.userId]
    );

    res.json({ roadmaps: result.rows });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: 'Failed to get roadmaps' });
  }
});

// Get roadmap by ID with topics
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await getRoadmapWithTopics(req.params.id, req.user.userId);

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json({ roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
});

// Helper function to get roadmap with topics
async function getRoadmapWithTopics(roadmapId, userId = null) {
  const roadmapResult = await pool.query(
    `SELECT * FROM roadmaps WHERE id = $1${userId ? ' AND user_id = $2' : ''}`,
    userId ? [roadmapId, userId] : [roadmapId]
  );

  if (roadmapResult.rows.length === 0) {
    return null;
  }

  const roadmap = roadmapResult.rows[0];

  const topicsResult = await pool.query(
    'SELECT * FROM roadmap_topics WHERE roadmap_id = $1 ORDER BY order_index',
    [roadmapId]
  );

  roadmap.topics = topicsResult.rows;
  return roadmap;
}

export default router;
