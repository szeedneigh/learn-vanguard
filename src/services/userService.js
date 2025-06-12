import * as userApi from "@/lib/api/userApi";
import apiClient from "@/lib/api/client";

const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === "true",
};

// --- Mock Data (Fallback only) ---
const MOCK_USERS = [
  {
    id: "mock-user-1",
    email: "john.doe@student.laverdad.edu.ph",
    fullName: "John Doe",
    role: "STUDENT",
    programId: "bsis",
    year: 1,
    semester: "1st Semester",
    status: "active",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-user-2",
    email: "jane.smith@student.laverdad.edu.ph",
    fullName: "Jane Smith",
    role: "PIO",
    assignedClass: "BSIS-First Year",
    status: "active",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock implementation of getUsers
 */
const mockGetUsers = async (filters = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  let filteredUsers = [...MOCK_USERS];

  // Apply filters
  if (filters.role) {
    filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  return {
    data: filteredUsers,
    pagination: {
      page: 1,
      limit: 10,
      total: filteredUsers.length,
      totalPages: 1,
    },
  };
};

/**
 * Mock implementation of getCurrentUserProfile
 */
const mockGetCurrentUserProfile = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  return MOCK_USERS[0]; // Return first mock user as current user
};

/**
 * Mock implementation of updateCurrentUserProfile
 */
const mockUpdateCurrentUserProfile = async (profileData) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  return {
    ...MOCK_USERS[0],
    ...profileData,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Mock implementation of updateUser
 */
const mockUpdateUser = async (userId, updates) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  const existingUser = MOCK_USERS.find((user) => user.id === userId);
  return {
    ...existingUser,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Mock implementation of deleteUser
 */
const mockDeleteUser = async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  return { message: `Mock user ${userId} deleted successfully` };
};

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
 * @param {string} userId - User ID
 * @returns {Promise} - API response
 */
export const removeUser = async (userId) => {
  try {
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
