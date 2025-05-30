import apiClient from '@/lib/api/client';
import { ROLES } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';
import { environment } from '@/config/environment';
import { 
  signInWithGoogle, 
  signOutGoogle, 
  getCurrentUserToken,
  onAuthStateChanged 
} from '@/config/firebase';

/**
 * Environment configuration
 */
const config = {
  useMockAuth: environment.USE_MOCK_AUTH,
  tokenExpiryDays: 7,
};

/**
 * Authenticate user with provided credentials
 * @param {Object} credentials - User credentials (email and password)
 * @returns {Promise<Object>} User data and tokens
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    const { message, token, user } = response.data;

    // Store token securely
    if (token) {
      localStorage.setItem('authToken', token);
    }

    return { 
      user, 
      token, 
      success: true,
      message 
    };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return { 
      user: null, 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error?.message || 'Authentication failed' 
    };
  }
};

/**
 * Google Sign-in authentication with Firebase
 * @returns {Promise<Object>} User data and result
 */
export const loginWithGoogle = async () => {
  try {
    // Sign in with Google and get Firebase ID token
    const { user: googleUser, idToken } = await signInWithGoogle();
    
    // Send Firebase ID token to backend for verification
    const response = await apiClient.post('/auth/firebase', {
      idToken: idToken
    });

    const { message, token, user, needsRegistration } = response.data;

    if (needsRegistration) {
      // Return registration required state
      return {
        user: null,
        token: null,
        success: false,
        needsRegistration: true,
        email: googleUser.email,
        message: 'Additional information required'
      };
    }

    // Store the JWT token from backend
    if (token) {
      localStorage.setItem('authToken', token);
    }
    
    return {
      user,
      token,
      success: true,
      message: message || 'Google sign-in successful'
    };
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return {
      user: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Google sign-in failed'
    };
  }
};

/**
 * Complete Google user registration with additional info
 * @param {Object} registrationData - Additional user information
 * @returns {Promise<Object>} Registration result
 */
export const completeGoogleRegistration = async (registrationData) => {
  try {
    const response = await apiClient.post('/auth/firebase', registrationData);
    const { message, token, user } = response.data;

    if (token) {
      localStorage.setItem('authToken', token);
    }

    return {
      user,
      token,
      success: true,
      message: message || 'Registration completed successfully'
    };
  } catch (error) {
    console.error('Google registration failed:', error);
    return {
      user: null,
      success: false,
      error: error.response?.data?.message || error.response?.data?.error?.message || 'Registration failed'
    };
  }
};

/**
 * Two-step signup process - Step 1: Initiate signup
 * @param {Object} basicData - Basic user information (firstName, lastName, email, password)
 * @returns {Promise<Object>} Temporary token for step 2
 */
export const initiateSignup = async (basicData) => {
  try {
    const response = await apiClient.post('/auth/signup/initiate', basicData);
    const { message, tempToken } = response.data;

    return {
      success: true,
      tempToken,
      message: message || 'First step completed successfully'
    };
  } catch (error) {
    console.error('Signup initiation failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error?.message || 'Signup failed',
      details: error.response?.data?.error?.details || {}
    };
  }
};

/**
 * Two-step signup process - Step 2: Complete signup
 * @param {Object} completeData - Academic information and temp token
 * @returns {Promise<Object>} User data and JWT token
 */
export const completeSignup = async (completeData) => {
  try {
    const response = await apiClient.post('/auth/signup/complete', completeData);
    const { message, token, user } = response.data;

    if (token) {
      localStorage.setItem('authToken', token);
    }

    return {
      success: true,
      token,
      user,
      message: message || 'Successfully created an account'
    };
  } catch (error) {
    console.error('Signup completion failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error?.message || 'Signup failed',
      details: error.response?.data?.error?.details || {}
    };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { user: null, success: false, error: 'No auth token found' };
    }

    const response = await apiClient.get('/auth/me');
    return { 
      user: response.data.user || response.data, 
      success: true 
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    // If unauthorized, clear token
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return { 
      user: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to get current user' 
    };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout result
 */
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear local storage regardless of API call success
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Sign out from Firebase as well
    try {
      await signOutGoogle();
    } catch (firebaseError) {
      console.warn('Firebase signout failed:', firebaseError);
    }
  }

  return { success: true, message: 'Logged out successfully' };
};

/**
 * Request password reset
 * @param {Object} data - Contains email address
 * @returns {Promise<Object>} Result of password reset request
 */
export const requestPasswordReset = async (data) => {
  try {
    const response = await apiClient.post('/password/forgot-password', data);
    return { 
      success: true,
      message: response.data.message,
      expiresAt: response.data.expiresAt
    };
  } catch (error) {
    console.error('Password reset request failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to request password reset' 
    };
  }
};

/**
 * Verify password reset code
 * @param {Object} data - Contains email and verification code
 * @returns {Promise<Object>} Verification result with reset token
 */
export const verifyResetCode = async (data) => {
  try {
    const response = await apiClient.post('/password/verify-code', data);
    return {
      success: true,
      resetToken: response.data.resetToken,
      message: response.data.message || 'Code verified successfully'
    };
  } catch (error) {
    console.error('Code verification failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Code verification failed'
    };
  }
};

/**
 * Reset password with verified token
 * @param {Object} data - Contains resetToken, password, confirmPassword
 * @returns {Promise<Object>} Password reset result
 */
export const resetPassword = async (data) => {
  try {
    const response = await apiClient.post('/password/reset', data);
    return {
      success: true,
      message: response.data.message || 'Password reset successfully'
    };
  } catch (error) {
    console.error('Password reset failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Password reset failed'
    };
  }
};

/**
 * Verify if current token is valid
 * @returns {Promise<boolean>} Token validity
 */
export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // Decode token to check expiration
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      localStorage.removeItem('authToken');
      return false;
    }

    // Verify with backend
    await apiClient.get('/auth/verify');
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    localStorage.removeItem('authToken');
    return false;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token decode failed:', error);
    return false;
  }
};

// Export all auth functions
export const authService = {
  login,
  loginWithGoogle,
  completeGoogleRegistration,
  logout,
  getCurrentUser,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyToken,
  isAuthenticated,
  onAuthStateChanged,
  initiateSignup,
  completeSignup
}; 