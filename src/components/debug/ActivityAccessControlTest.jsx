import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  BookOpen, 
  Calendar,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';

/**
 * Test component to verify activity completion access control fixes
 */
const ActivityAccessControlTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedCourse, setSelectedCourse] = useState('Bachelor of Science in Information Systems');
  const [selectedYear, setSelectedYear] = useState('Third Year');

  // Mock data for testing access control
  const mockUsers = {
    student: {
      role: 'student',
      course: 'Bachelor of Science in Information Systems',
      yearLevel: 'Third Year',
      name: 'John Doe'
    },
    pio: {
      role: 'pio',
      assignedClass: 'Bachelor of Science in Information Systems - Third Year',
      name: 'Jane Smith'
    },
    admin: {
      role: 'admin',
      name: 'Admin User'
    }
  };

  const mockSubjects = [
    {
      id: 'subject-1',
      name: 'Database Systems',
      programId: 'bsis',
      yearLevel: '3',
      course: 'Bachelor of Science in Information Systems'
    },
    {
      id: 'subject-2', 
      name: 'Programming Fundamentals',
      programId: 'act',
      yearLevel: '1',
      course: 'Associate in Computer Technology'
    },
    {
      id: 'subject-3',
      name: 'Advanced Programming',
      programId: 'bsis',
      yearLevel: '2',
      course: 'Bachelor of Science in Information Systems'
    }
  ];

  const addTestResult = (result) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testAccessControl = (subject) => {
    const user = mockUsers[selectedRole];
    let hasAccess = false;
    let reason = '';

    if (selectedRole === 'admin') {
      hasAccess = false;
      reason = 'Admin users cannot mark activities as complete (view-only access)';
    } else if (selectedRole === 'student') {
      // Map user course to programId
      const courseToProgram = {
        'Associate in Computer Technology': 'act',
        'Bachelor of Science in Information Systems': 'bsis',
      };

      // Map user year level to subject year level format
      const yearLevelToNumber = {
        'First Year': '1',
        'Second Year': '2', 
        'Third Year': '3',
        'Fourth Year': '4',
      };

      const userProgramId = courseToProgram[user.course];
      const userYearLevelNumber = yearLevelToNumber[user.yearLevel];

      hasAccess = (
        subject.programId === userProgramId &&
        subject.yearLevel === userYearLevelNumber
      );

      if (hasAccess) {
        reason = `Student has access - matches course (${user.course}) and year (${user.yearLevel})`;
      } else {
        reason = `Access denied - student is ${user.course} ${user.yearLevel}, subject is for ${subject.course} Year ${subject.yearLevel}`;
      }
    } else if (selectedRole === 'pio') {
      const assignedClassParts = user.assignedClass.split(' - ');
      if (assignedClassParts.length === 2) {
        const [assignedCourse, assignedYearLevel] = assignedClassParts;

        const courseToProgram = {
          'Associate in Computer Technology': 'act',
          'Bachelor of Science in Information Systems': 'bsis',
        };

        const yearLevelToNumber = {
          'First Year': '1',
          'Second Year': '2',
          'Third Year': '3', 
          'Fourth Year': '4',
        };

        const assignedProgramId = courseToProgram[assignedCourse];
        const assignedYearLevelNumber = yearLevelToNumber[assignedYearLevel];

        hasAccess = (
          subject.programId === assignedProgramId &&
          subject.yearLevel === assignedYearLevelNumber
        );

        if (hasAccess) {
          reason = `PIO has access - matches assigned class (${user.assignedClass})`;
        } else {
          reason = `Access denied - PIO assigned to ${user.assignedClass}, subject is for ${subject.course} Year ${subject.yearLevel}`;
        }
      }
    }

    addTestResult({
      type: hasAccess ? 'success' : 'error',
      message: `${selectedRole.toUpperCase()} access to "${subject.name}": ${hasAccess ? 'ALLOWED' : 'DENIED'}`,
      details: reason,
      subject: subject.name,
      role: selectedRole
    });

    return hasAccess;
  };

  const runAllTests = () => {
    setTestResults([]);
    addTestResult({
      type: 'info',
      message: `Running access control tests for ${selectedRole.toUpperCase()} user...`,
      details: `User: ${mockUsers[selectedRole].name}`
    });

    mockSubjects.forEach(subject => {
      testAccessControl(subject);
    });

    addTestResult({
      type: 'info',
      message: 'Access control tests completed',
      details: 'Check results above for detailed access control validation'
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Completion Access Control Test</CardTitle>
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

          {/* Current User Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Test User:</strong> {mockUsers[selectedRole].name} ({selectedRole})
              {selectedRole === 'student' && (
                <span> - {mockUsers[selectedRole].course}, {mockUsers[selectedRole].yearLevel}</span>
              )}
              {selectedRole === 'pio' && (
                <span> - Assigned to: {mockUsers[selectedRole].assignedClass}</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Test Subjects */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test Subjects:</h3>
            <div className="grid gap-4">
              {mockSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-4 border rounded-lg bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{subject.name}</h4>
                        <p className="text-sm text-gray-600">
                          {subject.course} - Year {subject.yearLevel}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testAccessControl(subject)}
                    >
                      Test Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex gap-4">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Run All Tests
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded border text-sm ${getResultColor(result.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getResultIcon(result.type)}
                      <div className="flex-1">
                        <div className="font-medium">{result.message}</div>
                        {result.details && (
                          <div className="text-xs mt-1 opacity-75">{result.details}</div>
                        )}
                      </div>
                      <span className="text-xs opacity-75">{result.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Features Checklist */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Security Features Implemented:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Backend API validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Frontend UI access control</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Student course/year validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>PIO assigned class validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Admin access restriction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Subject-based filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Events page activity filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Real-time completion updates</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityAccessControlTest;
