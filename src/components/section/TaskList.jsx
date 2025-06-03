import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import PropTypes from "prop-types";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

const TaskPreviewCard = ({ task }) => {
  // Handle both frontend and backend property naming conventions
  const taskName = task.name || task.taskName || "";
  const taskDescription = task.description || task.taskDescription || "";
  const taskDueDate = task.dueDate || task.taskDeadline || "";

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 rounded-lg">
      <CardContent className="p-4 space-y-1">
        <h3 className="font-semibold text-sm text-gray-800">{taskName}</h3>
        <p className="text-xs text-gray-500">{taskDescription}</p>
        <div className="flex items-center gap-1 text-gray-500 text-xs pt-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(taskDueDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

TaskPreviewCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    taskName: PropTypes.string,
    description: PropTypes.string,
    taskDescription: PropTypes.string,
    dueDate: PropTypes.string,
    taskDeadline: PropTypes.string,
  }).isRequired,
};

// Custom validator to ensure at least one naming convention is provided
TaskPreviewCard.propTypes.task = function (props, propName, componentName) {
  const task = props[propName];
  if (!task) {
    return new Error(`${propName} is required in ${componentName}`);
  }

  if (!task.name && !task.taskName) {
    return new Error(
      `Either 'name' or 'taskName' is required in ${componentName}`
    );
  }

  if (!task.dueDate && !task.taskDeadline) {
    return new Error(
      `Either 'dueDate' or 'taskDeadline' is required in ${componentName}`
    );
  }

  return null;
};

const TaskList = () => {
  const { filteredTasks, isLoading, isError, error } = useTasks();

  const sortedTasks = [...(filteredTasks || [])].sort((a, b) => {
    const aDueDate = a.dueDate || a.taskDeadline || new Date();
    const bDueDate = b.dueDate || b.taskDeadline || new Date();
    return new Date(aDueDate) - new Date(bDueDate);
  });
  const topTasks = sortedTasks.slice(0, 3);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Upcoming Deadlines
        </h2>
        <Button
          variant="ghost"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 h-auto text-sm rounded-md"
          asChild
        >
          <Link to="/dashboard/tasks" className="flex items-center gap-1">
            View all Tasks
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading tasks...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error?.message || "Failed to load tasks"}</p>
          </div>
        ) : topTasks.length > 0 ? (
          topTasks.map((task) => <TaskPreviewCard key={task.id} task={task} />)
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No upcoming deadlines.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
