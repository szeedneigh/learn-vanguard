import logger from "@/utils/logger";
import { motion } from "framer-motion";
import {
  CheckCircle,
  CheckCircle2,
  Calendar,
  Edit,
  Trash2,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/PermissionContext";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { isTaskOverdue, formatDateTime } from "@/lib/calendarHelpers";
import PropTypes from "prop-types";

const TaskCard = ({ task, onEdit, onDelete, onArchive }) => {
  const { hasPermission } = usePermission();
  const { user } = useAuth();
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
  // Map status to color
  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "On Hold":
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
  // Map backend priority format to frontend format
  const normalizePriority = (priority) => {
    if (priority && priority.includes && priority.includes("Priority")) {
      return priority.replace(" Priority", "");
    return priority;
  // Extract and normalize task properties
  const taskId = task.id || task._id;
  const taskName = task.name || task.taskName;
  const taskDescription = task.description || task.taskDescription;
  const taskDueDate = task.dueDate || task.taskDeadline;
  const taskPriority = task.priority || task.taskPriority;
  const taskCompletedAt = task.completedAt || task.dateCompleted;
  const taskUserId = task.userId || task.creatorId || task.assigneeId;
  // Normalize status
  const normalizedStatus = normalizeStatus(task.status || task.taskStatus);
  const normalizedPriority = normalizePriority(taskPriority);
  const statusColor = getStatusColor(normalizedStatus);
  const priorityDisplay = {
    High: { text: "High", color: "text-red-700", bg: "bg-red-100" },
    Medium: { text: "Medium", color: "text-amber-700", bg: "bg-amber-100" },
    Low: { text: "Low", color: "text-green-700", bg: "bg-green-100" },
  const currentPriority = priorityDisplay[normalizedPriority] || {
    text: normalizedPriority || "Unknown",
    color: "text-gray-700",
    bg: "bg-gray-100",
  const isCompleted = normalizedStatus === "Completed";
  const isOverdue = isTaskOverdue(taskDueDate, normalizedStatus);
  // Permission checks
  const hasEditPermission = hasPermission(PERMISSIONS.EDIT_TASK);
  const hasDeletePermission = hasPermission(PERMISSIONS.DELETE_TASK);
  const hasArchivePermission = hasPermission(PERMISSIONS.MANAGE_ARCHIVE);
  // Check if the task belongs to the current user
  const isOwnTask = user && taskUserId && user.id === taskUserId;
  // Normalize user role for case-insensitive comparison
  const userRole = user?.role?.toUpperCase();
  // Admin and PIO can edit all tasks, students can only edit their own tasks
  const canEditTask =
    userRole === ROLES.ADMIN ||
    userRole === ROLES.PIO ||
    (userRole === ROLES.STUDENT && hasEditPermission && isOwnTask);
  // Only admin and PIO can delete tasks
  const canDeleteTask =
    (hasDeletePermission &&
      (userRole === ROLES.ADMIN || userRole === ROLES.PIO)) ||
    (userRole === ROLES.STUDENT && isOwnTask);
  // Admin and PIO can archive any task, students can archive their own completed tasks
  const canManageArchive =
    (hasArchivePermission &&
      userRole === ROLES.STUDENT &&
      isOwnTask &&
      isCompleted);
  // Debug archive permissions
  if (isCompleted) {
    logger.log("Archive permission check:", {
      taskId: taskId,
      taskName: taskName,
      hasArchivePermission,
      userRole,
      isOwnTask,
      isCompleted,
      canManageArchive,
      hasOnArchiveProp: !!onArchive,
    });
  }
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
        )}
        <p
          className={`text-sm text-gray-600 line-clamp-3 ${
            isCompleted ? "line-through" : ""
          }`}
        >
          {taskDescription}
        </p>
        {/* Display on-hold remarks if task is on hold */}
        {normalizedStatus === "On Hold" && task.onHoldRemark && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
            <div className="flex items-center text-yellow-700 text-sm">
              <span className="mr-1">💬</span>
              <span className="font-medium">On-Hold Reason:</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1 italic">
              {task.onHoldRemark}
            </p>
        <div className="flex flex-col gap-1.5">
            className={`flex items-center text-xs ${
              isOverdue ? "text-red-600" : "text-gray-500"
            }`}
            <Calendar
              size={14}
              className={`mr-1.5 ${
                isOverdue ? "text-red-500" : "text-gray-400"
            />
            {isOverdue && (
              <AlertTriangle size={14} className="mr-1.5 text-red-500" />
            )}
            <span>
              Due: {formatDateTime(taskDueDate)}
              {isOverdue && (
                <span className="ml-1 font-semibold text-red-600">
                  (OVERDUE)
                </span>
              )}
            </span>
          {isCompleted && taskCompletedAt && (
            <div className="flex items-center text-green-600 text-xs">
              <CheckCircle2 size={14} className="mr-1.5" />
              <span>Completed: {formatDateTime(taskCompletedAt)}</span>
          )}
        <div className="flex justify-end pt-2 border-t mt-3">
          {isCompleted && canManageArchive && onArchive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(taskId)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 w-full justify-center"
              <Archive className="w-4 h-4 mr-2" />
              Move to Archive
            </Button>
          ) : (
            <div className="flex gap-2">
              {canEditTask && (
                <button
                  onClick={() => onEdit()}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit size={18} />
                </button>
              {canDeleteTask && (
                  onClick={() => onDelete()}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  <Trash2 size={18} />
      </div>
      <div
        className={`w-full py-2 text-center text-xs font-semibold ${statusColor} ${
          isCompleted ? "bg-opacity-75" : ""
        }`}
      >
        {normalizedStatus}
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
    dueDate: PropTypes.string,
    taskDeadline: PropTypes.string,
    status: PropTypes.string,
    taskStatus: PropTypes.string,
    priority: PropTypes.string,
    taskPriority: PropTypes.string,
    completedAt: PropTypes.string,
    dateCompleted: PropTypes.string,
    isArchived: PropTypes.bool,
    archived: PropTypes.bool,
    userId: PropTypes.string,
    creatorId: PropTypes.string,
    assigneeId: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onArchive: PropTypes.func,
export default TaskCard;
