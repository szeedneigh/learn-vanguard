import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, List, LayoutGrid, AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Move utility functions outside component to prevent recreation
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const calculateRemainingDays = (archivedAt) => {
  if (!archivedAt) return 30;

  const archiveDate = new Date(archivedAt);
  const deleteDate = new Date(archiveDate);
  deleteDate.setDate(deleteDate.getDate() + 30);

  const now = new Date();
  const diffTime = deleteDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

// Custom hook for throttle with instance-specific timeout
const useThrottle = () => {
  const timeoutRef = useRef(null);
  
  const throttle = useCallback((func, wait) => {
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        func(...args);
      };
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(later, wait);
    };
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttle;
};

const Archive = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const {
    tasks,
    handleRestoreTask,
    handleDeleteTask,
    setShowArchived,
    isLoading,
  } = useTasks(toast);
  const { tasks, handleRestoreTask, handleDeleteTask } = useTasks(toast);
  const throttle = useThrottle(); // Use the custom hook for instance-specific throttling

  const [sortBy, setSortBy] = useState("completionDateDesc");
  const [viewMode, setViewMode] = useState("list");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Set showArchived to true when component mounts
  useEffect(() => {
    console.log("Archive: Setting showArchived to true");
    setShowArchived(true);
    return () => {
      console.log("Archive: Setting showArchived to false (cleanup)");
      setShowArchived(false); // Reset when unmounting
    };
  }, [setShowArchived]);

  // Log when tasks change
  useEffect(() => {
    console.log(
      "Archive: Tasks updated, count:",
      Array.isArray(tasks) ? tasks.length : "not an array",
      tasks
    );
  }, [tasks]);

  // Memoize the expensive calculation function
  const calculateRemainingDays = useCallback((archivedAt) => {
    if (!archivedAt) return 30; // Default if no archive date

    const archiveDate = new Date(archivedAt);
    const deleteDate = new Date(archiveDate);
    deleteDate.setDate(deleteDate.getDate() + 30);

    const now = new Date();
    const diffTime = deleteDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays); // Don't show negative days
  }, []);

  // Show welcome toast if coming from task archival
  useEffect(() => {
    const justArchived = searchParams.get("archived");
    if (justArchived === "true") {
      toast({
        title: "Task Archived",
        description: "The task has been moved to archives successfully.",
        variant: "success",
      });
    }
  }, [searchParams, toast]);

  // Add performance monitoring in development
  useEffect(() => {
    if (typeof window !== "undefined" && window.console) {
      console.time("Archive render");
      return () => console.timeEnd("Archive render");
    }
  });

  // Optimize archived items calculation with better memoization
  // Memoize archived items calculation with better optimization
  const archivedItems = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    console.log("Archive: Processing tasks data:", tasks);

    return tasks
      .filter((task) => {
        // Check if task is archived using both possible field names
        const isArchived = task.isArchived === true || task.archived === true;
        console.log(
          `Task ${task._id || task.id}: isArchived=${isArchived}, fields:`,
          {
            isArchived: task.isArchived,
            archived: task.archived,
          }
        );
        return isArchived;
      })
      .map((task) => {
        const archivedAt = task.archivedAt || task.updatedAt;
        return {
          id: task._id || task.id,
          name: task.taskName || task.name,
          completionDate:
            task.dateCompleted || task.completedAt || task.updatedAt,
          archivedAt,
          remainingDays: calculateRemainingDays(archivedAt),
        };
      });
  }, [tasks]); // Remove calculateRemainingDays from dependencies since it's now static

  // Optimize sorting with stable sort
  const sortedItems = useMemo(() => {
    if (!archivedItems.length) return [];

    
    // Use a stable sort to prevent unnecessary re-renders
    const items = [...archivedItems];
    
    switch (sortBy) {
      case "completionDateAsc":
        return items.sort(
          (a, b) => new Date(a.completionDate) - new Date(b.completionDate)
        );
        return items.sort((a, b) => {
          const dateA = new Date(a.completionDate);
          const dateB = new Date(b.completionDate);
          return dateA - dateB;
        });
      case "completionDateDesc":
        return items.sort(
          (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
        );
        return items.sort((a, b) => {
          const dateA = new Date(a.completionDate);
          const dateB = new Date(b.completionDate);
          return dateB - dateA;
        });
      case "nameAsc":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case "nameDesc":
        return items.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return items;
    }
  }, [archivedItems, sortBy]);

  // Memoize sort label to prevent recalculation
  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case "completionDateAsc":
        return "Oldest First";
      case "completionDateDesc":
        return "Newest First";
      case "nameAsc":
        return "Name (A-Z)";
      case "nameDesc":
        return "Name (Z-A)";
      default:
        return "Sort by date";
    }
  }, [sortBy]);

  // Memoize event handlers to prevent child re-renders
  const handleRestore = useMemo(
    () => throttle((id) => {
      handleRestoreTask(id);
      toast({
        title: "Task Restored",
        description: "The task has been restored from archives.",
        variant: "success",
      });
    }, 1000),
    [throttle, handleRestoreTask, toast]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast({
        title: "Task Deleted",
        description: "The task has been permanently deleted.",
        variant: "default",
      });
    }
  }, [taskToDelete, handleDeleteTask, toast]);

  const openDeleteDialog = useCallback((id) => {
    if (id) {
      setTaskToDelete(id);
      setDeleteDialogOpen(true);
    }
  }, []);

  const handleCloseDeleteDialog = useCallback((open) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setTaskToDelete(null);
    }
  }, []);

  // Memoize view mode handlers
  const handleSetListView = useCallback(() => setViewMode("list"), []);
  const handleSetGridView = useCallback(() => setViewMode("grid"), []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-semibold">Archive</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{sortLabel}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setSortBy("completionDateDesc")}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy("completionDateAsc")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy("nameAsc")}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy("nameDesc")}>
                Name (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={handleSetListView}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={handleSetGridView}
              className="rounded-l-none border-l"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Alert className="bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
        <AlertCircle className="h-4 w-4 !text-blue-800 dark:!text-blue-300" />
        <AlertDescription>
          Items in the archive will be deleted forever after 30 days.
        </AlertDescription>
      </Alert>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Loading archived items...</span>
        </div>
      )}

      {!isLoading && viewMode === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead className="text-right">
                  Remaining Days until Deletion
                </TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length > 0 ? (
                sortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{formatDate(item.completionDate)}</TableCell>
                    <TableCell className="text-right">
                      {item.remainingDays} days
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => handleRestore(item.id)}
                          >
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => openDeleteDialog(item.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-100/50"
                          >
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No archived items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Grid View Implementation */}
      {!isLoading && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {item.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleRestore(item.id)}>
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => openDeleteDialog(item.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-100/50"
                      >
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>
                    Completed: {formatDate(item.completionDate)}
                  </CardDescription>
                  <CardDescription className="mt-2">
                    Deletion in: {item.remainingDays} days
                  </CardDescription>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No archived items found.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Archive;
