import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  Upload,
  FileText,
  Image,
  Video,
  Archive,
  File,
  RefreshCw,
  Trash2,
  Eye,
} from "lucide-react";
import { ROLES } from "@/lib/constants";
import { getResources, deleteResource } from "@/services/resourceService";
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

const TopicResourceView = ({
  topic,
  subjectId,
  userRole,
  onUploadClick,
  refetchTrigger = 0, // Use this to trigger refetch from parent
}) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch resources for this specific topic
  useEffect(() => {
    const fetchTopicResources = async () => {
      if (!topic || !topic.id) return;

      setLoading(true);
      try {
        console.log(
          `TopicResourceView: Fetching resources for topic ${topic.name} (${
            topic.id
          }) at ${new Date().toISOString()}`
        );
        const result = await getResources({
          topicId: topic.id,
          subjectId: subjectId,
        });

        if (result && result.data) {
          console.log(
            `TopicResourceView: Found ${result.data.length} resources for topic ${topic.name}`,
            result.data
          );
          setResources(result.data);

          // Only perform a single delayed refetch to ensure we have the latest data
          // This helps catch any resources that might have been uploaded but not yet processed
          setTimeout(async () => {
            console.log(
              `TopicResourceView: Single delayed refetch for topic ${
                topic.name
              } (1500ms) at ${new Date().toISOString()}`
            );
            try {
              const refreshResult = await getResources({
                topicId: topic.id,
                subjectId: subjectId,
              });

              if (refreshResult && refreshResult.data) {
                console.log(
                  `TopicResourceView: Delayed refetch found ${refreshResult.data.length} resources for topic ${topic.name}`,
                  refreshResult.data
                );
                // Force state update even if array length is the same
                setResources([...refreshResult.data]);
              }
            } catch (err) {
              console.error(
                `Error in delayed refetch for topic ${topic.id}:`,
                err
              );
            }
          }, 1500);
        } else {
          setResources([]);
        }
        setError(null);
      } catch (err) {
        console.error(`Error fetching resources for topic ${topic.id}:`, err);
        setError(err.message || "Failed to load resources");
        setResources([]);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchTopicResources();
  }, [topic, subjectId, refetchTrigger]); // Remove lastRefetchTime to prevent continuous refreshes

  const handleManualRefresh = () => {
    if (!loading && !isRefreshing) {
      setIsRefreshing(true);
      console.log(
        `TopicResourceView: Manual refresh triggered for topic ${
          topic.name
        } at ${new Date().toISOString()}`
      );

      getResources({
        topicId: topic.id,
        subjectId: subjectId,
      })
        .then((result) => {
          if (result && result.data) {
            console.log(
              `TopicResourceView: Manual refresh found ${result.data.length} resources for topic ${topic.name}`,
              result.data
            );
            // Force state update even if array length is the same
            setResources([...result.data]);
          }
          setError(null);
        })
        .catch((err) => {
          console.error(
            `Error refreshing resources for topic ${topic.id}:`,
            err
          );
          setError(err.message || "Failed to refresh resources");
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  };

  // Function to handle resource deletion
  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteResource(
        resourceToDelete._id || resourceToDelete.id
      );
      // The deleteResource function returns { message: ... } on success
      if (result && result.message) {
        // Remove the resource from the local state
        setResources((prevResources) =>
          prevResources.filter(
            (r) =>
              (r._id || r.id) !== (resourceToDelete._id || resourceToDelete.id)
          )
        );
        console.log(`Resource ${resourceToDelete.name} deleted successfully`);

        // Refresh resources after a short delay to ensure backend processing is complete
        setTimeout(() => {
          getResources({
            topicId: topic.id,
            subjectId: subjectId,
          })
            .then((result) => {
              if (result && result.data) {
                console.log(
                  `TopicResourceView: Refreshed ${result.data.length} resources after deletion for topic ${topic.name}`
                );
                setResources(result.data);
              }
            })
            .catch((err) => {
              console.error(
                `Error refreshing resources after deletion for topic ${topic.id}:`,
                err
              );
            });
        }, 500);
      } else {
        console.error(
          "Failed to delete resource:",
          result?.error || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
    } finally {
      setIsDeleting(false);
      setResourceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to determine icon by resource type
  const getResourceIcon = (resourceType) => {
    switch (resourceType) {
      case "document":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "image":
        return <Image className="w-4 h-4 text-green-600" />;
      case "video":
        return <Video className="w-4 h-4 text-red-600" />;
      case "archive":
        return <Archive className="w-4 h-4 text-amber-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  // Function to determine if a file is a PDF
  const isPdfFile = (resource) => {
    if (resource.mimeType && resource.mimeType.includes("pdf")) return true;
    if (resource.name && resource.name.toLowerCase().endsWith(".pdf"))
      return true;
    return false;
  };

  // Function to handle viewing or downloading a resource
  const handleViewResource = (resource) => {
    if (isPdfFile(resource)) {
      // For PDF files, download directly instead of viewing
      downloadFile(resource);
    } else {
      // For non-PDF files, open in a new tab
      window.open(resource.fileUrl, "_blank");
    }
  };

  // Function to download a file
  const downloadFile = (resource) => {
    // Force download the file instead of just opening it
    const link = document.createElement("a");

    // Get the file URL and prepare for download
    let downloadUrl = resource.fileUrl;

    // For Cloudinary URLs, construct URL with fl_attachment in the path
    if (downloadUrl.includes("cloudinary.com")) {
      // Extract parts of the Cloudinary URL
      const urlParts = downloadUrl.split("/upload/");
      if (urlParts.length === 2) {
        // Insert fl_attachment directly in the URL path
        downloadUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;
      }
    }

    // Set up the download link with proper filename
    link.href = downloadUrl;

    // Use fileName property if available, otherwise fall back to name
    const filename = resource.fileName || resource.name || "download";
    link.setAttribute("download", filename);

    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-3 space-y-2">
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
              onClick={handleDeleteResource}
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

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <p className="text-xs font-medium text-gray-500 mr-2">Resources:</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
          >
            <RefreshCw
              className={`h-3 w-3 text-gray-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUploadClick(topic)}
            className="text-xs"
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload File
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <p className="text-xs text-muted-foreground">Loading resources...</p>
        </div>
      ) : error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : resources.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {resources.map((resource) => (
            <div
              key={resource.id || resource._id}
              className="p-2 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-50 rounded">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{resource.name}</p>
                  <p className="text-xs text-gray-500">
                    {resource.size
                      ? `${(parseInt(resource.size) / (1024 * 1024)).toFixed(
                          2
                        )} MB`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                {!isPdfFile(resource) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => handleViewResource(resource)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">View</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600"
                  onClick={() => downloadFile(resource)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Download</span>
                </Button>
                {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => {
                      setResourceToDelete(resource);
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
      ) : (
        <p className="text-xs text-gray-500 italic">No resources yet</p>
      )}
    </div>
  );
};

TopicResourceView.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  subjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  userRole: PropTypes.string,
  onUploadClick: PropTypes.func.isRequired,
  refetchTrigger: PropTypes.number,
};

export default TopicResourceView;
