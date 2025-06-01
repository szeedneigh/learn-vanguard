import { getEvents, getTodayEvents, createEvent, updateEvent, deleteEvent } from '@/lib/api/eventApi';

/**
 * Event Service - Backend API Integration
 * All mock data removed - using real backend API calls
 */

/**
 * Get events with optional filters
 * @param {Object} filters - Optional filters (startDate, endDate, course, yearLevel)
 * @returns {Promise<Object>} Events data
 */
export const getEventsData = async (filters = {}) => {
  return await getEvents(filters);
};

/**
 * Get today's events
 * @returns {Promise<Object>} Today's events data
 */
export const getTodayEventsData = async () => {
  return await getTodayEvents();
};

/**
 * Create a new event
 * @param {Object} eventData - Event data to create
 * @returns {Promise<Object>} Created event
 */
export const createEventData = async (eventData) => {
  return await createEvent(eventData);
};

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export const updateEventData = async (eventId, eventData) => {
  return await updateEvent(eventId, eventData);
};

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteEventData = async (eventId) => {
  return await deleteEvent(eventId);
};

// Export all functions
export default {
  getEventsData,
  getTodayEventsData,
  createEventData,
  updateEventData,
  deleteEventData
}; 