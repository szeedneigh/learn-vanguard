import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEventsPage } from "@/hooks/useEventsQuery";
import { toLocaleDateStringISO, generateCalendarGrid } from "@/lib/calendarHelpers";
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
  const [selectedDate, setSelectedDate] = useState(toLocaleDateStringISO(new Date()));

  // Keep selectedDate in sync with currentDate
  useEffect(() => {
    setSelectedDate(toLocaleDateStringISO(currentDate));
  }, [currentDate]);

  // React Query hook for events
  const {
    events,
    isLoading: tasksLoading,
    isError: tasksIsError,
    error: tasksError,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: createTaskLoading,
    isUpdating: updateTaskLoading,
    isDeleting: deleteTaskLoading,
  } = useEventsPage();

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
    const newDate = new Date(dateString + 'T00:00:00');
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
      date: eventData.scheduleDate.substring(0, 10) // Extract YYYY-MM-DD from the ISO string
    };
    
    // Call the API function
    createEvent(formattedData)
      .then(() => {
        // Close the form after successful event creation
        setIsEventFormOpen(false);
      })
      .catch(error => {
        // Show error message
        console.error('Failed to create event:', error);
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
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return events
      .filter(task => {
        // Handle both date and scheduleDate properties
        let taskDate;
        if (task.date) {
          taskDate = new Date(task.date + 'T00:00:00');
        } else if (task.scheduleDate) {
          taskDate = new Date(task.scheduleDate);
        } else {
          return false;
        }
        
        return taskDate >= today && taskDate <= nextWeek && task.status !== 'completed';
      })
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(a.scheduleDate);
        const dateB = b.date ? new Date(b.date) : new Date(b.scheduleDate);
        return dateA - dateB;
      });
  }, [events]);

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.24))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg font-medium text-muted-foreground">Loading Events...</p>
      </div>
    );
  }

  if (tasksIsError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Events</AlertTitle>
          <AlertDescription>
            {tasksError?.message || "An unexpected error occurred. Please try again later."}
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
        <div className="lg:col-span-2">
          {renderCalendarView()}
        </div>
        <div className="lg:col-span-1">
          <UpcomingDeadlines tasks={upcomingTasks} onTaskClick={handleTaskClick} />
        </div>
      </div>
      <TaskDetailDialog
        task={selectedTask}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        onEdit={openEditTaskForm}
        onDelete={handleDeleteTask}
        isDeleting={deleteTaskLoading}
      />
      <TaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSave={handleSaveTask}
        onCancel={closeTaskForm}
        isLoading={selectedTask ? updateTaskLoading : createTaskLoading}
      />
      <EventFormDialog
        open={isEventFormOpen}
        onOpenChange={setIsEventFormOpen}
        onSave={handleSaveEvent}
        onCancel={closeEventForm}
        isLoading={createTaskLoading}
      />
    </div>
  );
}
