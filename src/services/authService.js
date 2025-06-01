import apiClient from '@/lib/api/client';
import { jwtDecode } from 'jwt-decode';
import { 
  signInWithGoogle, 
  onAuthStateChanged 
} from '@/config/firebase';
import { ROLES } from '@/lib/constants';

// Utility to store token consistently
const storeToken = (token) => {
  if (!token) {
    console.warn('Attempted to store null/undefined token');
    return false;
  }
  try {
    localStorage.setItem('authToken', token);
    return true;
  } catch (error) {
    console.error('Failed to store auth token:', error);
    return false;
  }
};

// Utility to remove token consistently
const removeToken = () => {
  try {
    localStorage.removeItem('authToken');
    return true;
  } catch (error) {
    console.error('Failed to remove auth token:', error);
    return false;
  }
};

// Normalize user data to ensure role names match our constants
const normalizeUserData = (user) => {
  if (!user) {
    console.warn('Attempted to normalize null/undefined user');
    return null;
  }
  
  try {
    // Create a mapping of lowercase roles to our constant roles
    const roleMapping = {
      'student': ROLES.STUDENT,
      'pio': ROLES.PIO,
      'admin': ROLES.ADMIN
    };

    const normalizedUser = {
      ...user,
      role: roleMapping[user.role?.toLowerCase()] || user.role
    };

    console.log('Normalized user data:', {
      original: user,
      normalized: normalizedUser
    });

    return normalizedUser;
  } catch (error) {
    console.error('Error normalizing user data:', error);
    return user; // Return original user data if normalization fails
  }
};

/**
 * Authenticate user with provided credentials
 */
export const login = async (credentials) => {
  try {
    console.log('Attempting login with credentials:', {
      ...credentials,
      password: '[REDACTED]'
    });

    const response = await apiClient.post('/auth/login', credentials);
    console.log('Login response:', {
      status: response.status,
      hasToken: !!response.data?.token,
      hasUser: !!response.data?.user
    });

    const { token, user } = response.data;

    if (!token || !user) {
      console.error('Invalid login response:', { hasToken: !!token, hasUser: !!user });
      return { 
        success: false, 
        error: 'Invalid response from server' 
      };
    }

    const tokenStored = storeToken(token);
    if (!tokenStored) {
      console.error('Failed to store authentication token');
      return { 
        success: false, 
        error: 'Failed to establish session' 
      };
    }

    const normalizedUser = normalizeUserData(user);
    if (!normalizedUser) {
      removeToken();
      console.error('Failed to normalize user data');
      return { 
        success: false, 
        error: 'Invalid user data received' 
      };
    }

    return { 
      success: true, 
      token, 
      user: normalizedUser 
    };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error);
    
    if (error.response?.status === 401) {
      return { 
        success: false, 
        error: error.response.data.message || 'Invalid credentials' 
      };
    }

    if (error.response?.status === 400) {
      return { 
        success: false, 
        error: 'Invalid input data',
        details: error.response.data.errors 
      };
    }

    return { 
      success: false, 
      error: 'Login failed. Please try again later.' 
    };
  }
};

/**
 * Google Sign-in authentication with Firebase
 */
export const loginWithGoogle = async () => {
  try {
    const { user: googleUser, idToken } = await signInWithGoogle();
    const response = await apiClient.post('/auth/firebase', { idToken });
    const { message, token, user, needsRegistration } = response.data;

    if (needsRegistration) {
      return { success: false, needsRegistration: true, email: googleUser.email, message: 'Additional information required' };
    }

    if (token) storeToken(token);
    return { user, token, success: true, message: message || 'Google sign-in successful' };
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return { user: null, success: false, error: error.response?.data?.message || error.message || 'Google sign-in failed' };
  }
};

/**
 * Complete Google user registration with additional info
 */
export const completeGoogleRegistration = async (registrationData) => {
  try {
    const response = await apiClient.post('/auth/firebase', registrationData);
    const { message, token, user } = response.data;
    if (token) storeToken(token);
    return { user, token, success: true, message: message || 'Registration completed successfully' };
  } catch (error) {
    console.error('Google registration failed:', error);
    return { user: null, success: false, error: error.response?.data?.message || error.response?.data?.error?.message || 'Registration failed' };
  }
};

/**
 * Two-step signup process - Step 1: Initiate signup
 */
