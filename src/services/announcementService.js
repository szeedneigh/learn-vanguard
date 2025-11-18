import logger from "@/utils/logger";
import * as announcementApi from "@/lib/api/announcementApi";

const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === "true",
};

// --- Mock Data (Fallback only) ---
const MOCK_ANNOUNCEMENTS = [
  {
    id: "mock-announcement-1",
    content: "Welcome to the course! Please review the syllabus.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "medium",
    author: "System",
  },
  {
    id: "mock-announcement-2",
    content: "Assignment #1 has been posted. Due date is next week.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    author: "System",
  },
];

/**
 * Mock implementation of getAnnouncements
 */
const mockGetAnnouncements = async ({ subjectId }) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  return MOCK_ANNOUNCEMENTS.map((announcement) => ({
    ...announcement,
    subjectId,
  }));
};

/**
 * Mock implementation of createAnnouncement
 */
const mockCreateAnnouncement = async ({
  content,
  subjectId,
  title,
  priority = "medium",
  type = "general",
}) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  return {
    id: `mock-announcement-${Date.now()}`,
    content,
    title,
    priority,
    type,
    createdAt: new Date().toISOString(),
    subjectId,
    author: "Current User",
  };
};

/**
 * Mock implementation of updateAnnouncement
 */
const mockUpdateAnnouncement = async ({
  announcementId,
  content,
  subjectId,
}) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  return {
    id: announcementId,
    content,
    updatedAt: new Date().toISOString(),
    subjectId,
    priority: "medium",
    author: "Current User",
  };
};

/**
 * Mock implementation of deleteAnnouncement
 */
const mockDeleteAnnouncement = async ({ announcementId, subjectId }) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  return {
    message: `Mock announcement ${announcementId} deleted successfully`,
  };
};

/**
 * Fetches announcements for a specific subject.
 * Uses backend API with fallback to mock data if API fails.
 * @param {object} params - { subjectId }
 * @returns {Promise<Array<object>>} Array of announcement objects.
 */
export const getAnnouncements = async ({ subjectId }) => {
  if (!subjectId) {
    logger.warn("getAnnouncements called without subjectId");
    return [];
  }

  logger.log(
    `announcementService.js: getAnnouncements called with subjectId: ${subjectId}. USE_MOCK_DATA: ${config.useMockData}`
  );

  if (config.useMockData) {
    logger.log(
      "announcementService.js: getAnnouncements - returning MOCK_ANNOUNCEMENTS"
    );
    return mockGetAnnouncements({ subjectId });
  }

  try {
    logger.log(
      "announcementService.js: getAnnouncements - attempting to fetch from API"
    );
    const result = await announcementApi.getAnnouncements({ subjectId });

    if (result.success) {
      logger.log(
        "announcementService.js: getAnnouncements - API success:",
        result.data
      );
      return Array.isArray(result.data) ? result.data : [];
    } else {
      logger.warn(
        "announcementService.js: getAnnouncements - API returned error, using fallback:",
        result.error
      );
      return mockGetAnnouncements({ subjectId });
    }
  } catch (error) {
    logger.error(
      `announcementService.js: getAnnouncements - API call failed for subject ${subjectId}, using fallback:`,
      error
    );
    return mockGetAnnouncements({ subjectId });
  }
};

/**
 * Creates a new announcement for a subject.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {object} params - { content, subjectId, title, priority, type }
 * @returns {Promise<object>} The created announcement object.
 */
