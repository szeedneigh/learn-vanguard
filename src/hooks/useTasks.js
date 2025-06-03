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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
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

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
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
          archived: false, // Include both property names
          archivedAt: null,
        },
      });
    },
    [updateTaskMutation]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        // Check if task has the necessary properties
        if (!task) return false;

        // Handle both frontend and backend naming conventions
        const taskName = task.name || task.taskName || "";
        const taskDescription = task.description || task.taskDescription || "";
        const taskStatus = task.status || task.taskStatus || "";
        const taskPriority = task.priority || task.taskPriority || "";
        const taskIsArchived = task.isArchived || task.archived || false;

        const searchMatch =
          taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          taskDescription.toLowerCase().includes(searchQuery.toLowerCase());

        const statusMatch =
          statusFilter === "all" || taskStatus === statusFilter;
        const priorityMatch =
          priorityFilter === "all" || taskPriority === priorityFilter;
        const archiveMatch = showArchived ? taskIsArchived : !taskIsArchived;

        return searchMatch && statusMatch && priorityMatch && archiveMatch;
      }),
    [tasks, searchQuery, statusFilter, priorityFilter, showArchived]
  );

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter((t) => {
        const status = t.status || t.taskStatus || "";
        return status.toLowerCase() === "completed";
      }).length,
      inProgress: tasks.filter((t) => {
        const status = t.status || t.taskStatus || "";
        return (
          status.toLowerCase() === "in-progress" ||
          status.toLowerCase() === "in progress"
        );
      }).length,
      notStarted: tasks.filter((t) => {
        const status = t.status || t.taskStatus || "";
        return (
          status.toLowerCase() === "not-started" ||
          status.toLowerCase() === "not yet started"
        );
      }).length,
      onHold: tasks.filter((t) => {
        const status = t.status || t.taskStatus || "";
        return (
          status.toLowerCase() === "on-hold" ||
          status.toLowerCase() === "on-hold"
        );
      }).length,
      overdue: tasks.filter((t) => {
        const dueDate = t.dueDate || t.taskDeadline;
        const status = t.status || t.taskStatus || "";
        if (!dueDate || status.toLowerCase() === "completed") return false;
        try {
          return new Date(dueDate) < now;
        } catch (e) {
          return false;
        }
      }).length,
      archived: tasks.filter((t) => t.isArchived || t.archived).length,
      highPriority: tasks.filter((t) => {
        const priority = t.priority || t.taskPriority || "";
        const status = t.status || t.taskStatus || "";
        return (
          (priority === "High" || priority === "High Priority") &&
          status.toLowerCase() !== "completed"
        );
      }).length,
    };
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
