import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";

export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  subject,
  selectedTopic = null,
}) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopicState, setSelectedTopicState] = useState(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef(null);
  const uploadStartTime = useRef(null);
  const uploadedBytes = useRef(0);

  // Utility functions for upload progress
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUploadSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return "0 KB/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return (
      parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };

  const resetUploadState = () => {
    setUploadProgress(0);
    setUploadStatus("");
    setUploadSpeed(0);
    setUploadError(null);
    setUploadComplete(false);
    uploadStartTime.current = null;
    uploadedBytes.current = 0;
  };

  // Use the selectedTopic prop if provided
  useEffect(() => {
    if (selectedTopic) {
      console.log(
        "UploadModal: Setting selected topic from prop:",
        selectedTopic
      );
      setSelectedTopicState(selectedTopic);
    } else {
      // Reset the selected topic if none is provided and the subject changes
      if (!selectedTopic && subject?.id) {
        setSelectedTopicState(null);
      }
    }
  }, [selectedTopic, subject]);

  // Fetch topics when subject changes
  useEffect(() => {
    // Only fetch topics if subject is available
    if (subject?.id) {
      setTopicsLoading(true);
      import("@/services/topicService")
        .then((topicService) => {
          topicService
            .getTopicsBySubject(subject.id)
            .then((result) => {
              if (result.success && result.data) {
                setTopics(result.data);

                // If selectedTopicState exists and is from this subject, ensure it's selected
                if (selectedTopicState && selectedTopicState.id) {
                  const matchingTopic = result.data.find(
                    (t) => t.id === selectedTopicState.id
                  );
                  if (matchingTopic) {
                    console.log(
                      "Setting selected topic from fetched data:",
                      matchingTopic
                    );
                    // Only update if truly different to prevent infinite loop
                    if (
                      JSON.stringify(matchingTopic) !==
                      JSON.stringify(selectedTopicState)
                    ) {
                      setSelectedTopicState(matchingTopic);
                    }
                  }
                }
              } else {
                setTopics([]);
              }
            })
            .catch((err) => {
              console.error("Error fetching topics:", err);
              setTopics([]);
            })
            .finally(() => {
              setTopicsLoading(false);
            });
        })
        .catch((err) => {
          console.error("Error importing topic service:", err);
          setTopicsLoading(false);
        });
    } else {
      setTopics([]);
    }
  }, [subject]);

  // Body scroll is handled by Dialog component automatically

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = () => {
    if (file) {
      setIsUploading(true);
      resetUploadState();
      setUploadStatus("Preparing upload...");
      uploadStartTime.current = Date.now();

      // Create progress callback
      const onProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          uploadedBytes.current = progressEvent.loaded;

          // Calculate upload speed
          const elapsedTime = (Date.now() - uploadStartTime.current) / 1000;
          if (elapsedTime > 0) {
            const speed = progressEvent.loaded / elapsedTime;
            setUploadSpeed(speed);
          }

          // Update status based on progress
          if (percentCompleted < 100) {
            setUploadStatus("Uploading...");
          } else {
            setUploadStatus("Processing...");
          }
        }
      };

      onUpload(
        file,
        subject,
        selectedTopicState,
        // Success callback
        () => {
          console.log("Upload completed successfully, closing modal");
          setUploadProgress(100);
          setUploadStatus("Upload Complete!");
          setUploadComplete(true);
          setIsUploading(false);

          // Close modal after a brief delay to show completion
          setTimeout(() => {
            handleClose();
          }, 1500);
        },
        // Error callback
        (error) => {
          console.log("Upload failed:", error);
          setUploadError(error?.message || "Upload failed. Please try again.");
          setUploadStatus("Upload Failed");
          setIsUploading(false);
        },
        // Progress callback
        onProgress
      );
    }
  };

  const handleClose = () => {
    // Don't allow closing during active upload
    if (isUploading) return;

    setFile(null);
    setSelectedTopicState(null);
    setIsUploading(false);
    resetUploadState();
    onClose();
  };

  const handleModalClose = (open) => {
    // Only call onClose when the dialog is closing and not uploading
    if (!open && !isUploading) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {subject ? `Uploading to: ${subject.name}` : "No subject selected"}
          </p>

          {subject && topics.length > 0 && (
            <div>
              <label
                htmlFor="topic-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Topic (Optional)
              </label>
              <select
                id="topic-select"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedTopicState?.id || ""}
                onChange={(e) => {
                  const topicId = e.target.value;
                  const topic = topics.find((t) => t.id === topicId);
                  setSelectedTopicState(topic || null);
                }}
                disabled={topicsLoading || isUploading}
              >
                <option value="">No specific topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              {topicsLoading && (
                <p className="text-xs text-gray-500 mt-1">Loading topics...</p>
              )}
            </div>
          )}

          <div
            className={`border-2 border-dashed ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            {file ? (
              <div>
                <div className="flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-blue-500 mr-2" />
                  <div className="text-left">
                    <p className="text-green-600 font-medium">File selected:</p>
                    <p className="text-sm text-gray-600 truncate max-w-full">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Drag and drop your file here, or click to select
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supported file types: PDF, Word, PowerPoint, Images, etc.
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress Section */}
          {isUploading && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploadStatus}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>

              <Progress
                value={uploadProgress}
                className="mb-3"
                variant={uploadComplete ? "success" : "default"}
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {file && `${file.name} (${formatFileSize(file.size)})`}
                </span>
                {uploadSpeed > 0 && (
                  <span>{formatUploadSpeed(uploadSpeed)}</span>
                )}
              </div>
            </div>
          )}

          {/* Upload Error Section */}
          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{uploadError}</span>
              </div>
            </div>
          )}

          {/* Upload Complete Section */}
          {uploadComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-700">
                  File uploaded successfully!
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isUploading && !uploadComplete && !uploadError}
            >
              {uploadComplete ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          {!uploadComplete && (
            <Button
              onClick={handleUpload}
              disabled={!file || !subject || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              loading={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {uploadProgress > 0
                    ? `Uploading ${uploadProgress}%`
                    : "Uploading..."}
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </span>
              )}
            </Button>
          )}
          {uploadError && (
            <Button
              onClick={() => {
                setUploadError(null);
                resetUploadState();
              }}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

UploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  subject: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  selectedTopic: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};
