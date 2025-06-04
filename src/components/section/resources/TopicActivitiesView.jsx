import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, FileText, Calendar, Award } from "lucide-react";
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
        toast({
          title: "Success",
          description: "Activity deleted successfully",
        });
        onActivityDeleted(activityToDelete);
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
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{activityToDelete?.title}
              &rdquo;? This action cannot be undone.
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
              {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
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
  onActivityDeleted: PropTypes.func,
};

export default TopicActivitiesView;
