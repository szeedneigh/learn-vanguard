import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api/taskApi";

export const useTasks = (toast) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const queryClient = useQueryClient();

  // Fetch tasks with better error handling
  const {
    data: tasksData = { data: [] },
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
    select: (data) => ({ data: data?.data || [] }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Extract tasks array from the data object for easier use
  const tasks = tasksData.data;

  // Optimized mutations with proper cache updates
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (newTaskData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(queryKeys.tasks);

      // Optimistically update cache
      const tempId = `temp-${Date.now()}`;
      const optimisticTask = {
        ...newTaskData,
        _id: tempId,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return { data: [optimisticTask] };
        return {
          ...old,
          data: [optimisticTask, ...old.data],
        };
      });

      return { previousTasks, tempId };
    },
    onSuccess: (newTask, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return { data: [newTask.data || newTask] };
        return {
          ...old,
          data: old.data.map(task => 
            task._id === context.tempId || task.id === context.tempId
              ? newTask.data || newTask
              : task
          ),
        };
      });

      toast({
        title: "Task Created",
        description: "New task added successfully!",
      });
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks, context.previousTasks);
      }

      toast({
        title: "Error",
        description: err.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update task mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) => updateTask(taskId, taskData),
    onMutate: async ({ taskId, taskData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });

      const previousTasks = queryClient.getQueryData(queryKeys.tasks);

      // Optimistically update
      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(task => 
            (task._id === taskId || task.id === taskId) 
              ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onSuccess: () => {
      toast({
        title: "Task Updated",
        description: "Task updated successfully!",
      });
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks, context.previousTasks);
      }

      toast({
        title: "Error",
        description: err.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation with optimistic updates
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });

      const previousTasks = queryClient.getQueryData(queryKeys.tasks);

      // Optimistically remove task
      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(task => 
            task._id !== taskId && task.id !== taskId
          ),
        };
      });

      return { previousTasks };
    },
    onSuccess: () => {
      toast({
        title: "Task Deleted",
        description: "Task removed successfully!",
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks, context.previousTasks);
      }

      toast({
        title: "Error",
        description: err.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleTaskSubmit = useCallback(
    (taskData) => {
      if (taskData.id) {
        updateTaskMutation.mutate({ taskId: taskData.id, taskData });
      } else {
        createTaskMutation.mutate(taskData);
      }
    },
    [createTaskMutation, updateTaskMutation]
  );

  const handleDeleteTask = useCallback(
    (taskId) => {
      deleteTaskMutation.mutate(taskId);
    },
    [deleteTaskMutation]
  );

  const handleStatusChange = useCallback(
    (taskId, newStatus) => {
      const now = new Date().toISOString();
      updateTaskMutation.mutate({
        taskId,
        taskData: {
          status: newStatus,
          taskStatus: newStatus,
          completedAt: newStatus === "completed" ? now : null,
          dateCompleted: newStatus === "completed" ? now : null,
        },
      });
    },
    [updateTaskMutation]
  );

  const handleArchiveTask = useCallback(
    (taskId) => {
      const now = new Date().toISOString();
      updateTaskMutation.mutate({
        taskId,
        taskData: {
          isArchived: true,
          archived: true,
          archivedAt: now,
        },
      });
    },
    [updateTaskMutation]
  );

  const handleRestoreTask = useCallback(
    (taskId) => {
      updateTaskMutation.mutate({
        taskId,
        taskData: {
          isArchived: false,
          archived: false,
          archivedAt: null,
        },
      });
    },
    [updateTaskMutation]
  );

  // Memoized filtered tasks with debounced search
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    const searchQueryLower = searchQuery.toLowerCase().trim();
    
    return tasks.filter((task) => {
      if (!task) return false;

      // Archive filter
      const isArchived = task.isArchived || task.archived;
      if (showArchived !== isArchived) return false;

      // Search filter
      if (searchQueryLower) {
        const taskName = (task.taskName || task.name || "").toLowerCase();
        const description = (task.description || "").toLowerCase();
        
        if (!taskName.includes(searchQueryLower) && !description.includes(searchQueryLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        const taskStatus = task.status || task.taskStatus || "pending";
        if (taskStatus !== statusFilter) return false;
      }

      // Priority filter
      if (priorityFilter !== "all") {
        const taskPriority = task.priority || task.taskPriority || "medium";
        if (taskPriority !== priorityFilter) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, showArchived]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    isLoading,
    isError,
    error,
    refetch,
    handleTaskSubmit,
    handleDeleteTask,
    handleStatusChange,
    handleArchiveTask,
    handleRestoreTask,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    showArchived,
    setShowArchived,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
