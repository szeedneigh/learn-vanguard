import apiClient from "./client";

/**
 * Topic Management API Service
 * Handles all topic-related API calls to the backend
 */

/**
 * Get all topics for a subject
 * @param {string} subjectId - Subject ID
 * @param {Object} options - Optional parameters for pagination
 * @returns {Promise<Object>} Topics list with pagination
 */
export const getTopicsBySubject = async (subjectId, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({ page, limit });

    const response = await apiClient.get(
      `/topics/subject/${subjectId}?${params.toString()}`
    );

    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch topics",
    };
  }
};

/**
 * Get a single topic by ID
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Topic data with resources
 */
export const getTopicById = async (topicId) => {
  try {
    const response = await apiClient.get(`/topics/${topicId}`);

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching topic:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch topic",
    };
  }
};

/**
 * Create a new topic
 * @param {Object} topicData - Topic data (name, description, subjectId, order)
 * @returns {Promise<Object>} Created topic
 */
export const createTopic = async (topicData) => {
  try {
    const response = await apiClient.post("/topics", topicData);

    return {
      data: response.data.topic,
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error creating topic:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to create topic",
    };
  }
};

/**
 * Update an existing topic
 * @param {string} topicId - Topic ID
 * @param {Object} topicData - Updated topic data
 * @returns {Promise<Object>} Updated topic
 */
export const updateTopic = async (topicId, topicData) => {
  try {
    console.log("topicApi.js: Making PUT request to:", `/topics/${topicId}`);
    console.log("topicApi.js: Request data:", topicData);
    const response = await apiClient.put(`/topics/${topicId}`, topicData);

    return {
      data: response.data.topic,
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error updating topic:", error);
    console.error("topicApi.js: Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update topic",
    };
  }
};

/**
 * Delete a topic
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTopic = async (topicId) => {
  try {
    const response = await apiClient.delete(`/topics/${topicId}`);

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error deleting topic:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete topic",
    };
  }
};

/**
 * Add an activity to a topic
 * @param {string} topicId - Topic ID
 * @param {Object} activityData - Activity data (type, title, description, etc.)
 * @returns {Promise<Object>} Created activity
 */
export const addActivity = async (topicId, activityData) => {
  try {
    const response = await apiClient.post(
      `/topics/${topicId}/activities`,
      activityData
    );

    return {
      data: response.data.activity,
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error adding activity:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to add activity",
    };
  }
};

/**
 * Update an activity
 * @param {string} topicId - Topic ID
 * @param {string} activityId - Activity ID
 * @param {Object} activityData - Updated activity data
 * @returns {Promise<Object>} Updated activity
 */
export const updateActivity = async (topicId, activityId, activityData) => {
  try {
    const response = await apiClient.put(
      `/topics/${topicId}/activities/${activityId}`,
      activityData
    );

    return {
      data: response.data.activity,
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error updating activity:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update activity",
    };
  }
};

/**
 * Delete an activity
 * @param {string} topicId - Topic ID
 * @param {string} activityId - Activity ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteActivity = async (topicId, activityId) => {
  try {
    const response = await apiClient.delete(
      `/topics/${topicId}/activities/${activityId}`
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error deleting activity:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete activity",
    };
  }
};

export default {
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  addActivity,
  updateActivity,
  deleteActivity,
};
