import { useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  FileText,
  Calendar,
  Award,
  Lock,
  Info,
  Check,
  CheckCircle,
  Eye,
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
import {
  useMarkActivityComplete,
  useTopicActivityCompletions,
} from "@/hooks/useActivityCompletion";
import { ActivityDetailModal } from "@/components/modal/ActivityDetailModal";

const TopicActivitiesView = ({
  topic,
  userRole,
  onActivityDeleted = () => {},
  canEditInCurrentContext = false,
  isStudent = false,
  isPIO = false,
  assignedClassInfo = null,
  currentSubject = null, // Add currentSubject prop for access validation
}) => {
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false);
  const { toast } = useToast();

  // Activity completion hooks
  const markActivityCompleteMutation = useMarkActivityComplete();
  const {
    isActivityCompleted,
    completedActivityIds,
    isLoading: completionsLoading,
  } = useTopicActivityCompletions(topic, !!(isStudent || isPIO));

  // CRITICAL: Subject access validation for activity completion
  const canMarkActivitiesComplete = useMemo(() => {
    // Admin users cannot mark activities complete
    if (userRole === "admin") return false;

    // Must have a current subject to validate access
    if (!currentSubject) return false;

    // Student access validation
    if (isStudent) {
      // Get user data from AuthContext if available
      const { user } = useContext(AuthContext) || {};
      if (!user) return false;

      const userCourse = user.course;
      const userYearLevel = user.yearLevel;

      // Map user course to programId
      const courseToProgram = {
        "Associate in Computer Technology": "act",
        "Bachelor of Science in Information Systems": "bsis",
      };

      // Map user year level to subject year level format
      const yearLevelToNumber = {
        "First Year": "1",
        "Second Year": "2",
        "Third Year": "3",
        "Fourth Year": "4",
      };

      const userProgramId = courseToProgram[userCourse];
      const userYearLevelNumber = yearLevelToNumber[userYearLevel];

      // Student can only mark activities complete in subjects matching their course/year
      return (
        currentSubject.programId === userProgramId &&
        currentSubject.yearLevel === userYearLevelNumber
      );
    }

    // PIO access validation
    if (isPIO && assignedClassInfo) {
      // PIO can only mark activities complete in their assigned class
      return (
        currentSubject.programId === assignedClassInfo.programId &&
        currentSubject.yearLevel ===
          assignedClassInfo.yearLevelNumber.toString()
      );
    }

    // Default to false for safety
    return false;
  }, [userRole, isStudent, isPIO, assignedClassInfo, currentSubject]);

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

  const handleMarkActivityComplete = async (activity) => {
    // Validate that we have the required data
    if (!topic?.id || !activity?._id) {
      toast({
        title: "Error",
        description:
          "Invalid activity or topic data. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await markActivityCompleteMutation.mutateAsync({
        topicId: topic.id,
        activityId: activity._id,
        notes: null, // Could be extended to include notes in the future
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Error marking activity as complete:", error);
    }
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setIsActivityDetailOpen(true);
  };

  const handleCloseActivityDetail = () => {
    setIsActivityDetailOpen(false);
    setSelectedActivity(null);
  };

  // Function to get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "assignment":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "quiz":
        return <Award className="w-4 h-4 text-amber-600" />;
      case "material":
        // Backward compatibility for existing material activities
        return <FileText className="w-4 h-4 text-green-600" />;
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
        {topic.activities.map((activity) => {
          const isCompleted = isActivityCompleted(activity._id);
          const isCompletionLoading = markActivityCompleteMutation.isPending;
          const hasValidData = topic?.id && activity?._id;

          return (
            <div
              key={activity._id}
              className={`p-2 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between ${
                isCompleted ? "bg-green-50 border-green-200" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`p-1 rounded ${
                    isCompleted ? "bg-green-100" : "bg-blue-50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    getActivityIcon(activity.type)
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-sm font-medium cursor-pointer hover:text-blue-600 ${
                        isCompleted ? "text-green-800 line-through" : ""
                      }`}
                      onClick={() => handleActivityClick(activity)}
                    >
                      {activity.title}
                    </p>
                    {isCompleted && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.dueDate && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(activity.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <TooltipProvider>
                  {/* View Details button - available to all users */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">View</span>
                  </Button>

                  {/* Mark as Done button - only for Students and PIO users with proper access */}
                  {canMarkActivitiesComplete &&
                    !isCompleted &&
                    hasValidData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => handleMarkActivityComplete(activity)}
                        disabled={isCompletionLoading || completionsLoading}
                      >
                        {isCompletionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Check className="w-3.5 h-3.5 mr-1" />
                        )}
                        <span className="text-xs">
                          {isCompletionLoading ? "Marking..." : "Mark as Done"}
                        </span>
                      </Button>
                    )}

                  {/* Delete button - only for Admin/PIO with edit permissions */}
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
          );
        })}
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={isActivityDetailOpen}
        onClose={handleCloseActivityDetail}
        activity={selectedActivity}
        topic={topic}
        subject={currentSubject}
      />
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
        description: PropTypes.string,
        fileUrls: PropTypes.arrayOf(PropTypes.string),
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
      })
    ),
  }).isRequired,
  userRole: PropTypes.string,
  onActivityDeleted: PropTypes.func, // (deletedActivity, announcementDeleted) => void
  canEditInCurrentContext: PropTypes.bool,
  isStudent: PropTypes.bool,
  isPIO: PropTypes.bool,
  assignedClassInfo: PropTypes.object,
  currentSubject: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    programId: PropTypes.string,
    yearLevel: PropTypes.string,
  }),
};

export default TopicActivitiesView;
