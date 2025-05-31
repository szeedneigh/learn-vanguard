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

// Utility to store token consistently
const storeToken = (token) => localStorage.setItem('authToken', token);

/**
 * Authenticate user with provided credentials
 */
export const login = async (credentials) => {
  try {
    console.log('Attempting login with email:', credentials.email);
    const response = await apiClient.post('/auth/login', credentials);
    const { token } = response.data;
    if (token) {
      storeToken(token);
      return { success: true, token };
    }
    return { success: false, error: 'Login failed' };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error);
    if (error.response?.status === 401) {
      return { success: false, error: error.response.data.message || 'Invalid credentials' };
    }
    return { success: false, error: 'Login failed. Please try again later.' };
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
    };
    console.log('Signup Complete:', formatted);
    const res = await apiClient.post('/auth/signup/complete', formatted);
    const { message, token, user } = res.data;
    if (!token || !user) throw new Error('No token or user received');
    storeToken(token);
    return { success: true, token, user, message: message || 'Signup successful' };
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
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
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
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('authToken');
      return false;
    }
    await apiClient.get('/auth/verify');
    return true;
  } catch {
    localStorage.removeItem('authToken');
    return false;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
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
