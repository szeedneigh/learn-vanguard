import apiClient from "./client";

/**
 * Announcement Management API Service
 * Handles all announcement-related API calls to the backend
 */

/**
 * Get announcements with optional filters
 * @param {Object} filters - Optional filters (subjectId, limit, etc.)
 * @returns {Promise<Object>} Announcements list
 */
export const getAnnouncements = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(`/announcements?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch announcements",
    };
  }
};

/**
 * Get a single announcement by ID
 * @param {string} announcementId - Announcement ID
 * @returns {Promise<Object>} Announcement data
 */
export const getAnnouncementById = async (announcementId) => {
  try {
    const response = await apiClient.get(`/announcements/${announcementId}`);
    return {
      data: response.data.announcement || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching announcement by ID:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch announcement",
    };
  }
};

/**
 * Create a new announcement
 * @param {Object} announcementData - Announcement data (content, subjectId, priority, etc.)
 * @returns {Promise<Object>} Created announcement
 */
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await apiClient.post("/announcements", announcementData);
    return {
      data: response.data.announcement,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error creating announcement:", error);
    console.error("Full error response:", error.response?.data);

    // Handle validation errors (400 status)
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
        .map((err) => err.msg)
        .join(", ");
      return {
        data: null,
        success: false,
        error: `Validation failed: ${validationErrors}`,
        details: error.response.data.errors,
      };
    }

    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create announcement",
      details: error.response?.data || {},
    };
  }
};

/**
 * Update an existing announcement
 * @param {string} announcementId - Announcement ID
 * @param {Object} announcementData - Updated announcement data
 * @returns {Promise<Object>} Updated announcement
 */
export const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    const response = await apiClient.put(
      `/announcements/${announcementId}`,
      announcementData
    );
    return {
      data: response.data.announcement,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update announcement",
      details: error.response?.data?.error?.details || {},
    };
  }
};

/**
 * Delete an announcement
 * @param {string} announcementId - Announcement ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAnnouncement = async (announcementId) => {
  try {
    const response = await apiClient.delete(`/announcements/${announcementId}`);
    return {
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete announcement",
    };
  }
};

/**
 * Get announcements for a specific subject
 * @param {string} subjectId - Subject ID
 * @returns {Promise<Object>} Subject announcements
 */
export const getAnnouncementsBySubject = async (subjectId) => {
  return getAnnouncements({ subjectId });
};

/**
 * Get announcements for calendar view with access control
 * @param {Object} filters - Optional filters (startDate, endDate)
 * @returns {Promise<Object>} Calendar announcements list
 */
export const getCalendarAnnouncements = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(
      `/announcements/calendar?${params.toString()}`
    );
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching calendar announcements:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch calendar announcements",
    };
  }
};

/**
 * Mark announcement as read
 * @param {string} announcementId - Announcement ID
 * @returns {Promise<Object>} Update result
 */
export const markAnnouncementAsRead = async (announcementId) => {
  try {
    const response = await apiClient.patch(
      `/announcements/${announcementId}/read`
    );
    return {
      data: response.data,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to mark announcement as read",
    };
  }
};

export default {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsBySubject,
  getCalendarAnnouncements,
  markAnnouncementAsRead,
};
