// api.ts - SIMPLIFIED FIX
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // Required for HttpOnly cookies
});

let isRefreshing = false; 
let refreshFailed = false; // Flag to prevent infinite retries
let refreshSubscribers: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

// Listen for when refresh completesn  
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

// Notify subscribers of refresh failure
const onRefreshFailed = (error: any) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

// Add subscriber
const addRefreshSubscriber = (resolve: (token: string) => void, reject: (error: any) => void) => {
  refreshSubscribers.push({ resolve, reject });
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
    
    // If refresh has already failed, don't retry
    if (refreshFailed) {
      return Promise.reject(error);
    }
    
    // Don't handle refresh endpoint errors or non-401 errors
    if (response?.status !== 401 || config.url === '/auth/refresh') {
      // If refresh endpoint failed, mark refresh as failed
      if (config.url === '/auth/refresh' && response?.status === 401) {
        refreshFailed = true;
        localStorage.removeItem('access_token');
        accessToken = null;
        // Don't redirect here, let the component handle it
      }
      return Promise.reject(error);
    }
    
    // Don't try to refresh for validate-token calls - let LoginChecker handle redirects
    // This prevents infinite loops when user is not authenticated
    if (config.url === '/auth/validate-token') {
      return Promise.reject(error);
    }
    
    // If already refreshing, wait for it
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(
          (newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(config));
          },
          (refreshError: any) => {
            reject(refreshError || error);
          }
        );
      });
    }
    
    isRefreshing = true;
    
    try {
      // Refresh token is automatically sent via cookie
      const { data } = await api.post('/auth/refresh');
      
      // Store new access token
      accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      refreshFailed = false; // Reset flag on success
      
      // Update all waiting requests
      onRefreshed(data.access_token);
      
      // Retry original request
      config.headers.Authorization = `Bearer ${data.access_token}`;
      return api(config);
    } catch (refreshError: any) {
      // Refresh failed - mark as failed and clear tokens
      refreshFailed = true;
      localStorage.removeItem('access_token');
      accessToken = null;
      
      // Notify all waiting requests
      onRefreshFailed(refreshError);
      
      // Don't redirect for validate-token calls - let LoginChecker handle redirects
      // Only redirect for other API calls that fail after refresh attempt
      if (config.url !== '/auth/validate-token') {
        const notLoggedInPages = ['/login', '/signup', '/forgot-password'];
        if (!notLoggedInPages.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Helper functions
export const setAccessToken = (token: string) => {
  accessToken = token;
  refreshFailed = false; // Reset flag when setting new token
  localStorage.setItem('access_token', token);
};

export const clearTokens = () => {
  accessToken = null;
  refreshFailed = false; // Reset flag when clearing tokens
  localStorage.removeItem('access_token');
};