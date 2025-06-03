import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

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
  const fileInputRef = useRef(null);

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

      onUpload(
        file,
        subject,
        selectedTopicState,
        // Success callback
        () => {
          console.log("Upload completed successfully, closing modal");
          // Don't show toast here as it's already shown in Resources.jsx
          setIsUploading(false);

          // Close modal after success
          handleClose();
        },
        // Error callback
        // eslint-disable-next-line no-unused-vars
        (error) => {
          console.log("Upload failed, closing modal");
          // Don't show toast here as it's already shown in Resources.jsx
          setIsUploading(false);

          // Also close the modal on error
          onClose();
        }
      );
    }
  };

  const handleClose = () => {
    // Don't allow closing during active upload
    if (isUploading) return;

    setFile(null);
    setSelectedTopicState(null);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={!isUploading ? handleClose : undefined}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Upload Resource</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            {subject ? `Uploading to: ${subject.name}` : "No subject selected"}
          </p>

          {subject && topics.length > 0 && (
            <div className="mb-4">
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
                <p className="text-green-600 font-medium">File selected:</p>
                <p className="text-sm text-gray-600 mt-1 truncate max-w-full">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
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
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className={`px-4 py-2 text-sm border border-gray-300 rounded-md ${
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !subject || isUploading}
            className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-md ${
              !file || !subject || isUploading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
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
