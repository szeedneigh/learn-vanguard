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

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
    select: (data) => data?.data || [],
  });

  // Create task mutation with optimized cache management
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // ✅ Add new task to cache instead of invalidating everything
      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return { data: [newTask.data || newTask] };
        return {
          ...old,
          data: [newTask.data || newTask, ...old.data]
        };
      });
      
      toast({
        title: "Task Created",
        description: "New task added successfully!",
      });
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) => updateTask(taskId, taskData),
    onSuccess: (data, { taskId, taskData }) => {
      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(task => 
            (task._id === taskId || task.id === taskId) 
              ? { ...task, ...taskData }
              : task
          )
        };
      });
      
      toast({
        title: "Task Updated",
        description: "Task updated successfully!",
      });
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation with optimized cache management
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (data, taskId) => {
      // ✅ Remove specific task from cache instead of invalidating everything
      queryClient.setQueryData(queryKeys.tasks, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(task => 
            task._id !== taskId && task.id !== taskId
          )
        };
      });
      
      toast({
        title: "Task Deleted",
        description: "Task removed successfully!",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

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
      // Use the appropriate property name based on the API expectations
      // Some APIs might expect 'status', others might expect 'taskStatus'
      updateTaskMutation.mutate({
        taskId,
        taskData: {
          status: newStatus,
          taskStatus: newStatus, // Include both property names to be safe
          completedAt:
            newStatus === "completed" ? new Date().toISOString() : null,
          dateCompleted:
            newStatus === "completed" ? new Date().toISOString() : null, // Include both property names
        },
      });
    },
    [updateTaskMutation]
  );

  const handleArchiveTask = useCallback(
    (taskId) => {
      updateTaskMutation.mutate({
        taskId,
        taskData: {
          isArchived: true,
          archived: true, // Include both property names
          archivedAt: new Date().toISOString(),
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

  // Optimized filtered tasks with better performance
  const filteredTasks = useMemo(
    () => {
      if (!Array.isArray(tasks)) return [];
      
      // Pre-calculate search query to avoid repeated toLowerCase calls
      const searchQueryLower = searchQuery.toLowerCase();
      
      return tasks.filter((task) => {
        // Check if task has the necessary properties
        if (!task) return false;

        // Handle both frontend and backend naming conventions
        const taskName = task.name || task.taskName || "";
        const taskDescription = task.description || task.taskDescription || "";
        const taskStatus = task.status || task.taskStatus || "";
        const taskPriority = task.priority || task.taskPriority || "";
        const taskIsArchived = task.isArchived || task.archived || false;

        // Early return optimizations
        if (statusFilter !== "all" && taskStatus !== statusFilter) return false;
        if (priorityFilter !== "all" && taskPriority !== priorityFilter) return false;
        if (showArchived !== taskIsArchived) return false;
        
        // Search match only if there's a search query
        if (searchQueryLower) {
          const searchMatch =
            taskName.toLowerCase().includes(searchQueryLower) ||
            taskDescription.toLowerCase().includes(searchQueryLower);
          return searchMatch;
        }

        return true;
      });
    },
    [tasks, searchQuery, statusFilter, priorityFilter, showArchived]
  );

  // Optimized stats calculation with single loop
  const stats = useMemo(() => {
    if (!Array.isArray(tasks)) return {
      total: 0, completed: 0, inProgress: 0, notStarted: 0,
      onHold: 0, overdue: 0, archived: 0, highPriority: 0
    };

    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      onHold: 0,
      overdue: 0,
      archived: 0,
      highPriority: 0,
    };

    // Single loop for better performance
    tasks.forEach((task) => {
      if (!task) return;

      const status = (task.status || task.taskStatus || "").toLowerCase();
      const priority = task.priority || task.taskPriority || "";
      const isArchived = task.isArchived || task.archived;
      const dueDate = task.dueDate || task.taskDeadline;

      // Count status
      if (status === "completed") stats.completed++;
      else if (status === "in-progress" || status === "in progress") stats.inProgress++;
      else if (status === "not-started" || status === "not yet started") stats.notStarted++;
      else if (status === "on-hold") stats.onHold++;

      // Count archived
      if (isArchived) stats.archived++;

      // Count high priority (non-completed)
      if ((priority === "High" || priority === "High Priority") && status !== "completed") {
        stats.highPriority++;
      }

      // Count overdue
      if (dueDate && status !== "completed") {
        try {
          if (new Date(dueDate) < now) stats.overdue++;
        } catch (e) {
          // Invalid date, skip
        }
      }
    });

    return stats;
  }, [tasks]);

  return {
    tasks,
    isLoading,
    isError,
    error,
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
    handleTaskSubmit,
    handleDeleteTask,
    handleStatusChange,
    handleArchiveTask,
    handleRestoreTask,
    showArchived,
    setShowArchived,
    filteredTasks,
    stats,
  };
};
