import logger from "@/utils/logger";
import apiClient from './client';
import { environment } from '@/config/environment';

/**
 * Subject Management API Service
 * Handles all subject-related API calls including file uploads
 */
 * Get subjects with optional filters
 * @param {Object} filters - Optional filters (course, yearLevel)
 * @returns {Promise<Object>} Subjects list
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
    logger.error('Error fetching subjects:', error);
      data: [],
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch subjects'
  }
};
 * Create a new subject (PIO and Admin only)
 * @param {Object} subjectData - Subject data (name, description, instructor, semester, course, yearLevel)
 * @returns {Promise<Object>} Created subject
export const createSubject = async (subjectData) => {
    const response = await apiClient.post('/subjects', subjectData);
      data: response.data.subject,
      message: response.data.message,
    logger.error('Error creating subject:', error);
      data: null,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create subject',
      details: error.response?.data?.error?.details || {}
 * Upload lecture file to a subject
 * @param {string} subjectId - Subject ID
 * @param {File} file - File to upload
 * @param {string} title - Lecture title
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result
export const uploadLecture = async (subjectId, file, title, onProgress = null) => {
    // Validate file size
    if (file.size > environment.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${environment.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!environment.ALLOWED_FILE_TYPES.includes(fileExtension)) {
      throw new Error('File type not allowed');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      };
    const response = await apiClient.post(`/subjects/${subjectId}/lectures`, formData, config);
      data: response.data.data,
    logger.error('Error uploading lecture:', error);
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'File upload failed'
 * Delete a lecture from a subject
 * @param {string} lectureId - Lecture ID
 * @returns {Promise<Object>} Deletion result
export const deleteLecture = async (subjectId, lectureId) => {
    const response = await apiClient.delete(`/subjects/${subjectId}/lectures/${lectureId}`);
    logger.error('Error deleting lecture:', error);
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete lecture'
 * Create an announcement for a subject
 * @param {Object} announcementData - Announcement data (text, activity)
 * @returns {Promise<Object>} Created announcement
export const createAnnouncement = async (subjectId, announcementData) => {
    const response = await apiClient.post(`/subjects/${subjectId}/announcements`, announcementData);
      data: response.data.announcement,
    logger.error('Error creating announcement:', error);
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create announcement',
 * Delete a subject (PIO and Admin only)
export const deleteSubject = async (subjectId) => {
    const response = await apiClient.delete(`/subjects/${subjectId}`);
    logger.error('Error deleting subject:', error);
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete subject'
 * Validate file for upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
export const validateFile = (file) => {
  const errors = [];
  
  // Check file size
  if (file.size > environment.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${environment.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!environment.ALLOWED_FILE_TYPES.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} is not allowed`);
  return {
    isValid: errors.length === 0,
    errors
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
