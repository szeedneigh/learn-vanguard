import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEventsPage } from "@/hooks/useEventsQuery";
import { useTasks } from "@/hooks/useTasksQuery";
import {
  toLocaleDateStringISO,
  generateCalendarGrid,
} from "@/lib/calendarHelpers";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import UpcomingDeadlines from "@/components/calendar/UpcomingDeadlines";
import TaskDetailDialog from "@/components/calendar/TaskDetailDialog";
import TaskFormDialog from "@/components/calendar/TaskFormDialog";
import EventFormDialog from "@/components/calendar/EventFormDialog";
import DayView from "@/components/calendar/DayView";
import WeekView from "@/components/calendar/WeekView";

export default function Events() {
  // Local state for calendar functionality
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    toLocaleDateStringISO(new Date())
  );

  // Keep selectedDate in sync with currentDate
  useEffect(() => {
    setSelectedDate(toLocaleDateStringISO(currentDate));
  }, [currentDate]);

  // React Query hook for events
  const {
    events,
    isLoading: eventsLoading,
    isError: eventsIsError,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: createEventLoading,
    isUpdating: updateEventLoading,
    isDeleting: deleteEventLoading,
  } = useEventsPage();

  // Get tasks for upcoming deadlines
  const { data: tasksList, isLoading: tasksLoading } = useTasks();

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

  const openEditTaskForm = (task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(false);
    setIsTaskFormOpen(true);
  };

  const closeTaskForm = () => {
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  };

  const closeEventForm = () => {
    setIsEventFormOpen(false);
  };

  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      updateEvent({ eventId: selectedTask.id, eventData: taskData });
    } else {
      createEvent(taskData);
    }
    closeTaskForm();
  };

  const handleSaveEvent = (eventData) => {
    // Format data to ensure it contains the date property that the calendar expects
    const formattedData = {
      ...eventData,
      date: eventData.scheduleDate.substring(0, 10), // Extract YYYY-MM-DD from the ISO string
    };

    // Call the API function
    createEvent(formattedData)
      .then(() => {
        // Close the form after successful event creation
        setIsEventFormOpen(false);
      })
      .catch((error) => {
        // Show error message
        console.error("Failed to create event:", error);
      });
  };

  const handleDeleteTask = (taskId) => {
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

  // Calendar grid generation
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(currentDate, events);
  }, [currentDate, events]);

  // Upcoming tasks calculation
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Use actual tasks data from the tasks API
    if (!tasksList || tasksList.length === 0) {
      return [];
    }

    return tasksList
      .filter((task) => {
        // Filter tasks with upcoming deadlines
        if (!task.taskDeadline) return false;

        const taskDate = new Date(task.taskDeadline);

        // Include tasks that are due within the next 7 days
        // and exclude completed tasks
        return (
          taskDate >= today &&
          taskDate <= nextWeek &&
          task.taskStatus !== "Completed"
        );
      })
      .sort((a, b) => {
        // Sort by date (closest first)
        return new Date(a.taskDeadline) - new Date(b.taskDeadline);
      })
      .map((task) => {
        // Map task data to the format expected by UpcomingDeadlines
        return {
          id: task._id,
          taskName: task.taskName,
          title: task.taskName,
          description: task.taskDescription,
          taskDeadline: task.taskDeadline,
          status:
            task.taskStatus === "Not yet started"
              ? "not-started"
              : task.taskStatus === "In progress"
              ? "in-progress"
              : task.taskStatus === "Completed"
              ? "completed"
              : "on-hold",
          priority:
            task.taskPriority === "High Priority"
              ? "high"
              : task.taskPriority === "Medium Priority"
              ? "medium"
              : "low",
          type: "task",
        };
      });
  }, [tasksList]);

  if (eventsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.24))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg font-medium text-muted-foreground">
          Loading Events...
        </p>
      </div>
    );
  }

  if (eventsIsError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Events</AlertTitle>
          <AlertDescription>
            {eventsError?.message ||
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
        onAddEvent={openAddEventForm}
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
        onEdit={openEditTaskForm}
        onDelete={handleDeleteTask}
        isDeleting={deleteEventLoading}
      />
      <TaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSave={handleSaveTask}
        onCancel={closeTaskForm}
        isLoading={selectedTask ? updateEventLoading : createEventLoading}
      />
      <EventFormDialog
        open={isEventFormOpen}
        onOpenChange={setIsEventFormOpen}
        onSave={handleSaveEvent}
        onCancel={closeEventForm}
        isLoading={createEventLoading}
      />
    </div>
  );
}
