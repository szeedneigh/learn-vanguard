import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Info, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PropTypes from 'prop-types';
// Import hook, constants, AND the helper function
import { useCalendarState, courseColors, statusClasses, capitalize, toLocaleDateStringISO } from "@/lib/hooks/useCalendarState";


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
        <Button onClick={onAddTask}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}

// Prop types for CalendarHeader
CalendarHeader.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  currentView: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onAddTask: PropTypes.func.isRequired,
};


function CalendarGrid({ grid, view, onTaskClick }) {
  // Use the imported helper to get today's date string in local timezone
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
                      // Compare cell's local date string with today's local date string
                      cell.dateString === todayDateString ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cell.tasks?.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5">
                      {cell.tasks.length} task{cell.tasks.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[80px] pr-2">
                  <div className="space-y-1 p-1">
                    {cell.tasks.map((task) => (
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

// Prop types for CalendarGrid
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
                        {/* Ensure date display is consistent, consider using toLocaleDateStringISO if needed */}
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

function TaskDetailDialog({ task, open, onOpenChange, onEdit, onDelete }) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          {/* Ensure date display is consistent */}
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
               <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
             </div>
           )}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onDelete(task.id)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button onClick={() => onEdit(task)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
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
};


function TaskFormDialog({ open, onOpenChange, task, onSave, onCancel }) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!task;

  React.useEffect(() => {
    if (open) {
      setFormData(
        task || {
          title: "",
          // Default date input to local 'YYYY-MM-DD'
          date: toLocaleDateStringISO(new Date()),
          description: "",
          course: Object.keys(courseColors)[0] || "General",
          priority: "medium",
          status: "not-started",
        }
      );
    }
  }, [task, open]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
     setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
        console.error("Title and Date are required.");
        return;
    };
    onSave(formData);
  };


  const handleDialogClose = (isOpen) => {
      if (!isOpen) {
          onCancel();
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this task." : "Fill in the details for the new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="e.g., Complete project proposal"
              required
              autoFocus
            />
          </div>

          {/* Date & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="date" className="text-sm font-medium">Due Date</label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="course" className="text-sm font-medium">Course / Category</label>
              <Select name="course" value={formData.course || ''} onValueChange={(value) => handleSelectChange('course', value)}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(courseColors).map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                   <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <Select name="priority" value={formData.priority || ''} onValueChange={(value) => handleSelectChange('priority', value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select name="status" value={formData.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusClasses).map((status) => (
                    <SelectItem key={status} value={status}>
                      {capitalize(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Add any relevant details or notes..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <DialogFooter className="mt-4">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Prop types for TaskFormDialog
TaskFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        date: PropTypes.string,
        description: PropTypes.string,
        course: PropTypes.string,
        priority: PropTypes.string,
        status: PropTypes.string,
    }),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};


// --- Main Component ---

export default function Events() {
  const {
    currentDate,
    currentView,
    setCurrentView,
    selectedTask,
    isTaskDetailOpen,
    setIsTaskDetailOpen,
    isTaskFormOpen,
    setIsTaskFormOpen,
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
  } = useCalendarState();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onViewChange={setCurrentView}
        onAddTask={openAddTaskForm}
      />

      <CalendarGrid
        grid={calendarGrid}
        view={currentView}
        onTaskClick={handleTaskClick}
      />

      <UpcomingDeadlines
        tasks={upcomingTasks}
        onTaskClick={handleTaskClick}
      />

      {/* Dialogs */}
      <TaskDetailDialog
        task={selectedTask}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        onEdit={openEditTaskForm}
        onDelete={handleDeleteTask}
      />

      <TaskFormDialog
        key={selectedTask?.id || 'new-task-form'}
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSave={handleSaveTask}
        onCancel={closeTaskForm}
      />
    </div>
  );
}
