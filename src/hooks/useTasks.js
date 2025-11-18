import logger from "@/utils/logger";
import { useState, useCallback, useMemo, useEffect } from "react";
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
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKeys.tasks, { showArchived }],
    queryFn: async () => {
      try {
        // Include archived=true parameter when showArchived is true
        const params = showArchived
          ? { archived: "true" }
          : { archived: "false" };
        logger.log("useTasks: Fetching tasks with params:", params);
        const result = await getTasks(params);
        logger.log(
          "useTasks: Fetched tasks:",
          result?.data?.length || 0,
          "items"
        );
        return result;
      } catch (err) {
        logger.error("useTasks: Error fetching tasks:", err);
        throw err;
      }
    },
    select: (data) => data?.data || [],
    staleTime: 0, // Always fetch fresh data
    cacheTime: showArchived ? 5000 : 10 * 60 * 1000, // 5 seconds for archive, 10 minutes for normal view
    refetchOnWindowFocus: true, // Always refetch on window focus
    refetchOnMount: true, // Always refetch when component mounts
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      return failureCount < 2;
  });
  // Watch for changes to showArchived and invalidate cache when it changes
  useEffect(() => {
    // Invalidate the tasks cache when switching between archived and non-archived views
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
  }, [showArchived, queryClient]);
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
    onSuccess: (newTask, variables, context) => {
      // Replace optimistic update with real data
        if (!old?.data) return { data: [newTask.data || newTask] };
          data: old.data.map((task) =>
            task._id === context.tempId || task.id === context.tempId
              ? newTask.data || newTask
              : task
          ),
      // Invalidate events queries since they include tasks for upcoming deadlines
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task Created",
        description: "New task added successfully!",
      setIsModalOpen(false);
      setEditingTask(null);
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks, context.previousTasks);
        title: "Error",
        description: err.message || "Failed to create task",
        variant: "destructive",
  // Update task mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) => updateTask(taskId, taskData),
    onMutate: async ({ taskId, taskData }) => {
      // Optimistically update
        if (!old?.data) return old;
            task._id === taskId || task.id === taskId
              ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
      return { previousTasks };
    onSuccess: (data, { taskId, taskData }) => {
        title: "Task Updated",
        description: "Task updated successfully!",
        description: err.message || "Failed to update task",
  // Delete task mutation with optimistic updates
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      // Optimistically remove task
          data: old.data.filter(
            (task) => task._id !== taskId && task.id !== taskId
    onSuccess: () => {
        title: "Task Deleted",
        description: "Task removed successfully!",
        description: err.message || "Failed to delete task",
  // Memoized handlers to prevent unnecessary re-renders
  const handleTaskSubmit = useCallback(
    (taskData) => {
      if (taskData.id) {
        updateTaskMutation.mutate({ taskId: taskData.id, taskData });
      } else {
        createTaskMutation.mutate(taskData);
    [createTaskMutation, updateTaskMutation]
  );
  const handleDeleteTask = useCallback(
    (taskId) => {
      // Invalidate cache before and after deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      return deleteTaskMutation.mutateAsync(taskId).then((result) => {
        // Force a refetch after deletion with a small delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
        }, 300);
    [deleteTaskMutation, queryClient]
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
    [updateTaskMutation]
  const handleArchiveTask = useCallback(
      // First invalidate relevant queries
      return updateTaskMutation
        .mutateAsync({
          taskId,
          taskData: {
            isArchived: true,
            archived: true,
            archivedAt: now,
          },
        })
        .then((result) => {
          // Force a refetch to ensure the UI is up-to-date
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            queryClient.invalidateQueries({ queryKey: queryKeys.events });
          }, 300);
          return result;
        });
    [updateTaskMutation, queryClient]
  const handleRestoreTask = useCallback(
            isArchived: false,
            archived: false,
            archivedAt: null,
  // Memoized filtered tasks with debounced search
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    const searchQueryLower = searchQuery.toLowerCase().trim();
    return tasks.filter((task) => {
      if (!task) return false;
      // Skip archive filter when showing archived tasks explicitly
      if (!showArchived) {
        // Only show non-archived tasks when not in archive view
        const isArchived = task.isArchived === true || task.archived === true;
        if (isArchived) return false;
      // Search filter
      if (searchQueryLower) {
        const taskName = (task.taskName || task.name || "").toLowerCase();
        const description = (task.description || "").toLowerCase();
        if (
          !taskName.includes(searchQueryLower) &&
          !description.includes(searchQueryLower)
        ) {
          return false;
        }
      // Status filter
      if (statusFilter !== "all") {
        const taskStatus = task.status || task.taskStatus || "pending";
        if (taskStatus !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== "all") {
        const taskPriority = task.priority || task.taskPriority || "medium";
        if (taskPriority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, showArchived]);
  return {
    tasks: filteredTasks,
    allTasks: tasks,
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
