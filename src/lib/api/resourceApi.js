import logger from "@/utils/logger";
import apiClient from "./client";

/**
 * Resource Management API Service
 * Handles all resource-related API calls to the backend including file uploads
 */

/**
 * Get resources with optional filters
 * @param {Object} filters - Optional filters (subjectId, type, search, page, limit, etc.)
 * @returns {Promise<Object>} Resources list with pagination
 */
export const getResources = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(`/resources?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true,
    };
  } catch (error) {
    logger.error("Error fetching resources:", error);
    return {
      data: [],
      pagination: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch resources",
    };
  }
};

/**
 * Get a single resource by ID
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Resource details
 */
export const getResource = async (resourceId) => {
  try {
    const response = await apiClient.get(`/resources/${resourceId}`);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    logger.error("Error fetching resource:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch resource",
    };
  }
};

/**
 * Search resources
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchResources = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("q", query);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(
      `/resources/search?${params.toString()}`
    );
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true,
    };
  } catch (error) {
    logger.error("Error searching resources:", error);
    return {
      data: [],
      pagination: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to search resources",
    };
  }
};

/**
 * Upload a resource file with FormData
 * @param {FormData} formData - The form data containing file and resource metadata
 * @param {Function} onProgress - Progress callback function (optional)
 * @returns {Promise<Object>} Upload result with created resource
 */
export const uploadResource = async (formData, onProgress = null) => {
  try {
    // Add a flag to make files public
    formData.append("isPublic", "true");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === "function") {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          onProgress(progressEvent);
        }
      };
    }

    const response = await apiClient.post("/resources", formData, config);

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    logger.error("Error uploading resource:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to upload resource",
      details: error.response?.data?.error?.details || {},
    };
  }
};

/**
 * Create resource from URL or link
 * @param {Object} resourceData - Resource data (title, description, url, subjectId, etc.)
 * @returns {Promise<Object>} Created resource
 */
export const createResource = async (resourceData) => {
  try {
    const response = await apiClient.post("/resources", resourceData);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    logger.error("Error creating resource:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to create resource",
    };
  }
};

/**
 * Update an existing resource
 * @param {string} resourceId - Resource ID
 * @param {Object} updates - Resource updates
 * @returns {Promise<Object>} Updated resource
 */
export const updateResource = async (resourceId, updates) => {
  try {
    const response = await apiClient.put(`/resources/${resourceId}`, updates);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    logger.error("Error updating resource:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update resource",
    };
  }
};

/**
 * Delete a resource
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteResource = async (resourceId) => {
  try {
    const response = await apiClient.delete(`/resources/${resourceId}`);
    return {
      success: true,
      message: response.data.message || "Resource deleted successfully",
    };
  } catch (error) {
    logger.error("Error deleting resource:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete resource",
    };
  }
};

/**
 * Share a resource
 * @param {string} resourceId - Resource ID
 * @param {Object} shareData - Share data (userIds, permissions, etc.)
 * @returns {Promise<Object>} Share result
 */
export const shareResource = async (resourceId, shareData) => {
  try {
    const response = await apiClient.post(
      `/resources/${resourceId}/share`,
      shareData
    );
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    logger.error("Error sharing resource:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to share resource",
    };
  }
};

/**
 * Get download URL for a resource
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Download URL
 */
export const getResourceDownloadUrl = async (resourceId) => {
  try {
    const response = await apiClient.get(`/resources/${resourceId}/download`);
    return {
      url: response.data.downloadUrl || response.data.url,
      success: true,
    };
  } catch (error) {
    logger.error("Error getting download URL:", error);
    return {
      url: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to get download URL",
    };
  }
};

/**
 * Track resource download
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Tracking result
 */
export const trackResourceDownload = async (resourceId) => {
  try {
    const response = await apiClient.post(
      `/resources/${resourceId}/track-download`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logger.error("Error tracking download:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to track download",
    };
  }
};

export default {
  getResources,
  getResource,
  searchResources,
  uploadResource,
  createResource,
  updateResource,
  deleteResource,
  shareResource,
  getResourceDownloadUrl,
  trackResourceDownload,
};
