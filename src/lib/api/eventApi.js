import apiClient from "./client";
import { format, isValid, parseISO } from "date-fns";

/**
 * Event Management API Service
 * Handles all event-related API calls to the backend
 */

/**
 * Get events with optional filters
 * @param {Object} filters - Optional filters like course, yearLevel, startDate, endDate
 * @returns {Promise} - API response
 */
export const getEvents = async (filters = {}) => {
  try {
    // Ensure consistent date format in filters
    const formattedFilters = { ...filters };

    // Format date filters consistently if they exist
    if (formattedFilters.startDate) {
      try {
        // Handle both Date objects and string dates
        const date =
          typeof formattedFilters.startDate === "string"
            ? parseISO(formattedFilters.startDate)
            : formattedFilters.startDate;

        if (isValid(date)) {
          // Use UTC date to avoid timezone issues
          formattedFilters.startDate = format(date, "yyyy-MM-dd");
        }
        console.log("Formatted startDate:", formattedFilters.startDate);
      } catch (err) {
        console.error("Error formatting startDate:", err);
      }
    }

    if (formattedFilters.endDate) {
      try {
        // Handle both Date objects and string dates
        const date =
          typeof formattedFilters.endDate === "string"
            ? parseISO(formattedFilters.endDate)
            : formattedFilters.endDate;

        if (isValid(date)) {
          // Use UTC date to avoid timezone issues
          formattedFilters.endDate = format(date, "yyyy-MM-dd");
        }
        console.log("Formatted endDate:", formattedFilters.endDate);
      } catch (err) {
        console.error("Error formatting endDate:", err);
      }
    }

    // Log the request for debugging
    const url = `/events${formatQueryParams(formattedFilters)}`;
    console.log("Fetching events with URL:", url);
    console.log("Filters:", formattedFilters);

    const response = await apiClient.get(url);
    console.log("Events API response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
      dataIsArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
    });

    // Convert dates to proper format in the response
    if (Array.isArray(response.data)) {
      response.data = response.data.map((event) => {
        if (event.scheduleDate) {
          try {
            // Convert to local date for consistent display
            const date = new Date(event.scheduleDate);

            // Add formatted date strings for easier comparison
            event._formattedDate = format(date, "yyyy-MM-dd");
            event._localDate = format(date, "yyyy-MM-dd");
            event._displayTime = format(date, "h:mm a");
          } catch (err) {
            console.error("Error formatting event date in response:", err);
          }
        }
        return event;
      });
    }

    return response;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/**
 * Format query parameters for API requests
 * @param {Object} params - Query parameters
 * @returns {String} - Formatted query string
 */
const formatQueryParams = (params) => {
  if (!params || Object.keys(params).length === 0) return "";

  const queryString = Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return queryString ? `?${queryString}` : "";
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
    // Enhanced error logging and handling
    console.error("Error creating event:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      eventData,
    });

    // Return structured error response
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || "Failed to create event",
      errorCode: error.response?.data?.error,
      details: error.response?.data?.details || {},
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
