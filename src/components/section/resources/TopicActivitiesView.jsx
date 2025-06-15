import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  FileText,
  Calendar,
  Award,
  Lock,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROLES } from "@/lib/constants";
import { format } from "date-fns";
import { deleteActivity } from "@/services/topicService";
import { useToast } from "@/hooks/use-toast";
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

const TopicActivitiesView = ({
  topic,
  userRole,
  onActivityDeleted = () => {},
  canEditInCurrentContext = false,
  isStudent = false,
  isPIO = false,
  assignedClassInfo = null,
}) => {
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteActivity(topic.id, activityToDelete._id);

      if (result.success) {
        // Show success message with information about announcement deletion
        const message = result.deletedAnnouncement
          ? "Activity and its related announcement deleted successfully"
          : "Activity deleted successfully";

        toast({
          title: "Success",
          description: message,
        });

        // Notify parent component to refresh both activities and announcements
        onActivityDeleted(activityToDelete, result.deletedAnnouncement);
      } else {
        throw new Error(result.error || "Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete activity",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setActivityToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "assignment":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "quiz":
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Check if there are any activities
  if (!topic.activities || topic.activities.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic mt-2">No activities yet</p>
    );
  }

  return (
    <div className="mt-3">
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Activity Deletion</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete &ldquo;{activityToDelete?.title}
                &rdquo;?
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <strong>Note:</strong> This will also delete any related
                announcement that was automatically generated for this activity.
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs font-medium text-gray-500 mb-2">Activities:</p>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {topic.activities.map((activity) => (
          <div
            key={activity._id}
            className="p-2 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-blue-50 rounded">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <p className="text-sm font-medium">{activity.title}</p>
                <div className="flex items-center space-x-2">
                  {activity.dueDate && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(activity.dueDate), "MMM d, yyyy")}
                    </p>
                  )}
                  {activity.points > 0 && (
                    <p className="text-xs text-gray-500">
                      Points: {activity.points}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <TooltipProvider>
                {canEditInCurrentContext && !isStudent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => {
                      setActivityToDelete(activity);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">Delete</span>
                  </Button>
                )}
                {!canEditInCurrentContext && !isStudent && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-gray-400 opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">Delete</span>
                        <Lock className="w-2 h-2 ml-1" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        You can only delete activities in your assigned class
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TopicActivitiesView.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        type: PropTypes.string,
        dueDate: PropTypes.string,
        points: PropTypes.number,
      })
    ),
  }).isRequired,
  userRole: PropTypes.string,
  onActivityDeleted: PropTypes.func, // (deletedActivity, announcementDeleted) => void
  canEditInCurrentContext: PropTypes.bool,
  isStudent: PropTypes.bool,
  isPIO: PropTypes.bool,
  assignedClassInfo: PropTypes.object,
};

export default TopicActivitiesView;
