import logger from "@/utils/logger";
import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api/taskApi";

// --- Constants ---
export const courseColors = {
  // Export constants needed by UI
  Physics: "bg-purple-500",
  Mathematics: "bg-green-500",
  English: "bg-amber-500",
  "Computer Science": "bg-blue-500",
  Chemistry: "bg-pink-500",
};
export const statusClasses = {
  "not-started": "border-gray-300 bg-gray-100 text-gray-800",
  "in-progress": "border-blue-300 bg-blue-100 text-blue-800",
  "on-hold": "border-yellow-300 bg-yellow-100 text-yellow-800",
  completed: "border-green-300 bg-green-100 text-green-800",
export const capitalize = (s) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()); // Export utility
// Helper function to get 'YYYY-MM-DD' string based on local date components
export const toLocaleDateStringISO = (date) => {
  // Export the helper
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
// --- Custom Hook for State Management ---
export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksIsError,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks"], // Query key for tasks
    queryFn: async () => {
      const result = await getTasks();
      return result.success ? result.data : [];
    },
    // You might want to add options like staleTime, cacheTime, refetchOnWindowFocus, etc.
  });
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["tasks"]);
      toast({
        title: "Task Created",
        description: `Task "${data.title}" has been created successfully.`,
      });
      closeTaskForm();
    },
    onError: (error) => {
        title: "Error Creating Task",
        description:
          error.message || "Could not create task. Please try again.",
        variant: "destructive",
  const updateTaskMutation = useMutation({
    mutationFn: (taskData) => updateTask(taskData.id, taskData),
        title: "Task Updated",
        description: `Task "${data.title}" has been updated successfully.`,
        title: "Error Updating Task",
          error.message || "Could not update task. Please try again.",
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask, // Expects taskId
    onSuccess: (data, taskId) => {
      // data might be undefined or {success: true} depending on backend
        title: "Task Deleted",
        description: "Task has been permanently removed.",
      setIsTaskDetailOpen(false);
      setSelectedTask(null);
        title: "Error Deleting Task",
          error.message || "Could not delete task. Please try again.",
  const handlePrevious = useCallback(() => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (currentView === "month") newDate.setMonth(newDate.getMonth() - 1);
      else if (currentView === "week") newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, [currentView]);
  const handleNext = useCallback(() => {
      if (currentView === "month") newDate.setMonth(newDate.getMonth() + 1);
      else if (currentView === "week") newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  }, []);
  const openAddTaskForm = useCallback(() => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  const openEditTaskForm = useCallback((task) => {
    setIsTaskDetailOpen(false);
  const closeTaskForm = useCallback(() => {
    setIsTaskFormOpen(false);
  const handleSaveTask = useCallback(
    (taskData) => {
      if (taskData.id) {
        updateTaskMutation.mutate(taskData);
      } else {
        // For new tasks, ensure all required fields by backend are present.
        // ID will be assigned by backend.
        createTaskMutation.mutate(taskData);
      }
    [createTaskMutation, updateTaskMutation]
  );
  const handleDeleteTask = useCallback(
    (taskId) => {
      deleteTaskMutation.mutate(taskId);
    [deleteTaskMutation]
  const createCalendarCell = useCallback(
    (date, isCurrentMonth) => ({
      day: date.getDate(),
      dateString: toLocaleDateStringISO(date), // Use local date string helper
      isCurrentMonth,
      tasks: Array.isArray(tasks)
        ? tasks.filter((task) => task.date === toLocaleDateStringISO(date))
        : [], // Use helper here too for consistency
    }),
    [tasks]
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    if (currentView === "month") {
      const firstDayOfMonth = new Date(year, month, 1);
      const startDayOfWeek = firstDayOfMonth.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const grid = [];
      let currentDayCounter = 1;
      let nextMonthDayCounter = 1;
      for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
        const week = [];
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const cellIndex = weekIndex * 7 + dayIndex;
          if (cellIndex < startDayOfWeek) {
            const day = daysInPrevMonth - (startDayOfWeek - cellIndex - 1);
            const date = new Date(year, month - 1, day);
            week.push(createCalendarCell(date, false));
          } else if (currentDayCounter <= daysInMonth) {
            const date = new Date(year, month, currentDayCounter);
            week.push(createCalendarCell(date, true));
            currentDayCounter++;
          } else {
            const date = new Date(year, month + 1, nextMonthDayCounter);
            nextMonthDayCounter++;
          }
        }
        if (week.some((cell) => cell.isCurrentMonth) || weekIndex === 0) {
          grid.push(week);
      return grid.filter((week) => week.some((cell) => cell.isCurrentMonth));
    }
    if (currentView === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        week.push(createCalendarCell(dayDate, dayDate.getMonth() === month));
      return [week];
    return [[createCalendarCell(currentDate, true)]];
  }, [currentView, currentDate, createCalendarCell]);
  const upcomingTasks = useMemo(() => {
    // Create consistent date boundaries - start of today to end of 7 days from now
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999); // End of the 7th day
    return tasks
      .filter((task) => {
        // Handle different date field names and formats
        let taskDate;
        if (task.taskDeadline) {
          taskDate = new Date(task.taskDeadline);
        } else if (task.date) {
          taskDate = new Date(task.date + "T00:00:00");
        } else {
          return false; // Skip tasks without dates
        // Check if task date is valid
        if (isNaN(taskDate.getTime())) {
          logger.warn("Invalid task date:", task);
          return false;
        // Include tasks from today (inclusive) through the next 7 days (inclusive)
        const isInDateRange = taskDate >= today && taskDate <= sevenDaysLater;
        const isNotCompleted =
          (task.status || task.taskStatus) !== "completed" &&
          (task.status || task.taskStatus) !== "Completed";
        return isInDateRange && isNotCompleted;
      })
      .sort((a, b) => {
        const dateA = a.taskDeadline
          ? new Date(a.taskDeadline)
          : new Date(a.date);
        const dateB = b.taskDeadline
          ? new Date(b.taskDeadline)
          : new Date(b.date);
        return dateA - dateB;
  }, [tasks]);
  return {
    currentDate,
    currentView,
    setCurrentView,
    selectedTask,
    isTaskDetailOpen,
    setIsTaskDetailOpen,
    isTaskFormOpen,
    setIsTaskFormOpen,
    tasks, // Now from useQuery
    tasksLoading,
    tasksIsError,
    tasksError,
    handlePrevious,
    handleNext,
    handleTaskClick,
    openAddTaskForm,
    openEditTaskForm,
    closeTaskForm,
    handleSaveTask, // Now uses mutations
    createTaskLoading: createTaskMutation.isLoading,
    updateTaskLoading: updateTaskMutation.isLoading,
    handleDeleteTask, // Now uses mutation
    deleteTaskLoading: deleteTaskMutation.isLoading,
    calendarGrid,
    upcomingTasks,
  };
}
