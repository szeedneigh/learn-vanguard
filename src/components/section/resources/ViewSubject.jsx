import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROLES } from "@/lib/constants";
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
  Book,
  BookOpen,
  RefreshCw,
} from "lucide-react";
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
import { AddActivityModal } from "@/components/modal/AddActivityModal";
import TopicResourceView from "./TopicResourceView";

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
  userRole,
  topics = [],
  topicsLoading = false,
  topicsError = null,
  onTopicAdded = () => {},
  onActivityAdded = () => {},
  setIsModalOpen,
  refetchAll = () => {},
}) => {
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter(
      (resource) =>
        resource.name &&
        resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);

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
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
              >
                {viewMode === "grid" ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-xl font-semibold">Topics</CardTitle>
          </div>
          {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
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
          {!topicsLoading && !topicsError && topics && topics.length > 0 && (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium">{topic.name}</h3>
                    {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
                      <div className="flex space-x-2">
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
                  </div>
                  {topic.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {topic.description}
                    </p>
                  )}

                  {/* Topic Resources - Using the new component */}
                  <TopicResourceView
                    topic={topic}
                    subjectId={currentSubject?.id}
                    userRole={userRole}
                    onUploadClick={handleUploadForTopic}
                    refetchTrigger={refetchTrigger}
                  />

                  {/* Activities */}
                  {topic.activities && topic.activities.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500">
                        Activities:
                      </p>
                      {topic.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-2 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">
                              {activity.title}
                            </p>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {activity.type}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-gray-600 mb-1">
                              {activity.description}
                            </p>
                          )}
                          {activity.dueDate && (
                            <p className="text-xs text-orange-600">
                              Due:{" "}
                              {new Date(activity.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-2">
                      No activities yet
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {!topicsLoading &&
            !topicsError &&
            (!topics || topics.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No topics for this subject yet.
              </p>
            )}
        </CardContent>
      </Card>

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
                        (userRole === ROLES.ADMIN ||
                          userRole === ROLES.PIO) && (
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
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-xl font-semibold">
              Announcements
            </CardTitle>
          </div>
          {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddAnnouncement}
              className="whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New
            </Button>
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
            announcements &&
            announcements.length > 0 && (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-purple-50 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-purple-700">
                        Posted:{" "}
                        {new Date(announcement.createdAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(announcement.createdAt).toLocaleTimeString()}
                      </p>
                      {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-purple-600 hover:bg-purple-100"
                            onClick={() => onEditAnnouncement(announcement)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:bg-red-100"
                            onClick={() =>
                              onDeleteAnnouncement(announcement.id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          {!announcementsLoading &&
            !announcementsError &&
            (!announcements || announcements.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No announcements for this subject yet.
              </p>
            )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddTopicModal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        onSuccess={handleTopicSuccess}
        subjectId={currentSubject?.id || ""}
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
};

export default ViewSubject;
