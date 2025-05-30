import * as taskApi from '@/lib/api/taskApi';

const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

// --- Mock Data (Fallback only) ---
const MOCK_TASKS = [
  {
    id: 'mock-task-1',
    taskName: 'Welcome to Learn Vanguard',
    taskDescription: 'Complete your profile setup and explore the platform features.',
    taskDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    taskPriority: 'medium',
    taskStatus: 'todo',
    onHoldRemark: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-task-2',
    taskName: 'Submit Assignment #1',
    taskDescription: 'Complete and submit the first assignment for Database Management.',
    taskDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    taskPriority: 'high',
    taskStatus: 'in-progress',
    onHoldRemark: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Mock implementation of getTasks
 */
const mockGetTasks = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  let filteredTasks = [...MOCK_TASKS];
  
  // Apply filters
  if (filters.status) {
    filteredTasks = filteredTasks.filter(task => task.taskStatus === filters.status);
  }
  if (filters.priority) {
    filteredTasks = filteredTasks.filter(task => task.taskPriority === filters.priority);
  }
  
  return {
    data: filteredTasks,
    pagination: {
      page: 1,
      limit: 10,
      total: filteredTasks.length,
      totalPages: 1
    }
  };
};

/**
 * Mock implementation of createTask
 */
const mockCreateTask = async (taskData) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  return {
    id: `mock-task-${Date.now()}`,
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Mock implementation of updateTask
 */
const mockUpdateTask = async (taskId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  const existingTask = MOCK_TASKS.find(task => task.id === taskId);
  return {
    ...existingTask,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Mock implementation of deleteTask
 */
const mockDeleteTask = async (taskId) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return { message: `Mock task ${taskId} deleted successfully` };
};

/**
 * Get all tasks with optional filters.
 * Uses backend API with fallback to mock data if API fails.
 * @param {Object} filters - Optional filters (status, priority, search, etc.)
 * @returns {Promise<Object>} Tasks data with pagination
 */
export const getTasks = async (filters = {}) => {
  console.log("taskService.js: getTasks called with filters:", filters, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: getTasks - returning MOCK_TASKS");
    return mockGetTasks(filters);
  }

  try {
    console.log("taskService.js: getTasks - attempting to fetch from API");
    const result = await taskApi.getTasks(filters);
    
    if (result.success) {
      console.log("taskService.js: getTasks - API success:", result.data);
      return {
        data: result.data,
        pagination: result.pagination
      };
    } else {
      console.warn("taskService.js: getTasks - API returned error, using fallback:", result.error);
      return mockGetTasks(filters);
    }
  } catch (error) {
    console.error("taskService.js: getTasks - API call failed, using fallback:", error);
    return mockGetTasks(filters);
  }
};

/**
 * Get tasks for a specific user.
 * Uses backend API with fallback to mock data if API fails.
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} User tasks
 */
export const getUserTasks = async (userId, filters = {}) => {
  console.log(`taskService.js: getUserTasks called with userId: ${userId}, filters:`, filters, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: getUserTasks - returning MOCK_TASKS");
    const mockResult = await mockGetTasks(filters);
    return mockResult.data;
  }

  try {
    console.log("taskService.js: getUserTasks - attempting to fetch from API");
    const result = await taskApi.getUserTasks(userId, filters);
    
    if (result.success) {
      console.log("taskService.js: getUserTasks - API success:", result.data);
      return result.data;
    } else {
      console.warn("taskService.js: getUserTasks - API returned error, using fallback:", result.error);
      const mockResult = await mockGetTasks(filters);
      return mockResult.data;
    }
  } catch (error) {
    console.error("taskService.js: getUserTasks - API call failed, using fallback:", error);
    const mockResult = await mockGetTasks(filters);
    return mockResult.data;
  }
};

/**
 * Create a new task.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  console.log("taskService.js: createTask called with:", taskData, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: createTask - MOCK - creating task");
    return mockCreateTask(taskData);
  }

  try {
    console.log("taskService.js: createTask - attempting to create via API");
    const result = await taskApi.createTask(taskData);
    
    if (result.success) {
      console.log("taskService.js: createTask - API success:", result.data);
      return result.data;
    } else {
      console.error("taskService.js: createTask - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("taskService.js: createTask - API call failed:", error);
    throw error;
  }
};

/**
 * Update an existing task.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} taskId - Task ID
 * @param {Object} updates - Task updates
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, updates) => {
  console.log("taskService.js: updateTask called with:", taskId, updates, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: updateTask - MOCK - updating task");
    return mockUpdateTask(taskId, updates);
  }

  try {
    console.log("taskService.js: updateTask - attempting to update via API");
    const result = await taskApi.updateTask(taskId, updates);
    
    if (result.success) {
      console.log("taskService.js: updateTask - API success:", result.data);
      return result.data;
    } else {
      console.error("taskService.js: updateTask - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("taskService.js: updateTask - API call failed:", error);
    throw error;
  }
};

/**
 * Delete a task.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  console.log("taskService.js: deleteTask called with taskId:", taskId, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: deleteTask - MOCK - deleting task");
    return mockDeleteTask(taskId);
  }

  try {
    console.log("taskService.js: deleteTask - attempting to delete via API");
    const result = await taskApi.deleteTask(taskId);
    
    if (result.success) {
      console.log("taskService.js: deleteTask - API success:", result.message);
      return { message: result.message };
    } else {
      console.error("taskService.js: deleteTask - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("taskService.js: deleteTask - API call failed:", error);
    throw error;
  }
};

/**
 * Update task status.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskStatus = async (taskId, status) => {
  console.log("taskService.js: updateTaskStatus called with:", taskId, status, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: updateTaskStatus - MOCK - updating task status");
    return mockUpdateTask(taskId, { taskStatus: status });
  }

  try {
    console.log("taskService.js: updateTaskStatus - attempting to update via API");
    const result = await taskApi.updateTaskStatus(taskId, status);
    
    if (result.success) {
      console.log("taskService.js: updateTaskStatus - API success:", result.data);
      return result.data;
    } else {
      console.error("taskService.js: updateTaskStatus - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("taskService.js: updateTaskStatus - API call failed:", error);
    throw error;
  }
};

/**
 * Get a single task by ID
 * @param {string} taskId - ID of the task to retrieve
 * @returns {Promise<Object>} Task data
 */
export const getTaskById = async (taskId) => {
  console.log("taskService.js: getTaskById called with taskId:", taskId, "USE_MOCK_DATA:", config.useMockData);

  if (config.useMockData) {
    console.log("taskService.js: getTaskById - MOCK - getting task");
    const mockTask = MOCK_TASKS.find(task => task.id === taskId);
    return mockTask ? { data: mockTask, success: true } : { data: null, success: false, error: 'Task not found' };
  }

  try {
    console.log("taskService.js: getTaskById - attempting to fetch from API");
    const result = await taskApi.getTask(taskId);
    
    if (result.success) {
      console.log("taskService.js: getTaskById - API success:", result.data);
      return { data: result.data, success: true };
    } else {
      console.error("taskService.js: getTaskById - API returned error:", result.error);
      return { data: null, success: false, error: result.error };
    }
  } catch (error) {
    console.error("taskService.js: getTaskById - API call failed:", error);
    return { 
      data: null, 
      success: false, 
      error: error.message || 'Failed to fetch task' 
    };
  }
};

/**
 * Get task summary/statistics
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Object>} Task summary data
 */
export const getTaskSummary = async (params = {}) => {
  try {
    const response = await taskApi.getTaskSummary(params);
    return response;
  } catch (error) {
    console.error('Error fetching task summary:', error);
    return {
      data: null,
      success: false,
      error: error.message || 'Failed to fetch task summary'
    };
  }
}; 