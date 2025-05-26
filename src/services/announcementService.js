import apiClient from '@/lib/api/client';

const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

/**
 * Fetches announcements for a specific subject.
 * @param {object} params - { subjectId }
 * @returns {Promise<Array<object>>} Array of announcement objects.
 */
export const getAnnouncements = async ({ subjectId }) => {
  if (!subjectId) {
    console.warn('getAnnouncements called without subjectId');
    return [];
  }

  if (config.useMockData) {
    return mockGetAnnouncements({ subjectId });
  }

  try {
    const { data } = await apiClient.get('/announcements', { params: { subjectId } });
    // Ensure we always return an array
    return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
  } catch (error) {
    console.error(`Error fetching announcements for subject ${subjectId}:`, error.response?.data || error.message);
    return []; // Return empty array on error instead of throwing
  }
};

/**
 * Mock implementation of getAnnouncements
 */
const mockGetAnnouncements = async ({ subjectId }) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  return [
    {
      id: 'mock-announcement-1',
      content: 'Welcome to the course! Please review the syllabus.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      subjectId
    },
    {
      id: 'mock-announcement-2',
      content: 'Assignment #1 has been posted. Due date is next week.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      subjectId
    }
  ];
};

/**
 * Creates a new announcement for a subject.
 * @param {object} params - { content, subjectId }
 * @returns {Promise<object>} The created announcement object.
 */
export const createAnnouncement = async ({ content, subjectId }) => {
  if (config.useMockData) {
    return mockCreateAnnouncement({ content, subjectId });
  }

  try {
    const { data } = await apiClient.post('/announcements', { content, subjectId });
    return data;
  } catch (error) {
    console.error("Error creating announcement:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mock implementation of createAnnouncement
 */
const mockCreateAnnouncement = async ({ content, subjectId }) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  return {
    id: `mock-announcement-${Date.now()}`,
    content,
    createdAt: new Date().toISOString(),
    subjectId
  };
};

/**
 * Updates an existing announcement.
 * @param {object} params - { announcementId, content, subjectId }
 * @returns {Promise<object>} The updated announcement object.
 */
export const updateAnnouncement = async ({ announcementId, content, subjectId }) => {
  if (config.useMockData) {
    return mockUpdateAnnouncement({ announcementId, content, subjectId });
  }

  try {
    const { data } = await apiClient.put(`/announcements/${announcementId}`, { content, subjectId });
    return data;
  } catch (error) {
    console.error(`Error updating announcement ${announcementId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mock implementation of updateAnnouncement
 */
const mockUpdateAnnouncement = async ({ announcementId, content, subjectId }) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  return {
    id: announcementId,
    content,
    createdAt: new Date().toISOString(),
    subjectId
  };
};

/**
 * Deletes an announcement.
 * @param {object} params - { announcementId, subjectId }
 * @returns {Promise<void>}
 */
export const deleteAnnouncement = async ({ announcementId, subjectId }) => {
  if (config.useMockData) {
    return mockDeleteAnnouncement({ announcementId, subjectId });
  }

  try {
    await apiClient.delete(`/announcements/${announcementId}`);
  } catch (error) {
    console.error(`Error deleting announcement ${announcementId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mock implementation of deleteAnnouncement
 */
const mockDeleteAnnouncement = async ({ announcementId }) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return; // Success, no return value needed
}; 