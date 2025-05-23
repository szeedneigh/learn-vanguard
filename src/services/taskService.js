import apiClient, { createCancelableRequest } from '@/lib/api/client';
import { ROLES } from '@/lib/constants';

/**
 * Environment configuration
 */
const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

/**
 * Mock task data for development
 */
const MOCK_TASKS = [
  {
    id: 'task-001',
    title: 'Complete React Fundamentals Module',
    description: 'Go through the React basics module and complete all exercises.',
    status: 'IN_PROGRESS',
    dueDate: '2023-11-20',
    priority: 'HIGH',
    assignedTo: 'mock-student-001',
    assignedBy: 'mock-pio-001',
    createdAt: '2023-11-01',
    updatedAt: '2023-11-05',
    completionProgress: 60,
    attachments: [],
    comments: [
      {
        id: 'comment-001',
        userId: 'mock-pio-001',
        userName: 'PIO User',
        content: 'How is the progress going?',
        createdAt: '2023-11-10'
      }
    ]
  },
  {
    id: 'task-002',
    title: 'Submit Final JavaScript Project',
    description: 'Complete and submit your final JavaScript project.',
    status: 'TODO',
    dueDate: '2023-12-15',
    priority: 'MEDIUM',
    assignedTo: 'mock-student-001',
    assignedBy: 'mock-pio-001',
    createdAt: '2023-11-08',
    updatedAt: '2023-11-08',
    completionProgress: 0,
    attachments: [],
    comments: []
  },
  {
    id: 'task-003',
    title: 'Review Student Submissions',
    description: 'Go through the submitted JavaScript assignments and provide feedback.',
    status: 'TODO',
    dueDate: '2023-11-30',
    priority: 'HIGH',
    assignedTo: 'mock-pio-001',
    assignedBy: 'mock-admin-001',
    createdAt: '2023-11-15',
    updatedAt: '2023-11-15',
    completionProgress: 0,
    attachments: [],
    comments: []
  },
  {
    id: 'task-004',
    title: 'Prepare Next Module Materials',
    description: 'Prepare learning materials for the next CSS module.',
    status: 'IN_PROGRESS',
    dueDate: '2023-12-05',
    priority: 'MEDIUM',
    assignedTo: 'mock-pio-001',
    assignedBy: 'mock-admin-001',
    createdAt: '2023-11-10',
    updatedAt: '2023-11-12',
    completionProgress: 30,
    attachments: [],
    comments: []
  },
  {
    id: 'task-005',
    title: 'Curriculum Review',
    description: 'Review and approve the updated curriculum for the next semester.',
    status: 'COMPLETED',
    dueDate: '2023-11-15',
    priority: 'HIGH',
    assignedTo: 'mock-admin-001',
    assignedBy: 'mock-admin-001',
    createdAt: '2023-11-01',
    updatedAt: '2023-11-14',
    completionProgress: 100,
    attachments: [],
    comments: []
  }
];

/**
 * Get tasks based on provided filters
 * @param {Object} params - Query parameters for filtering tasks
 * @returns {Promise<Array>} List of tasks
 */
export const getTasks = async (params = {}) => {
  if (config.useMockData) {
    return mockGetTasks(params);
  }

  try {
    const { data } = await apiClient.get('/tasks', { params });
    return { data, success: true };
  } catch (error) {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    return { 
      data: [], 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch tasks' 
    };
  }
};

/**
 * Mock implementation of getTasks
 * @param {Object} params - Filter parameters
 * @returns {Promise<Object>} Mock task list
 */
const mockGetTasks = async (params = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredTasks = [...MOCK_TASKS];
  
  // Apply filters based on params
  if (params.status) {
    filteredTasks = filteredTasks.filter(task => task.status === params.status);
  }
  
  if (params.assignedTo) {
    filteredTasks = filteredTasks.filter(task => task.assignedTo === params.assignedTo);
  }
  
  if (params.assignedBy) {
    filteredTasks = filteredTasks.filter(task => task.assignedBy === params.assignedBy);
  }
  
  if (params.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
  }
  
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) || 
      task.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by due date by default
  filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return { data: filteredTasks, success: true };
};

/**
 * Get a specific task by ID
 * @param {string} taskId - ID of the task to retrieve
 * @returns {Promise<Object>} Task data
 */
export const getTaskById = async (taskId) => {
  if (!taskId) {
    return {
      data: null,
      success: false,
      error: 'Task ID is required'
    };
  }
  
  if (config.useMockData) {
    return mockGetTaskById(taskId);
  }

  try {
    const { data } = await apiClient.get(`/tasks/${taskId}`);
    return { data, success: true };
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch task' 
    };
  }
};

/**
 * Mock implementation of getTaskById
 * @param {string} taskId - ID of the task to retrieve
 * @returns {Promise<Object>} Mock task data
 */
const mockGetTaskById = async (taskId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const task = MOCK_TASKS.find(task => task.id === taskId);
  
  if (task) {
    return { data: task, success: true };
  }
  
  return { 
    data: null, 
    success: false, 
    error: 'Task not found' 
  };
};

/**
 * Create a new task
 * @param {Object} taskData - New task details
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  // Validate required fields
  if (!taskData?.title?.trim() || !taskData?.assignedTo?.trim()) {
    return {
      data: null,
      success: false,
      error: 'Title and assignedTo are required fields'
    };
  }

  if (config.useMockData) {
    return mockCreateTask(taskData);
  }

  try {
    const { data } = await apiClient.post('/tasks', taskData);
    return { data, success: true };
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to create task' 
    };
  }
};

/**
 * Mock implementation of createTask
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created mock task
 */