export const createAnnouncement = async ({
  content,
  subjectId,
  title,
  priority = "medium",
  type = "general",
  dueDate = null,
  activityData = null,
  creationSource = "manual",
}) => {
  logger.log(
    "announcementService.js: createAnnouncement called with:",
    {
      content,
      subjectId,
      title,
      priority,
      type,
      dueDate,
      activityData,
      creationSource,
    },
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (!content || !subjectId || !title) {
    logger.error(
      "announcementService.js: createAnnouncement - Missing required fields"
    );
    throw new Error(
      "Missing required fields: content, subjectId, and title are required"
    );
  }

  if (config.useMockData) {
    logger.log(
      "announcementService.js: createAnnouncement - MOCK - creating announcement"
    );
    return mockCreateAnnouncement({
      content,
      subjectId,
      title,
      priority,
      type,
    });
  }

  try {
    logger.log(
      "announcementService.js: createAnnouncement - attempting to create via API"
    );
    // Prepare the request payload, excluding activityData if it's null/undefined
    const payload = {
      content,
      subjectId,
      title,
      priority,
      type,
      dueDate,
      creationSource,
    };

    // Only include activityData if it's a valid object
    if (activityData && typeof activityData === "object") {
      payload.activityData = activityData;
      logger.log(
        "announcementService.js: Including activityData in payload:",
        activityData
      );
    } else {
      logger.log(
        "announcementService.js: Excluding activityData from payload. Value:",
        activityData,
        "Type:",
        typeof activityData
      );
    }

    const result = await announcementApi.createAnnouncement(payload);

    if (result.success) {
      logger.log(
        "announcementService.js: createAnnouncement - API success:",
        result.data
      );
      return result.data;
    } else {
      logger.error(
        "announcementService.js: createAnnouncement - API returned error:",
        result.error
      );
      // Throw error instead of falling back to mock data
      throw new Error(result.error || "Failed to create announcement");
    }
  } catch (error) {
    logger.error(
      "announcementService.js: createAnnouncement - API call failed:",
      error
    );
    // Re-throw the error instead of falling back to mock data
    throw error;
  }
};

/**
 * Updates an existing announcement.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {object} params - { announcementId, content, subjectId }
 * @returns {Promise<object>} The updated announcement object.
 */
export const updateAnnouncement = async ({
  announcementId,
  content,
  title,
  priority,
  type,
  dueDate,
  subjectId,
}) => {
  logger.log(
    "announcementService.js: updateAnnouncement called with:",
    { announcementId, content, title, priority, type, dueDate, subjectId },
    "USE_MOCK_DATA:",
    config.useMockData
  );

  // Validate required parameters
  if (!announcementId) {
    throw new Error("Announcement ID is required for update");
  }

  if (!content && !title) {
    throw new Error("At least content or title is required for update");
  }

  if (config.useMockData) {
    logger.log(
      "announcementService.js: updateAnnouncement - MOCK - updating announcement"
    );
    return mockUpdateAnnouncement({
      announcementId,
      content,
      title,
      priority,
      type,
      dueDate,
      subjectId,
    });
  }

  try {
    logger.log(
      "announcementService.js: updateAnnouncement - attempting to update via API"
    );
    // Prepare update data, excluding undefined values
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title;
    if (priority !== undefined) updateData.priority = priority;
    if (type !== undefined) updateData.type = type;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (subjectId !== undefined) updateData.subjectId = subjectId;

    const result = await announcementApi.updateAnnouncement(
      announcementId,
      updateData
    );

    if (result.success) {
      logger.log(
        "announcementService.js: updateAnnouncement - API success:",
        result.data
      );
      return result.data;
    } else {
      logger.error(
        "announcementService.js: updateAnnouncement - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    logger.error(
      "announcementService.js: updateAnnouncement - API call failed:",
      error
    );
    throw error;
  }
};

/**
 * Deletes an announcement.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {object} params - { announcementId, subjectId }
 * @returns {Promise<void>}
 */
export const deleteAnnouncement = async ({ announcementId, subjectId }) => {
  logger.log(
    "announcementService.js: deleteAnnouncement called with:",
    { announcementId, subjectId },
    "USE_MOCK_DATA:",
    config.useMockData
  );

  // Check if announcementId is valid
  if (!announcementId) {
    logger.error(
      "announcementService.js: deleteAnnouncement - Missing or invalid announcementId"
    );
    throw new Error("Missing or invalid announcement ID");
  }

  // Convert to string if it's an object ID
  const idToDelete =
    typeof announcementId === "object" && announcementId._id
      ? announcementId._id
      : announcementId;

  logger.log(`announcementService.js: Using ID for deletion: ${idToDelete}`);

  if (config.useMockData) {
    logger.log(
      "announcementService.js: deleteAnnouncement - MOCK - deleting announcement"
    );
    return mockDeleteAnnouncement({ announcementId: idToDelete, subjectId });
  }

  try {
    logger.log(
      "announcementService.js: deleteAnnouncement - attempting to delete via API"
    );
    const result = await announcementApi.deleteAnnouncement(idToDelete);

    if (result.success) {
      logger.log(
        "announcementService.js: deleteAnnouncement - API success:",
        result.message
      );
      return { message: result.message };
    } else {
      logger.error(
        "announcementService.js: deleteAnnouncement - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    logger.error(
      "announcementService.js: deleteAnnouncement - API call failed:",
      error
    );
    throw error;
  }
};
