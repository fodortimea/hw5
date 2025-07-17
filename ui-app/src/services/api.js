// src/services/api.js
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get configuration from environment variables (synced from Terraform)
const config = Constants.expoConfig?.extra || {};

if (!config.apiBaseUrl) {
  console.warn('⚠️ API configuration not found. Make sure to run ./scripts/sync-config.sh first.');
}

export const API_BASE_URL = config.apiBaseUrl || 'http://localhost:3000';
export const ALB_BASE_URL = config.albBaseUrl || 'http://localhost:3000'; // Fallback for testing

console.log('🔗 API Configuration:', {
  apiGateway: API_BASE_URL,
  directALB: ALB_BASE_URL,
  environment: config.environment || 'development'
});

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage helpers
const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
};

// JWT token interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error interceptor for handling auth issues
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await tokenStorage.removeToken();
      // Note: Navigation will be handled by AuthContext
      console.log('🔒 Unauthorized access - token cleared');
    }
    return Promise.reject(error);
  }
);

// Alternative ALB client for direct access (no auth required)
export const albClient = axios.create({
  baseURL: ALB_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { apiClient };