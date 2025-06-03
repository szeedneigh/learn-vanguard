import apiClient from './client';
import { environment } from '@/config/environment';

/**
 * Subject Management API Service
 * Handles all subject-related API calls including file uploads
 */

/**
 * Get subjects with optional filters
 * @param {Object} filters - Optional filters (course, yearLevel)
 * @returns {Promise<Object>} Subjects list
 */
export const getSubjects = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await apiClient.get(`/subjects?${params.toString()}`);
    return {
      data: response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return {
      data: [],
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch subjects'
    };
  }
};

/**
 * Create a new subject (PIO and Admin only)
 * @param {Object} subjectData - Subject data (name, description, instructor, semester, course, yearLevel)
 * @returns {Promise<Object>} Created subject
 */
export const createSubject = async (subjectData) => {
  try {
    const response = await apiClient.post('/subjects', subjectData);
    return {
      data: response.data.subject,
      message: response.data.message,
      success: true
    };
  } catch (error) {
    console.error('Error creating subject:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create subject',
      details: error.response?.data?.error?.details || {}
    };
  }
};

/**
 * Upload lecture file to a subject
 * @param {string} subjectId - Subject ID
 * @param {File} file - File to upload
 * @param {string} title - Lecture title
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result
 */
export const uploadLecture = async (subjectId, file, title, onProgress = null) => {
  try {
    // Validate file size
    if (file.size > environment.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${environment.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
    
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!environment.ALLOWED_FILE_TYPES.includes(fileExtension)) {
      throw new Error('File type not allowed');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      };
    }
    
    const response = await apiClient.post(`/subjects/${subjectId}/lectures`, formData, config);
    return {
      data: response.data.data,
      message: response.data.message,
      success: true
    };
  } catch (error) {
    console.error('Error uploading lecture:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'File upload failed'
    };
  }
};

/**
 * Delete a lecture from a subject
 * @param {string} subjectId - Subject ID
 * @param {string} lectureId - Lecture ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteLecture = async (subjectId, lectureId) => {
  try {
    const response = await apiClient.delete(`/subjects/${subjectId}/lectures/${lectureId}`);
    return {
      message: response.data.message,
      success: true
    };
  } catch (error) {
    console.error('Error deleting lecture:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete lecture'
    };
  }
};

/**
 * Create an announcement for a subject
 * @param {string} subjectId - Subject ID
 * @param {Object} announcementData - Announcement data (text, activity)
 * @returns {Promise<Object>} Created announcement
 */
export const createAnnouncement = async (subjectId, announcementData) => {
  try {
    const response = await apiClient.post(`/subjects/${subjectId}/announcements`, announcementData);
    return {
      data: response.data.announcement,
      message: response.data.message,
      success: true
    };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create announcement',
      details: error.response?.data?.error?.details || {}
    };
  }
};

/**
 * Delete a subject (PIO and Admin only)
 * @param {string} subjectId - Subject ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSubject = async (subjectId) => {
  try {
    const response = await apiClient.delete(`/subjects/${subjectId}`);
    return {
      message: response.data.message,
      success: true
    };
  } catch (error) {
    console.error('Error deleting subject:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete subject'
    };
  }
};

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateFile = (file) => {
  const errors = [];
  
  // Check file size
  if (file.size > environment.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${environment.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  
  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!environment.ALLOWED_FILE_TYPES.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  getSubjects,
  createSubject,
  uploadLecture,
  deleteLecture,
  createAnnouncement,
  deleteSubject,
  validateFile,
}; 