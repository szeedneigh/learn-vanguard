import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Global error handler for React Query
const defaultQueryFn = async ({ queryKey }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${queryKey[0]}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Create the query client with global configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query function
      queryFn: defaultQueryFn,
      // Stale time: 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache time: 10 minutes
      cacheTime: 1000 * 60 * 10,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Error handling
      onError: (error) => {
        console.error('Query error:', error);
        
        // Show user-friendly error messages
        if (error.message.includes('401')) {
          toast({
            title: 'Authentication Error',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          });
        } else if (error.message.includes('403')) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this resource.',
            variant: 'destructive',
          });
        } else if (error.message.includes('404')) {
          toast({
            title: 'Not Found',
            description: 'The requested resource was not found.',
            variant: 'destructive',
          });
        } else if (error.message.includes('500')) {
          toast({
            title: 'Server Error',
            description: 'An internal server error occurred. Please try again later.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
        }
      },
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        
        // Show user-friendly error messages for mutations
        if (error.response?.data?.message) {
          toast({
            title: 'Operation Failed',
            description: error.response.data.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Operation Failed',
            description: 'Unable to complete the operation. Please try again.',
            variant: 'destructive',
          });
        }
      },
      // Success handling for mutations
      onSuccess: () => {
        // Optional: Global success handling
        console.log('Mutation completed successfully');
      },
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Authentication
  auth: ['auth'],
  user: (id) => ['user', id],
  
  // Tasks
  tasks: ['tasks'],
  task: (id) => ['task', id],
  tasksByUser: (userId) => ['tasks', 'user', userId],
  tasksByStatus: (status) => ['tasks', 'status', status],
  taskSummary: ['tasks', 'summary'],
  
  // Users
  users: ['users'],
  userById: (id) => ['users', id],
  usersByRole: (role) => ['users', 'role', role],
  usersByProgram: (programId, year) => ['users', 'program', programId, 'year', year],
  
  // Events
  events: ['events'],
  event: (id) => ['event', id],
  eventsByDate: (startDate, endDate) => ['events', 'date', startDate, endDate],
  eventsByUser: (userId) => ['events', 'user', userId],
  
  // Resources
  resources: ['resources'],
  resource: (id) => ['resource', id],
  resourcesBySubject: (subjectId) => ['resources', 'subject', subjectId],
  
  // Subjects
  subjects: ['subjects'],
  subject: (id) => ['subject', id],
  subjectsByProgram: (programId, year, semester) => ['subjects', 'program', programId, 'year', year, 'semester', semester],
  
  // Programs
  programs: ['programs'],
  program: (id) => ['program', id],
  
  // Announcements
  announcements: ['announcements'],
  announcement: (id) => ['announcement', id],
};

// Utility functions for cache management
export const invalidateQueries = (queryKey) => {
  return queryClient.invalidateQueries(queryKey);
};

export const setQueryData = (queryKey, data) => {
  return queryClient.setQueryData(queryKey, data);
};

export const getQueryData = (queryKey) => {
  return queryClient.getQueryData(queryKey);
};

// Prefetch function for better UX
export const prefetchQuery = (queryKey, queryFn, options = {}) => {
  return queryClient.prefetchQuery(queryKey, queryFn, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export default queryClient; 