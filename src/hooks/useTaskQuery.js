import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as taskApi from "@/lib/api/taskApi";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a stable query key from params object
 * @param {Object} params - Query parameters
 * @returns {Array} Stable query key
 */
const createStableQueryKey = (params) => {
  // Sort keys to ensure consistent order
  const sortedKeys = Object.keys(params).sort();
  // Create array of [key, value] pairs in sorted order
  const stableParams = sortedKeys.map((key) => [key, params[key]]);
  return ["tasks", ...stableParams];
};

/**
 * Hook for fetching tasks with filtering options
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional react-query options
 * @returns {Object} React Query result
 */
export const useTasksQuery = (params = {}, options = {}) => {
  // Create stable query key from params
  const queryKey = createStableQueryKey(params);

  return useQuery({
    queryKey,
    queryFn: () => taskApi.getTasks(params),
    select: (result) => result.data,
    // Default options can be overridden
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching a single task by ID
 * @param {string} taskId - Task ID
 * @param {Object} options - Additional react-query options
 * @returns {Object} React Query result
 */
export const useTaskQuery = (taskId, options = {}) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskApi.getTask(taskId),
    enabled: !!taskId,
    select: (result) => result.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook for creating a new task
 * @returns {Object} React Query mutation
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData) => taskApi.createTask(taskData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate tasks query to refetch data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast({
          title: "Success",
          description: "Task created successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create task",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while creating the task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating a task
 * @returns {Object} React Query mutation
 */
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, taskData }) =>
      taskApi.updateTask(taskId, taskData),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Update the task in the cache
        queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
        // Invalidate tasks query to refetch list data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast({
          title: "Success",
          description: "Task updated successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update task",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while updating the task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating a task's status
 * @returns {Object} React Query mutation
 */
export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }) =>
      taskApi.updateTaskStatus(taskId, status),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Optimistic update for the task in the cache
        queryClient.setQueryData(["task", variables.taskId], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              status: variables.status,
            },
          };
        });

        // Invalidate tasks query to refetch list data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast({
          title: "Success",
          description: "Task status updated",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update task status",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while updating the task status",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating a task's progress
 * @returns {Object} React Query mutation
 * @deprecated This hook is not currently supported by the API
 */
export const useUpdateTaskProgressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, progress }) =>
      // Note: updateTaskProgress endpoint not available in taskApi
      // Using updateTask as a workaround
      taskApi.updateTask(taskId, { completionProgress: progress }),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Optimistic update for the task in the cache
        queryClient.setQueryData(["task", variables.taskId], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              completionProgress: variables.progress,
            },
          };
        });

        // Invalidate tasks query to refetch list data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast({
          title: "Success",
          description: "Task progress updated",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update task progress",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while updating the task progress",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting a task
 * @returns {Object} React Query mutation
 */
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId) => taskApi.deleteTask(taskId),
    onSuccess: (result, taskId) => {
      if (result.success) {
        // Remove the task from the cache using exact query key
        queryClient.removeQueries(["task", taskId]);
        // Invalidate tasks query to refetch list data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast({
          title: "Success",
          description: "Task deleted successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete task",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while deleting the task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for adding a comment to a task
 * @returns {Object} React Query mutation
 * @deprecated This hook is not currently supported by the API - addTaskComment endpoint not available
 */
export const useAddTaskCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, commentData }) => {
      // Note: addTaskComment endpoint not available in taskApi
      // This mutation will need to be implemented when the API supports it
      return Promise.reject(new Error("addTaskComment is not yet implemented in the API"));
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Update the task in the cache
        queryClient.setQueryData(["task", variables.taskId], (oldData) => {
          if (!oldData) return oldData;
          return result;
        });

        toast({
          title: "Success",
          description: "Comment added successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add comment",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while adding the comment",
        variant: "destructive",
      });
    },
  });
};

export default {
  useTasksQuery,
  useTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskProgressMutation,
  useDeleteTaskMutation,
  useAddTaskCommentMutation,
};
