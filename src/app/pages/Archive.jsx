import { useState, useMemo, useEffect, useCallback } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
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
    refetch,
  } = useTasks(toast);
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = useState("completionDateDesc");
  const [viewMode, setViewMode] = useState("list");

  // Set showArchived to true when component mounts
  useEffect(() => {
    console.log("Archive: Setting showArchived to true");
    setShowArchived(true);

    // Force refetch tasks with archived=true
    const fetchArchivedTasks = async () => {
      try {
        console.log("Archive: Explicitly fetching archived tasks");
        // First invalidate any existing cached data
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks });

        // Then perform a refetch
        await refetch();

        // Add a small delay and refetch again to ensure we get the latest data
        // This helps when a task was just archived and redirected here
        setTimeout(async () => {
          console.log("Archive: Refetching archived tasks after delay");
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
          await refetch();
        }, 1000);
      } catch (error) {
        console.error("Error fetching archived tasks:", error);
      }
    };

    fetchArchivedTasks();

    // Set up an interval to refetch data every few seconds while the page is open
    const refreshInterval = setInterval(() => {
      console.log("Archive: Periodic refresh of archived tasks");
      refetch().catch((err) =>
        console.error("Error in refresh interval:", err)
      );
    }, 10000); // Refresh every 10 seconds

    return () => {
      console.log("Archive: Setting showArchived to false (cleanup)");
      setShowArchived(false); // Reset when unmounting
      clearInterval(refreshInterval); // Clear the refresh interval
    };
  }, [setShowArchived, refetch, queryClient]);

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
  const archivedItems = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.log("Archive: tasks is not an array:", tasks);
      return [];
    }

    console.log("Archive: Processing tasks data:", tasks);

    // Ensure we're only showing archived tasks
    const filtered = tasks.filter((task) => {
      // Check if task is archived using both possible field names
      const isArchived = task.isArchived === true || task.archived === true;

      // Log each task for debugging
      console.log(
        `Task ${task._id || task.id}: isArchived=${isArchived}, name=${
          task.taskName || task.name
        }, fields:`,
        {
          id: task._id || task.id,
          name: task.taskName || task.name,
          isArchived: task.isArchived,
          archived: task.archived,
        }
      );

      return isArchived;
    });

    console.log(
      `Archive: Found ${filtered.length} archived tasks out of ${tasks.length} total tasks`
    );

    // If we don't have any archived tasks but we should be showing archived tasks,
    // this might indicate a caching issue - force a refetch
    if (filtered.length === 0 && tasks.length > 0) {
      console.log(
        "Archive: No archived tasks found but tasks exist - might need to refetch"
      );
      // Use setTimeout to avoid React state updates during render
      setTimeout(() => {
        refetch().catch((err) => console.error("Error refetching:", err));
      }, 500);
    }

    return filtered.map((task) => {
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
  }, [tasks, calculateRemainingDays, refetch]);

  // Optimize sorting with stable sort and better dependencies
  const sortedItems = useMemo(() => {
    if (!archivedItems.length) return [];

    const items = [...archivedItems];
    switch (sortBy) {
      case "completionDateAsc":
        return items.sort(
          (a, b) => new Date(a.completionDate) - new Date(b.completionDate)
        );
      case "completionDateDesc":
        return items.sort(
          (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
        );
      case "nameAsc":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case "nameDesc":
        return items.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return items;
    }
  }, [archivedItems, sortBy]);

  const getSortLabel = () => {
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
  };

  // Restore task handler with improved refetching
  const handleRestoreClick = (taskId) => {
    toast({
      title: "Restore Task?",
      description: "Are you sure you want to restore this task?",
      action: (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // Call the restore task function
              handleRestoreTask(taskId)
                .then(() => {
                  // Show success message
                  toast({
                    title: "Task Restored",
                    description: "Task has been restored successfully.",
                    variant: "default",
                  });

                  // Force refetch after a short delay to update the UI
                  setTimeout(() => {
                    refetch().catch((err) =>
                      console.error("Error refetching after restore:", err)
                    );
                  }, 500);
                })
                .catch((error) => {
                  console.error("Error restoring task:", error);
                  toast({
                    title: "Error",
                    description: "Failed to restore task. Please try again.",
                    variant: "destructive",
                  });
                });
            }}
          >
            Restore
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

  // Delete task handler with improved refetching
  const handleDeleteClick = (taskId) => {
    toast({
      title: "Delete Task Permanently?",
      description: "This action cannot be undone.",
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Call the delete task function
              handleDeleteTask(taskId)
                .then(() => {
                  // Show success message
                  toast({
                    title: "Task Deleted",
                    description: "Task has been permanently deleted.",
                    variant: "destructive",
                  });

                  // Force refetch after a short delay to update the UI
                  setTimeout(() => {
                    refetch().catch((err) =>
                      console.error("Error refetching after delete:", err)
                    );
                  }, 500);
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-semibold">Archive</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{getSortLabel()}</Button>
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
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
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
                            onSelect={() => handleRestoreClick(item.id)}
                          >
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDeleteClick(item.id)}
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
                      <DropdownMenuItem
                        onSelect={() => handleRestoreClick(item.id)}
                      >
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleDeleteClick(item.id)}
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
    </div>
  );
};

export default Archive;