const mockCreateTask = async (taskData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Validate required fields
  if (!taskData.title || !taskData.assignedTo) {
    return {
      data: null,
      success: false,
      error: 'Title and assignedTo are required fields'
    };
  }
  
  const newTask = {
    id: `task-${Date.now()}`,
    ...taskData,
    status: taskData.status || 'TODO',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    completionProgress: taskData.completionProgress || 0,
    attachments: taskData.attachments || [],
    comments: taskData.comments || []
  };
  
  // Add to mock data
  MOCK_TASKS.push(newTask);
  
  return { data: newTask, success: true };
};

/**
 * Update an existing task
 * @param {string} taskId - ID of the task to update
 * @param {Object} taskData - Updated task fields
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, taskData) => {
  if (!taskId) {
    throw new Error('Task ID is required');
  }
  
  if (config.useMockData) {
    return mockUpdateTask(taskId, taskData);
  }

  try {
    const { data } = await apiClient.put(`/tasks/${taskId}`, taskData);
    return { data, success: true };
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to update task' 
    };
  }
};

/**
 * Mock implementation of updateTask
 * @param {string} taskId - ID of the task to update
 * @param {Object} taskData - Updated task fields
 * @returns {Promise<Object>} Updated mock task
 */
const mockUpdateTask = async (taskId, taskData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const taskIndex = MOCK_TASKS.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Task not found'
    };
  }
  
  // Update the task
  const updatedTask = {
    ...MOCK_TASKS[taskIndex],
    ...taskData,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  MOCK_TASKS[taskIndex] = updatedTask;
  
  return { data: updatedTask, success: true };
};

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTask = async (taskId) => {
  if (!taskId) {
    throw new Error('Task ID is required');
  }
  
  if (config.useMockData) {
    return mockDeleteTask(taskId);
  }

  try {
    await apiClient.delete(`/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete task' 
    };
  }
};

/**
 * Mock implementation of deleteTask
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<Object>} Deletion result
 */
const mockDeleteTask = async (taskId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const taskIndex = MOCK_TASKS.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return {
      success: false,
      error: 'Task not found'
    };
  }
  
  // Remove the task
  MOCK_TASKS.splice(taskIndex, 1);
  
  return { success: true };
};

/**
 * Update task status
 * @param {string} taskId - ID of the task to update
 * @param {string} status - New status value
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskStatus = async (taskId, status) => {
  return updateTask(taskId, { status });
};

/**
 * Update task progress
 * @param {string} taskId - ID of the task to update
 * @param {number} progress - New progress value (0-100)
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskProgress = async (taskId, progress) => {
  // Ensure progress is a number and clamp between 0 and 100
  const clampedProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);
  return updateTask(taskId, { completionProgress: clampedProgress });
};

/**
 * Add a comment to a task
 * @param {string} taskId - ID of the task
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Updated task with new comment
 */
export const addTaskComment = async (taskId, commentData) => {
  if (config.useMockData) {
    return mockAddTaskComment(taskId, commentData);
  }

  try {
    const { data } = await apiClient.post(`/tasks/${taskId}/comments`, commentData);
    return { data, success: true };
  } catch (error) {
    console.error(`Error adding comment to task ${taskId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to add comment' 
    };
  }
};

/**
 * Mock implementation of addTaskComment
 * @param {string} taskId - ID of the task
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Updated mock task
 */
const mockAddTaskComment = async (taskId, commentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const taskIndex = MOCK_TASKS.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Task not found'
    };
  }
  
  // Create new comment
  const newComment = {
    id: `comment-${Date.now()}`,
    ...commentData,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  // Add comment to task
  MOCK_TASKS[taskIndex].comments.push(newComment);
  const updatedTask = MOCK_TASKS[taskIndex];
  
  return { data: updatedTask, success: true };
};

/**
 * Assign tasks to multiple users in batch
 * @param {Array} assignments - Array of {taskId, userId} objects
 * @returns {Promise<Object>} Assignment result
 */
export const assignTasksBatch = async (assignments) => {
  if (config.useMockData) {
    return mockAssignTasksBatch(assignments);
  }

  try {
    const { data } = await apiClient.post('/tasks/batch-assign', { assignments });
    return { data, success: true };
  } catch (error) {
    console.error('Error assigning tasks in batch:', error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to assign tasks' 
    };
  }
};

/**
 * Mock implementation of assignTasksBatch
 * @param {Array} assignments - Array of {taskId, userId} objects
 * @returns {Promise<Object>} Assignment results
 */
const mockAssignTasksBatch = async (assignments) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const results = [];
  let allSuccessful = true;
  
  for (const assignment of assignments) {
    const { taskId, userId } = assignment;
    const taskIndex = MOCK_TASKS.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      MOCK_TASKS[taskIndex].assignedTo = userId;
      MOCK_TASKS[taskIndex].updatedAt = new Date().toISOString().split('T')[0];
      results.push({ taskId, success: true });
    } else {
      results.push({ taskId, success: false, error: 'Task not found' });
      allSuccessful = false;
    }
  }
  
  return { 
    data: results, 
    success: allSuccessful 
  };
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskProgress,
  addTaskComment,
  assignTasksBatch,
}; 