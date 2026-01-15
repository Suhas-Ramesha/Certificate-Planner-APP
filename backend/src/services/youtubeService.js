import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function searchVideos(query, maxResults = 5) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        key: YOUTUBE_API_KEY,
        order: 'relevance'
      }
    });

    return response.data.items.map(item => ({
      video_id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channel_name: item.snippet.channelTitle,
      thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      resource_type: 'video'
    }));
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw new Error('Failed to search YouTube videos');
  }
}

export async function searchPlaylists(query, maxResults = 3) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'playlist',
        maxResults,
        key: YOUTUBE_API_KEY,
        order: 'relevance'
      }
    });

    return response.data.items.map(item => ({
      playlist_id: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      channel_name: item.snippet.channelTitle,
      thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      resource_type: 'playlist'
    }));
  } catch (error) {
    console.error('Error searching YouTube playlists:', error);
    throw new Error('Failed to search YouTube playlists');
  }
}

export async function getVideoDetails(videoId) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'contentDetails,snippet',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    if (response.data.items.length === 0) {
      return null;
    }

    const item = response.data.items[0];
    const duration = parseDuration(item.contentDetails.duration);

    return {
      video_id: videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channel_name: item.snippet.channelTitle,
      duration_seconds: duration,
      thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    throw new Error('Failed to get video details');
  }
}

function parseDuration(duration) {
  // Parse ISO 8601 duration (e.g., PT1H2M10S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}
