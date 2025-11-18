import logger from "@/utils/logger";
import * as activityApi from '@/lib/api/activityApi';

/**
 * Service layer for activity completion functionality
 * Provides a clean interface between components and API calls
 */

/**
 * Mark an activity as completed
 * @param {string} topicId - Topic ID containing the activity
 * @param {string} activityId - Activity ID to mark as complete
 * @param {string} notes - Optional notes about the completion
 * @returns {Promise<Object>} Completion result
 */
export const markActivityComplete = async (topicId, activityId, notes = null) => {
  try {
    const result = await activityApi.markActivityComplete(topicId, activityId, notes);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.data,
      message: 'Activity marked as completed successfully',
    };
  } catch (error) {
    logger.error('Service: Error marking activity as complete:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark activity as complete',
    };
  }
};

/**
 * Get all completed activities for the current user
 * @param {string} subjectId - Optional subject ID to filter completions
 * @returns {Promise<Object>} List of completed activities
 */
export const getActivityCompletions = async (subjectId = null) => {
  try {
    const result = await activityApi.getActivityCompletions(subjectId);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    logger.error('Service: Error fetching activity completions:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch activity completions',
    };
  }
};

/**
 * Check if a specific activity is completed
 * @param {string} topicId - Topic ID containing the activity
 * @param {string} activityId - Activity ID to check
 * @returns {Promise<Object>} Completion status
 */
export const checkActivityCompletion = async (topicId, activityId) => {
  try {
    const result = await activityApi.checkActivityCompletion(topicId, activityId);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      success: true,
      isCompleted: result.isCompleted,
      data: result.data,
    };
  } catch (error) {
    logger.error('Service: Error checking activity completion:', error);
    return {
      success: false,
      isCompleted: false,
      error: error.message || 'Failed to check activity completion',
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
    const result = await activityApi.batchCheckActivityCompletions(activities);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    logger.error('Service: Error batch checking activity completions:', error);
    return {
      success: false,
      data: {},
      error: error.message || 'Failed to batch check activity completions',
    };
  }
};

/**
 * Helper function to filter out completed activities from a list
 * @param {Array} activities - Array of activity objects
 * @param {Object} completionMap - Map of completion statuses
 * @param {string} topicId - Topic ID for the activities
 * @returns {Array} Filtered activities (non-completed only)
 */
export const filterIncompleteActivities = (activities, completionMap, topicId) => {
  if (!activities || !completionMap) return activities;

  return activities.filter(activity => {
    const key = `${topicId}-${activity._id}`;
    return !completionMap[key];
  });
};

/**
 * Helper function to get completed activities from a list
 * @param {Array} activities - Array of activity objects
 * @param {Object} completionMap - Map of completion statuses
 * @param {string} topicId - Topic ID for the activities
 * @returns {Array} Completed activities only
 */
export const filterCompletedActivities = (activities, completionMap, topicId) => {
  if (!activities || !completionMap) return [];

  return activities.filter(activity => {
    const key = `${topicId}-${activity._id}`;
    return completionMap[key];
  });
};

/**
 * Helper function to check if all activities in a topic are completed
 * @param {Array} activities - Array of activity objects
 * @param {Object} completionMap - Map of completion statuses
 * @param {string} topicId - Topic ID for the activities
 * @returns {boolean} True if all activities are completed
 */
export const areAllActivitiesCompleted = (activities, completionMap, topicId) => {
  if (!activities || activities.length === 0) return true;
  if (!completionMap) return false;

  return activities.every(activity => {
    const key = `${topicId}-${activity._id}`;
    return completionMap[key];
  });
};

/**
 * Helper function to get completion progress for a topic
 * @param {Array} activities - Array of activity objects
 * @param {Object} completionMap - Map of completion statuses
 * @param {string} topicId - Topic ID for the activities
 * @returns {Object} Progress information
 */
export const getTopicCompletionProgress = (activities, completionMap, topicId) => {
  if (!activities || activities.length === 0) {
    return { completed: 0, total: 0, percentage: 100 };
  }

  if (!completionMap) {
    return { completed: 0, total: activities.length, percentage: 0 };
  }

  const completed = activities.filter(activity => {
    const key = `${topicId}-${activity._id}`;
    return completionMap[key];
  }).length;

  const total = activities.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
};
