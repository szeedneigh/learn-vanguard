import { useContext } from "react";
import PropTypes from "prop-types";
import { Edit, Trash, Loader2, Info } from "lucide-react";
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
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import {
  statusClasses,
  capitalize,
  courseColors,
  getTaskColor,
  getTaskColorClasses,
  getStatusColorClasses,
  normalizePriority,
  normalizeStatus,
  isTaskCompleted,
  isTaskOverdue,
  formatDateTime,
} from "@/lib/calendarHelpers";

function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting,
}) {
  const { user } = useContext(AuthContext);
  const { hasPermission } = usePermission();

  if (!task) return null;

  // Get the appropriate date field for the task/event/announcement - prioritize full datetime fields
  const getItemDate = () => {
    return task.scheduleDate || task.dueDate || task.taskDeadline || task.date;
  };

  // Check if item is overdue
  const itemDate = getItemDate();
  const overdue = isTaskOverdue(itemDate, task.status);

  // Get user context for permission checks - we'll determine the specific permissions based on item type later

  // Determine if this is a task, announcement, or event
  // Tasks have type="task" (added in Events.jsx transformation) or have taskName/taskDeadline properties
  // Announcements have type="announcement" or have content/subjectId properties
  // Events have title/scheduleDate properties and no type property
  const isTask =
    task?.type === "task" || (task?.taskName && task?.taskDeadline);
  const isAnnouncement =
    task?.type === "announcement" || (task?.content && task?.subjectId);

  // Helper function to get user ID (similar to backend getUserId)
  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj.userId || userObj.id || userObj._id;
  };

  // Extract creator/owner ID for ownership check
  // For Tasks: userId field
  // For Events: createdBy field (MongoDB ObjectId)
  const creatorId = isTask ? task?.userId : task?.createdBy;

  // Also try alternative fields as fallback
  const fallbackCreatorId = task?.creatorId || task?.assigneeId;
  const finalCreatorId = creatorId || fallbackCreatorId;

  // Get current user ID using the same logic as backend
  const currentUserId = getUserId(user);

  console.log("TaskDetailDialog - Creator ID extraction:", {
    isTask,
    // Raw field values from task object
    taskUserId: task?.userId,
    taskCreatedBy: task?.createdBy,
    taskCreatorId: task?.creatorId,
    taskAssigneeId: task?.assigneeId,
    // Extraction logic results
    primaryCreatorId: creatorId,
    fallbackCreatorId: fallbackCreatorId,
    finalCreatorId: finalCreatorId,
    // User ID extraction
    userObject: user,
    extractedCurrentUserId: currentUserId,
  });

  console.log("TaskDetailDialog - Item analysis:", {
    itemId: task.id || task._id,
    itemType: isTask ? "task" : "event",
    hasType: !!task?.type,
    typeValue: task?.type,
    hasTaskName: !!task?.taskName,
    hasTitle: !!task?.title,
    hasTaskDeadline: !!task?.taskDeadline,
    hasScheduleDate: !!task?.scheduleDate,
    // Show ALL properties of the task object for debugging
    allTaskProperties: Object.keys(task || {}),
    rawTaskObject: task,
    // User analysis
    userId: user?.id,
    userRole: user?.role,
    allUserProperties: Object.keys(user || {}),
    rawUserObject: user,
  });

  // Check if the item belongs to the current user
  // Use string comparison to handle ObjectId vs string differences
  const isOwnItem =
    currentUserId &&
    finalCreatorId &&
    currentUserId.toString() === finalCreatorId.toString();

  console.log("TaskDetailDialog - Ownership check:", {
    hasUser: !!user,
    hasCreatorId: !!finalCreatorId,
    // User ID analysis
    userRaw: user,
    currentUserId,
    currentUserIdType: typeof currentUserId,
    currentUserIdString: currentUserId?.toString(),
    // Creator ID analysis
    finalCreatorId,
    creatorIdType: typeof finalCreatorId,
    finalCreatorIdString: finalCreatorId?.toString(),
    // Detailed comparison analysis
    bothExist: !!currentUserId && !!finalCreatorId,
    exactMatch: currentUserId === finalCreatorId,
    stringMatch: currentUserId?.toString() === finalCreatorId?.toString(),
    // Raw values for debugging
    currentUserIdRaw: currentUserId,
    finalCreatorIdRaw: finalCreatorId,
    // Length comparison (to check for extra characters)
    currentUserIdLength: currentUserId?.toString().length,
    finalCreatorIdLength: finalCreatorId?.toString().length,
    isOwnItem,
  });

  // Normalize user role for case-insensitive comparison
  const userRole = user?.role?.toUpperCase();

  // Permission logic for tasks, announcements, and events
  let canEditItem, canDeleteItem;

  if (isTask) {
    // For tasks: Tasks should not be editable/deletable from the Events page
    // They should only be managed from the Tasks page
    canEditItem = false;
    canDeleteItem = false;
    console.log(
      "TaskDetailDialog - Task permissions: edit=false, delete=false (tasks managed from Tasks page)"
    );
  } else if (isAnnouncement) {
    // For announcements: Announcements should not be editable/deletable from the Events page
    // They should only be managed from the Resources/Subject pages where they are created
    canEditItem = false;
    canDeleteItem = false;
    console.log(
      "TaskDetailDialog - Announcement permissions: edit=false, delete=false (announcements managed from Resources page)"
    );
  } else {
    // For events: Check event-specific permissions
    console.log("TaskDetailDialog - Checking event permissions...", {
      PERMISSIONS_EDIT_EVENT: PERMISSIONS.EDIT_EVENT,
      PERMISSIONS_DELETE_EVENT: PERMISSIONS.DELETE_EVENT,
      userRole,
      ROLES_ADMIN: ROLES.ADMIN,
      ROLES_PIO: ROLES.PIO,
    });

    const hasEditEventPermission = hasPermission(PERMISSIONS.EDIT_EVENT);
    const hasDeleteEventPermission = hasPermission(PERMISSIONS.DELETE_EVENT);

    console.log("TaskDetailDialog - Permission check results:", {
      hasEditEventPermission,
      hasDeleteEventPermission,
    });

    // Admin can edit/delete all events, PIO can only edit/delete their own events
    const isAdmin = userRole === ROLES.ADMIN;
    const isPIO = userRole === ROLES.PIO;

    canEditItem = isAdmin || (isPIO && hasEditEventPermission && isOwnItem);
    canDeleteItem = isAdmin || (isPIO && hasDeleteEventPermission && isOwnItem);

    console.log("TaskDetailDialog - Event permissions:", {
      userRole,
      hasEditEventPermission,
      hasDeleteEventPermission,
      isOwnItem,
      isAdmin,
      isPIO,
      // Detailed calculation breakdown
      adminCanEdit: isAdmin,
      pioCanEdit: isPIO && hasEditEventPermission && isOwnItem,
      pioEditComponents: {
        isPIO,
        hasEditEventPermission,
        isOwnItem,
      },
      adminCanDelete: isAdmin,
      pioCanDelete: isPIO && hasDeleteEventPermission && isOwnItem,
      pioDeleteComponents: {
        isPIO,
        hasDeleteEventPermission,
        isOwnItem,
      },
      canEditItem,
      canDeleteItem,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title || task.taskName}</DialogTitle>
          <DialogDescription
            className={
              overdue && !isTaskCompleted(task.status) ? "text-red-600" : ""
            }
          >
            Due: {formatDateTime(itemDate)}
            {overdue && !isTaskCompleted(task.status) && (
              <span className="ml-1 font-semibold">(OVERDUE)</span>
            )}
          </DialogDescription>
        </DialogHeader>
        {/* Show read-only notice for tasks viewed from Events page */}
        {isTask && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <Info className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                This is a personal task. To edit or manage this task, please
                visit the <span className="font-medium">Tasks page</span>.
              </p>
            </div>
          </div>
        )}
        {/* Show enhanced announcement details */}
        {isAnnouncement && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
            <div className="flex items-center mb-3">
              <Info className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-purple-800 font-medium">
                Subject Announcement
              </p>
            </div>

            {/* Announcement Type */}
            {task.type && (
              <div className="mb-2">
                <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                  Type:
                </span>
                <span className="ml-2 text-sm text-purple-800 capitalize">
                  {task.type}
                </span>
              </div>
            )}

            {/* Announcement Content */}
            {task.content && (
              <div className="mb-2">
                <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                  Content:
                </span>
                <p className="mt-1 text-sm text-purple-800 bg-white p-2 rounded border">
                  {task.content}
                </p>
              </div>
            )}

            {/* Due Date for assignments/quizzes/exams */}
            {task.dueDate &&
              ["assignment", "quiz", "exam"].includes(task.type) && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                    Due Date:
                  </span>
                  <span className="ml-2 text-sm text-purple-800">
                    {formatDateTime(task.dueDate)}
                  </span>
                </div>
              )}

            <div className="mt-3 pt-2 border-t border-purple-200">
              <p className="text-xs text-purple-700">
                To edit or manage this announcement, visit the{" "}
                <span className="font-medium">Resources page</span> for the
                related subject.
              </p>
            </div>
          </div>
        )}
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            {/* Status Badge - using consistent colors */}
            <Badge className={getStatusColorClasses(task.status)}>
              {capitalize(normalizeStatus(task.status) || "N/A")}
            </Badge>
            {/* Priority Badge - remove duplicate "priority" text and use consistent colors */}
            {task.priority && (
              <Badge
                className={getTaskColorClasses(task.priority, task.status)}
              >
                {capitalize(normalizePriority(task.priority) || "N/A")}
              </Badge>
            )}
          </div>
          {/* Only show Course field for events, not tasks */}
          {!isTask && task.course && (
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
          )}
          {/* Show Personal field for tasks */}
          {isTask && task.personal !== undefined && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">
                Personal
              </h4>
              <span className="text-sm">{task.personal ? "Yes" : "No"}</span>
            </div>
          )}
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
          {normalizeStatus(task.status) === "On Hold" && task.onHoldRemark && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">
                On-Hold Remarks
              </h4>
              <p className="text-sm text-amber-700 whitespace-pre-wrap bg-amber-50 p-2 rounded-md border border-amber-200">
                {task.onHoldRemark}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          {canEditItem && (
            <Button
              variant="outline"
              onClick={() => onEdit(task)}
              disabled={isDeleting}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canDeleteItem && (
            <Button
              variant="destructive"
              onClick={() => onDelete(task.id || task._id)}
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
    status: PropTypes.string, // was required, now optional
    priority: PropTypes.string, // was required, now optional
    course: PropTypes.string,
    description: PropTypes.string,
    taskDescription: PropTypes.string,
    userId: PropTypes.string,
    assigneeId: PropTypes.string,
  }),
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default TaskDetailDialog;
