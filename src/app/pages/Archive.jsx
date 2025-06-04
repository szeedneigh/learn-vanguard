import { useState, useMemo, useEffect } from "react";
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

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate days remaining until deletion (30 days from archive date)
const calculateRemainingDays = (archivedAt) => {
  if (!archivedAt) return 30; // Default if no archive date

  const archiveDate = new Date(archivedAt);
  const deleteDate = new Date(archiveDate);
  deleteDate.setDate(deleteDate.getDate() + 30);

  const now = new Date();
  const diffTime = deleteDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays); // Don't show negative days
};

const Archive = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { tasks, handleRestoreTask, handleDeleteTask } = useTasks(toast);

  const [sortBy, setSortBy] = useState("completionDateDesc");
  const [viewMode, setViewMode] = useState("list");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  // Filter only archived tasks
  const archivedItems = useMemo(() => {
    return tasks
      .filter((task) => task.isArchived || task.archived)
      .map((task) => ({
        id: task._id || task.id,
        name: task.taskName || task.name,
        completionDate:
          task.dateCompleted || task.completedAt || task.updatedAt,
        archivedAt: task.archivedAt || task.updatedAt,
        remainingDays: calculateRemainingDays(
          task.archivedAt || task.updatedAt
        ),
      }));
  }, [tasks]);

  const sortedItems = useMemo(() => {
    let items = [...archivedItems];
    switch (sortBy) {
      case "completionDateAsc":
        items.sort(
          (a, b) => new Date(a.completionDate) - new Date(b.completionDate)
        );
        break;
      case "completionDateDesc":
        items.sort(
          (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
        );
        break;
      case "nameAsc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return items;
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

  const handleRestore = (id) => {
    handleRestoreTask(id);
    toast({
      title: "Task Restored",
      description: "The task has been restored from archives.",
      variant: "success",
    });
  };

  const handleDeleteConfirm = () => {
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
  };

  const openDeleteDialog = (id) => {
    if (id) {
      setTaskToDelete(id);
      setDeleteDialogOpen(true);
    }
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

      {viewMode === "list" && (
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
      {viewMode === "grid" && (
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
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setTaskToDelete(null);
          }
        }}
      >
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
