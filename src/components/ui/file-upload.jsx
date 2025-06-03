import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { cn } from '@/lib/utils';

/**
 * File Upload Component with Drag & Drop, Progress Tracking, and Preview
 * Features:
 * - Drag and drop file upload
 * - File type validation
 * - File size validation
 * - Upload progress tracking
 * - File preview generation
 * - Multiple file support
 * - Error handling
 */

const FileUpload = ({
  onFileSelect,
  onUploadComplete,
  onUploadError,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = true,
  className,
  disabled = false,
  showPreview = true,
  uploadEndpoint = null,
  metadata = {},
  ...props
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Get allowed file types from environment or props
  const allowedTypes = accept === '*' 
    ? (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png').split(',')
    : accept.split(',');

  const maxFileSize = maxSize || parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760');

  /**
   * Validate file type and size
   */
  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
    }
    
    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    if (accept !== '*' && allowedTypes.length > 0) {
      const isValidExtension = allowedTypes.some(type => 
        type.trim().toLowerCase() === fileExtension ||
        mimeType.includes(type.trim().toLowerCase())
      );
      
      if (!isValidExtension) {
        errors.push(`File type "${fileExtension}" is not allowed. Allowed types: ${allowedTypes.join(', ')}.`);
      }
    }
    
    return errors;
  };

  /**
   * Process selected files
   */
  const processFiles = useCallback((selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    const newErrors = [];
    const validFiles = [];

    // Check total file count
    if (files.length + fileList.length > maxFiles) {
      newErrors.push(`Cannot upload more than ${maxFiles} files. Please remove some files first.`);
      setErrors(newErrors);
      return;
    }

    fileList.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        // Create file object with metadata
        const fileObj = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'pending', // pending, uploading, completed, error
          preview: null,
          error: null
        };

        // Generate preview for images
        if (file.type.startsWith('image/') && showPreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id ? { ...f, preview: e.target.result } : f
            ));
          };
          reader.readAsDataURL(file);
        }

        validFiles.push(fileObj);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      onFileSelect?.(validFiles);
    }
  }, [files, maxFiles, maxFileSize, allowedTypes, onFileSelect, showPreview]);

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value
    e.target.value = '';
  };

  /**
   * Remove file from list
   */
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  /**
   * Clear all files
   */
  const clearAllFiles = () => {
    setFiles([]);
    setErrors([]);
  };

  /**
   * Upload files to server
   */
  const uploadFiles = async () => {
    if (!uploadEndpoint || files.length === 0) return;

    setUploading(true);
    const uploadPromises = files
      .filter(f => f.status === 'pending')
      .map(async (fileObj) => {
        try {
          // Update file status
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f
          ));

          // Create FormData
          const formData = new FormData();
          formData.append('file', fileObj.file);
          
          // Add metadata
          Object.keys(metadata).forEach(key => {
            if (metadata[key] !== undefined && metadata[key] !== null) {
              formData.append(key, metadata[key]);
            }
          });

          // Simulate upload with progress (replace with actual upload logic)
          const response = await uploadWithProgress(uploadEndpoint, formData, (progress) => {
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id ? { ...f, progress } : f
            ));
          });

          // Update file status on success
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f
          ));

          return { fileId: fileObj.id, response };
        } catch (error) {
          // Update file status on error
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { 
              ...f, 
              status: 'error', 
              error: error.message || 'Upload failed',
              progress: 0 
            } : f
          ));

          throw error;
        }
      });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);

      onUploadComplete?.(successful, failed);
    } catch (error) {
      onUploadError?.(error);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload with progress tracking
   */
  const uploadWithProgress = (url, formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get file icon based on type
   */
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragOver ? 'Drop files here' : 'Upload files'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-xs text-gray-400">
          Supported formats: {allowedTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)} • Max files: {maxFiles}
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert className="mt-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length}/{maxFiles})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFiles}
              disabled={uploading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      {getFileIcon(fileObj)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileObj.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {fileObj.status === 'uploading' && (
                    <div className="mt-1">
                      <Progress value={fileObj.progress} className="h-1" />
                      <p className="text-xs text-gray-500 mt-1">
                        {fileObj.progress}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {fileObj.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      {fileObj.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {fileObj.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {fileObj.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {fileObj.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileObj.id)}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {uploadEndpoint && files.some(f => f.status === 'pending') && (
            <div className="mt-4">
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status !== 'pending')}
                className="w-full"
              >
                {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 