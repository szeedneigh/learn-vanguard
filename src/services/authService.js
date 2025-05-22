import apiClient from '@/lib/api/client';
import { ROLES } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';
import { authConfig } from '@/config/auth';

// Mock user data for development
const MOCK_USERS = {
  admin: {
    id: 'mock-admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: ROLES.ADMIN,
    password: 'password123', // Would never store password in plaintext in a real app
  },
  pio: {
    id: 'mock-pio-001',
    name: 'PIO User',
    email: 'pio@example.com',
    role: ROLES.PIO,
    password: 'passwordPIO',
  },
  student: {
    id: 'mock-student-001',
    name: 'Student User',
    email: 'student@example.com',
    role: ROLES.STUDENT,
    password: 'passwordStudent',
  },
};

/**
 * Environment configuration
 */
const config = {
  useMockAuth: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
  tokenExpiryDays: 7,
};

/**
 * Authenticate user with provided credentials
 * @param {Object} credentials - User credentials (email/username and password)
 * @returns {Promise<Object>} User data and tokens
 */
export const login = async (credentials) => {
  if (config.useMockAuth) {
    return mockLogin(credentials);
  }

  try {
    const response = await apiClient.post('/auth/login', credentials);
    const { user, token, refreshToken } = response.data;

    // Store tokens securely
    if (token) {
      localStorage.setItem('authToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }

    return { user, success: true };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return { 
      user: null, 
      success: false, 
      error: error.response?.data?.message || 'Authentication failed' 
    };
  }
};

/**
 * Mock login implementation for development
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Mock user data and token
 */
const mockLogin = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const providedEmail = credentials.email || credentials.username;
  
  // Find matching mock user
  const matchedUser = Object.values(MOCK_USERS).find(
    user => user.email === providedEmail && user.password === credentials.password
  );

  if (matchedUser) {
    // Create a user object without the password
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = matchedUser;
    
    // Generate mock tokens
    const mockToken = `mock-${userWithoutPassword.role.toLowerCase()}-token-${Date.now()}`;
    const mockRefreshToken = `mock-refresh-${userWithoutPassword.role.toLowerCase()}-${Date.now()}`;
    
    // Store tokens in localStorage
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('refreshToken', mockRefreshToken);
    
    return { 
      user: userWithoutPassword, 
      success: true 
    };
  }
  
  // Mock authentication failure
  return { 
    user: null, 
    success: false, 
    error: 'Invalid email or password' 
  };
};

/**
 * Get the currently authenticated user's information
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  if (config.useMockAuth) {
    return mockGetCurrentUser();
  }

  try {
    const response = await apiClient.get('/auth/me');
    return { 
      user: response.data, 
      success: true 
    };
  } catch (error) {
    console.error('Error fetching current user:', error.response?.data || error.message);
    return { 
      user: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user data' 
    };
  }
};

/**
 * Mock implementation of getting current user
 * @returns {Promise<Object>} Mock user data
 */
const mockGetCurrentUser = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return { user: null, success: false, error: 'No authentication token found' };
  }

  // Token validation logic would go here in a real implementation
  // For mock, we'll parse the role from the token
  
  let mockUser = null;
  
  if (token.includes('admin')) {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = MOCK_USERS.admin;
    mockUser = userWithoutPassword;
  } else if (token.includes('pio')) {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = MOCK_USERS.pio;
    mockUser = userWithoutPassword;
  } else if (token.includes('student')) {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = MOCK_USERS.student;
    mockUser = userWithoutPassword;
  }

  if (mockUser) {
    return { user: mockUser, success: true };
  }
  
  // Token didn't match any expected pattern
  return { user: null, success: false, error: 'Invalid token' };
};

/**
 * Register a new user account
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} New user data and result
 */
export const register = async (userData) => {
  if (config.useMockAuth) {
    return mockRegister(userData);
  }

  try {
    const response = await apiClient.post('/auth/register', userData);
    return { 
      user: response.data.user, 
      success: true 
    };
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    return { 
      user: null, 
      success: false, 
      error: error.response?.data?.message || 'Registration failed' 
    };
  }
};

/**
 * Mock implementation of user registration
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Mock registration result
 */
const mockRegister = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if email already exists in mock data
  const emailExists = Object.values(MOCK_USERS).some(user => user.email === userData.email);
  
  if (emailExists) {
    return {
      user: null,
      success: false,
      error: 'Email already in use'
    };
  }
  
  // Create a mock user (would be created by the server in reality)
  const newMockUser = {
    id: `mock-user-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: ROLES.STUDENT, // Default role for new registrations
  };
  
  return {
    user: newMockUser,
    success: true
  };
};

/**
 * Log the user out
 * @returns {Promise<Object>} Logout result
 */
export const logout = async () => {
  if (config.useMockAuth) {
    return mockLogout();
  }

  try {
    // Call logout API endpoint if needed
    await apiClient.post('/auth/logout');
    
    // Clean up tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
    
    // Still remove tokens even if the API call fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    return { 
      success: true, // Consider logout successful even if API fails
      error: error.response?.data?.message 
    };
  }
};

/**
 * Mock implementation of logout
 * @returns {Promise<Object>} Mock logout result
 */
const mockLogout = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Remove tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  
  return { success: true };
};

/**
 * Request a password reset
 * @param {Object} data - Contains email address
 * @returns {Promise<Object>} Result of password reset request
 */
export const requestPasswordReset = async (data) => {
  if (config.useMockAuth) {
    return mockRequestPasswordReset(data);
  }

  try {
    await apiClient.post('/auth/password-reset-request', data);
    return { success: true };
  } catch (error) {
    console.error('Password reset request failed:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to request password reset' 
    };
  }
};

/**
 * Mock implementation of password reset request
 * @param {Object} data - Contains email address
 * @returns {Promise<Object>} Mock result
 */
const mockRequestPasswordReset = async (data) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if email exists in mock users
  const userExists = Object.values(MOCK_USERS).some(user => user.email === data.email);
  
  if (!userExists) {
    // For security, don't reveal if the email exists or not
    // In a mock environment, we'll still return success
    console.log('Mock: Reset requested for non-existent email, but returning success for security');
  }
  
  // Always return success to prevent email enumeration
  return { success: true };
};

/**
 * Verify authentication token
 * @returns {boolean} Whether the current token is valid
 */
export const verifyToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  // If using mock auth, check if token includes any of our mock role strings
  if (authConfig.useMockAuth) {
    return token.includes('mock-') || 
           token.includes('admin') || 
           token.includes('pio') || 
           token.includes('student');
  }
  
  try {
    // Decode the JWT token
    const decodedToken = jwtDecode(token);
    
    // Check if token has expired
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (!decodedToken.exp || decodedToken.exp < currentTime) {
      return false;
    }
    
    // Check if token is approaching expiry and needs refresh
    const timeUntilExpiry = decodedToken.exp - currentTime;
    if (timeUntilExpiry < authConfig.jwt.refreshThreshold) {
      // Token is valid but approaching expiry - trigger refresh if needed
      console.log('Token approaching expiry, consider refreshing');
    }
    
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

/**
 * Check if user has authentication
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

export default {
  login,
  logout,
  register,
  getCurrentUser,
  requestPasswordReset,
  verifyToken,
  isAuthenticated,
}; 