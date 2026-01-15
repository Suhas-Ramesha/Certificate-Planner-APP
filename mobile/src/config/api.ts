import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For local development, use your computer's IP address for mobile device testing
// For production, use your Render backend URL: 'https://your-backend.onrender.com'
// 
// TO USE ONLINE BACKEND: Replace both URLs below with your Render backend URL
// Example: 'https://learning-planner-backend.onrender.com'
//
const API_URL = __DEV__ 
  ? 'https://your-backend.onrender.com'  // ⚠️ UPDATE THIS: Replace with your Render backend URL
  : 'https://your-backend.onrender.com'; // ⚠️ UPDATE THIS: Replace with your Render backend URL

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('firebase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('firebase_token');
    }
    return Promise.reject(error);
  }
);

export default api;
