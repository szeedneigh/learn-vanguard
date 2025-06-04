import apiClient from "./client";

/**
 * Event Management API Service
 * Handles all event-related API calls to the backend
 */

/**
 * Get events with optional filters
 * @param {Object} filters - Optional filters (startDate, endDate, course, yearLevel, etc.)
 * @returns {Promise<Object>} Events data
 */
export const getEvents = async (filters = {}) => {
  try {
    // Build query params
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.course) params.append("course", filters.course);
    if (filters.yearLevel) params.append("yearLevel", filters.yearLevel);
    if (filters.archived !== undefined)
      params.append("archived", filters.archived);

    // Add userFiltered parameter to rely on backend filtering for students
    if (filters.userFiltered) params.append("userFiltered", "true");

    const url = `/events${params.toString() ? `?${params.toString()}` : ""}`;

    console.log("Fetching events with URL:", url);
    const response = await apiClient.get(url);
    console.log("Events response:", response.data);

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch events",
    };
  }
};

/**
 * Get today's events
 * @returns {Promise<Object>} Today's events
 */
export const getTodayEvents = async () => {
  try {
    const response = await apiClient.get("/events/today");
    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching today's events:", error);
    return {
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch today's events",
    };
  }
};

/**
 * Create a new event (PIO and Admin only)
 * @param {Object} eventData - Event data (title, description, scheduleDate, label, course, yearLevel)
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post("/events", eventData);
    return {
      data: response.data.event,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to create event",
      details: error.response?.data?.error?.details || {},
    };
  }
};

/**
 * Update an existing event (PIO and Admin only)
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return {
      data: response.data.event,
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update event",
      details: error.response?.data?.error?.details || {},
    };
  }
};

/**
 * Delete an event (PIO and Admin only)
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await apiClient.delete(`/events/${eventId}`);
    return {
      message: response.data.message,
      success: true,
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete event",
    };
  }
};

export default {
  getEvents,
  getTodayEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
