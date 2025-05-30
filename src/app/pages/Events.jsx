import { useMemo, useState, useContext, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Info, Edit, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PropTypes from 'prop-types';
import { useEventsPage } from "@/hooks/useEventsQuery";
import { courseColors, statusClasses, capitalize, toLocaleDateStringISO } from "@/hooks/useCalendarState";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function CalendarHeader({ currentDate, currentView, onPrevious, onNext, onViewChange, onAddTask }) {
  const formattedDate = useMemo(() => {
    if (currentView === "month") {
      return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
    } else if (currentView === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `Week of ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else {
      return currentDate.toLocaleDateString("default", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  }, [currentDate, currentView]);

  const { user } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold min-w-[200px] text-center">{formattedDate}</h2>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Select value={currentView} onValueChange={onViewChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
        {(user?.role === ROLES.STUDENT || user?.role === ROLES.PIO) && (
          <Button onClick={onAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
}

CalendarHeader.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  currentView: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onAddTask: PropTypes.func.isRequired,
};

function CalendarGrid({ grid, view, onTaskClick }) {
  const todayDateString = toLocaleDateStringISO(new Date());

  return (
    <Card>
      <CardContent className="p-0">
        {view !== "day" && (
          <div className="grid grid-cols-7 border-b text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="border-r p-2 font-medium text-sm text-muted-foreground last:border-r-0">
                {day}
              </div>
            ))}
          </div>
        )}
        <div className={`grid ${view === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
          {grid.map((week, weekIndex) =>
            week.map((cell, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[120px] border-b border-r p-1 last:border-r-0 ${!cell.isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-background"} ${weekIndex === grid.length - 1 ? 'border-b-0' : ''}`}
              >
                <div className="flex justify-between items-center p-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                      cell.dateString === todayDateString ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {cell.day}
                  </span>
                  {Array.isArray(cell.tasks) && cell.tasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5">
                      {cell.tasks.length} task{cell.tasks.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[80px] pr-2">
                  <div className="space-y-1 p-1">
                    {Array.isArray(cell.tasks) && cell.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`${statusClasses[task.status]} flex items-center rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80 border`}
                      >
                        <div className={`${courseColors[task.course] || 'bg-gray-500'} mr-1.5 h-2 w-2 rounded-full flex-shrink-0`} />
                        <span className="truncate flex-grow">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

CalendarGrid.propTypes = {
    grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
        day: PropTypes.number.isRequired,
        dateString: PropTypes.string.isRequired,
        isCurrentMonth: PropTypes.bool.isRequired,
        tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    }))).isRequired,
    view: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
    onTaskClick: PropTypes.func.isRequired,
};

function UpcomingDeadlines({ tasks, onTaskClick }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>Tasks due in the next 7 days (excluding completed).</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`${courseColors[task.course] || 'bg-gray-500'} h-10 w-1 rounded-full flex-shrink-0`} />
                    <div className="overflow-hidden">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <div className="text-sm text-muted-foreground truncate">
                        {task.course} • Due: {new Date(task.date + 'T00:00:00').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusClasses[task.status]} ml-2 flex-shrink-0`}>
                    {capitalize(task.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming deadlines in the next 7 days.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

UpcomingDeadlines.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        priority: PropTypes.string.isRequired,
        course: PropTypes.string.isRequired,
        description: PropTypes.string,
    })).isRequired,
    onTaskClick: PropTypes.func.isRequired,
};

function TaskDetailDialog({ task, open, onOpenChange, onEdit, onDelete, isDeleting }) {
  const { user } = useContext(AuthContext);

  if (!task) return null;

  const canModify = user?.role === ROLES.ADMIN || 
                    user?.role === ROLES.PIO || 
                    (user?.role === ROLES.STUDENT /* && task.creatorId === user.id */);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Due: {new Date(task.date + 'T00:00:00').toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusClasses[task.status]}>
              {capitalize(task.status)}
            </Badge>
            <Badge variant="outline">{capitalize(task.priority)} priority</Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 text-muted-foreground">Course</h4>
            <div className="flex items-center">
              <div className={`${courseColors[task.course] || 'bg-gray-500'} h-3 w-3 rounded-full mr-2 flex-shrink-0`} />
              <span>{task.course}</span>
            </div>
          </div>
          {task.description && (
             <div>
               <h4 className="text-sm font-medium mb-1 text-muted-foreground">Description</h4>
               <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded-md">{task.description}</p>
             </div>
           )}
        </div>
        <DialogFooter className="mt-4">
          {canModify && (
            <Button variant="outline" onClick={() => onEdit(task)} disabled={isDeleting}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canModify && (
            <Button variant="destructive" onClick={() => onDelete(task.id)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />} 
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

TaskDetailDialog.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        priority: PropTypes.string.isRequired,
        course: PropTypes.string.isRequired,
        description: PropTypes.string,
    }),
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool,
};

function TaskFormDialog({ open, onOpenChange, task, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState(task || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
        setFormData(task || {
            title: '',
            date: toLocaleDateStringISO(new Date()), 
            status: 'not-started',
            priority: 'medium',
            course: '', 
            description: '',
        });
        setErrors({});
    }
  }, [task, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    else if (isNaN(new Date(formData.date).getTime())) newErrors.date = "Invalid date format.";
    if (!formData.course?.trim()) newErrors.course = "Course is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
     setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} error={errors.title} required />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input id="date" type="date" name="date" value={formData.date || ''} onChange={handleInputChange} error={errors.date} required />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course/Subject</label>
              <Input id="course" name="course" value={formData.course || ''} onChange={handleInputChange} error={errors.course} required />
              {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
            </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select name="status" value={formData.status || 'not-started'} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusClasses).map(([key]) => (
                            <SelectItem key={key} value={key}>{capitalize(key)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select name="priority" value={formData.priority || 'medium'} onValueChange={(value) => handleSelectChange('priority', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {task ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

TaskFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    task: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default function Events() {
  // Local state for calendar functionality
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  // React Query hook for events
  const {
    events,
    todayEvents,
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

  const openAddTaskForm = () => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
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

  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      updateEvent({ eventId: selectedTask.id, eventData: taskData });
    } else {
      createEvent(taskData);
    }
    closeTaskForm();
  };

  const handleDeleteTask = (taskId) => {
    deleteEvent(taskId);
    setIsTaskDetailOpen(false);
  };

  // Calendar grid generation
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const grid = [];
    let week = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayTasks = events.filter(task => {
        const taskDate = new Date(task.date + 'T00:00:00');
        return taskDate.toDateString() === date.toDateString();
      });
      
      week.push({
        day: date.getDate(),
        dateString: toLocaleDateStringISO(date),
        isCurrentMonth: date.getMonth() === month,
        tasks: dayTasks
      });
      
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }
    
    return grid;
  }, [currentDate, events, currentView]);

  // Upcoming tasks calculation
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return events
      .filter(task => {
        const taskDate = new Date(task.date + 'T00:00:00');
        return taskDate >= today && taskDate <= nextWeek && task.status !== 'completed';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onViewChange={setCurrentView}
        onAddTask={openAddTaskForm}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarGrid grid={calendarGrid} view={currentView} onTaskClick={handleTaskClick} />
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
    </div>
  );
}
