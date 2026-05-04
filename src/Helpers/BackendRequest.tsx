import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  // baseURL: "/api/v1",

  
  withCredentials: true,
});

// 🔴 Separate instance for refresh
const refreshApi = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  // baseURL: "/api/v1",

  withCredentials: true,
});

let isRefreshing = false;
let refreshFailed = false;
let isRedirecting = false;

let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: any) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (
  resolve: (token: string) => void,
  reject: (error: any) => void
) => {
  refreshSubscribers.push({ resolve, reject });
};

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

    // Already retried once
    if (config._retry) {
      return Promise.reject(error);
    }

    // Refresh failed globally
    if (refreshFailed) {
      return Promise.reject(error);
    }

    if (response?.status !== 401) {
      return Promise.reject(error);
    }

    // Ignore refresh endpoint itself
    if (config.url === '/auth/refresh') {
      refreshFailed = true;
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {

      return new Promise((resolve, reject) => {

        addRefreshSubscriber(
          (token: string) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(api(config));
          },
          reject
        );

      });

    }

    isRefreshing = true;

    try {

      // ✅ use refreshApi (NOT api)
      const { data } = await refreshApi.post('/auth/refresh');

      accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);

      refreshFailed = false;

      onRefreshed(data.access_token);

      config.headers.Authorization = `Bearer ${data.access_token}`;

      return api(config);

    } catch (refreshError) {

      refreshFailed = true;

      localStorage.removeItem('access_token');
      accessToken = null;

      onRefreshFailed(refreshError);

      // Prevent multiple redirects
      if (!isRedirecting) {

        isRedirecting = true;

        const publicPages = [
          '/login',
          '/signup',
          '/forgot-password',
          '/verify-email'
        ];

        if (!publicPages.includes(window.location.pathname)) {

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
