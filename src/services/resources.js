import apiClient from '@/lib/api/client';

/**
 * Fetches a list of resources.
 * @param {object} params - Query parameters for filtering (e.g., { type: 'pdf', category: 'lecture-notes' }).
 * @returns {Promise<object>} A promise that resolves to { data, success, error }.
 */
export const getResources = async (params) => {
  try {
    const { data } = await apiClient.get('/resources', { params });
    return { data, success: true, error: null };
  } catch (error) {
    console.error("Error fetching resources:", error.response?.data || error.message);
    return {
      data: [],
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch resources'
    };
  }
};

/**
 * Fetches a single resource by its ID.
 * @param {string} resourceId - The ID of the resource to fetch.
 * @returns {Promise<object>} A promise that resolves to { data, success, error }.
 */
export const getResourceById = async (resourceId) => {
  try {
    const { data } = await apiClient.get(`/resources/${resourceId}`);
    return { data, success: true, error: null };
  } catch (error) {
    console.error(`Error fetching resource ${resourceId}:`, error.response?.data || error.message);
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch resource'
    };
  }
};

/**
 * Creates a new resource (e.g., uploads a file and/or its metadata).
 * @param {FormData | object} resourceData - The data for the new resource. This might be FormData if uploading files.
 * @returns {Promise<object>} A promise that resolves to { data, success, error }.
 */
export const createResource = async (resourceData) => {
  try {
    // If uploading files, headers might need to be adjusted, e.g., 'Content-Type': 'multipart/form-data'
    // Axios typically handles this automatically if resourceData is a FormData object.
    const { data } = await apiClient.post('/resources', resourceData);
    return { data, success: true, error: null };
  } catch (error) {
    console.error("Error creating resource:", error.response?.data || error.message);
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create resource'
    };
  }
};

/**
 * Updates an existing resource.
 * @param {string} resourceId - The ID of the resource to update.
 * @param {FormData | object} resourceData - The data to update for the resource.
 * @returns {Promise<object>} A promise that resolves to { data, success, error }.
 */
export const updateResource = async (resourceId, resourceData) => {
  try {
    // Similar to create, this might involve FormData
    const { data } = await apiClient.put(`/resources/${resourceId}`, resourceData);
    return { data, success: true, error: null };
  } catch (error) {
    console.error(`Error updating resource ${resourceId}:`, error.response?.data || error.message);
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update resource'
    };
  }
};

/**
 * Deletes a resource.
 * @param {string} resourceId - The ID of the resource to delete.
 * @returns {Promise<object>} A promise that resolves to { data, success, error }.
 */
export const deleteResource = async (resourceId) => {
  try {
    const { data } = await apiClient.delete(`/resources/${resourceId}`);
    return { data: null, success: true, error: null };
  } catch (error) {
    console.error(`Error deleting resource ${resourceId}:`, error.response?.data || error.message);
    return {
      data: null,
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete resource'
    };
  }
}; 