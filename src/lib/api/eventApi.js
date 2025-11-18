import logger from "@/utils/logger";
import apiClient from "./client";
import { format, isValid, parseISO } from "date-fns";

/**
 * Event Management API Service
 * Handles all event-related API calls to the backend
 */
 * Get events with optional filters
 * @param {Object} filters - Optional filters like course, yearLevel, startDate, endDate
 * @returns {Promise} - API response
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
        logger.log("Formatted startDate:", formattedFilters.startDate);
      } catch (err) {
        logger.error("Error formatting startDate:", err);
      }
    }
    if (formattedFilters.endDate) {
          typeof formattedFilters.endDate === "string"
            ? parseISO(formattedFilters.endDate)
            : formattedFilters.endDate;
          formattedFilters.endDate = format(date, "yyyy-MM-dd");
        logger.log("Formatted endDate:", formattedFilters.endDate);
        logger.error("Error formatting endDate:", err);
    // Log the request for debugging
    const url = `/events${formatQueryParams(formattedFilters)}`;
    logger.log("Fetching events with URL:", url);
    logger.log("Filters:", formattedFilters);
    const response = await apiClient.get(url);
    logger.log("Events API response:", {
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
            logger.error("Error formatting event date in response:", err);
          }
        return event;
      });
    return response;
  } catch (error) {
    logger.error("Error fetching events:", error);
    throw error;
  }
};
 * Format query parameters for API requests
 * @param {Object} params - Query parameters
 * @returns {String} - Formatted query string
const formatQueryParams = (params) => {
  if (!params || Object.keys(params).length === 0) return "";
  const queryString = Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    .join("&");
  return queryString ? `?${queryString}` : "";
 * Get today's events
 * @returns {Promise<Object>} Today's events
export const getTodayEvents = async () => {
    const response = await apiClient.get("/events/today");
    return {
      success: true,
    };
    logger.error("Error fetching today's events:", error);
      data: [],
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch today's events",
 * Create a new event (PIO and Admin only)
 * @param {Object} eventData - Event data (title, description, scheduleDate, label, course, yearLevel)
 * @returns {Promise<Object>} Created event
export const createEvent = async (eventData) => {
    const response = await apiClient.post("/events", eventData);
      data: response.data.event,
      message: response.data.message,
    // Enhanced error logging and handling
    logger.error("Error creating event:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      eventData,
    // Return structured error response
      data: null,
      error: error.response?.data?.message || "Failed to create event",
      errorCode: error.response?.data?.error,
      details: error.response?.data?.details || {},
 * Update an existing event (PIO and Admin only)
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
export const updateEvent = async (eventId, eventData) => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    logger.error("Error updating event:", error);
        "Failed to update event",
      details: error.response?.data?.error?.details || {},
 * Delete an event (PIO and Admin only)
 * @returns {Promise<Object>} Deletion result
export const deleteEvent = async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    logger.error("Error deleting event:", error);
        "Failed to delete event",
export default {
  getEvents,
  getTodayEvents,
  createEvent,
  updateEvent,
  deleteEvent,
