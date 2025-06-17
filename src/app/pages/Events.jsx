import React, { useMemo, useState, useEffect, useContext } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEventsPage } from "@/hooks/useEventsQuery";
import { useTasks } from "@/hooks/useTasksQuery";
import { useEventsPageAnnouncements } from "@/hooks/useAnnouncementsQuery";
import {
  toLocaleDateStringISO,
  generateCalendarGrid,
} from "@/lib/calendarHelpers";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import UpcomingDeadlines from "@/components/calendar/UpcomingDeadlines";
import TaskDetailDialog from "@/components/calendar/TaskDetailDialog";
import EventFormDialog from "@/components/calendar/EventFormDialog";
import DayView from "@/components/calendar/DayView";
import WeekView from "@/components/calendar/WeekView";
import { useActivityCompletions } from "@/hooks/useActivityCompletion";

export default function Events() {
  // Local state for calendar functionality
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    toLocaleDateStringISO(new Date())
  );
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get user context for role-based permissions
  const { user } = useContext(AuthContext);
  const isStudent = user?.role?.toUpperCase() === ROLES.STUDENT;

  // Keep selectedDate in sync with currentDate
  useEffect(() => {
    setSelectedDate(toLocaleDateStringISO(currentDate));
  }, [currentDate]);

  // React Query hook for events with user-specific filters
  const {
    events: eventsData,
    isLoading,
    isError,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: createTaskLoading,
    isUpdating: updateTaskLoading,
    isDeleting: deleteTaskLoading,
  } = useEventsPage(
    // For students, we'll rely on backend filtering by course and yearLevel
    // The backend already handles this in the getEvents controller
    isStudent ? { userFiltered: true } : {}
  );

  // Calendar navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === "month") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === "month") {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Task/Event handlers
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    const newDate = new Date(dateString + "T00:00:00");
    setCurrentDate(newDate);

    // If we're in month view, switch to day view when a date is clicked
    if (currentView === "month") {
      setCurrentView("day");
    }
  };

  const openAddEventForm = () => {
    setIsEventFormOpen(true);
  };

  const openEditEventForm = (event) => {
    setSelectedEvent(event);
    setIsEventFormOpen(true);
  };

  const closeEventForm = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = (eventData) => {
    if (selectedEvent) {
      updateEvent({ eventId: selectedEvent.id, eventData });
    } else {
      createEvent({
        ...eventData,
        date: eventData.scheduleDate.substring(0, 10),
      });
    }
    closeEventForm();
  };

  const handleDeleteTask = (taskId) => {
    // Check if the selected task is actually a task or an event
    if (selectedTask?.type === "task") {
      // For tasks, we need to use the task deletion API
      // This would require importing and using the task deletion mutation
      console.log("Deleting task:", taskId);
      // TODO: Implement task deletion - for now, we'll use the event deletion as fallback
    }

    // For events or as fallback, use the event deletion
    deleteEvent(taskId);
    setIsTaskDetailOpen(false);
  };

  // Get the start of the week for the current date (for week view)
  const getWeekStart = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    newDate.setDate(newDate.getDate() - day); // Set to Sunday
    return newDate;
  };

  // Fetch tasks separately for upcoming deadlines view (excludes events)
  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    isError: tasksIsError,
  } = useTasks({ archived: "false" });

  // Fetch announcements for calendar integration
  const {
    data: announcements = [],
    isLoading: announcementsLoading,
    isError: announcementsIsError,
    error: announcementsError,
  } = useEventsPageAnnouncements(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Fetch activity completions for filtering completed activities
  const { data: activityCompletions = [] } = useActivityCompletions();

  // Helper function to check if an activity is completed
  const isActivityCompleted = useMemo(() => {
    const completionMap = new Map();
    activityCompletions.forEach((completion) => {
      const key = `${completion.topicId}-${completion.activityId}`;
      completionMap.set(key, true);
    });

    return (topicId, activityId) => {
      const key = `${topicId}-${activityId}`;
      return completionMap.has(key);
    };
  }, [activityCompletions]);

  // Debug logging for announcements
  React.useEffect(() => {
    console.log("Events.jsx - Announcements state:", {
      loading: announcementsLoading,
      error: announcementsIsError,
      errorDetails: announcementsError,
      count: announcements?.length || 0,
      announcements: announcements?.slice(0, 3).map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
      })),
    });
  }, [
    announcements,
    announcementsLoading,
    announcementsIsError,
    announcementsError,
  ]);

  // Combine events, tasks, and announcements for calendar display, filtering out completed tasks and activities
  const events = useMemo(() => {
    const combinedEvents = [];
    const now = new Date();

    // Add events (filter out completed tasks and past events, but keep all tasks for calendar display)
    if (eventsData && Array.isArray(eventsData)) {
      const filteredEvents = eventsData.filter((event) => {
        // If it's a task (has taskStatus or type='task'), only filter out completed ones
        // Tasks should appear in calendar regardless of due date (including overdue)
        if (event.taskStatus || event.type === "task") {
          const isCompleted =
            event.taskStatus === "Completed" || event.status === "Completed";
          return !isCompleted; // Show all non-completed tasks in calendar
        }

        // For regular events (not tasks), filter out past events
        const eventDate = new Date(event.scheduleDate || event.date);
        if (eventDate < now) {
          return false; // Hide past events (but not past tasks)
        }

        // For regular events, include all (that are not in the past)
        return true;
      });

      combinedEvents.push(...filteredEvents);
    }

    // Add personal tasks from the separate tasks query to ensure they appear in calendar
    // This is a fallback in case tasks aren't included in eventsData
    if (tasksResponse && Array.isArray(tasksResponse)) {
      const transformedTasks = tasksResponse
        .filter((task) => {
          // Only include non-completed tasks
          const isCompleted =
            task.taskStatus === "Completed" || task.taskStatus === "completed";
          return !isCompleted;
        })
        .map((task) => ({
          // Transform task to match event format for calendar display
          id: task._id,
          _id: task._id,
          title: task.taskName,
          taskName: task.taskName,
          description: task.taskDescription,
          taskDescription: task.taskDescription,
          scheduleDate: task.taskDeadline,
          taskDeadline: task.taskDeadline,
          date: task.taskDeadline ? task.taskDeadline.split("T")[0] : null,
          status: task.taskStatus,
          taskStatus: task.taskStatus,
          priority: task.taskPriority,
          taskPriority: task.taskPriority,
          course: "Personal",
          type: "task",
          userId: task.userId,
          personal: true,
        }));

      // Check if tasks are already included in eventsData to avoid duplicates
      const existingTaskIds = new Set(
        combinedEvents
          .filter((event) => event.type === "task" || event.taskStatus)
          .map((event) => event.id || event._id)
      );

      const newTasks = transformedTasks.filter(
        (task) => !existingTaskIds.has(task.id)
      );
      combinedEvents.push(...newTasks);

      console.log("Task integration debug:", {
        tasksFromTasksResponse: tasksResponse.length,
        transformedTasks: transformedTasks.length,
        existingTasksInEvents: existingTaskIds.size,
        newTasksAdded: newTasks.length,
        totalCombinedEvents: combinedEvents.length,
      });
    }

    // Add announcements (filter out completed activities and past announcements)
    if (announcements && Array.isArray(announcements)) {
      const filteredAnnouncements = announcements.filter((announcement) => {
        // Filter out past announcements (announcements with due dates that have passed)
        if (announcement.dueDate) {
          const announcementDate = new Date(announcement.dueDate);
          if (announcementDate < now) {
            return false; // Hide past announcements
          }
        }

        // If announcement is linked to an activity, check if the activity is completed
        if (
          announcement.topicId &&
          announcement.activityId &&
          announcement.creationSource === "activity"
        ) {
          const completed = isActivityCompleted(
            announcement.topicId,
            announcement.activityId
          );
          return !completed; // Exclude completed activities
        }
        // For regular announcements (not activity-generated), include all (that are not in the past)
        return true;
      });

      combinedEvents.push(...filteredAnnouncements);
    }

    console.log("Combined events for calendar:", {
      events: eventsData?.length || 0,
      eventsAfterFiltering: eventsData
        ? eventsData.filter((e) => {
            if (e.taskStatus || e.type === "task") {
              return e.taskStatus !== "Completed" && e.status !== "Completed";
            }
            return true;
          }).length
        : 0,
      announcements: announcements?.length || 0,
      announcementsAfterActivityFiltering: announcements
        ? announcements.filter((announcement) => {
            if (
              announcement.topicId &&
              announcement.activityId &&
              announcement.creationSource === "activity"
            ) {
              return !isActivityCompleted(
                announcement.topicId,
                announcement.activityId
              );
            }
            return true;
          }).length
        : 0,
      activityCompletions: activityCompletions?.length || 0,
      total: combinedEvents.length,
    });

    // Debug logging (can be removed in production)
    console.log("Events page loaded:", {
      isStudent,
      eventsCount: eventsData?.length || 0,
      announcementsCount: announcements?.length || 0,
      combinedEventsCount: combinedEvents.length,
    });

    return combinedEvents;
  }, [eventsData, announcements, tasksResponse, isActivityCompleted]);

  // Calendar grid generation - moved after events definition to fix initialization order
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(currentDate, events);
  }, [currentDate, events]);

  // Filter and sort the upcoming tasks - Only show Tasks, not Events
  // Include overdue tasks to ensure they remain visible
  const upcomingTasks = useMemo(() => {
    // Create consistent date boundaries - start of today to end of 7 days from now
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999); // End of the 7th day

    // Debug: Log the tasks response structure
    console.log("Events.jsx - tasksResponse:", tasksResponse);

    // The useTasks hook from useTasksQuery.js already selects data?.data || []
    // So tasksResponse should be the array directly
    const tasks = Array.isArray(tasksResponse) ? tasksResponse : [];

    console.log("Events.jsx - tasks array:", tasks);

    return tasks
      .filter((task) => {
        // Handle task deadline date
        let taskDate;
        if (task.taskDeadline) {
          taskDate = new Date(task.taskDeadline);
        } else if (task.date) {
          taskDate = new Date(task.date + "T00:00:00");
        } else {
          return false;
        }

        // Check if task date is valid
        if (isNaN(taskDate.getTime())) {
          console.warn("Invalid task date:", task);
          return false;
        }

        // Check if task is completed
        const isNotCompleted =
          task.taskStatus !== "Completed" && task.taskStatus !== "completed";

        // Don't show completed tasks
        if (!isNotCompleted) {
          return false;
        }

        // Include tasks that are:
        // 1. In the upcoming date range (today through next 7 days)
        // 2. OR overdue (past due date but not completed)
        const isInDateRange = taskDate >= today && taskDate <= sevenDaysLater;
        const isOverdue = taskDate < now;

        return isInDateRange || isOverdue;
      })
      .sort((a, b) => {
        const dateA = a.taskDeadline
          ? new Date(a.taskDeadline)
          : new Date(a.date);
        const dateB = b.taskDeadline
          ? new Date(b.taskDeadline)
          : new Date(b.date);
        return dateA - dateB;
      })
      .map((task) => ({
        // Transform task to match the expected format for UpcomingDeadlines component
        id: task._id,
        title: task.taskName,
        description: task.taskDescription,
        // Don't strip time from date - keep full datetime for proper display
        scheduleDate: task.taskDeadline,
        dueDate: task.taskDeadline, // Also provide as dueDate for consistency
        status: task.taskStatus,
        priority: task.taskPriority,
        course: "Personal", // Tasks are personal
        type: "task",
      }));
  }, [tasksResponse, isActivityCompleted]);

  if (tasksLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.24))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg font-medium text-muted-foreground">
          Loading Events...
        </p>
      </div>
    );
  }

  if (tasksIsError || isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Events</AlertTitle>
          <AlertDescription>
            {error?.message ||
              "An unexpected error occurred. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Determine which calendar view to render
  const renderCalendarView = () => {
    switch (currentView) {
      case "day":
        return (
          <DayView
            date={currentDate}
            events={events}
            onEventClick={handleTaskClick}
          />
        );
      case "week":
        return (
          <WeekView
            startDate={getWeekStart(currentDate)}
            events={events}
            onEventClick={handleTaskClick}
            onDateClick={handleDateClick}
          />
        );
      default: // month view
        return (
          <CalendarGrid
            grid={calendarGrid}
            view={currentView}
            onTaskClick={handleTaskClick}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onViewChange={setCurrentView}
        onAddEvent={() => setIsEventFormOpen(true)}
        showAddEvent={!isStudent}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">{renderCalendarView()}</div>
        <div className="lg:col-span-1">
          <UpcomingDeadlines
            tasks={upcomingTasks}
            onTaskClick={handleTaskClick}
          />
        </div>
      </div>
      <TaskDetailDialog
        task={selectedTask}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        onEdit={openEditEventForm}
        onDelete={handleDeleteTask}
        isDeleting={deleteTaskLoading}
      />
      <EventFormDialog
        open={isEventFormOpen}
        onOpenChange={setIsEventFormOpen}
        onSave={handleSaveEvent}
        onCancel={closeEventForm}
        isLoading={selectedEvent ? updateTaskLoading : createTaskLoading}
        event={selectedEvent}
      />
    </div>
  );
}
