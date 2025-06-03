import apiClient from '@/lib/api/client';

/**
 * Fetches a list of users.
 * @param {object} params - Query parameters for filtering (e.g., { role: 'STUDENT', programId: 'bsis', year: 1, search: 'John' }).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 */
export const getUsers = async (params) => {
  try {
    const { data } = await apiClient.get('/users', { params });
    return data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single user by their ID.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<object>} A promise that resolves to the user object.
 */
export const getUserById = async (userId) => {
  try {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new user.
 * @param {object} userData - The data for the new user.
 * @returns {Promise<object>} A promise that resolves to the created user object.
 */
export const createUser = async (userData) => {
  try {
    const { data } = await apiClient.post('/users', userData);
    return data;
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing user.
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - The data to update for the user.
 * @returns {Promise<object>} A promise that resolves to the updated user object.
 */
export const updateUser = async (userId, userData) => {
  try {
    const { data } = await apiClient.put(`/users/${userId}`, userData);
    return data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a user.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<object>} A promise that resolves to the response data (or handles no content).
 */
export const deleteUser = async (userId) => {
  try {
    const { data } = await apiClient.delete(`/users/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Assigns or updates a role for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} role - The role to assign (e.g., 'PIO', 'ADMIN', 'STUDENT').
 * @returns {Promise<object>} A promise that resolves to the updated user object or confirmation.
 */
export const assignUserRole = async (userId, role) => {
  try {
    const { data } = await apiClient.put(`/users/${userId}/role`, { role });
    return data;
  } catch (error) {
    console.error(`Error assigning role to user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Note: The previous mock functions can be mapped to these new service functions.
// For example:
// - fetchStudentsAPI(programId, year) could map to getUsers({ programId, year, role: 'STUDENT' })
// - assignRoleAPI(studentId, role) could map to assignUserRole(studentId, role) or updateUser(studentId, { role })
// The exact mapping depends heavily on your backend API capabilities and data model.
