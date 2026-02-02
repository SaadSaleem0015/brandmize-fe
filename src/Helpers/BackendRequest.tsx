// api.ts - SIMPLIFIED FIX
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // Required for HttpOnly cookies
});

let isRefreshing = false; 
let refreshSubscribers: ((token: string) => void)[] = [];

// Listen for when refresh completesn  
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Add subscriber
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Store access token
let accessToken = localStorage.getItem('access_token') || null;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Only handle 401 errors
    if (response?.status !== 401 || config.url === '/auth/refresh') {
      return Promise.reject(error);
    }
    
    // If already refreshing, wait for it
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(config));
        });
      });
    }
    
    isRefreshing = true;
    
    try {
      // Refresh token is automatically sent via cookie
      const { data } = await api.post('/auth/refresh');
      
      // Store new access token
      accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      
      // Update all waiting requests
      onRefreshed(data.access_token);
      
      // Retry original request
      config.headers.Authorization = `Bearer ${data.access_token}`;
      return api(config);
    } catch (refreshError) {
      // Refresh failed - redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Helper functions
export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem('access_token', token);
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem('access_token');
};