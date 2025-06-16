import * as topicApi from "@/lib/api/topicApi";

const config = {
  useMockData: false, // Set to true only during development when backend is unavailable
};

// --- Mock Data (Fallback only) ---
const MOCK_TOPICS = [
  {
    id: "topic-1",
    name: "Introduction to Databases",
    description: "Learn the basics of database design and SQL",
    subjectId: "subject-1",
    order: 0,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    activities: [
      {
        id: "activity-1",
        type: "assignment",
        title: "ER Diagram Exercise",
        description: "Create an ER diagram for a simple inventory system",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        points: 100,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "topic-2",
    name: "SQL Fundamentals",
    description: "Learn basic SQL queries and operations",
    subjectId: "subject-1",
    order: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    activities: [],
  },
];

/**
 * Get topics for a subject
 * @param {string} subjectId - Subject ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Topics with pagination
 */
export const getTopicsBySubject = async (subjectId, options = {}) => {
  console.log("topicService.js: Getting topics for subject", subjectId);

  if (config.useMockData) {
    const mockTopics = MOCK_TOPICS.filter(
      (topic) => topic.subjectId === subjectId
    );
    return {
      data: mockTopics,
      pagination: {
        page: 1,
        limit: 10,
        total: mockTopics.length,
        totalPages: 1,
      },
      success: true,
    };
  }

  try {
    const result = await topicApi.getTopicsBySubject(subjectId, options);
    return result;
  } catch (error) {
    console.error("Error getting topics:", error);
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      success: false,
      error: error.message || "Failed to get topics",
    };
  }
};

/**
 * Get a topic by ID
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Topic data with resources
 */
export const getTopicById = async (topicId) => {
  console.log("topicService.js: Getting topic", topicId);

  if (config.useMockData) {
    const topic = MOCK_TOPICS.find((t) => t.id === topicId);
    return {
      data: {
        topic: topic,
        resources: [],
      },
      success: !!topic,
    };
  }

  try {
    const result = await topicApi.getTopicById(topicId);
    return result;
  } catch (error) {
    console.error("Error getting topic:", error);
    return {
      data: null,
      success: false,
      error: error.message || "Failed to get topic",
    };
  }
};

/**
 * Create a new topic
 * @param {Object} topicData - Topic data (name, description, subjectId, order)
 * @returns {Promise<Object>} Created topic
 */
export const createTopic = async (topicData) => {
  console.log("topicService.js: Creating topic", topicData);

  if (config.useMockData) {
    const newTopic = {
      id: `topic-${Date.now()}`,
      ...topicData,
      activities: [],
      createdAt: new Date().toISOString(),
    };
    MOCK_TOPICS.push(newTopic);
    return {
      data: newTopic,
      success: true,
      message: "Topic created successfully",
    };
  }

  try {
    const result = await topicApi.createTopic(topicData);
    return result;
  } catch (error) {
    console.error("Error creating topic:", error);
    return {
      data: null,
      success: false,
      error: error.message || "Failed to create topic",
    };
  }
};

/**
 * Update a topic
 * @param {string} topicId - Topic ID
 * @param {Object} topicData - Updated topic data
 * @returns {Promise<Object>} Updated topic
 */
export const updateTopic = async (topicId, topicData) => {
  console.log("topicService.js: Updating topic", topicId, topicData);

  if (config.useMockData) {
    const index = MOCK_TOPICS.findIndex((t) => t.id === topicId);
    if (index !== -1) {
      MOCK_TOPICS[index] = {
        ...MOCK_TOPICS[index],
        ...topicData,
        updatedAt: new Date().toISOString(),
      };
      return {
        data: MOCK_TOPICS[index],
        success: true,
        message: "Topic updated successfully",
      };
    }
    return {
      success: false,
      error: "Topic not found",
    };
  }

  try {
    const result = await topicApi.updateTopic(topicId, topicData);
    return result;
  } catch (error) {
    console.error("Error updating topic:", error);
    return {
      data: null,
      success: false,
      error: error.message || "Failed to update topic",
    };
  }
};

/**
 * Delete a topic
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTopic = async (topicId) => {
  console.log("topicService.js: Deleting topic", topicId);

  if (config.useMockData) {
    const index = MOCK_TOPICS.findIndex((t) => t.id === topicId);
    if (index !== -1) {
      MOCK_TOPICS.splice(index, 1);
      return {
        success: true,
        message: "Topic deleted successfully",
      };
    }
    return {
      success: false,
      error: "Topic not found",
    };
  }

  try {
    const result = await topicApi.deleteTopic(topicId);
    return result;
  } catch (error) {
    console.error("Error deleting topic:", error);
    return {
      success: false,
      error: error.message || "Failed to delete topic",
    };
  }
};

/**
 * Add an activity to a topic
 * @param {string} topicId - Topic ID
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} Created activity
 */
export const addActivity = async (topicId, activityData) => {
  console.log(
    "topicService.js: Adding activity to topic",
    topicId,
    activityData
  );

  if (config.useMockData) {
    const topicIndex = MOCK_TOPICS.findIndex((t) => t.id === topicId);
    if (topicIndex !== -1) {
      const newActivity = {
        id: `activity-${Date.now()}`,
        ...activityData,
        createdAt: new Date().toISOString(),
      };
      MOCK_TOPICS[topicIndex].activities.push(newActivity);
      return {
        data: newActivity,
        success: true,
        message: "Activity added successfully",
      };
    }
    return {
      success: false,
      error: "Topic not found",
    };
  }

  try {
    const result = await topicApi.addActivity(topicId, activityData);
    return result;
  } catch (error) {
    console.error("Error adding activity:", error);
    return {
      data: null,
      success: false,
      error: error.message || "Failed to add activity",
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
  console.log(
    "topicService.js: Updating activity",
    topicId,
    activityId,
    activityData
  );

  if (config.useMockData) {
    const topicIndex = MOCK_TOPICS.findIndex((t) => t.id === topicId);
    if (topicIndex !== -1) {
      const activityIndex = MOCK_TOPICS[topicIndex].activities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex !== -1) {
        MOCK_TOPICS[topicIndex].activities[activityIndex] = {
          ...MOCK_TOPICS[topicIndex].activities[activityIndex],
          ...activityData,
          updatedAt: new Date().toISOString(),
        };
        return {
          data: MOCK_TOPICS[topicIndex].activities[activityIndex],
          success: true,
          message: "Activity updated successfully",
        };
      }
    }
    return {
      success: false,
      error: "Topic or activity not found",
    };
  }

  try {
    const result = await topicApi.updateActivity(
      topicId,
      activityId,
      activityData
    );
    return result;
  } catch (error) {
    console.error("Error updating activity:", error);
    return {
      data: null,
      success: false,
      error: error.message || "Failed to update activity",
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
  console.log("topicService.js: Deleting activity", topicId, activityId);

  if (config.useMockData) {
    const topicIndex = MOCK_TOPICS.findIndex((t) => t.id === topicId);
    if (topicIndex !== -1) {
      const activityIndex = MOCK_TOPICS[topicIndex].activities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex !== -1) {
        MOCK_TOPICS[topicIndex].activities.splice(activityIndex, 1);
        return {
          success: true,
          message: "Activity deleted successfully",
        };
      }
    }
    return {
      success: false,
      error: "Topic or activity not found",
    };
  }

  try {
    const result = await topicApi.deleteActivity(topicId, activityId);
    return result;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return {
      success: false,
      error: error.message || "Failed to delete activity",
    };
  }
};

// Re-export activity completion functions for convenience
export {
  markActivityComplete,
  getActivityCompletions,
  checkActivityCompletion,
  batchCheckActivityCompletions,
  filterIncompleteActivities,
  filterCompletedActivities,
  areAllActivitiesCompleted,
  getTopicCompletionProgress,
} from "./activityService";

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
