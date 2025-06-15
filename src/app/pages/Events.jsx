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

  // Combine events and announcements for calendar display, filtering out completed tasks
  const events = useMemo(() => {
    const combinedEvents = [];

    // Add events (filter out completed tasks)
    if (eventsData && Array.isArray(eventsData)) {
      const filteredEvents = eventsData.filter((event) => {
        // If it's a task (has taskStatus or type='task'), filter out completed ones
        if (event.taskStatus || event.type === "task") {
          const isCompleted =
            event.taskStatus === "Completed" || event.status === "Completed";
          return !isCompleted;
        }
        // For regular events, include all
        return true;
      });

      combinedEvents.push(...filteredEvents);
    }

    // Add announcements (all announcements are shown)
    if (announcements && Array.isArray(announcements)) {
      combinedEvents.push(...announcements);
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
  }, [eventsData, announcements]);

  // Calendar grid generation - moved after events definition to fix initialization order
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(currentDate, events);
  }, [currentDate, events]);

  // Filter and sort the upcoming tasks - Only show Tasks, not Events
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

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

        return (
          taskDate >= today &&
          taskDate <= nextWeek &&
          task.taskStatus !== "Completed"
        );
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
        date: task.taskDeadline ? task.taskDeadline.split("T")[0] : null,
        scheduleDate: task.taskDeadline,
        status: task.taskStatus,
        priority: task.taskPriority,
        course: "Personal", // Tasks are personal
        type: "task",
      }));
  }, [tasksResponse]);

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
