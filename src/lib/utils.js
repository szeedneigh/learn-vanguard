import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Role normalization
export const normalizeRole = (role) => {
  if (!role) return '';
  const roleMap = {
    'ADMIN': 'admin',
    'PIO': 'pio',
    'STUDENT': 'student'
  };
  return roleMap[role.toUpperCase()] || role.toLowerCase();
};

// API error handling
export const handleApiError = (error) => {
  if (error?.response?.data?.error) {
    return {
      message: error.response.data.error.message,
      code: error.response.data.error.code,
      details: error.response.data.error.details
    };
  }
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: null
  };
};

// Authentication state check
export const checkAuthState = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// API connection check with improved error handling
export const checkApiConnection = async (baseUrl) => {
  console.log('Checking API connection to:', baseUrl);
  
  // Create a controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    // First try the health endpoint
    const healthEndpoint = `${baseUrl}/health`;
    console.log('Attempting to connect to health endpoint:', healthEndpoint);
    
    try {
      const response = await fetch(healthEndpoint, { 
        signal: controller.signal,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('API health check successful:', response.status);
        return true;
      } else {
        console.warn('API health check failed with status:', response.status);
        // Try without the /health endpoint as fallback
        return await fallbackConnectionCheck(baseUrl);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('Health endpoint fetch failed:', fetchError.message);
      
      if (fetchError.name === 'AbortError') {
        console.error('API health check timed out after 5 seconds');
      }
      
      // Try a fallback check
      return await fallbackConnectionCheck(baseUrl);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API connection check failed:', error);
    return false;
  }
};

// Fallback connection check method
export const fallbackConnectionCheck = async (baseUrl) => {
  console.log('Attempting fallback connection check to:', baseUrl);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    // Try a basic OPTIONS request which most servers will accept
    const response = await fetch(baseUrl, {
      signal: controller.signal,
      method: 'OPTIONS'
    });
    
    clearTimeout(timeoutId);
    console.log('Fallback connection check result:', response.status);
    
    // Any response means the server is reachable
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fallback connection check failed:', error.message);
    return false;
  }
};

// API constants
export const API_BASE_URL = 'http://localhost:5000/api';

// Headers generator
export const getAuthHeaders = (token = null) => {
  const authToken = token || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
};

// Response handler
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || 'API request failed');
  }
  return response.json();
};
