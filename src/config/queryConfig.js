/**
 * React Query Configuration
 *
 * Optimized settings for React Query to reduce unnecessary API calls
 * and improve application performance.
 */

import { QUERY_CONFIG, API_CONFIG } from '@/constants';

/**
 * Default query options for React Query
 * These can be overridden per-query when needed
 */
export const defaultQueryOptions = {
  // ==========================================
  // Caching Configuration
  // ==========================================

  /**
   * Time until data is considered stale (5 minutes)
   * Stale data may be served while revalidating in background
   */
  staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,

  /**
   * Time until inactive query data is garbage collected (10 minutes)
   * After this, the data is removed from cache
   */
  gcTime: QUERY_CONFIG.DEFAULT_CACHE_TIME,

  // ==========================================
  // Refetch Behavior
  // ==========================================

  /**
   * Don't refetch on window focus by default
   * This prevents excessive API calls when switching tabs
   * Enable per-query for real-time data needs
   */
  refetchOnWindowFocus: false,

  /**
   * Don't refetch on mount if data exists
   * Prevents refetching when component remounts with cached data
   */
  refetchOnMount: false,

  /**
   * Don't refetch on reconnect by default
   * Enable for critical data that needs to be fresh
   */
  refetchOnReconnect: false,

  // ==========================================
  // Retry Configuration
  // ==========================================

  /**
   * Number of retry attempts on failure
   */
  retry: API_CONFIG.MAX_RETRIES,

  /**
   * Delay between retries (exponential backoff)
   */
  retryDelay: (attemptIndex) =>
    Math.min(API_CONFIG.RETRY_DELAY_BASE * 2 ** attemptIndex, 30000),

  /**
   * Only retry on certain conditions
   */
  retryOnMount: false,
};

/**
 * Query options for frequently changing data
 * Use for dashboards, notifications, real-time features
 */
export const realtimeQueryOptions = {
  ...defaultQueryOptions,
  staleTime: QUERY_CONFIG.SHORT_STALE_TIME, // 30 seconds
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  refetchInterval: 60000, // Refetch every minute
};

/**
 * Query options for rarely changing data
 * Use for user profiles, settings, static content
 */
export const staticQueryOptions = {
  ...defaultQueryOptions,
  staleTime: QUERY_CONFIG.LONG_STALE_TIME, // 30 minutes
  gcTime: 60 * 60 * 1000, // 1 hour
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

/**
 * Query options for user-specific data
 * Use for user profile, preferences
 */
export const userDataQueryOptions = {
  ...defaultQueryOptions,
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
};

/**
 * Query options for list data with pagination
 * Use for task lists, resource lists, user lists
 */
export const listQueryOptions = {
  ...defaultQueryOptions,
  staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
  keepPreviousData: true, // Keep showing previous page while loading next
};

/**
 * Mutation options with optimistic updates
 * @param {Object} queryClient - React Query client instance
 * @param {string} queryKey - Query key to invalidate
 */
export const optimisticMutationOptions = (queryClient, queryKey) => ({
  onMutate: async (newData) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData(queryKey);

    return { previousData };
  },
  onError: (_err, _newData, context) => {
    // Rollback on error
    if (context?.previousData) {
      queryClient.setQueryData(queryKey, context.previousData);
    }
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey });
  },
});

/**
 * Create query client with optimized defaults
 */
export const createQueryClientConfig = () => ({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: {
      retry: 1,
      retryDelay: API_CONFIG.RETRY_DELAY_BASE,
    },
  },
});

/**
 * Query key factory for consistent key generation
 * Helps with cache invalidation and organization
 */
export const queryKeys = {
  // User queries
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
    profile: () => [...queryKeys.users.all, 'profile'],
  },

  // Task queries
  tasks: {
    all: ['tasks'],
    lists: () => [...queryKeys.tasks.all, 'list'],
    list: (filters) => [...queryKeys.tasks.lists(), filters],
    details: () => [...queryKeys.tasks.all, 'detail'],
    detail: (id) => [...queryKeys.tasks.details(), id],
    summary: () => [...queryKeys.tasks.all, 'summary'],
    userTasks: (userId) => [...queryKeys.tasks.all, 'user', userId],
  },

  // Resource queries
  resources: {
    all: ['resources'],
    lists: () => [...queryKeys.resources.all, 'list'],
    list: (filters) => [...queryKeys.resources.lists(), filters],
    details: () => [...queryKeys.resources.all, 'detail'],
    detail: (id) => [...queryKeys.resources.details(), id],
    bySubject: (subjectId) => [...queryKeys.resources.all, 'subject', subjectId],
  },

  // Event queries
  events: {
    all: ['events'],
    lists: () => [...queryKeys.events.all, 'list'],
    list: (filters) => [...queryKeys.events.lists(), filters],
    details: () => [...queryKeys.events.all, 'detail'],
    detail: (id) => [...queryKeys.events.details(), id],
    upcoming: () => [...queryKeys.events.all, 'upcoming'],
  },

  // Announcement queries
  announcements: {
    all: ['announcements'],
    lists: () => [...queryKeys.announcements.all, 'list'],
    list: (filters) => [...queryKeys.announcements.lists(), filters],
    details: () => [...queryKeys.announcements.all, 'detail'],
    detail: (id) => [...queryKeys.announcements.details(), id],
  },

  // Notification queries
  notifications: {
    all: ['notifications'],
    unread: () => [...queryKeys.notifications.all, 'unread'],
    count: () => [...queryKeys.notifications.all, 'count'],
  },
};

export default {
  defaultQueryOptions,
  realtimeQueryOptions,
  staticQueryOptions,
  userDataQueryOptions,
  listQueryOptions,
  optimisticMutationOptions,
  createQueryClientConfig,
  queryKeys,
};
