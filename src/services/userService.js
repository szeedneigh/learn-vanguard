import apiClient from "@/lib/api/client";

/**
 * Get all users with optional filtering
 * @param {Object} filters - Optional filters (course, yearLevel, role, gender, search)
 * @returns {Promise} - API response with users data
 */
export const getUsers = async (filters = {}) => {
  try {
    const response = await apiClient.get("/users", { params: filters });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

/**
 * Get students for a specific class
 * @param {Object} params - Parameters (course, yearLevel)
 * @returns {Promise} - API response with students data
 */
export const getClassStudents = async (params = {}) => {
  try {
    const response = await apiClient.get("/users/class", { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching class students:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch students",
    };
  }
};

/**
 * Search for students that can be added to a class
 * @param {string} query - Search query
 * @returns {Promise} - API response with search results
 */
export const searchAvailableStudents = async (query) => {
  try {
    const response = await apiClient.get("/users/search", {
      params: { search: query },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error searching students:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to search students",
    };
  }
};

/**
 * Assign PIO role to a student
 * @param {string} userId - User ID
 * @param {Object} data - Role assignment data (assignedClass)
 * @returns {Promise} - API response
 */
export const assignPioRole = async (userId, data) => {
  try {
    const response = await apiClient.post(`/users/pio/${userId}`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error assigning PIO role:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to assign PIO role",
    };
  }
};

/**
 * Remove a student
 * @param {Object|string} user - User object or User ID
 * @returns {Promise} - API response
 */
export const removeUser = async (user) => {
  try {
    // Extract the user ID from the object or use the string directly
    const userId = typeof user === 'object' ? (user.studentId || user.id || user.userId) : user;
    
    if (!userId) {
      throw new Error('No valid user ID found');
    }
    
    const response = await apiClient.delete(`/users/${userId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error removing user:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to remove user",
    };
  }
};

export const userService = {
  getUsers,
  getClassStudents,
  searchAvailableStudents,
  assignPioRole,
  removeUser,
};

export default userService;
