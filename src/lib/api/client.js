import axios from 'axios';
import { environment } from '@/config/environment';

// Create custom axios instance
const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // Enable credentials for CORS
});

// Track whether a token refresh is in progress
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to retry failed requests
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await apiClient(config);
  } catch (error) {
    if (retryCount < MAX_RETRIES && (error.code === 'ECONNABORTED' || !error.response)) {
      await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request Interceptor: Inject auth token and handle request formatting
apiClient.interceptors.request.use(
  (config) => {
    // Log the request details for debugging
    console.log('Making request to:', config.url, {
      method: config.method,
      headers: config.headers,
      data: config.data
    });

    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common error scenarios
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log detailed error information
    console.error('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        headers: originalRequest?.headers,
        withCredentials: originalRequest?.withCredentials
      }
    });
    
    // Handle unauthorized error (401)
    if (error.response?.status === 401) {
      // Clear tokens and trigger auth required event
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new CustomEvent('auth:required'));
      return Promise.reject(error);
    }
    
    // Server error - 500 range
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data || error.message);
      window.dispatchEvent(new CustomEvent('api:server-error', { 
        detail: { 
          message: 'Server error occurred',
          error: error.response?.data 
        } 
      }));
    }
    
    // Not found - 404
    if (error.response?.status === 404) {
      console.warn('Resource not found:', originalRequest.url);
    }
    
    // Request aborted/timeout - no status
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout', originalRequest.url);
      window.dispatchEvent(new CustomEvent('api:timeout', { 
        detail: { url: originalRequest.url } 
      }));
    }
    
    // Network error - no response
    if (!error.response) {
      console.error('Network error:', error.message);
      window.dispatchEvent(new CustomEvent('api:network-error', { 
        detail: { message: error.message } 
      }));
    }
    
    return Promise.reject(error);
  }
);

// Function to create a cancelable request
export const createCancelableRequest = () => {
  const controller = new AbortController();
  const signal = controller.signal;
  
  return {
    signal,
    cancel: () => controller.abort()
  };
};

export default apiClient; 