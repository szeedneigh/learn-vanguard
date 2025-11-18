import logger from "@/utils/logger";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { getCurrentUserProfile } from "@/lib/api/userApi";
import { useTasks } from "@/hooks/useTasksQuery";

/**
 * Test component to verify the fixes for:
 * 1. Upcoming deadlines not updating when tasks are modified
 * 2. Profile modal missing Year Level and Course fields
 */
const FixTestComponent = () => {
  const [profileData, setProfileData] = useState(null);
  const [testResults, setTestResults] = useState({});
  const queryClient = useQueryClient();
  // Test the task cache invalidation
  const testTaskCacheInvalidation = () => {
    logger.log("Testing task cache invalidation...");
    // Check current cache state
    const taskCache = queryClient.getQueryData(queryKeys.tasks);
    const eventsCache = queryClient.getQueryData(queryKeys.events);
    logger.log("Current cache state:", {
      tasks: taskCache,
      events: eventsCache,
      allCacheKeys: queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey),
    });
    // Simulate task update by invalidating caches
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    queryClient.invalidateQueries({ queryKey: queryKeys.events });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setTestResults((prev) => ({
      ...prev,
      cacheInvalidation:
        "Cache invalidation triggered - check console for details",
    }));
  };
  // Test the profile API
  const testProfileAPI = async () => {
    logger.log("Testing profile API...");
    try {
      const result = await getCurrentUserProfile();
      logger.log("Profile API result:", result);
      if (result.success && result.data) {
        setProfileData(result.data);
        setTestResults((prev) => ({
          ...prev,
          profileAPI: {
            success: true,
            hasYearLevel: !!result.data.yearLevel,
            hasCourse: !!result.data.course,
            yearLevel: result.data.yearLevel,
            course: result.data.course,
            role: result.data.role,
            allFields: Object.keys(result.data),
          },
        }));
      } else {
            success: false,
            error: result.error || "No data returned",
      }
    } catch (error) {
      logger.error("Profile API test error:", error);
      setTestResults((prev) => ({
        ...prev,
        profileAPI: {
          success: false,
          error: error.message,
        },
      }));
    }
  // Test the useTasks hook
  const TestTasksHook = () => {
    const { data: tasks, isLoading, error } = useTasks({ archived: "false" });
    React.useEffect(() => {
      if (tasks) {
          tasksHook: {
            taskCount: tasks.length,
            sampleTask: tasks[0] || null,
      } else if (error) {
            error: error.message,
    }, [tasks, error]);
    return (
      <div className="text-sm">
        {isLoading ? "Loading tasks..." : `Loaded ${tasks?.length || 0} tasks`}
      </div>
    );
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Fix Verification Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test 1: Cache Invalidation */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">
            Test 1: Task Cache Invalidation
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Tests if task updates properly invalidate the Events page cache
          </p>
          <Button onClick={testTaskCacheInvalidation} className="mb-2">
            Test Cache Invalidation
          </Button>
          {testResults.cacheInvalidation && (
            <div className="text-sm bg-gray-100 p-2 rounded">
              {testResults.cacheInvalidation}
            </div>
          )}
        </div>
        {/* Test 2: Profile API */}
          <h3 className="font-semibold mb-2">Test 2: Profile API</h3>
            Tests if the profile API returns yearLevel and course fields
          <Button onClick={testProfileAPI} className="mb-2">
            Test Profile API
          {testResults.profileAPI && (
              <pre>{JSON.stringify(testResults.profileAPI, null, 2)}</pre>
        {/* Test 3: Tasks Hook */}
          <h3 className="font-semibold mb-2">Test 3: Tasks Hook</h3>
            Tests if the useTasks hook is working properly
          <TestTasksHook />
          {testResults.tasksHook && (
            <div className="text-sm bg-gray-100 p-2 rounded mt-2">
              <pre>{JSON.stringify(testResults.tasksHook, null, 2)}</pre>
        {/* Profile Data Display */}
        {profileData && (
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Current Profile Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Role:</strong> {profileData.role}
              </div>
                <strong>Year Level:</strong>{" "}
                {profileData.yearLevel || "Not specified"}
                <strong>Course:</strong> {profileData.course || "Not specified"}
                <strong>Email:</strong> {profileData.email}
          </div>
        )}
        {/* Instructions */}
        <div className="border p-4 rounded bg-blue-50">
          <h3 className="font-semibold mb-2">Testing Instructions</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>
              Run "Test Cache Invalidation" and check browser console for cache
              details
            </li>
              Run "Test Profile API" to verify yearLevel and course fields are
              returned
            <li>Check if the Tasks Hook loads data properly</li>
              Open profile modal to see if Year Level and Course fields appear
              Modify a task deadline and check if upcoming deadlines update
          </ol>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800 mb-2">
              Fixes Applied:
            </h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>
                <strong>Profile Modal:</strong> Fixed role check to include
                profileData.role
              </li>
                <strong>DateTime Display:</strong> Fixed task transformation to
                preserve full datetime
                <strong>Date Priority:</strong> Updated getTaskDueDate to
                prioritize full datetime fields
                <strong>Cache Invalidation:</strong> Enhanced task mutations to
                invalidate Events page cache
            </ul>
      </CardContent>
    </Card>
  );
};
export default FixTestComponent;
