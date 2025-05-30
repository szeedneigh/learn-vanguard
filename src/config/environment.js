/**
 * Environment Configuration
 * Centralized configuration for all environment variables
 */

export const environment = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  
  // Firebase Configuration
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  
  // Development Settings
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  USE_MOCK_AUTH: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
  ENABLE_TOKEN_REFRESH: import.meta.env.VITE_ENABLE_TOKEN_REFRESH === 'true',
  
  // WebSocket Configuration
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws',
  
  // File Upload Settings
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'
  ],
  
  // Rate Limiting
  API_RATE_LIMIT: 100, // requests per minute
  UPLOAD_RATE_LIMIT: 20, // uploads per minute
};

// Validation function to ensure required environment variables are set
export const validateEnvironment = () => {
  const required = ['API_BASE_URL'];
  const missing = required.filter(key => !environment[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
  
  return missing.length === 0;
};

export default environment; 