import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Render backend URL
const API_URL = 'https://learning-planner-backend.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Clerk token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('clerk_token');
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
      await AsyncStorage.removeItem('clerk_token');
    }
    return Promise.reject(error);
  }
);

export default api;
