import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast"; // Assuming useToast is in the root hooks dir

// --- Constants ---

const initialTasks = [
  {
    id: 1,
    title: "Physics Lab Report",
    date: "2024-03-15",
    status: "in-progress",
    priority: "high",
    course: "Physics",
    description: "Complete the analysis section and conclusion for the pendulum experiment",
  },
  {
    id: 2,
    title: "Math Assignment",
    date: "2024-03-12",
    status: "completed",
    priority: "medium",
    course: "Mathematics",
    description: "Complete problems 1-15 from Chapter 7",
  },
];

export const courseColors = { // Export constants needed by UI
  Physics: "bg-purple-500",
  Mathematics: "bg-green-500",
  English: "bg-amber-500",
  "Computer Science": "bg-blue-500",
  Chemistry: "bg-pink-500",
};

export const statusClasses = { // Export constants needed by UI
  "not-started": "border-gray-300 bg-gray-100 text-gray-800",
  "in-progress": "border-blue-300 bg-blue-100 text-blue-800",
  "on-hold": "border-yellow-300 bg-yellow-100 text-yellow-800",
  completed: "border-green-300 bg-green-100 text-green-800",
};

export const capitalize = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()); // Export utility

// Helper function to get 'YYYY-MM-DD' string based on local date components
export const toLocaleDateStringISO = (date) => { // Export the helper
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Custom Hook for State Management ---

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const { toast } = useToast();

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
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (currentView === "month") newDate.setMonth(newDate.getMonth() + 1);
      else if (currentView === "week") newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, [currentView]);

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  }, []);

  const openAddTaskForm = useCallback(() => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  }, []);

  const openEditTaskForm = useCallback((task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(false);
    setIsTaskFormOpen(true);
  }, []);

  const closeTaskForm = useCallback(() => {
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  }, []);

  const handleSaveTask = useCallback((taskData) => {
    const isEdit = !!taskData.id;
    setTasks((prevTasks) =>
      isEdit
        ? prevTasks.map((t) => (t.id === taskData.id ? taskData : t))
        : [...prevTasks, { ...taskData, id: Date.now() }]
    );
    closeTaskForm();
    toast({
      title: `Task ${isEdit ? "Updated" : "Created"}`,
      description: `Task "${taskData.title}" has been ${isEdit ? "updated" : "created"} successfully.`,
    });
  }, [toast, closeTaskForm]);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
    toast({
      title: "Task Deleted",
      description: "Task has been permanently removed.",
      variant: "destructive",
    });
  }, [toast]);

  const createCalendarCell = useCallback((date, isCurrentMonth) => ({
    day: date.getDate(),
    dateString: toLocaleDateStringISO(date), // Use local date string helper
    isCurrentMonth,
    tasks: tasks.filter((task) => task.date === toLocaleDateStringISO(date)), // Use helper here too for consistency
  }), [tasks]);

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
            week.push(createCalendarCell(date, false));
            nextMonthDayCounter++;
          }
        }
        if (week.some(cell => cell.isCurrentMonth) || weekIndex === 0) {
             grid.push(week);
        }
      }
      return grid.filter(week => week.some(cell => cell.isCurrentMonth));
    }

    if (currentView === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        week.push(createCalendarCell(dayDate, dayDate.getMonth() === month));
      }
      return [week];
    }

    return [[createCalendarCell(currentDate, true)]];

  }, [currentView, currentDate, createCalendarCell]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    return tasks
      .filter((task) => {
        const taskDate = new Date(task.date + 'T00:00:00');
        return taskDate >= today && taskDate < sevenDaysLater && task.status !== 'completed';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
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
    tasks, // Keep returning tasks if needed elsewhere
    handlePrevious,
    handleNext,
    handleTaskClick,
    openAddTaskForm,
    openEditTaskForm,
    closeTaskForm,
    handleSaveTask,
    handleDeleteTask,
    calendarGrid,
    upcomingTasks,
  };
}
