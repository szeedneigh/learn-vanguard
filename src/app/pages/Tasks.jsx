import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ArrowUpCircle,
  CheckCircle,
  CheckCircle2,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TaskModal from "@/components/modal/AddTaskModal";
import TaskCard from "@/components/section/TaskCard";
import StatCard from "@/components/section/StatCard";
import { useTasksPage } from "@/hooks/useTasksQuery";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Tasks = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermission();

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [onHoldRemark, setOnHoldRemark] = useState("");
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState(null);

  // Update showArchived state based on statusFilter
  useEffect(() => {
    setShowArchived(statusFilter === "archived");
  }, [statusFilter]);

  // React Query hook for all task operations
  const {
    tasks,
    summary: stats,
    isLoading,
    isError,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask: deleteTaskMutation,
    updateTaskStatus,
    archiveTask,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStatus,
    isArchiving,
    isMutating,
  } = useTasksPage({
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
    archived: showArchived ? "true" : "false",
  });

  // Refresh summary stats when filter changes or after operations
  useEffect(() => {
    // Refresh stats after component mounts and when filter changes
    refetch();
  }, [statusFilter, searchQuery, showArchived, refetch]);

  const taskStatusColumns = [
    "Not Started",
    "In Progress",
    "On Hold",
    "Completed",
  ];

  // Status mapping functions - moved up before they're used
  const mapStatusForDisplay = (apiStatus) => {
    if (!apiStatus) return "Unknown";
    // Convert to lowercase for case-insensitive comparison
    const apiStatusLower =
      typeof apiStatus === "string" ? apiStatus.toLowerCase() : "";

    const statusMap = {
      "not-started": "Not Started",
      "in-progress": "In Progress",
      "on-hold": "On Hold",
      completed: "Completed",
      // Add mappings for backend format
      "not yet started": "Not Started",
      "in progress": "In Progress",
    };
    return statusMap[apiStatusLower] || apiStatus;
  };

  const mapStatusForAPI = (displayStatus) => {
    if (!displayStatus) return "unknown";
    const statusMap = {
      "Not Started": "not-started",
      "In Progress": "in-progress",
      "On Hold": "on-hold",
      Completed: "completed",
    };
    return statusMap[displayStatus] || displayStatus;
  };

  // Filter tasks for display based on search and status
  const filteredTasks = tasks.filter((task) => {
    const searchMatch =
      !searchQuery ||
      task.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskDescription?.toLowerCase().includes(searchQuery.toLowerCase());

    // Handle archived filter separately
    if (statusFilter === "archived") {
      return searchMatch && (task.isArchived || task.archived);
    } else {
      const statusMatch =
        statusFilter === "all" ||
        mapStatusForDisplay(task.taskStatus) === statusFilter;

      return searchMatch && statusMatch && !(task.isArchived || task.archived);
    }
  });

  // Handler functions
  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      updateTask({ taskId: editingTask.id, taskData });
    } else {
      createTask(taskData);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!task) {
      console.error("Cannot delete task: Task not found", taskId);
      toast({
        title: "Error",
        description: "Failed to delete task: Task not found",
        variant: "destructive",
      });
      return;
    }

    const taskName = task.taskName || task.name;

    // Show confirmation toast instead of modal
    toast({
      title: "Delete Task?",
      description: `Are you sure you want to delete "${taskName}"? This action cannot be undone.`,
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Use the task's _id or id property (MongoDB uses _id)
              const actualTaskId = task._id || task.id;

              if (!actualTaskId) {
                console.error("Cannot delete task: Invalid task ID", task);
                toast({
                  title: "Error",
                  description: "Failed to delete task: Invalid task ID",
                  variant: "destructive",
                });
                return;
              }

              deleteTaskMutation(actualTaskId)
                .then(() => {
                  toast({
                    title: "Task Deleted",
                    description: "The task has been permanently deleted.",
                    variant: "default",
                  });
                  refetch();
                })
                .catch((error) => {
                  console.error("Error deleting task:", error);
                  toast({
                    title: "Error",
                    description: "Failed to delete task. Please try again.",
                    variant: "destructive",
                  });
                });
            }}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Do nothing, toast will dismiss
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleStatusChange = (taskId, newStatus, completedDate = null) => {
    if (!taskId) {
      console.error("Cannot update task status: Task ID is undefined");
      toast({
        title: "Error",
        description: "Failed to update task status: Invalid task ID",
        variant: "destructive",
      });
      return;
    }

    console.log("Updating task status:", { taskId, newStatus, completedDate });

    const updateData = { taskStatus: mapStatusForAPI(newStatus) };
    if (newStatus === "completed" && completedDate) {
      updateData.dateCompleted = completedDate;
    }

    updateTaskStatus({
      taskId,
      status: mapStatusForAPI(newStatus),
    });
  };

  const handleSetHighPriority = (taskId) => {
    const task = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (task) {
      // Use the task's _id or id property (MongoDB uses _id)
      const actualTaskId = task._id || task.id;

      updateTask({
        taskId: actualTaskId,
        taskData: {
          taskPriority: task.taskPriority === "High" ? "Medium" : "High",
        },
      });
    }
  };

  const handleArchiveTask = (taskId) => {
    if (!taskId) {
      console.error("Cannot archive task: Task ID is undefined");
      toast({
        title: "Error",
        description: "Failed to archive task: Invalid task ID",
        variant: "destructive",
      });
      return;
    }

    const task = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!task) {
      console.error("Cannot archive task: Task not found", taskId);
      toast({
        title: "Error",
        description: "Failed to archive task: Task not found",
        variant: "destructive",
      });
      return;
    }

    const taskName = task.taskName || task.name;

    // Show toast with confirmation buttons
    toast({
      title: "Archive Task?",
      description: `Are you sure you want to archive "${taskName}"?`,
      action: (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // Use the task's _id or id property (MongoDB uses _id)
              const actualTaskId = task._id || task.id;

              if (!actualTaskId) {
                console.error("Cannot archive task: Invalid task ID", task);
                toast({
                  title: "Error",
                  description: "Failed to archive task: Invalid task ID",
                  variant: "destructive",
                });
                return;
              }

              archiveTask({
                taskId: actualTaskId,
                archived: true,
              })
                .then(() => {
                  toast({
                    title: "Task Archived",
                    description: "The task has been moved to the archive.",
                  });
                  // Force refresh the task list and stats
                  refetch();
                  // If we're in the archive view, refresh immediately
                  if (statusFilter === "archived") {
                    setTimeout(() => refetch(), 300);
                  }
                })
                .catch((error) => {
                  console.error("Error archiving task:", error);
                  toast({
                    title: "Error",
                    description: "Failed to archive task. Please try again.",
                    variant: "destructive",
                  });
                });
            }}
          >
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Do nothing, toast will dismiss
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const openArchiveDialog = (taskId) => {
    const task = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (task) {
      const taskName = task.taskName || task.name;

      // Show confirmation toast instead of modal
      toast({
        title: "Archive Task?",
        description: `Are you sure you want to archive "${taskName}"? You can restore it later from the Archive page.`,
        action: (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                const actualTaskId = task._id || task.id;
                if (actualTaskId) {
                  handleArchiveTask(actualTaskId);
                }
              }}
            >
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Do nothing, toast will dismiss
              }}
            >
              Cancel
            </Button>
          </div>
        ),
      });
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      // Find the task object using the draggableId
      const task = filteredTasks.find(
        (t) => String(t._id || t.id) === draggableId
      );

      if (!task) {
        console.error("Task not found for draggableId:", draggableId);
        toast({
          title: "Error",
          description: "Failed to update task: Task not found",
          variant: "destructive",
        });
        return;
      }

      // Use the task's _id or id property (MongoDB uses _id)
      const taskId = task._id || task.id;

      if (!taskId) {
        console.error("Invalid task ID in drag operation:", task);
        toast({
          title: "Error",
          description: "Failed to update task: Invalid task ID",
          variant: "destructive",
        });
        return;
      }

      const newApiStatus = destination.droppableId;
      const sourceStatus = source.droppableId;

      // Get display names for the statuses for better user experience
      const newDisplayStatus = mapStatusForDisplay(newApiStatus);

      // Special handling for "On Hold" status
      if (newApiStatus === "on-hold") {
        setStatusChangeInfo({
          taskId,
          taskName: task.taskName || task.name,
          sourceStatus,
          newStatus: newApiStatus,
          newDisplayStatus,
        });
        setOnHoldRemark("");
        setStatusChangeDialogOpen(true);
      } else {
        // Show confirmation for other status changes
        toast({
          title: `Change Task Status?`,
          description: `Are you sure you want to change "${
            task.taskName || task.name
          }" from ${mapStatusForDisplay(sourceStatus)} to ${newDisplayStatus}?`,
          action: (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (newApiStatus === "completed") {
                    handleStatusChange(
                      taskId,
                      newApiStatus,
                      new Date().toISOString()
                    );
                    // Show success message for completed tasks
                    toast({
                      title: "🎉 Task Completed!",
                      description: "Great job on completing this task!",
                      variant: "success",
                    });
                  } else {
                    handleStatusChange(taskId, newApiStatus);
                    // Show regular success message for other status changes
                    toast({
                      title: "Status Updated",
                      description: `Task status changed to ${newDisplayStatus}`,
                      variant: "default",
                    });
                  }
                  // Force refetch to update summary stats
                  refetch();
                }}
              >
                Yes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleStatusChange(taskId, sourceStatus);
                }}
              >
                No
              </Button>
            </div>
          ),
        });
      }
    }
  };

  const handleStatusChangeConfirm = () => {
    if (!statusChangeInfo) return;

    const { taskId, newStatus, newDisplayStatus } = statusChangeInfo;

    if (newStatus === "on-hold") {
      // Pass the onHoldRemark for On Hold status
      updateTaskStatus({
        taskId,
        status: newStatus,
        onHoldRemark,
      });
    } else {
      // Normal status update
      handleStatusChange(taskId, newStatus);
    }

    // Show success message
    toast({
      title: "Status Updated",
      description: `Task status changed to ${newDisplayStatus}`,
      variant: "default",
    });

    // Force refetch to update summary stats
    refetch();

    // Reset state
    setStatusChangeDialogOpen(false);
    setStatusChangeInfo(null);
    setOnHoldRemark("");
  };

  const handleStatusChangeCancel = () => {
    if (!statusChangeInfo) return;

    // Revert to original status
    handleStatusChange(statusChangeInfo.taskId, statusChangeInfo.sourceStatus);

    // Reset state
    setStatusChangeDialogOpen(false);
    setStatusChangeInfo(null);
    setOnHoldRemark("");
  };

  const handleHighPriorityClick = (taskId) => {
    handleSetHighPriority(taskId);
    toast({
      title: "Task Priority Updated",
      description: "The task has been set to high priority.",
      variant: "default",
    });
  };

  const getTasksForColumn = (columnDisplayStatus) => {
    return filteredTasks.filter(
      (task) => mapStatusForDisplay(task.taskStatus) === columnDisplayStatus
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-6 md:p-8 bg-gray-100">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Tasks"
              value={stats.total || 0}
              icon={<CheckCircle2 size={24} className="text-gray-400" />}
            />
            <StatCard
              title="Completed"
              value={stats.completed || 0}
              icon={<CheckCircle2 size={24} className="text-green-500" />}
            />
            <StatCard
              title="Overdue"
              value={stats.overdue || 0}
              icon={<ArrowUpCircle size={24} className="text-red-500" />}
            />
            <StatCard
              title="Archived"
              value={stats.archived || 0}
              icon={<CheckCircle size={24} className="text-amber-500" />}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-1 w-full md:w-auto md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white shadow-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-auto md:w-[180px] bg-white shadow-sm rounded-md border-gray-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {taskStatusColumns.map((statusColumnDisplay) => (
              <Droppable
                droppableId={mapStatusForAPI(statusColumnDisplay)}
                key={statusColumnDisplay}
                isDropDisabled={showArchived}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`bg-gray-200/70 rounded-lg p-4 min-h-[300px] transition-colors duration-200 ease-in-out
                                ${snapshot.isDraggingOver ? "bg-blue-100" : ""}
                                ${
                                  statusColumnDisplay === "Completed"
                                    ? "bg-green-100/50"
                                    : ""
                                }`}
                  >
                    <div className="flex items-center mb-5">
                      <h2
                        className={`text-base font-semibold ${
                          statusColumnDisplay === "Completed"
                            ? "text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        {statusColumnDisplay}
                      </h2>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          statusColumnDisplay === "Completed"
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {getTasksForColumn(statusColumnDisplay).length}
                      </span>
                    </div>

                    {getTasksForColumn(statusColumnDisplay).length === 0 &&
                      !snapshot.isDraggingOver && (
                        <div className="text-center text-sm text-gray-400 mt-10">
                          No tasks here.
                        </div>
                      )}

                    {getTasksForColumn(statusColumnDisplay).map(
                      (task, index) => (
                        <Draggable
                          key={String(task._id || task.id)}
                          draggableId={String(task._id || task.id)}
                          index={index}
                          isDragDisabled={showArchived || task.isArchived}
                        >
                          {(providedDraggable, snapshotDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className={`select-none ${
                                snapshotDraggable.isDragging ? "opacity-75" : ""
                              }`}
                            >
                              <TaskCard
                                task={{
                                  ...task,
                                  status: mapStatusForDisplay(task.taskStatus),
                                }}
                                onEdit={() => {
                                  setEditingTask(task);
                                  setIsModalOpen(true);
                                }}
                                onDelete={() =>
                                  handleDeleteTask(task._id || task.id)
                                }
                                onSetHighPriority={() =>
                                  handleHighPriorityClick(task._id || task.id)
                                }
                                onArchive={openArchiveDialog}
                              />
                            </div>
                          )}
                        </Draggable>
                      )
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>

          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleTaskSubmit}
            editTask={editingTask}
            mapStatusForAPI={mapStatusForAPI}
            mapStatusForDisplay={mapStatusForDisplay}
          />

          {/* On Hold Status Change Dialog */}
          <AlertDialog
            open={statusChangeDialogOpen}
            onOpenChange={setStatusChangeDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Change Task Status to On Hold?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {statusChangeInfo?.taskName && (
                    <>
                      Are you sure you want to change "
                      {statusChangeInfo.taskName}" from{" "}
                      {mapStatusForDisplay(statusChangeInfo.sourceStatus)} to On
                      Hold?
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <label
                  htmlFor="onHoldRemark"
                  className="block text-sm font-medium mb-2"
                >
                  Reason for On Hold (max 30 characters):
                </label>
                <Input
                  id="onHoldRemark"
                  value={onHoldRemark}
                  onChange={(e) => setOnHoldRemark(e.target.value)}
                  maxLength={30}
                  className="w-full"
                  placeholder="Enter reason..."
                />
                {onHoldRemark.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {onHoldRemark.length}/30 characters
                  </p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleStatusChangeCancel}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleStatusChangeConfirm}
                  disabled={onHoldRemark.trim() === ""}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DragDropContext>
  );
};

export default Tasks;
