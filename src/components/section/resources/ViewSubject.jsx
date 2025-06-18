import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROLES, PERMISSIONS } from "@/lib/constants";
import { usePermission } from "@/context/PermissionContext";
import {
  Search,
  List,
  Filter,
  Loader2,
  Download,
  Trash2,
  MessageSquare,
  PlusCircle,
  Edit3,
  Edit,
  Book,
  BookOpen,
  RefreshCw,
  Lock,
  Info,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { AddTopicModal } from "@/components/modal/AddTopicModal";
import { EditTopicModal } from "@/components/modal/EditTopicModal";
import { AddActivityModal } from "@/components/modal/AddActivityModal";
import TopicResourceView from "./TopicResourceView";
import TopicActivitiesView from "./TopicActivitiesView";
import Pagination from "@/components/ui/pagination";
import { deleteTopic } from "@/services/topicService";
import { useToast } from "@/hooks/use-toast";

const ViewSubject = ({
  currentSubject,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  resources,
  resourcesLoading,
  resourcesError,
  handleDeleteResource,
  announcements,
  announcementsLoading,
  announcementsError,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onAnnouncementClick,
  userRole,
  topics = [],
  topicsLoading = false,
  topicsError = null,
  onTopicAdded = () => {},
  onActivityAdded = () => {},
  setIsModalOpen,
  refetchAll = () => {},
  canEditInCurrentContext = false,
  isPIO = false,
  assignedClassInfo = null,
  isStudent = false,
  isAdmin = false,
}) => {
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicToEdit, setTopicToEdit] = useState(null);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [isDeleteTopicDialogOpen, setIsDeleteTopicDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state for topics
  const [currentTopicPage, setCurrentTopicPage] = useState(1);
  const topicsPerPage = 2;

  const { hasPermission } = usePermission();
  const canCreateAnnouncement = hasPermission(PERMISSIONS.ANNOUNCE_SUBJECT);
  const { toast } = useToast();

  // Enhanced filtering for resources
  const filteredResources = useMemo(() => {
    if (!resources) return [];
    if (!searchTerm.trim()) return resources;

    const searchLower = searchTerm.toLowerCase().trim();
    return resources.filter((resource) => {
      const nameMatch = resource.name?.toLowerCase().includes(searchLower);
      const typeMatch = resource.type?.toLowerCase().includes(searchLower);
      const descriptionMatch = resource.description
        ?.toLowerCase()
        .includes(searchLower);

      return nameMatch || typeMatch || descriptionMatch;
    });
  }, [resources, searchTerm]);

  // Filter announcements
  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];
    if (!searchTerm.trim()) return announcements;

    const searchLower = searchTerm.toLowerCase().trim();
    return announcements.filter((announcement) => {
      const titleMatch = announcement.title
        ?.toLowerCase()
        .includes(searchLower);
      const descriptionMatch = announcement.description
        ?.toLowerCase()
        .includes(searchLower);
      const typeMatch = announcement.type?.toLowerCase().includes(searchLower);

      return titleMatch || descriptionMatch || typeMatch;
    });
  }, [announcements, searchTerm]);

  // Filter topics and their activities
  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!searchTerm.trim()) return topics;

    const searchLower = searchTerm.toLowerCase().trim();
    return topics
      .map((topic) => {
        const topicNameMatch = topic.name?.toLowerCase().includes(searchLower);
        const topicDescMatch = topic.description
          ?.toLowerCase()
          .includes(searchLower);

        // Filter activities within the topic
        const filteredActivities =
          topic.activities?.filter((activity) => {
            const activityTitleMatch = activity.title
              ?.toLowerCase()
              .includes(searchLower);
            const activityTypeMatch = activity.type
              ?.toLowerCase()
              .includes(searchLower);
            const activityDescMatch = activity.description
              ?.toLowerCase()
              .includes(searchLower);

            return activityTitleMatch || activityTypeMatch || activityDescMatch;
          }) || [];

        // Include topic if it matches or has matching activities
        if (topicNameMatch || topicDescMatch || filteredActivities.length > 0) {
          return {
            ...topic,
            activities: searchTerm.trim()
              ? filteredActivities
              : topic.activities,
            _isFiltered:
              !topicNameMatch &&
              !topicDescMatch &&
              filteredActivities.length > 0,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [topics, searchTerm]);

  // Pagination logic for topics
  const paginatedTopics = useMemo(() => {
    const startIndex = (currentTopicPage - 1) * topicsPerPage;
    const endIndex = startIndex + topicsPerPage;
    return filteredTopics.slice(startIndex, endIndex);
  }, [filteredTopics, currentTopicPage, topicsPerPage]);

  const totalTopicPages = Math.ceil(filteredTopics.length / topicsPerPage);

  // Reset to first page when search term changes
  const handleTopicPageChange = (page) => {
    setCurrentTopicPage(page);
  };

  // Reset pagination when search changes
  useMemo(() => {
    setCurrentTopicPage(1);
  }, [searchTerm]);

  // Helper function to highlight search matches
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim() || !text) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleConfirmDelete = () => {
    if (resourceToDelete) {
      setIsDeleting(true);
      handleDeleteResource(resourceToDelete.id)
        .then(() => {
          setResourceToDelete(null);
          setIsDeleteDialogOpen(false);
          setIsDeleting(false);
        })
        .catch((error) => {
          console.error("Error deleting resource:", error);
          setIsDeleting(false);
        });
    }
  };

  const handleAddTopic = () => {
    setIsAddTopicModalOpen(true);
  };

  const handleTopicSuccess = (topic) => {
    onTopicAdded(topic);
  };

  const handleAddActivity = (topicId) => {
    setSelectedTopic(topicId);
    setIsAddActivityModalOpen(true);
  };

  const handleActivitySuccess = (activity) => {
    onActivityAdded(activity);
  };

  const handleUploadForTopic = (topic) => {
    if (topic && topic.id) {
      console.log(
        `ViewSubject: Setting modal open for topic upload: ${topic.name}`
      );
      setIsModalOpen && setIsModalOpen(topic);

      // Only increment refetchTrigger once after upload is complete
      // This will be handled by the onSuccess callback in the Resources component
      // No need to set a timeout here
    } else {
      console.error("Invalid topic object:", topic);
    }
  };

  const handleRefreshResources = () => {
    setIsRefreshing(true);
    // Trigger refetch for all data
    refetchAll();
    // Trigger a single refetch
    setTimeout(() => {
      setRefetchTrigger((prev) => prev + 1);
      setIsRefreshing(false);
    }, 300);
  };

  // Topic management functions
  const handleEditTopic = (topic) => {
    console.log("Editing topic:", topic);
    setTopicToEdit(topic);
    setIsEditTopicModalOpen(true);
  };

  const handleEditTopicSuccess = (updatedTopic) => {
    toast({
      title: "Success!",
      description: "Topic has been successfully updated.",
      variant: "default",
    });
    refetchAll();
    setIsEditTopicModalOpen(false);
    setTopicToEdit(null);
  };

  const handleDeleteTopicClick = (topic) => {
    setTopicToDelete(topic);
    setIsDeleteTopicDialogOpen(true);
  };

  const handleConfirmDeleteTopic = async () => {
    if (!topicToDelete) return;

    setIsDeletingTopic(true);
    try {
      const result = await deleteTopic(topicToDelete.id);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Topic has been successfully deleted.",
          variant: "default",
        });
        refetchAll();
        setTopicToDelete(null);
        setIsDeleteTopicDialogOpen(false);
      } else {
        throw new Error(result.error || "Failed to delete topic");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTopic(false);
    }
  };

  return (
    <div className="space-y-6">
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{resourceToDelete?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

      {/* Topic Deletion Confirmation Dialog */}
      <AlertDialog
        open={isDeleteTopicDialogOpen}
        onOpenChange={setIsDeleteTopicDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Topic Deletion</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete the topic &ldquo;
                {topicToDelete?.name}
                &rdquo;?
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <strong>Warning:</strong> This will permanently delete the topic
                and all its associated resources and activities. This action
                cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTopic}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteTopic}
              disabled={isDeletingTopic}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingTopic ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Topic"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>{currentSubject?.name || "Subject Details"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources, announcements, topics, and activities..."
                className="w-full pl-10 pr-10 py-2 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleRefreshResources}
                disabled={isRefreshing}
                className="px-4"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
                }
                className="px-4"
                style={{ display: "none" }}
              >
                {viewMode === "grid" ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Results Summary */}
          {searchTerm.trim() && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <Search className="w-4 h-4" />
                <span>
                  Searching for "{searchTerm}" • Found{" "}
                  <strong>
                    {filteredResources.length} resources,{" "}
                    {filteredAnnouncements.length} announcements,{" "}
                    {filteredTopics.length} topics
                  </strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="ml-auto text-blue-600 hover:text-blue-800 h-6 px-2"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topics Section */}
      <TooltipProvider>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-3">
              <BookOpen
                className={`w-6 h-6 ${
                  canEditInCurrentContext ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <CardTitle className="text-xl font-semibold">Topics</CardTitle>
              {!canEditInCurrentContext && (
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="w-4 h-4 text-gray-400 ml-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {isStudent
                        ? "Students have read-only access to topics"
                        : isPIO
                        ? "You can only edit topics in your assigned class"
                        : "Read-only access"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {canEditInCurrentContext && !isStudent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTopic}
                className="whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Topic
              </Button>
            )}
            {!canEditInCurrentContext && !isStudent && (
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="whitespace-nowrap opacity-50"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Topic
                    <Lock className="w-3 h-3 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    You can only add topics in your assigned class:{" "}
                    {assignedClassInfo?.course} - {assignedClassInfo?.yearLevel}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </CardHeader>
          <CardContent>
            {topicsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <p className="ml-3 text-muted-foreground">Loading Topics...</p>
              </div>
            )}
            {topicsError && (
              <Alert variant="destructive" className="my-4">
                <AlertTitle>Error Loading Topics</AlertTitle>
                <AlertDescription>
                  {topicsError?.message ||
                    "An unexpected error occurred while fetching topics."}
                </AlertDescription>
              </Alert>
            )}
            {!topicsLoading &&
              !topicsError &&
              filteredTopics &&
              filteredTopics.length > 0 && (
                <>
                  <div className="space-y-4">
                    {paginatedTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="p-4 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-md font-medium">
                              {topic.name}
                            </h3>
                            {!canEditInCurrentContext && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Lock className="w-3 h-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">
                                    {isStudent
                                      ? "Read-only access to topic content"
                                      : "You can only edit topics in your assigned class"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          {canEditInCurrentContext && !isStudent && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTopic(topic)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTopicClick(topic)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddActivity(topic.id)}
                                className="text-sm"
                              >
                                <PlusCircle className="w-3 h-3 mr-1" />
                                Add Activity
                              </Button>
                            </div>
                          )}
                          {!canEditInCurrentContext && !isStudent && (
                            <div className="flex space-x-2">
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="text-sm opacity-50"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                    <Lock className="w-3 h-3 ml-1" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">
                                    You can only edit topics in your assigned
                                    class
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="text-sm opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                    <Lock className="w-3 h-3 ml-1" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">
                                    You can only delete topics in your assigned
                                    class
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="text-sm opacity-50"
                                  >
                                    <PlusCircle className="w-3 h-3 mr-1" />
                                    Add Activity
                                    <Lock className="w-3 h-3 ml-1" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">
                                    Restricted to your assigned class
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                        {topic.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {topic.description}
                          </p>
                        )}

                        {/* Topic Resources */}
                        <TopicResourceView
                          topic={topic}
                          subjectId={currentSubject?.id}
                          userRole={userRole}
                          onUploadClick={handleUploadForTopic}
                          refetchTrigger={refetchTrigger}
                          canEditInCurrentContext={canEditInCurrentContext}
                          isStudent={isStudent}
                          isPIO={isPIO}
                          assignedClassInfo={assignedClassInfo}
                        />

                        {/* Topic Activities */}
                        <TopicActivitiesView
                          topic={topic}
                          userRole={userRole}
                          onActivityDeleted={(
                            deletedActivity,
                            announcementDeleted
                          ) => {
                            // Refetch both topics and announcements when an activity is deleted
                            // This ensures the UI is updated to reflect both the activity and announcement deletion
                            console.log(
                              "Activity deleted:",
                              deletedActivity?.title,
                              "Announcement also deleted:",
                              announcementDeleted
                            );
                            refetchAll();
                          }}
                          canEditInCurrentContext={canEditInCurrentContext}
                          isStudent={isStudent}
                          isPIO={isPIO}
                          assignedClassInfo={assignedClassInfo}
                          currentSubject={currentSubject}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Topic Pagination */}
                  {totalTopicPages > 1 && (
                    <Pagination
                      currentPage={currentTopicPage}
                      totalPages={totalTopicPages}
                      onPageChange={handleTopicPageChange}
                      className="mt-4"
                    />
                  )}
                </>
              )}
            {!topicsLoading &&
              !topicsError &&
              (!filteredTopics || filteredTopics.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm.trim()
                    ? `No topics or activities found matching "${searchTerm}".`
                    : "No topics for this subject yet."}
                </p>
              )}
          </CardContent>
        </Card>
      </TooltipProvider>

      {resourcesLoading && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading Resources...</p>
        </div>
      )}
      {resourcesError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error Loading Resources</AlertTitle>
          <AlertDescription>
            {resourcesError?.message ||
              "An unexpected error occurred while fetching resources."}
          </AlertDescription>
        </Alert>
      )}
      {!resourcesLoading &&
        !resourcesError &&
        filteredResources &&
        filteredResources.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Book className="w-5 h-5 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="mr-1">
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      {handleDeleteResource &&
                        canEditInCurrentContext &&
                        !isStudent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setResourceToDelete(resource);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        )}
                      {!canEditInCurrentContext && !isStudent && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="text-gray-400 opacity-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                                <Lock className="w-3 h-3 ml-1" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">
                                You can only delete resources in your assigned
                                class
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Type: {resource.type || "File"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {resource.size || "N/A"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      {!resourcesLoading &&
        !resourcesError &&
        (!filteredResources || filteredResources.length === 0) && (
          <p className="mt-4 text-center text-muted-foreground">
            {searchTerm
              ? `No resources found matching "${searchTerm}".`
              : "No resources found for this subject."}
          </p>
        )}

      {/* Announcements Section */}
      <TooltipProvider>
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-3">
              <MessageSquare
                className={`w-6 h-6 ${
                  canEditInCurrentContext ? "text-purple-600" : "text-gray-500"
                }`}
              />
              <CardTitle className="text-xl font-semibold">
                Announcements
              </CardTitle>
              {!canEditInCurrentContext && (
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="w-4 h-4 text-gray-400 ml-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {isStudent
                        ? "Students have read-only access to announcements"
                        : isPIO
                        ? "You can only create announcements in your assigned class"
                        : "Read-only access"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {canEditInCurrentContext && !isStudent && canCreateAnnouncement && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onAnnouncementClick && onAnnouncementClick(currentSubject)
                  }
                  className="whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Announcement
                </Button>
              </div>
            )}
            {!canEditInCurrentContext && !isStudent && (
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="whitespace-nowrap opacity-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Announcement
                    <Lock className="w-3 h-3 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    You can only create announcements in your assigned class:{" "}
                    {assignedClassInfo?.course} - {assignedClassInfo?.yearLevel}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </CardHeader>
          <CardContent>
            {announcementsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <p className="ml-3 text-muted-foreground">
                  Loading Announcements...
                </p>
              </div>
            )}
            {announcementsError && (
              <Alert variant="destructive" className="my-4">
                <AlertTitle>Error Loading Announcements</AlertTitle>
                <AlertDescription>
                  {announcementsError?.message ||
                    "An unexpected error occurred while fetching announcements."}
                </AlertDescription>
              </Alert>
            )}
            {!announcementsLoading &&
              !announcementsError &&
              filteredAnnouncements &&
              filteredAnnouncements.length > 0 && (
                <div className="space-y-4">
                  {filteredAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                        announcement.creationSource === "activity"
                          ? "bg-blue-50 border-l-4 border-blue-400"
                          : "bg-purple-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap flex-1">
                          {announcement.content}
                        </p>
                        {announcement.creationSource === "activity" && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                            Auto-generated
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-purple-700">
                          Posted:{" "}
                          {new Date(
                            announcement.createdAt
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            announcement.createdAt
                          ).toLocaleTimeString()}
                        </p>
                        {canEditInCurrentContext && !isStudent && (
                          <div className="flex space-x-1">
                            {/* Only show edit button for manually created announcements */}
                            {announcement.creationSource !== "activity" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-purple-600 hover:bg-purple-100"
                                onClick={() => onEditAnnouncement(announcement)}
                                title="Edit announcement"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Show info icon for activity-generated announcements */}
                            {announcement.creationSource === "activity" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 cursor-not-allowed"
                                disabled
                                title="This announcement was auto-generated from an activity and cannot be edited"
                              >
                                <Edit3 className="w-4 h-4 opacity-50" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:bg-red-100"
                              onClick={() => {
                                // Ensure we have a valid ID before attempting deletion
                                const announcementId =
                                  announcement._id || announcement.id;
                                if (announcementId) {
                                  onDeleteAnnouncement(announcementId);
                                } else {
                                  console.error(
                                    "Invalid announcement ID:",
                                    announcement
                                  );
                                }
                              }}
                              title="Delete announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {!canEditInCurrentContext && !isStudent && (
                          <div className="flex space-x-1">
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  className="h-7 w-7 text-gray-400 opacity-50 relative"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <Lock className="w-2 h-2 absolute top-1 right-1" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  You can only edit announcements in your
                                  assigned class
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  className="h-7 w-7 text-gray-400 opacity-50 relative"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <Lock className="w-2 h-2 absolute top-1 right-1" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  You can only delete announcements in your
                                  assigned class
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {!announcementsLoading &&
              !announcementsError &&
              (!filteredAnnouncements ||
                filteredAnnouncements.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm.trim()
                    ? `No announcements found matching "${searchTerm}".`
                    : "No announcements for this subject yet."}
                </p>
              )}
          </CardContent>
        </Card>
      </TooltipProvider>

      {/* Modals */}
      <AddTopicModal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        onSuccess={handleTopicSuccess}
        subjectId={currentSubject?.id || ""}
      />

      <EditTopicModal
        isOpen={isEditTopicModalOpen}
        onClose={() => {
          setIsEditTopicModalOpen(false);
          setTopicToEdit(null);
        }}
        onSuccess={handleEditTopicSuccess}
        topic={topicToEdit}
      />

      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onSuccess={handleActivitySuccess}
        topicId={selectedTopic || ""}
      />
    </div>
  );
};

ViewSubject.propTypes = {
  currentSubject: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["grid", "list"]).isRequired,
  setViewMode: PropTypes.func.isRequired,
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      size: PropTypes.string,
    })
  ),
  resourcesLoading: PropTypes.bool,
  resourcesError: PropTypes.object,
  handleDeleteResource: PropTypes.func,
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ),
  announcementsLoading: PropTypes.bool,
  announcementsError: PropTypes.object,
  onAddAnnouncement: PropTypes.func,
  onEditAnnouncement: PropTypes.func,
  onDeleteAnnouncement: PropTypes.func,
  onAnnouncementClick: PropTypes.func,
  userRole: PropTypes.string,
  topics: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      description: PropTypes.string,
      activities: PropTypes.array,
    })
  ),
  topicsLoading: PropTypes.bool,
  topicsError: PropTypes.object,
  onTopicAdded: PropTypes.func,
  onActivityAdded: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  refetchAll: PropTypes.func,
  canEditInCurrentContext: PropTypes.bool,
  isPIO: PropTypes.bool,
  assignedClassInfo: PropTypes.object,
  isStudent: PropTypes.bool,
  isAdmin: PropTypes.bool,
};

export default ViewSubject;