export const initiateSignup = async (basicData) => {
  try {
    const formatted = {
      firstName: basicData.firstname || basicData.firstName,
      lastName: basicData.lastname || basicData.lastName,
      email: basicData.email,
      password: basicData.password,
    };
    console.log('Signup Initiate:', { ...formatted, password: '[REDACTED]' });
    const res = await apiClient.post('/auth/signup/initiate', formatted);
    const { message, tempToken } = res.data;
    if (!tempToken) throw new Error('No temporary token received');
    localStorage.setItem('signupTempToken', tempToken);
    return { success: true, tempToken, message: message || 'Step 1 complete' };
  } catch (error) {
    console.error('Initiate signup failed:', error.response?.data || error);
    const status = error.response?.status;
    if (status === 400) return { success: false, error: 'Invalid input data.', details: error.response.data.error?.details || {} };
    if (status === 409) return { success: false, error: 'Email already registered.', needsLogin: true };
    return { success: false, error: error.response?.data?.message || 'Signup initiation failed' };
  }
};

/**
 * Two-step signup process - Step 2: Complete signup
 */
export const completeSignup = async (completeData) => {
  try {
    if (!completeData.tempToken) throw new Error('Temporary token is required');
    const formatted = {
      tempToken: completeData.tempToken,
      studentNumber: completeData.studentNo || completeData.studentNumber,
      course: completeData.course === 'BSIS'
        ? 'Bachelor of Science in Information Systems'
        : completeData.course,
      yearLevel: {
        '1': 'First Year',
        '2': 'Second Year',
        '3': 'Third Year',
        '4': 'Fourth Year',
      }[completeData.yearLevel] || completeData.yearLevel,
      gender: completeData.gender,
    };
    console.log('Signup Complete:', formatted);
    const res = await apiClient.post('/auth/signup/complete', formatted);
    const { message, token } = res.data;
    if (!token) throw new Error('No token received');
    storeToken(token);
    const userData = await getCurrentUser();
    if (!userData || !userData.user) {
      throw new Error('Failed to fetch user data after signup');
    }
    const normalizedUser = normalizeUserData(userData.user);
    console.log('Normalized user data after signup:', normalizedUser);
    return { success: true, token, user: normalizedUser, message: message || 'Signup successful' };
  } catch (error) {
    console.error('Complete signup failed:', error.response?.data || error);
    return { success: false, error: error.response?.data?.message || 'Signup completion failed', details: error.response?.data?.error?.details || {} };
  }
};

/**
 * One-shot register aliasing two-step initiation
 */
export const register = initiateSignup;

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    console.log('Fetching current user data...');
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No auth token found when fetching current user');
      return { success: false, error: 'No authentication token found' };
    }

    const res = await apiClient.get('/auth/me');
    console.log('Current user response:', {
      status: res.status,
      hasUser: !!res.data?.user
    });

    if (!res.data?.user) {
      console.error('Invalid user data in response');
      removeToken();
      return { success: false, error: 'Invalid user data received' };
    }

    const normalizedUser = normalizeUserData(res.data.user);
    if (!normalizedUser) {
      removeToken();
      return { success: false, error: 'Failed to process user data' };
    }

    return { 
      success: true, 
      user: normalizedUser 
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    
    if (error.response?.status === 401) {
      removeToken();
      return { success: false, error: 'Session expired' };
    }

    return { success: false, error: 'Failed to fetch user data' };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    console.log('Logging out user...');
    await apiClient.post('/auth/logout');
    removeToken();
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error);
    // Still remove token even if API call fails
    removeToken();
    return { success: true };
  }
};

/**
 * Password reset flow
 */
export const requestPasswordReset = async (data) => {
  try {
    const res = await apiClient.post('/password/forgot-password', data);
    return { success: true, message: res.data.message, expiresAt: res.data.expiresAt };
  } catch (error) {
    console.error('Password reset request failed:', error);
    return { success: false, error: error.response?.data?.message || 'Request failed' };
  }
};
export const verifyResetCode = async (data) => {
  try {
    const res = await apiClient.post('/password/verify-code', data);
    return { success: true, resetToken: res.data.resetToken, message: res.data.message };
  } catch (error) {
    console.error('Verify reset code failed:', error);
    return { success: false, error: error.response?.data?.message || 'Verification failed' };
  }
};
export const resetPassword = async (data) => {
  try {
    const res = await apiClient.post('/password/reset', data);
    return { success: true, message: res.data.message };
  } catch (error) {
    console.error('Password reset failed:', error);
    return { success: false, error: error.response?.data?.message || 'Reset failed' };
  }
};

/**
 * Token verification and status
 */
export const verifyToken = async () => {
  try {
    console.log('Verifying authentication token...');
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No token found during verification');
      return false;
    }

    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      console.warn('Token expired');
      removeToken();
      return false;
    }

    const response = await apiClient.get('/auth/verify');
    console.log('Token verification response:', response.status);
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    removeToken();
    return false;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const decoded = jwtDecode(token);
    const isValid = decoded.exp > Date.now() / 1000;
    
    if (!isValid) {
      console.warn('Token expired during authentication check');
      removeToken();
    }

    return isValid;
  } catch (error) {
    console.error('Authentication check failed:', error);
    removeToken();
    return false;
  }
};

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
  completeSignup,
  register,
};
