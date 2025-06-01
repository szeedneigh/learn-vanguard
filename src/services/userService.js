import * as userApi from '@/lib/api/userApi';

const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

// --- Mock Data (Fallback only) ---
const MOCK_USERS = [
  {
    id: 'mock-user-1',
    email: 'john.doe@student.laverdad.edu.ph',
    fullName: 'John Doe',
    role: 'STUDENT',
    programId: 'bsis',
    year: 1,
    semester: '1st Semester',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-user-2',
    email: 'jane.smith@student.laverdad.edu.ph',
    fullName: 'Jane Smith',
    role: 'PIO',
    assignedClass: 'BSIS-First Year',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Mock implementation of getUsers
 */
const mockGetUsers = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  let filteredUsers = [...MOCK_USERS];
  
  // Apply filters
  if (filters.role) {
    filteredUsers = filteredUsers.filter(user => user.role === filters.role);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
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
      totalPages: 1
    }
  };
};

/**
 * Mock implementation of getCurrentUserProfile
 */
const mockGetCurrentUserProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return MOCK_USERS[0]; // Return first mock user as current user
};

/**
 * Mock implementation of updateCurrentUserProfile
 */
const mockUpdateCurrentUserProfile = async (profileData) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  return {
    ...MOCK_USERS[0],
    ...profileData,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Mock implementation of updateUser
 */
const mockUpdateUser = async (userId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  const existingUser = MOCK_USERS.find(user => user.id === userId);
  return {
    ...existingUser,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Mock implementation of deleteUser
 */
const mockDeleteUser = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return { message: `Mock user ${userId} deleted successfully` };
};

/**
 * Get all users with optional filters.
 * Uses backend API with fallback to mock data if API fails.
 * @param {Object} filters - Optional filters (role, search, page, limit, etc.)
 * @returns {Promise<Object>} Users data with pagination
 */
export const getUsers = async (filters = {}) => {
  console.log("userService.js: getUsers called with filters:", filters, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: getUsers - returning MOCK_USERS");
    return mockGetUsers(filters);
  }

  try {
    console.log("userService.js: getUsers - attempting to fetch from API");
    const result = await userApi.getUsers(filters);
    
    if (result.success) {
      console.log("userService.js: getUsers - API success:", result.data);
      return {
        data: result.data,
        pagination: result.pagination
      };
    } else {
      console.warn("userService.js: getUsers - API returned error, using fallback:", result.error);
      return mockGetUsers(filters);
    }
  } catch (error) {
    console.error("userService.js: getUsers - API call failed, using fallback:", error);
    return mockGetUsers(filters);
  }
};

/**
 * Get current user profile.
 * Uses backend API with fallback to mock data if API fails.
 * @returns {Promise<Object>} Current user profile
 */
export const getCurrentUserProfile = async () => {
  console.log("userService.js: getCurrentUserProfile called, USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: getCurrentUserProfile - returning mock profile");
    return mockGetCurrentUserProfile();
  }

  try {
    console.log("userService.js: getCurrentUserProfile - attempting to fetch from API");
    const result = await userApi.getCurrentUserProfile();
    
    if (result.success) {
      console.log("userService.js: getCurrentUserProfile - API success:", result.data);
      return result.data;
    } else {
      console.warn("userService.js: getCurrentUserProfile - API returned error, using fallback:", result.error);
      return mockGetCurrentUserProfile();
    }
  } catch (error) {
    console.error("userService.js: getCurrentUserProfile - API call failed, using fallback:", error);
    return mockGetCurrentUserProfile();
  }
};

/**
 * Update current user profile.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateCurrentUserProfile = async (profileData) => {
  console.log("userService.js: updateCurrentUserProfile called with:", profileData, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: updateCurrentUserProfile - MOCK - updating profile");
    return mockUpdateCurrentUserProfile(profileData);
  }

  try {
    console.log("userService.js: updateCurrentUserProfile - attempting to update via API");
    const result = await userApi.updateCurrentUserProfile(profileData);
    
    if (result.success) {
      console.log("userService.js: updateCurrentUserProfile - API success:", result.data);
      return result.data;
    } else {
      console.error("userService.js: updateCurrentUserProfile - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("userService.js: updateCurrentUserProfile - API call failed:", error);
    throw error;
  }
};

/**
 * Update a user (admin only).
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} userId - User ID
 * @param {Object} updates - User updates
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, updates) => {
  console.log("userService.js: updateUser called with:", userId, updates, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: updateUser - MOCK - updating user");
    return mockUpdateUser(userId, updates);
  }

  try {
    console.log("userService.js: updateUser - attempting to update via API");
    const result = await userApi.updateUser(userId, updates);
    
    if (result.success) {
      console.log("userService.js: updateUser - API success:", result.data);
      return result.data;
    } else {
      console.error("userService.js: updateUser - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("userService.js: updateUser - API call failed:", error);
    throw error;
  }
};

/**
 * Delete a user (admin only).
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  console.log("userService.js: deleteUser called with userId:", userId, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: deleteUser - MOCK - deleting user");
    return mockDeleteUser(userId);
  }

  try {
    console.log("userService.js: deleteUser - attempting to delete via API");
    const result = await userApi.deleteUser(userId);
    
    if (result.success) {
      console.log("userService.js: deleteUser - API success:", result.message);
      return { message: result.message };
    } else {
      console.error("userService.js: deleteUser - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("userService.js: deleteUser - API call failed:", error);
    throw error;
  }
};

/**
 * Search users.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async (query, filters = {}) => {
  console.log("userService.js: searchUsers called with query:", query, "filters:", filters, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: searchUsers - MOCK - searching users");
    // Simple mock search
    const filteredUsers = MOCK_USERS.filter(user => 
      user.fullName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    return {
      data: filteredUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredUsers.length,
        totalPages: 1
      }
    };
  }

  try {
    console.log("userService.js: searchUsers - attempting to search via API");
    const result = await userApi.searchUsers(query, filters);
    
    if (result.success) {
      console.log("userService.js: searchUsers - API success:", result.data);
      return {
        data: result.data,
        pagination: result.pagination
      };
    } else {
      console.warn("userService.js: searchUsers - API returned error, using fallback:", result.error);
      // Fallback to simple mock search
      const filteredUsers = MOCK_USERS.filter(user => 
        user.fullName.toLowerCase().includes(query.toLowerCase())
      );
      return {
        data: filteredUsers,
        pagination: { page: 1, limit: 10, total: filteredUsers.length, totalPages: 1 }
      };
    }
  } catch (error) {
    console.error("userService.js: searchUsers - API call failed, using fallback:", error);
    const filteredUsers = MOCK_USERS.filter(user => 
      user.fullName.toLowerCase().includes(query.toLowerCase())
    );
    return {
      data: filteredUsers,
      pagination: { page: 1, limit: 10, total: filteredUsers.length, totalPages: 1 }
    };
  }
};

/**
 * Get a single user by ID
 * @param {string} userId - ID of the user to retrieve
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  console.log("userService.js: getUserById called with userId:", userId, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("userService.js: getUserById - MOCK - getting user");
    const mockUser = MOCK_USERS.find(user => user.id === userId);
    return mockUser ? { data: mockUser, success: true } : { data: null, success: false, error: 'User not found' };
  }

  try {
    console.log("userService.js: getUserById - attempting to fetch from API");
    const result = await userApi.getUser(userId);
    
    if (result.success) {
      console.log("userService.js: getUserById - API success:", result.data);
      return { data: result.data, success: true };
    } else {
      console.error("userService.js: getUserById - API returned error:", result.error);
      return { data: null, success: false, error: result.error };
    }
  } catch (error) {
    console.error(`userService.js: getUserById - API call failed for user ${userId}:`, error);
    return { 
      data: null, 
      success: false, 
      error: error.message || 'Failed to fetch user' 
    };
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  try {
    const response = await userApi.createUser(userData);
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      data: null,
      success: false,
      error: error.message || 'Failed to create user'
    };
  }
};

/**
 * Assign role to a user
 * @param {string} userId - ID of the user
 * @param {string} role - Role to assign
 * @returns {Promise<Object>} Updated user
 */
export const assignUserRole = async (userId, role) => {
  try {
    const response = await userApi.assignRole(userId, role);
    return response;
  } catch (error) {
    console.error(`Error assigning role to user ${userId}:`, error);
    return {
      data: null,
      success: false,
      error: error.message || 'Failed to assign role'
    };
  }
};

/**
 * Get students by program and year
 * @param {string} programId - Program ID
 * @param {number} year - Academic year
 * @returns {Promise<Array>} List of students
 */
export const getStudentsByProgram = async (programId, year) => {
  try {
    const response = await userApi.getStudentsByProgram(programId, year);
    return response;
  } catch (error) {
    console.error(`Error fetching students for program ${programId}, year ${year}:`, error);
    return {
      data: [],
      success: false,
      error: error.message || 'Failed to fetch students'
    };
  }
};

/**
 * Assign class to students
 * @param {Array} studentIds - Array of student IDs
 * @param {Object} classData - Class assignment data
 * @returns {Promise<Object>} Assignment result
 */
export const assignClassToStudents = async (studentIds, classData) => {
  try {
    const response = await userApi.assignClass(studentIds, classData);
    return response;
  } catch (error) {
    console.error('Error assigning class to students:', error);
    return {
      data: null,
      success: false,
      error: error.message || 'Failed to assign class'
    };
  }
}; 