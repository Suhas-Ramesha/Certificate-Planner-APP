import express from 'express';
import { pool } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { searchVideos, searchPlaylists, getVideoDetails } from '../services/youtubeService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Search videos for a topic
router.get('/search/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { type = 'video', maxResults = 5 } = req.query;

    // Get topic details
    const topicResult = await pool.query(
      `SELECT rt.*, r.user_id 
       FROM roadmap_topics rt
       JOIN roadmaps r ON rt.roadmap_id = r.id
       WHERE rt.id = $1 AND r.user_id = $2`,
      [topicId, req.user.userId]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const topic = topicResult.rows[0];
    const searchQuery = `${topic.topic_name} tutorial`;

    let resources;
    if (type === 'playlist') {
      resources = await searchPlaylists(searchQuery, parseInt(maxResults));
    } else {
      resources = await searchVideos(searchQuery, parseInt(maxResults));
    }

    // Save resources to database
    for (const resource of resources) {
      const existing = await pool.query(
        `SELECT id FROM youtube_resources 
         WHERE roadmap_topic_id = $1 
         AND (video_id = $2 OR playlist_id = $2)`,
        [topicId, resource.video_id || resource.playlist_id]
      );

      if (existing.rows.length === 0) {
        const videoDetails = resource.video_id 
          ? await getVideoDetails(resource.video_id).catch(() => null)
          : null;

        await pool.query(
          `INSERT INTO youtube_resources 
           (roadmap_topic_id, video_id, playlist_id, title, description, 
            channel_name, duration_seconds, thumbnail_url, resource_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            topicId,
            resource.video_id || null,
            resource.playlist_id || null,
            resource.title,
            resource.description,
            resource.channel_name,
            videoDetails?.duration_seconds || null,
            resource.thumbnail_url,
            resource.resource_type
          ]
        );
      }
    }

    // Return saved resources
    const savedResources = await pool.query(
      'SELECT * FROM youtube_resources WHERE roadmap_topic_id = $1 ORDER BY created_at DESC',
      [topicId]
    );

    res.json({ resources: savedResources.rows });
  } catch (error) {
    console.error('Search YouTube error:', error);
    res.status(500).json({ error: error.message || 'Failed to search YouTube' });
  }
});

// Get resources for a topic
router.get('/topic/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;

    // Verify topic belongs to user
    const topicResult = await pool.query(
      `SELECT rt.id 
       FROM roadmap_topics rt
       JOIN roadmaps r ON rt.roadmap_id = r.id
       WHERE rt.id = $1 AND r.user_id = $2`,
      [topicId, req.user.userId]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const resources = await pool.query(
      'SELECT * FROM youtube_resources WHERE roadmap_topic_id = $1 ORDER BY created_at DESC',
      [topicId]
    );

    res.json({ resources: resources.rows });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

export default router;
