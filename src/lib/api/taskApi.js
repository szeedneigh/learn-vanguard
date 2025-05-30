import apiClient from './client';

/**
 * Task Management API Service
 * Handles all task-related API calls to the backend
 */

/**
 * Get task summary statistics
 * @returns {Promise<Object>} Task summary (total, completed, overdue, archived)
 */
export const getTaskSummary = async () => {
  try {
    const response = await apiClient.get('/tasks/summary');
    return {
      data: response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching task summary:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch task summary'
    };
  }
};

/**
 * Get tasks with optional filters
 * @param {Object} filters - Optional filters (status, assigneeId, dueDate, etc.)
 * @returns {Promise<Object>} Tasks list with pagination
 */
export const getTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await apiClient.get(`/tasks?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || null,
      success: true
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return {
      data: [],
      pagination: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch tasks'
    };
  }
};

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task details
 */
export const getTask = async (taskId) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch task'
    };
  }
};

/**
 * Get tasks for a specific user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} User tasks
 */
export const getUserTasks = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await apiClient.get(`/tasks/user/${userId}?${params.toString()}`);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return {
      data: [],
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch user tasks'
    };
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/tasks', taskData);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create task'
    };
  }
};

/**
 * Update an existing task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Task updates
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const response = await apiClient.put(`/tasks/${taskId}`, updates);
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update task'
    };
  }
};

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return {
      success: true,
      message: response.data.message || 'Task deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete task'
    };
  }
};

/**
 * Update task status
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error updating task status:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update task status'
    };
  }
};

/**
 * Assign task to user
 * @param {string} taskId - Task ID
 * @param {string} assigneeId - User ID to assign to
 * @returns {Promise<Object>} Updated task
 */
export const assignTask = async (taskId, assigneeId) => {
  try {
    const response = await apiClient.patch(`/tasks/${taskId}/assign`, { assigneeId });
    return {
      data: response.data.data || response.data,
      success: true
    };
  } catch (error) {
    console.error('Error assigning task:', error);
    return {
      data: null,
      success: false,
      error: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to assign task'
    };
  }
};

export default {
  getTaskSummary,
  getTasks,
  getTask,
  getUserTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
}; 