import apiClient from '@/lib/api/client';

/**
 * Fetches a list of events.
 * @param {object} params - Query parameters for filtering (e.g., { date_start: 'YYYY-MM-DD', date_end: 'YYYY-MM-DD', type: 'meeting' }).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of event objects.
 */
export const getEvents = async (params) => {
  try {
    const { data } = await apiClient.get('/events', { params });
    return data;
  } catch (error) {
    console.error("Error fetching events:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single event by its ID.
 * @param {string} eventId - The ID of the event to fetch.
 * @returns {Promise<object>} A promise that resolves to the event object.
 */
export const getEventById = async (eventId) => {
  try {
    const { data } = await apiClient.get(`/events/${eventId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new event.
 * @param {object} eventData - The data for the new event.
 * @returns {Promise<object>} A promise that resolves to the created event object.
 */
export const createEvent = async (eventData) => {
  try {
    const { data } = await apiClient.post('/events', eventData);
    return data;
  } catch (error) {
    console.error("Error creating event:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing event.
 * @param {string} eventId - The ID of the event to update.
 * @param {object} eventData - The data to update for the event.
 * @returns {Promise<object>} A promise that resolves to the updated event object.
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const { data } = await apiClient.put(`/events/${eventId}`, eventData);
    return data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes an event.
 * @param {string} eventId - The ID of the event to delete.
 * @returns {Promise<object>} A promise that resolves to the response data (or handles no content).
 */
export const deleteEvent = async (eventId) => {
  try {
    const { data } = await apiClient.delete(`/events/${eventId}`);
    return data;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error.response?.data || error.message);
    throw error;
  }
}; 