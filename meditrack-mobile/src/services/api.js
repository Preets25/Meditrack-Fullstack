import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, process.env isn't standard unless env variables are configured.
// For local testing, use your machine's local IP address instead of localhost.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://meditrack-fullstack.onrender.com/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle unauthenticated redirects
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and let navigation layer handle redirect
      await AsyncStorage.removeItem('token');
      // In a real app we'd dispatch an event or use NavigationRef 
      // navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default api;
