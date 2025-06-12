import { motion } from "framer-motion";
import {
  CheckCircle,
  CheckCircle2,
  Calendar,
  Edit,
  Trash2,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import PropTypes from "prop-types";

const TaskCard = ({ task, onEdit, onDelete, onArchive }) => {
  const { hasPermission } = usePermission();

  // Extract properties from task, handling different formats
  const taskId = task._id || task.id; // Handle both MongoDB _id and regular id
  const taskName = task.name || task.taskName || "";
  const taskDescription = task.description || task.taskDescription || "";
  const taskDueDate = task.dueDate || task.taskDeadline || "";
  const taskStatus = task.status || task.taskStatus || "";
  const taskPriority = task.priority || task.taskPriority || "";
  const taskCompletedAt = task.completedAt || task.dateCompleted || "";

  // Normalize status to handle different formats from backend
  const normalizeStatus = (status) => {
    if (!status) return "Unknown";

    // Convert to lowercase for case-insensitive comparison
    const statusLower = typeof status === "string" ? status.toLowerCase() : "";

    if (
      statusLower === "not yet started" ||
      statusLower === "not-started" ||
      statusLower === "not started"
    ) {
      return "Not Started";
    } else if (statusLower === "in progress" || statusLower === "in-progress") {
      return "In Progress";
    } else if (statusLower === "on hold" || statusLower === "on-hold") {
      return "On Hold";
    } else if (statusLower === "completed") {
      return "Completed";
    }

    return status; // Return original if no match
  };

  // Get normalized status
  const normalizedStatus = normalizeStatus(taskStatus);

  // Map status to color
  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "On Hold":
        return "bg-amber-100 text-amber-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const statusColor = getStatusColor(normalizedStatus);

  // Map backend priority format to frontend format
  const normalizedPriority = typeof taskPriority === "string" && taskPriority.includes("Priority")
    ? taskPriority.replace(" Priority", "")
    : taskPriority;

  const priorityDisplay = {
    High: { text: "High Priority", color: "text-red-600", bg: "bg-red-100" },
    Medium: {
      text: "Medium Priority",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    Low: { text: "Low Priority", color: "text-green-600", bg: "bg-green-100" },
  };



  const currentPriority = priorityDisplay[normalizedPriority] || {
    text: normalizedPriority || "Unknown",
    color: "text-gray-700",
    bg: "bg-gray-100",
  };



  const isCompleted = normalizedStatus === "Completed";

  // Permission checks
  const canEditTask = hasPermission(PERMISSIONS.EDIT_TASK);
  const canDeleteTask = hasPermission(PERMISSIONS.DELETE_TASK);
  const canManageArchive = hasPermission(PERMISSIONS.MANAGE_ARCHIVE);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg shadow mb-4 overflow-hidden ${
        isCompleted ? "opacity-75" : ""
      }`}
    >
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            <h3
              className={`font-semibold text-gray-800 text-md ${
                isCompleted ? "line-through" : ""
              }`}
            >
              {taskName}
            </h3>
          </div>
        </div>

        {taskPriority && (
          <div
            className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}
          >
            {currentPriority.text}
          </div>
        )}

        <p
          className={`text-sm text-gray-600 line-clamp-3 ${
            isCompleted ? "line-through" : ""
          }`}
        >
          {taskDescription}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar size={14} className="mr-1.5 text-gray-400" />
            <span>
              Due:{" "}
              {new Date(taskDueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          {isCompleted && taskCompletedAt && (
            <div className="flex items-center text-green-600 text-xs">
              <CheckCircle2 size={14} className="mr-1.5" />
              <span>
                Completed:{" "}
                {new Date(taskCompletedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {(canEditTask || canDeleteTask || canManageArchive) && (
          <div className="flex justify-end pt-2 border-t mt-3">
            {isCompleted && canManageArchive && onArchive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(taskId)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 w-full justify-center"
              >
                <Archive className="w-4 h-4 mr-2" />
                Move to Archive
              </Button>
            ) : (
              <div className="flex gap-2">
                {canEditTask && (
                  <button
                    onClick={() => onEdit(taskId)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {canDeleteTask && (
                  <button
                    onClick={() => onDelete(taskId)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className={`w-full py-2 text-center text-xs font-semibold ${statusColor} ${
          isCompleted ? "bg-opacity-75" : ""
        }`}
      >
        {normalizedStatus}
      </div>
    </motion.div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    taskName: PropTypes.string,
    description: PropTypes.string,
    taskDescription: PropTypes.string,
    status: PropTypes.string,
    taskStatus: PropTypes.string,
    priority: PropTypes.string,
    taskPriority: PropTypes.string,
    dueDate: PropTypes.string,
    taskDeadline: PropTypes.string,
    completedAt: PropTypes.string,
    dateCompleted: PropTypes.string,
    isArchived: PropTypes.bool,
    archived: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onArchive: PropTypes.func,
  onHighPriority: PropTypes.func,
};

export default TaskCard;
