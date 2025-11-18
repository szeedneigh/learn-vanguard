/**
 * Authentication Service Tests
 *
 * Tests for the authentication flow including login, logout, and token management.
 */

import { login, logout, getCurrentUser, isAuthenticated, getAuthToken } from '../src/services/authService';

// Mock dependencies
jest.mock('../src/lib/api/client', () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../src/utils/logger', () => ({
  default: {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    auth: jest.fn(),
  },
}));

jest.mock('../src/config/firebase', () => ({
  signInWithGoogle: jest.fn(),
  checkRedirectResult: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getCurrentUserToken: jest.fn(),
}));

jest.mock('../src/lib/queryClient', () => ({
  queryClient: {
    setQueryData: jest.fn(),
    clear: jest.fn(),
  },
}));

// Import mocked modules
import apiClient from '../src/lib/api/client';
import { queryClient } from '../src/lib/queryClient';

describe('Authentication Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ==========================================
  // Login Tests
  // ==========================================
  describe('login', () => {
    const validCredentials = {
      email: 'test@student.laverdad.edu.ph',
      password: 'Password123',
    };

    const mockUser = {
      id: '123',
      email: 'test@student.laverdad.edu.ph',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
    };

    const mockToken = 'mock-jwt-token';

    it('should successfully login with valid credentials', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: mockUser,
        },
        status: 200,
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(localStorage.getItem('authToken')).toBe(mockToken);
    });

    it('should normalize user role to uppercase', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: { ...mockUser, role: 'student' },
        },
        status: 200,
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('STUDENT');
    });

    it('should update React Query cache with user data', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: mockUser,
        },
        status: 200,
      });

      await login(validCredentials);

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['user'],
        expect.objectContaining({ email: mockUser.email })
      );
    });

    it('should return error for invalid credentials (401)', async () => {
      apiClient.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should return error for invalid input (400)', async () => {
      apiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: [{ field: 'email', message: 'Invalid email format' }],
          },
        },
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data');
      expect(result.details).toBeDefined();
    });

    it('should return generic error for server errors', async () => {
      apiClient.post.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Please try again later');
    });

    it('should clear existing token before login attempt', async () => {
      localStorage.setItem('authToken', 'old-token');

      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: mockUser,
        },
        status: 200,
      });

      await login(validCredentials);

      expect(localStorage.getItem('authToken')).toBe(mockToken);
    });

    it('should return error if response has no token', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          user: mockUser,
        },
        status: 200,
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response');
    });

    it('should return error if response has no user', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
        },
        status: 200,
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response');
    });

    it('should handle network errors', async () => {
      apiClient.post.mockRejectedValue(new Error('Network Error'));

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ==========================================
  // Logout Tests
  // ==========================================
  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    it('should clear token from localStorage', async () => {
      const result = await logout();

      expect(result.success).toBe(true);
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should clear React Query cache', async () => {
      await logout();

      expect(queryClient.clear).toHaveBeenCalled();
    });
  });

  // ==========================================
  // Token Management Tests
  // ==========================================
  describe('getAuthToken', () => {
    it('should return token from localStorage', () => {
      const token = 'test-token';
      localStorage.setItem('authToken', token);

      expect(getAuthToken()).toBe(token);
    });

    it('should return null if no token exists', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('authToken', 'test-token');

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  // ==========================================
  // getCurrentUser Tests
  // ==========================================
  describe('getCurrentUser', () => {
    const mockToken = 'valid-token';
    const mockUser = {
      id: '123',
      email: 'test@student.laverdad.edu.ph',
      role: 'STUDENT',
    };

    beforeEach(() => {
      localStorage.setItem('authToken', mockToken);
    });

    it('should fetch and return current user', async () => {
      apiClient.get.mockResolvedValue({
        data: { user: mockUser },
        status: 200,
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should return error when not authenticated', async () => {
      localStorage.removeItem('authToken');

      const result = await getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });

    it('should handle API errors', async () => {
      apiClient.get.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // Role Normalization Tests
  // ==========================================
  describe('Role Normalization', () => {
    const mockToken = 'mock-jwt-token';

    it('should normalize "student" to "STUDENT"', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: { id: '1', email: 'test@test.com', role: 'student' },
        },
      });

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(result.user.role).toBe('STUDENT');
    });

    it('should normalize "pio" to "PIO"', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: { id: '1', email: 'test@test.com', role: 'pio' },
        },
      });

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(result.user.role).toBe('PIO');
    });

    it('should normalize "admin" to "ADMIN"', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: { id: '1', email: 'test@test.com', role: 'admin' },
        },
      });

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(result.user.role).toBe('ADMIN');
    });

    it('should preserve assignedClass for PIO users', async () => {
      const pioUser = {
        id: '1',
        email: 'pio@test.com',
        role: 'pio',
        assignedClass: 'BSIT-3A',
      };

      apiClient.post.mockResolvedValue({
        data: {
          token: mockToken,
          user: pioUser,
        },
      });

      const result = await login({ email: 'pio@test.com', password: 'pass' });

      expect(result.user.assignedClass).toBe('BSIT-3A');
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle empty credentials', async () => {
      apiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Email and password are required' },
        },
      });

      const result = await login({ email: '', password: '' });

      expect(result.success).toBe(false);
    });

    it('should handle malformed response', async () => {
      apiClient.post.mockResolvedValue({
        data: null,
        status: 200,
      });

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(result.success).toBe(false);
    });

    it('should handle timeout errors', async () => {
      apiClient.post.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'Request timeout',
      });

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
