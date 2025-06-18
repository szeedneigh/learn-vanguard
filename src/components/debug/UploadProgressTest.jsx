import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadModal } from '@/components/modal/UploadModal';
import { CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react';

/**
 * Test component to verify upload progress functionality
 */
const UploadProgressTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Mock subject for testing
  const mockSubject = {
    id: 'test-subject-123',
    name: 'Test Subject for Upload Progress'
  };

  // Mock topic for testing
  const mockTopic = {
    id: 'test-topic-456',
    name: 'Test Topic'
  };

  const addTestResult = (result) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleTestUpload = (file, subject, topic, onSuccess, onError, onProgress) => {
    setIsTestRunning(true);
    addTestResult({
      type: 'info',
      message: `Starting upload test for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
    });

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15; // Random progress increments
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        
        // Simulate processing time
        setTimeout(() => {
          addTestResult({
            type: 'success',
            message: 'Upload completed successfully!'
          });
          setIsTestRunning(false);
          onSuccess();
        }, 1000);
      }

      // Call progress callback with mock progress event
      if (onProgress) {
        const mockProgressEvent = {
          lengthComputable: true,
          loaded: (file.size * progress) / 100,
          total: file.size
        };
        onProgress(mockProgressEvent);
      }

      addTestResult({
        type: 'progress',
        message: `Upload progress: ${Math.round(progress)}%`
      });
    }, 200);

    // Simulate potential error (10% chance)
    if (Math.random() < 0.1) {
      setTimeout(() => {
        clearInterval(progressInterval);
        addTestResult({
          type: 'error',
          message: 'Simulated upload error for testing'
        });
        setIsTestRunning(false);
        onError(new Error('Simulated upload error'));
      }, 2000);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'progress':
        return <Upload className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Progress Test Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Test Controls */}
          <div className="flex gap-4">
            <Button 
              onClick={() => setIsModalOpen(true)}
              disabled={isTestRunning}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Test Upload Progress
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="outline"
              disabled={isTestRunning}
            >
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded border text-sm ${getResultColor(result.type)}`}
                  >
                    {getResultIcon(result.type)}
                    <span className="flex-1">{result.message}</span>
                    <span className="text-xs opacity-75">{result.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Checklist */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Upload Progress Features to Test:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Visual progress bar (0-100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Upload status messages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>File name and size display</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Upload speed calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Error handling with retry option</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Success confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Responsive UI during upload</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>File validation maintained</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Test Upload Progress" to open the enhanced upload modal</li>
              <li>Select a file to upload (try different sizes: small, medium, large)</li>
              <li>Observe the progress bar, status messages, and upload speed</li>
              <li>Verify that the modal shows file information clearly</li>
              <li>Test error scenarios (simulated 10% chance of error)</li>
              <li>Confirm that success/error states are properly displayed</li>
              <li>Test the "Try Again" functionality on errors</li>
              <li>Verify that the modal can be closed properly after completion</li>
            </ol>
          </div>

        </CardContent>
      </Card>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleTestUpload}
        subject={mockSubject}
        selectedTopic={mockTopic}
      />
    </div>
  );
};

export default UploadProgressTest;
