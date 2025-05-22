import apiClient from '@/lib/api/client';
import { ROLES } from '@/lib/constants';

/**
 * Environment configuration
 */
const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

/**
 * Mock users data for development
 */
const MOCK_USERS = [
  {
    id: 'mock-admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: ROLES.ADMIN,
    status: 'ACTIVE',
    department: 'Administration',
    avatar: null,
    createdAt: '2023-01-01',
    lastLogin: '2023-11-15'
  },
  {
    id: 'mock-pio-001',
    name: 'PIO User',
    email: 'pio@example.com',
    role: ROLES.PIO,
    status: 'ACTIVE',
    department: 'Program Implementation',
    avatar: null,
    createdAt: '2023-02-15',
    lastLogin: '2023-11-14'
  },
  {
    id: 'mock-student-001',
    name: 'Student User',
    email: 'student@example.com',
    role: ROLES.STUDENT,
    status: 'ACTIVE',
    department: null,
    avatar: null,
    createdAt: '2023-03-20',
    lastLogin: '2023-11-13'
  },
  {
    id: 'mock-student-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: ROLES.STUDENT,
    status: 'ACTIVE',
    department: null,
    avatar: null,
    createdAt: '2023-04-10',
    lastLogin: '2023-11-10'
  },
  {
    id: 'mock-student-003',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: ROLES.STUDENT,
    status: 'INACTIVE',
    department: null,
    avatar: null,
    createdAt: '2023-04-15',
    lastLogin: '2023-10-25'
  },
  {
    id: 'mock-pio-002',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: ROLES.PIO,
    status: 'ACTIVE',
    department: 'Program Implementation',
    avatar: null,
    createdAt: '2023-05-05',
    lastLogin: '2023-11-12'
  }
];

/**
 * Get users based on provided filters
 * @param {Object} params - Query parameters for filtering users
 * @returns {Promise<Object>} Object containing users array and pagination info
 */
export const getUsers = async (params = {}) => {
  if (config.useMockData) {
    return mockGetUsers(params);
  }

  try {
    const { data } = await apiClient.get('/users', { params });
    // Ensure consistent response shape
    const responseData = {
      users: Array.isArray(data) ? data : (data.users || []),
      pagination: data.pagination || null
    };
    return { data: responseData, success: true };
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    return { 
      data: { users: [], pagination: null }, 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch users' 
    };
  }
};

/**
 * Mock implementation of getUsers
 * @param {Object} params - Filter parameters
 * @returns {Promise<Object>} Mock user list with pagination
 */
const mockGetUsers = async (params = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredUsers = [...MOCK_USERS];
  
  // Apply role filter if provided
  if (params.role) {
    filteredUsers = filteredUsers.filter(user => user.role === params.role);
  }
  
  // Apply status filter if provided
  if (params.status) {
    filteredUsers = filteredUsers.filter(user => user.status === params.status);
  }
  
  // Apply department filter if provided
  if (params.department) {
    filteredUsers = filteredUsers.filter(user => user.department === params.department);
  }
  
  // Apply search filter if provided
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) || 
      user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Handle pagination
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || filteredUsers.length;
  
  // If pagination is requested
  if (params.page || params.limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get paginated results
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return { 
      data: {
        users: paginatedUsers,
        pagination: {
          total: filteredUsers.length,
          page,
          limit,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      }, 
      success: true 
    };
  }
  
  // Return all results with null pagination when no pagination is requested
  return { 
    data: {
      users: filteredUsers,
      pagination: null
    }, 
    success: true 
  };
};

/**
 * Get a specific user by ID
 * @param {string} userId - ID of the user to retrieve
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (config.useMockData) {
    return mockGetUserById(userId);
  }

  try {
    const { data } = await apiClient.get(`/users/${userId}`);
    return { data, success: true };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user' 
    };
  }
};

/**
 * Mock implementation of getUserById
 * @param {string} userId - ID of the user to retrieve
 * @returns {Promise<Object>} Mock user data
 */
const mockGetUserById = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = MOCK_USERS.find(user => user.id === userId);
  
  if (user) {
    return { data: user, success: true };
  }
  
  return { 
    data: null, 
    success: false, 
    error: 'User not found' 
  };
};

/**
 * Create a new user
 * @param {Object} userData - New user details
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  if (config.useMockData) {
    return mockCreateUser(userData);
  }

  try {
    const { data } = await apiClient.post('/users', userData);
    return { data, success: true };
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to create user' 
    };
  }
};

/**
 * Mock implementation of createUser
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created mock user
 */
const mockCreateUser = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Validate required fields
  if (!userData.name || !userData.email || !userData.role) {
    return {
      data: null,
      success: false,
      error: 'Name, email, and role are required fields'
    };
  }
  
  // Check if email already exists
  const emailExists = MOCK_USERS.some(user => user.email.toLowerCase() === userData.email.toLowerCase());
  if (emailExists) {
    return {
      data: null,
      success: false,
      error: 'Email already in use'
    };
  }
  
  const newUser = {
    id: `mock-user-${Date.now()}`,
    ...userData,
    status: userData.status || 'ACTIVE',
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: null
  };
  
  // Add to mock data
  MOCK_USERS.push(newUser);
  
  return { data: newUser, success: true };
};

/**
 * Update an existing user
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Updated user fields
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (config.useMockData) {
    return mockUpdateUser(userId, userData);
  }

  try {
    const { data } = await apiClient.put(`/users/${userId}`, userData);
    return { data, success: true };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to update user' 
    };
  }
};

/**
 * Mock implementation of updateUser
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Updated user fields
 * @returns {Promise<Object>} Updated mock user
 */
const mockUpdateUser = async (userId, userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userIndex = MOCK_USERS.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'User not found'
    };
  }
  
  // Check if email is being changed and if it already exists
  if (userData.email && 
      userData.email.toLowerCase() !== MOCK_USERS[userIndex].email.toLowerCase() &&
      MOCK_USERS.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
    return {
      data: null,
      success: false,
      error: 'Email already in use'
    };
  }
  
  // Update the user
  const updatedUser = {
    ...MOCK_USERS[userIndex],
    ...userData
  };
  
  MOCK_USERS[userIndex] = updatedUser;
  
  return { data: updatedUser, success: true };
};

/**
 * Delete a user
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteUser = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (config.useMockData) {
    return mockDeleteUser(userId);
  }

  try {
    await apiClient.delete(`/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete user' 
    };
  }
};

/**
 * Mock implementation of deleteUser
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<Object>} Deletion result
 */
const mockDeleteUser = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const userIndex = MOCK_USERS.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return {
      success: false,
      error: 'User not found'
    };
  }
  
  // Check if user is one of the default mock users
  if (['mock-admin-001', 'mock-pio-001', 'mock-student-001'].includes(userId)) {
    return {
      success: false,
      error: 'Cannot delete default users in mock mode'
    };
  }
  
  // Remove the user
  MOCK_USERS.splice(userIndex, 1);
  
  return { success: true };
};

/**
 * Update user role
 * @param {string} userId - ID of the user to update
 * @param {string} role - New role value
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role');
  }
  return updateUser(userId, { role });
};

/**
 * Get students (shorthand for getting users with student role)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} List of student users
 */
export const getStudents = async (params = {}) => {
  return getUsers({ ...params, role: ROLES.STUDENT });
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getStudents
}; 