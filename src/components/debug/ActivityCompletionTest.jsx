import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen, 
  Award,
  FileText,
  Calendar,
  Check,
  X
} from 'lucide-react';
import {
  useMarkActivityComplete,
  useActivityCompletions,
  useTopicActivityCompletions,
} from '@/hooks/useActivityCompletion';

/**
 * Test component to verify activity completion functionality
 */
const ActivityCompletionTest = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [testResults, setTestResults] = useState([]);

  // Mock data for testing
  const mockTopic = {
    id: 'test-topic-123',
    name: 'Introduction to Programming',
    activities: [
      {
        _id: 'activity-1',
        title: 'Programming Assignment 1',
        type: 'assignment',
        dueDate: '2024-01-15T23:59:59Z',
        points: 100,
        description: 'Create a simple calculator program'
      },
      {
        _id: 'activity-2',
        title: 'Quiz: Variables and Data Types',
        type: 'quiz',
        dueDate: '2024-01-10T14:00:00Z',
        points: 50,
        description: 'Test your knowledge of basic programming concepts'
      },
      {
        _id: 'activity-3',
        title: 'Reading Material: Functions',
        type: 'material',
        dueDate: null,
        points: 0,
        description: 'Read chapter 5 about functions'
      }
    ]
  };

  // Hooks for testing
  const markActivityCompleteMutation = useMarkActivityComplete();
  const { data: completions, isLoading: completionsLoading } = useActivityCompletions();
  const {
    isActivityCompleted,
    completedActivityIds,
    isLoading: topicCompletionsLoading,
  } = useTopicActivityCompletions(mockTopic, true);

  const addTestResult = (result) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleMarkComplete = async (activity) => {
    addTestResult({
      type: 'info',
      message: `Attempting to mark "${activity.title}" as complete...`
    });

    try {
      await markActivityCompleteMutation.mutateAsync({
        topicId: mockTopic.id,
        activityId: activity._id,
        notes: `Completed by ${selectedRole} user in test environment`
      });

      addTestResult({
        type: 'success',
        message: `Successfully marked "${activity.title}" as complete!`
      });
    } catch (error) {
      addTestResult({
        type: 'error',
        message: `Failed to mark "${activity.title}" as complete: ${error.message}`
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'material':
        return <BookOpen className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Completion Test Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test as Role:</label>
            <div className="flex gap-2">
              {['student', 'pio', 'admin'].map(role => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  <User className="w-4 h-4 mr-1" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Mock Topic Activities */}
          <div className="space-y-4">
            <h3 className="font-semibold">Mock Topic: {mockTopic.name}</h3>
            <div className="grid gap-4">
              {mockTopic.activities.map((activity) => {
                const isCompleted = isActivityCompleted(activity._id);
                const canMarkComplete = selectedRole === 'student' || selectedRole === 'pio';
                
                return (
                  <div
                    key={activity._id}
                    className={`p-4 border rounded-lg ${
                      isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            getActivityIcon(activity.type)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : ''}`}>
                              {activity.title}
                            </h4>
                            {isCompleted && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <span className="capitalize">{activity.type}</span>
                            </span>
                            {activity.dueDate && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(activity.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {activity.points > 0 && (
                              <span>Points: {activity.points}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {canMarkComplete && !isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleMarkComplete(activity)}
                          disabled={markActivityCompleteMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Mark as Done
                        </Button>
                      )}
                      
                      {!canMarkComplete && (
                        <Badge variant="outline" className="text-gray-500">
                          {selectedRole === 'admin' ? 'Admin View Only' : 'No Permission'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex gap-4">
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
            <Badge variant="outline">
              Completed: {completedActivityIds.length} / {mockTopic.activities.length}
            </Badge>
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
            <h3 className="font-semibold mb-3">Activity Completion Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>"Mark as Done" button for Students/PIO</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Visual completion indicators</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Role-based access control</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Real-time completion tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Toast notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Loading states</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityCompletionTest;
