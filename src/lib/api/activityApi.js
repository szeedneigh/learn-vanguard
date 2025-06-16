import apiClient from './client';

/**
 * Mark an activity as completed
 * @param {string} topicId - Topic ID containing the activity
 * @param {string} activityId - Activity ID to mark as complete
 * @param {string} notes - Optional notes about the completion
 * @returns {Promise<Object>} Completion result
 */
export const markActivityComplete = async (topicId, activityId, notes = null) => {
  try {
    const response = await apiClient.post(
      `/topics/${topicId}/activities/${activityId}/complete`,
      { notes }
    );

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error('Error marking activity as complete:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to mark activity as complete',
    };
  }
};

/**
 * Get all activity completions for the current user
 * @param {string} subjectId - Optional subject ID to filter completions
 * @returns {Promise<Object>} List of completed activities
 */
export const getActivityCompletions = async (subjectId = null) => {
  try {
    const params = subjectId ? { subjectId } : {};
    const response = await apiClient.get('/topics/activities/completions', { params });

    return {
      data: response.data.completions || [],
      success: true,
    };
  } catch (error) {
    console.error('Error fetching activity completions:', error);
    return {
      data: [],
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch activity completions',
    };
  }
};

/**
 * Check if a specific activity is completed by the current user
 * @param {string} topicId - Topic ID containing the activity
 * @param {string} activityId - Activity ID to check
 * @returns {Promise<Object>} Completion status
 */
export const checkActivityCompletion = async (topicId, activityId) => {
  try {
    const response = await apiClient.get(
      `/topics/${topicId}/activities/${activityId}/completion`
    );

    return {
      data: response.data,
      success: true,
      isCompleted: response.data.isCompleted,
    };
  } catch (error) {
    console.error('Error checking activity completion:', error);
    return {
      data: null,
      success: false,
      isCompleted: false,
      error: error.response?.data?.message || error.message || 'Failed to check activity completion',
    };
  }
};

/**
 * Get completion statistics for an activity (for instructors/admins)
 * @param {string} topicId - Topic ID containing the activity
 * @param {string} activityId - Activity ID to get stats for
 * @returns {Promise<Object>} Completion statistics
 */
export const getActivityCompletionStats = async (topicId, activityId) => {
  try {
    const response = await apiClient.get(
      `/topics/${topicId}/activities/${activityId}/stats`
    );

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching activity completion stats:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch completion stats',
    };
  }
};

/**
 * Batch check completion status for multiple activities
 * @param {Array} activities - Array of {topicId, activityId} objects
 * @returns {Promise<Object>} Map of completion statuses
 */
export const batchCheckActivityCompletions = async (activities) => {
  try {
    const completionPromises = activities.map(({ topicId, activityId }) =>
      checkActivityCompletion(topicId, activityId)
    );

    const results = await Promise.all(completionPromises);
    
    // Create a map of completion statuses
    const completionMap = {};
    activities.forEach(({ topicId, activityId }, index) => {
      const key = `${topicId}-${activityId}`;
      completionMap[key] = results[index].isCompleted;
    });

    return {
      data: completionMap,
      success: true,
    };
  } catch (error) {
    console.error('Error batch checking activity completions:', error);
    return {
      data: {},
      success: false,
      error: error.message || 'Failed to batch check activity completions',
    };
  }
};
