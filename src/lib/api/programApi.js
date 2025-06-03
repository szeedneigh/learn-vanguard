import apiClient from "./client";

/**
 * Program and Subject Management API Service
 * Handles all program and subject-related API calls to the backend
 */

/**
 * Get all programs with their year and semester structure
 * @returns {Promise<Object>} Programs list
 */
export const getPrograms = async () => {
  try {
    const response = await apiClient.get("/programs");
    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching programs:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch programs",
    };
  }
};

/**
 * Get subjects with optional filters
 * @param {Object} filters - Optional filters (programId, year, semester)
 * @returns {Promise<Object>} Subjects list
 */
export const getSubjects = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(`/subjects?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch subjects",
    };
  }
};

/**
 * Get a single subject by ID
 * @param {string} subjectId - Subject ID
 * @returns {Promise<Object>} Subject data
 */
export const getSubjectById = async (subjectId) => {
  try {
    const response = await apiClient.get(`/subjects/${subjectId}`);
    return {
      data: response.data.subject || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching subject by ID:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch subject",
    };
  }
};

/**
 * Create a new subject
 * @param {Object} subjectData - Subject data (name, description, programId, yearName, semesterName)
 * @returns {Promise<Object>} Created subject
 */
export const createSubject = async (subjectData) => {
  try {
    const response = await apiClient.post("/subjects", subjectData);
    return {
      data: response.data.subject,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error creating subject:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to create subject",
      details: error.response?.data?.error?.details || {},
    };
  }
};

/**
 * Update an existing subject
 * @param {string} subjectId - Subject ID
 * @param {Object} subjectData - Updated subject data
 * @returns {Promise<Object>} Updated subject
 */
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await apiClient.put(`/subjects/${subjectId}`, subjectData);
    return {
      data: response.data.subject,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error updating subject:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update subject",
      details: error.response?.data?.error?.details || {},
    };
  }
};

/**
 * Delete a subject
 * @param {string} subjectId - Subject ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSubject = async (subjectId) => {
  try {
    const response = await apiClient.delete(`/subjects/${subjectId}`);
    return {
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete subject",
    };
  }
};

/**
 * Get subjects for a specific program and academic period
 * @param {string} programId - Program ID
 * @param {number} year - Academic year
 * @param {string} semester - Semester name
 * @returns {Promise<Object>} Subjects for the specified period
 */
export const getSubjectsByProgram = async (programId, year, semester) => {
  try {
    const params = new URLSearchParams({
      programId,
      year: year.toString(),
      semester,
    });

    const response = await apiClient.get(`/subjects?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching subjects by program:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch subjects",
    };
  }
};

/**
 * Create an announcement for a subject
 * @param {string} subjectId - Subject ID
 * @param {Object} announcementData - Announcement data (title, content, type, priority, dueDate)
 * @returns {Promise<Object>} Created announcement
 */
export const createSubjectAnnouncement = async (
  subjectId,
  announcementData
) => {
  try {
    const response = await apiClient.post(
      `/subjects/${subjectId}/announcements`,
      announcementData
    );
    return {
      data: response.data.announcement,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error creating subject announcement:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to create announcement",
      details: error.response?.data?.error?.details || {},
    };
  }
};

export default {
  getPrograms,
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByProgram,
  createSubjectAnnouncement,
};
