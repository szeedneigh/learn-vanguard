import apiClient from '@/lib/api/client'; // Assuming your API client is at this path

export const createTask = async (taskData) => {
  try {
    const { data } = await apiClient.post('/tasks', taskData); // Endpoint might be /api/tasks or similar
    return data;
  } catch (error) {
    // Handle or throw the error appropriately
    console.error("Error creating task:", error.response?.data || error.message);
    throw error; // Re-throw to be caught by React Query's onError
  }
};

export const getTasks = async () => {
  try {
    const { data } = await apiClient.get('/tasks');
    return Array.isArray(data) ? data : []; // Ensure an array is returned
  } catch (error) {
    console.error("Error fetching tasks:", error.response?.data || error.message);
    throw error;
  }
};

export const getTaskById = async (taskId) => {
  try {
    const { data } = await apiClient.get(`/tasks/${taskId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const { data } = await apiClient.put(`/tasks/${taskId}`, taskData);
    return data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const { data } = await apiClient.delete(`/tasks/${taskId}`);
    return data; // Or handle no content response, e.g., return { success: true }
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error.response?.data || error.message);
    throw error;
  }
};

// You can add other task-related API functions here later:
// export const getTasks = async () => { ... };
// export const updateTask = async (taskId, taskData) => { ... };
// export const deleteTask = async (taskId) => { ... }; 