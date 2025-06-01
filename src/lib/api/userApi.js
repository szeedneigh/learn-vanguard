import apiClient from './client';

/**
 * User Management API Service
 * Handles all user-related API calls to the backend
 */

/**
 * Get all users (admin only)
 * @param {Object} filters - Optional filters (role, search, page, limit, etc.)
 * @returns {Promise<Object>} Users list with pagination
 */
export const getUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await apiClient.get(`/users?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      data: [],
      pagination: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch users'
    };
  }
};

/**
 * Get a single user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User details
 */
export const getUser = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch user'
    };
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch profile'
    };
  }
};

/**
 * Update current user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateCurrentUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/profile', profileData);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update profile'
    };
  }
};

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} updates - User updates
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, updates) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, updates);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update user'
    };
  }
};

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return {
      success: true,
      message: response.data.message || 'User deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete user'
    };
  }
};

/**
 * Search users
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await apiClient.get(`/users/search?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true
    };
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      data: [],
      pagination: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to search users'
    };
  }
};

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/role`, { role });
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update user role'
    };
  }
};

/**
 * Update user status (admin only)
 * @param {string} userId - User ID
 * @param {string} status - New status (active, inactive, suspended)
 * @returns {Promise<Object>} Updated user
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/status`, { status });
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update user status'
    };
  }
};

/**
 * Get user statistics (admin only)
 * @returns {Promise<Object>} User statistics
 */
export const getUserStatistics = async () => {
  try {
    const response = await apiClient.get('/users/statistics');
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch user statistics'
    };
  }
};

/**
 * Upload user avatar
 * @param {File} file - Avatar image file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Upload result
 */
export const uploadUserAvatar = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    // Add progress tracking if callback provided
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await apiClient.post('/users/profile/avatar', formData, config);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to upload avatar'
    };
  }
};

/**
 * Assign PIO role to a user
 * @param {string} userId - User ID
 * @param {string} assignedClass - Class to assign to PIO
 * @returns {Promise<Object>} Updated user
 */
export const assignPIORole = async (userId, assignedClass) => {
  try {
    const response = await apiClient.post(`/users/pio/${userId}`, { assignedClass });
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error assigning PIO role:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to assign PIO role'
    };
  }
};

/**
 * Revert PIO role back to student
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const revertPIORole = async (userId) => {
  try {
    const response = await apiClient.post(`/users/pio/${userId}/revert`);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error reverting PIO role:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to revert PIO role'
    };
  }
};

export default {
  getUsers,
  getUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateUser,
  deleteUser,
  searchUsers,
  updateUserRole,
  updateUserStatus,
  getUserStatistics,
  uploadUserAvatar,
  assignPIORole,
  revertPIORole,
};