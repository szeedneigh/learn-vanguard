import { useContext } from "react";
import PropTypes from "prop-types";
import { Edit, Trash, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { statusClasses, capitalize, courseColors } from "@/lib/calendarHelpers";

function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting,
}) {
  const { user } = useContext(AuthContext);

  if (!task) return null;

  // Format date for display, handling multiple possible date properties
  const formatDate = () => {
    try {
      if (task.date) {
        return new Date(task.date + "T00:00:00").toLocaleDateString();
      } else if (task.scheduleDate) {
        return new Date(task.scheduleDate).toLocaleDateString();
      } else if (task.taskDeadline) {
        return new Date(task.taskDeadline).toLocaleDateString();
      }
      return "Date not specified";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const canModify =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.PIO ||
    user?.role === ROLES.STUDENT /* && task.creatorId === user.id */;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title || task.taskName}</DialogTitle>
          <DialogDescription>Due: {formatDate()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusClasses[task.status]}>
              {capitalize(task.status)}
            </Badge>
            <Badge variant="outline">
              {capitalize(task.priority)} priority
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 text-muted-foreground">
              Course
            </h4>
            <div className="flex items-center">
              <div
                className={`${
                  courseColors[task.course] || "bg-gray-500"
                } h-3 w-3 rounded-full mr-2 flex-shrink-0`}
              />
              <span>{task.course}</span>
            </div>
          </div>
          {(task.description || task.taskDescription) && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">
                Description
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded-md">
                {task.description || task.taskDescription}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          {canModify && (
            <Button
              variant="outline"
              onClick={() => onEdit(task)}
              disabled={isDeleting}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canModify && (
            <Button
              variant="destructive"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
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
    title: PropTypes.string,
    taskName: PropTypes.string,
    date: PropTypes.string,
    scheduleDate: PropTypes.string,
    taskDeadline: PropTypes.string,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    course: PropTypes.string.isRequired,
    description: PropTypes.string,
    taskDescription: PropTypes.string,
  }),
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default TaskDetailDialog;
