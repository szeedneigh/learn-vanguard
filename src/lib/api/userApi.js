import apiClient from "./client";

/**
 * User Management API Service
 * Handles all user-related API calls to the backend
 */

/**
 * Get all users (admin only)
 * @param {Object} filters - Optional filters (role, search, page, limit, etc.)
 * @returns {Promise<Object>} Users list with pagination
 */
export const getUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(`/users?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      data: [],
      pagination: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch users",
    };
  }
};

/**
 * Get a single user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User details
 */
export const getUser = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch user",
    };
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await apiClient.get("/users/profile");
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch profile",
    };
  }
};

/**
 * Update current user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateCurrentUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put("/users/profile", profileData);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update profile",
    };
  }
};

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} updates - User updates
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, updates) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, updates);
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update user",
    };
  }
};

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return {
      success: true,
      message: response.data.message || "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete user",
    };
  }
};

/**
 * Search users
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("q", query);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await apiClient.get(`/users/search?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      data: [],
      pagination: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to search users",
    };
  }
};

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/role`, { role });
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update user role",
    };
  }
};

/**
 * Update user status (admin only)
 * @param {string} userId - User ID
 * @param {string} status - New status (active, inactive, suspended)
 * @returns {Promise<Object>} Updated user
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/status`, {
      status,
    });
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update user status",
    };
  }
};

/**
 * Get user statistics (admin only)
 * @returns {Promise<Object>} User statistics
 */
export const getUserStatistics = async () => {
  try {
    const response = await apiClient.get("/users/statistics");
    return {
      data: response.data.data || response.data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch user statistics",
    };
  }
};

/**
 * Upload user avatar
 * @param {File} file - Avatar image file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Upload result
 */
export const uploadUserAvatar = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiClient.post("/users/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return {
      data: response.data.data || response.data,
      success: true,
      url: response.data.data?.avatarUrl || response.data.avatarUrl,
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      data: null,
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to upload avatar",
    };
  }
};

/**
 * Assigns PIO role to a user
 * @param {string} userId - The ID of the user to make PIO
 * @param {Object} data - The role assignment data
 * @param {string} data.course - The course the PIO will be assigned to
 * @param {string} data.yearLevel - The year level the PIO will be assigned to
 * @returns {Promise<Object>} Updated user
 */
export const assignPIORole = async (userId, data) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to assign PIO role");
    }

    if (!data || !data.course || !data.yearLevel) {
      throw new Error("Course and year level are required to assign PIO role");
    }

    console.log(
      `API: Assigning PIO role to user ${userId} with course ${data.course} and year level ${data.yearLevel}`
    );

    const response = await apiClient.post(`/users/pio/${userId}`, {
      course: data.course,
      yearLevel: data.yearLevel,
    });

    console.log("PIO role assignment response:", response.data);

    return {
      data: response.data.user || response.data,
      message: response.data.message || "PIO role assigned successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error assigning PIO role:", error);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Extract the most useful error message
    let errorMessage = "Failed to assign PIO role";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      data: null,
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Revert PIO role back to student
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const revertPIORole = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to revert PIO role");
    }

    console.log(`API: Reverting PIO role for user ${userId}`);

    const response = await apiClient.post(`/users/pio/${userId}/revert`);

    console.log("Revert PIO role response:", response.data);

    return {
      data: response.data.user || response.data,
      message: response.data.message || "PIO role reverted successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error reverting PIO role:", error);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Extract the most useful error message
    let errorMessage = "Failed to revert PIO role";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      data: null,
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Move student to different class
 * @param {string} userId - User ID to move
 * @param {Object} moveData - Move data containing targetCourse and targetYearLevel
 * @returns {Promise<Object>} Move result
 */
export const moveStudent = async (userId, moveData) => {
  try {
    const response = await apiClient.put(`/users/move/${userId}`, moveData);
    return {
      data: response.data.user || response.data,
      message: response.data.message || "Student moved successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error moving student:", error);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Extract the most useful error message
    let errorMessage = "Failed to move student";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      data: null,
      success: false,
      error: errorMessage,
    };
  }
};

export default {
  getUsers,
  getUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateUser,
  deleteUser,
  searchUsers,
  updateUserRole,
  updateUserStatus,
  getUserStatistics,
  uploadUserAvatar,
  assignPIORole,
  revertPIORole,
  moveStudent,
};
