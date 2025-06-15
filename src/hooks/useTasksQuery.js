import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getTaskSummary,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api/taskApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for fetching tasks with filters
 * @param {Object} filters - Query filters (status, search, archived, etc.)
 * @param {Object} options - React Query options
 */
export const useTasks = (filters = {}, options = {}) => {
  // Make sure we're passing the filters to the API
  console.log("useTasks hook called with filters:", filters);

  return useQuery({
    queryKey: queryKeys.tasks.concat([filters]),
    queryFn: () => getTasks(filters),
    select: (data) => data?.data || [],
    ...options,
  });
};

/**
 * Hook for fetching task summary/statistics
 * @param {Object} options - React Query options
 */
export const useTaskSummary = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.taskSummary,
    queryFn: () => getTaskSummary(),
    select: (data) => data?.data || {},
    staleTime: 10 * 1000, // 10 seconds - summary should be fresh
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Always refetch on mount
    ...options,
    onSuccess: (response) => {
      // If options contain an onSuccess handler, call it
      if (options.onSuccess) {
        options.onSuccess(response);
      }

      // Log summary data for debugging
      console.log("Task summary data refreshed:", response);
    },
  });
};

/**
 * Hook for creating a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskData) => {
      // Map the form data to the API expected format
      const apiTaskData = {
        taskName: taskData.name,
        taskDescription: taskData.description,
        taskDeadline: taskData.dueDate,
        taskPriority:
          taskData.priority === "High"
            ? "High Priority"
            : taskData.priority === "Medium"
            ? "Medium Priority"
            : "Low Priority",
        taskStatus:
          taskData.status === "not-started"
            ? "Not yet started"
            : taskData.status === "in-progress"
            ? "In progress"
            : taskData.status === "completed"
            ? "Completed"
            : "On-hold",
        onHoldRemark:
          taskData.status === "on-hold" ? taskData.onHoldRemark : null,
      };

      return createTask(apiTaskData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary });

      toast({
        title: "Success",
        description: data.message || "Task created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to create task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating an existing task
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ taskId, taskData }) => {
      // Ensure we have a valid task ID
      if (!taskId && taskData.id) {
        taskId = taskData.id;
      }

      console.log("Updating task with ID:", taskId, "and data:", taskData);

      if (!taskId) {
        throw new Error("Task ID is required for updating a task");
      }

      // Map the form data to the API expected format
      const apiTaskData = {};

      if (taskData.name !== undefined) apiTaskData.taskName = taskData.name;
      if (taskData.description !== undefined)
        apiTaskData.taskDescription = taskData.description;
      if (taskData.dueDate !== undefined)
        apiTaskData.taskDeadline = taskData.dueDate;

      // Handle priority conversion
      if (taskData.priority !== undefined) {
        apiTaskData.taskPriority =
          taskData.priority === "High"
            ? "High Priority"
            : taskData.priority === "Medium"
            ? "Medium Priority"
            : "Low Priority";
      }

      // Handle status conversion
      if (taskData.status !== undefined) {
        apiTaskData.taskStatus =
          taskData.status === "not-started"
            ? "Not yet started"
            : taskData.status === "in-progress"
            ? "In progress"
            : taskData.status === "completed"
            ? "Completed"
            : "On-hold";
      }

      // Handle on-hold remark
      if (taskData.status === "on-hold") {
        apiTaskData.onHoldRemark = taskData.onHoldRemark || null;
      }

      // Handle archived status
      if (taskData.archived !== undefined) {
        apiTaskData.archived = taskData.archived;
      }

      return updateTask(taskId, apiTaskData);
    },
    onSuccess: () => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary });

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskId) => deleteTask(taskId),
    onSuccess: () => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary });

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to delete task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating task status
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ taskId, status, onHoldRemark = null }) => {
      // Map the status to the API expected format
      const apiStatus =
        status === "not-started"
          ? "Not yet started"
          : status === "in-progress"
          ? "In progress"
          : status === "completed"
          ? "Completed"
          : "On-hold";

      const updateData = { taskStatus: apiStatus };
      if (status === "on-hold" && onHoldRemark) {
        updateData.onHoldRemark = onHoldRemark;
      }
      return updateTask(taskId, updateData);
    },
    onSuccess: () => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary });
      // Also invalidate events queries since they include tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.events });

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update task status",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for archiving/unarchiving tasks
 */
export const useArchiveTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ taskId, archived }) => updateTask(taskId, { archived }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary });
      // Also invalidate events queries since they include tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.events });

      toast({
        title: "Success",
        description: variables.archived
          ? "Task archived successfully"
          : "Task restored successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Comprehensive hook that combines all task-related functionality
 * for the Tasks page component
 */
export const useTasksPage = (filters = {}) => {
  // Make sure we're passing the archived filter correctly
  console.log("useTasksPage hook called with filters:", filters);

  // Main queries
  const tasksQuery = useTasks(filters);
  const summaryQuery = useTaskSummary();

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const archiveTaskMutation = useArchiveTask();

  // Computed values
  const tasks = tasksQuery.data || [];
  const summary = summaryQuery.data || {};

  // Filter tasks based on client-side filters (for performance)
  // We're now letting the backend handle the archived filtering
  // so we don't need to filter again here
  const filteredTasks = tasks;

  // Local stats calculation based on backend summary data
  const localStats = {
    total: summary.total || tasks.length,
    completed:
      summary.completed ||
      tasks.filter(
        (t) => t.taskStatus === "Completed" || t.status === "completed"
      ).length,
    inProgress: tasks.filter(
      (t) => t.taskStatus === "In progress" || t.status === "in-progress"
    ).length,
    notStarted: tasks.filter(
      (t) => t.taskStatus === "Not yet started" || t.status === "not-started"
    ).length,
    onHold: tasks.filter(
      (t) => t.taskStatus === "On-hold" || t.status === "on-hold"
    ).length,
    overdue:
      summary.overdue ||
      tasks.filter((t) => {
        const isCompleted =
          t.taskStatus === "Completed" || t.status === "completed";
        if (isCompleted) return false;
        const deadline = t.taskDeadline || t.dueDate;
        if (!deadline) return false;
        return new Date(deadline) < new Date();
      }).length,
    archived:
      summary.archived ||
      tasks.filter((t) => t.archived || t.isArchived).length,
    highPriority: tasks.filter(
      (t) =>
        (t.taskPriority === "High" ||
          t.taskPriority === "High Priority" ||
          t.priority === "High") &&
        t.taskStatus !== "Completed" &&
        t.status !== "completed"
    ).length,
  };

  return {
    // Data
    tasks: filteredTasks,
    summary: { ...summary, ...localStats }, // Merge backend and local stats

    // Loading states
    isLoading: tasksQuery.isLoading || summaryQuery.isLoading,
    isError: tasksQuery.isError || summaryQuery.isError,
    error: tasksQuery.error || summaryQuery.error,

    // Refetch functions
    refetch: () => {
      tasksQuery.refetch();
      summaryQuery.refetch();
    },

    // Mutations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    updateTaskStatus: updateStatusMutation.mutate,
    archiveTask: archiveTaskMutation.mutate,

    // Mutation loading states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isArchiving: archiveTaskMutation.isPending,

    // Any mutation loading
    isMutating:
      createTaskMutation.isPending ||
      updateTaskMutation.isPending ||
      deleteTaskMutation.isPending ||
      updateStatusMutation.isPending ||
      archiveTaskMutation.isPending,
  };
};
