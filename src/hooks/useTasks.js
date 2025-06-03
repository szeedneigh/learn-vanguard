import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/api/taskApi';

export const useTasks = (toast) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
    select: (data) => data?.data || [],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      toast({ title: "Task Created", description: "New task added successfully!" });
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to create task",
        variant: "destructive"
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) => updateTask(taskId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      toast({ title: "Task Updated", description: "Task updated successfully!" });
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update task",
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      toast({ title: "Task Deleted", description: "Task removed successfully!" });
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete task",
        variant: "destructive"
      });
    }
  });

  const handleTaskSubmit = useCallback((taskData) => {
    if (taskData.id) {
      updateTaskMutation.mutate({ taskId: taskData.id, taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  }, [createTaskMutation, updateTaskMutation]);

  const handleDeleteTask = useCallback((taskId) => {
    deleteTaskMutation.mutate(taskId);
  }, [deleteTaskMutation]);

  const handleStatusChange = useCallback((taskId, newStatus) => {
    updateTaskMutation.mutate({
      taskId,
      taskData: {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      }
    });
  }, [updateTaskMutation]);

  const handleArchiveTask = useCallback((taskId) => {
    updateTaskMutation.mutate({
      taskId,
      taskData: {
        isArchived: true,
        archivedAt: new Date().toISOString()
      }
    });
  }, [updateTaskMutation]);

  const handleRestoreTask = useCallback((taskId) => {
    updateTaskMutation.mutate({
      taskId,
      taskData: {
        isArchived: false,
        archivedAt: null
      }
    });
  }, [updateTaskMutation]);

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const searchMatch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    const archiveMatch = showArchived ? task.isArchived : !task.isArchived;
    return searchMatch && statusMatch && priorityMatch && archiveMatch;
  }), [tasks, searchQuery, statusFilter, priorityFilter, showArchived]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      notStarted: tasks.filter(t => t.status === 'not-started').length,
      onHold: tasks.filter(t => t.status === 'on-hold').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        try {
          return new Date(t.dueDate) < now;
        } catch (e) {
          return false;
        }
      }).length,
      archived: tasks.filter(t => t.isArchived).length,
      highPriority: tasks.filter(t => t.priority === 'High' && t.status !== 'completed').length,
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
    stats
  };
};