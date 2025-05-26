import axios from 'axios';
import { environment } from '@/config/environment';

// Create custom axios instance
const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Track whether a token refresh is in progress
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

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
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available (from cookie or other storage)
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
      
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common error scenarios and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops - don't retry already retried requests
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
          // Token expired - 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh token functionality is implemented
      if (environment.ENABLE_TOKEN_REFRESH) {
        originalRequest._retry = true;
        
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // Call your refresh token endpoint
            const response = await axios.post(
              `${environment.API_BASE_URL}/auth/token/refresh`,
              {},
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
                }
              }
            );
            
            const { token, refreshToken } = response.data;
            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Update authorization header for original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            // Process any queued requests with the new token
            processQueue(null, token);
            return apiClient(originalRequest);
          } catch (refreshError) {
            // If refresh token is expired or invalid, logout
            processQueue(refreshError, null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.dispatchEvent(new CustomEvent('auth:required'));
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Add request to queue to retry after token refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }
      } else {
        // If refresh token isn't enabled, handle logout
        localStorage.removeItem('authToken');
        window.dispatchEvent(new CustomEvent('auth:required'));
      }
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