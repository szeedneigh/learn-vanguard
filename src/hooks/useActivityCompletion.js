import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  markActivityComplete,
  getActivityCompletions,
  checkActivityCompletion,
  batchCheckActivityCompletions,
} from '@/lib/api/activityApi';

// Query keys for activity completion
export const activityCompletionKeys = {
  all: ['activityCompletions'],
  completions: (subjectId) => ['activityCompletions', 'list', subjectId],
  completion: (topicId, activityId) => ['activityCompletions', 'single', topicId, activityId],
  batch: (activities) => ['activityCompletions', 'batch', activities],
};

/**
 * Hook to mark an activity as complete
 */
export const useMarkActivityComplete = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ topicId, activityId, notes }) => {
      const result = await markActivityComplete(topicId, activityId, notes);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, { topicId, activityId }) => {
      // Invalidate and refetch completion queries
      queryClient.invalidateQueries({ queryKey: activityCompletionKeys.all });
      
      // Update the specific completion status
      queryClient.setQueryData(
        activityCompletionKeys.completion(topicId, activityId),
        { isCompleted: true, ...data }
      );

      toast({
        title: 'Activity Completed',
        description: 'Activity has been marked as completed successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to mark activity as complete';
      
      if (error.message === 'Activity already completed') {
        toast({
          title: 'Already Completed',
          description: 'This activity has already been marked as completed.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Completion Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
  });
};

/**
 * Hook to get all activity completions for the current user
 */
export const useActivityCompletions = (subjectId = null) => {
  return useQuery({
    queryKey: activityCompletionKeys.completions(subjectId),
    queryFn: () => getActivityCompletions(subjectId),
    select: (data) => data.data || [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to check if a specific activity is completed
 */
export const useActivityCompletion = (topicId, activityId, enabled = true) => {
  return useQuery({
    queryKey: activityCompletionKeys.completion(topicId, activityId),
    queryFn: () => checkActivityCompletion(topicId, activityId),
    select: (data) => data.isCompleted || false,
    enabled: enabled && !!topicId && !!activityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to batch check completion status for multiple activities
 */
export const useBatchActivityCompletions = (activities, enabled = true) => {
  return useQuery({
    queryKey: activityCompletionKeys.batch(activities),
    queryFn: () => batchCheckActivityCompletions(activities),
    select: (data) => data.data || {},
    enabled: enabled && activities && activities.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Custom hook to get completion status for activities in a topic
 */
export const useTopicActivityCompletions = (topic, enabled = true) => {
  const activities = topic?.activities?.map(activity => ({
    topicId: topic.id,
    activityId: activity._id,
  })) || [];

  const { data: completionMap, isLoading, error } = useBatchActivityCompletions(
    activities,
    enabled && activities.length > 0
  );

  // Helper function to check if a specific activity is completed
  const isActivityCompleted = (activityId) => {
    const key = `${topic?.id}-${activityId}`;
    return completionMap?.[key] || false;
  };

  // Get list of completed activity IDs
  const completedActivityIds = Object.entries(completionMap || {})
    .filter(([key, isCompleted]) => isCompleted && key.startsWith(`${topic?.id}-`))
    .map(([key]) => key.split('-')[1]);

  return {
    completionMap,
    isActivityCompleted,
    completedActivityIds,
    isLoading,
    error,
  };
};

/**
 * Hook to get completion statistics for activities (for instructors)
 */
export const useActivityCompletionStats = (topicId, activityId, enabled = true) => {
  return useQuery({
    queryKey: ['activityCompletionStats', topicId, activityId],
    queryFn: () => getActivityCompletionStats(topicId, activityId),
    select: (data) => data.data || null,
    enabled: enabled && !!topicId && !!activityId,
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent updates for stats)
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Utility function to invalidate all activity completion queries
 */
export const useInvalidateActivityCompletions = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: activityCompletionKeys.all });
  };
};
