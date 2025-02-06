import { useState, useCallback } from "react";
import { X, FileText, AlertCircle, Upload, File, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const ALLOWED_FILE_TYPES = {
  'application/pdf': {},
  'application/msword': {},
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {},
  'application/vnd.ms-powerpoint': {},
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {},
  'image/jpeg': {},
  'image/png': {},
  'image/jpg': {}
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const UploadModal = ({ isOpen, onClose, onUpload, selectedSubject, setSelectedSubject, subjects }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateAndSetFile = useCallback((file) => {
    if (!file) return;
    
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      setErrorMessage("Please upload only PDF, Word, or PowerPoint files.");
      setSelectedFile(null);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size should not exceed 10MB.");
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setErrorMessage("");
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsUploading(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    // if (!selectedSubject) {
    //   setErrorMessage("Please select a subject for this file.");
    //   return;
    // }
    
    await simulateUpload();
    onUpload(selectedFile);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ margin: 0, padding: 0 }}
        >
          <motion.div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Upload Materials</h2>
                  <p className="text-sm text-gray-500 mt-1">Add learning resources</p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Subject Selection */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    value={selectedSubject || ""}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Select a subject</option>
                    {subjects?.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* File Drop Zone */}
                <motion.div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                  <Upload className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your file here, or{' '}
                    <label className="inline-block">
                      <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        browse files
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                      />
                    </label>
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    {Object.values(ALLOWED_FILE_TYPES).map(({ name, icon }) => (
                      <div key={name} className="text-xs text-gray-500">
                        <span className="mr-1">{icon}</span>
                        {name}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Selected File Info */}
                <AnimatePresence mode="wait">
                  {selectedFile && (
                    <motion.div 
                      className="bg-gray-50 p-4 rounded-xl space-y-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <File className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                      
                      {isUploading && (
                        <div className="space-y-2">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div 
                      className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isUploading}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpload}
                className={`px-4 py-2 rounded-xl text-white shadow-sm flex items-center space-x-2 ${
                  isUploading ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={!selectedFile || !selectedSubject || isUploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUploading ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};