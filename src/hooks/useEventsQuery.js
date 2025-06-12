import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getEvents,
  getTodayEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/api/eventApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for fetching events with filters
 * @param {Object} filters - Query filters (startDate, endDate, course, yearLevel, etc.)
 * @param {Object} options - React Query options
 */
export const useEvents = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.events.concat([filters]),
    queryFn: async () => {
      const response = await getEvents(filters);
      // Log the raw response for debugging
      console.log(`Raw API response for ${JSON.stringify(filters)}:`, response);
      return response;
    },
    select: (response) => {
      const events = response?.data || [];
      // Log the selected data
      console.log(`Selected ${events.length} events from response`);
      return events;
    },
    ...options,
  });
};

/**
 * Hook for fetching events by date range
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @param {Object} options - React Query options
 */
export const useEventsByDate = (startDate, endDate, options = {}) => {
  return useQuery({
    queryKey: queryKeys.eventsByDate(startDate, endDate),
    queryFn: () => getEvents({ startDate, endDate }),
    select: (data) => data?.data || [],
    enabled: !!(startDate && endDate),
    ...options,
  });
};

/**
 * Hook for fetching today's events
 * @param {Object} options - React Query options
 */
export const useTodayEvents = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.events.concat(["today"]),
    queryFn: () => getTodayEvents(),
    select: (data) => data?.data || [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook for creating a new event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (eventData) => createEvent(eventData),
    onSuccess: (data) => {
      // Invalidate and refetch events queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events });

      toast({
        title: "Success",
        description: data.message || "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to create event",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating an existing event
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ eventId, eventData }) => updateEvent(eventId, eventData),
    onSuccess: (data) => {
      // Invalidate and refetch events queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events });

      toast({
        title: "Success",
        description: data.message || "Event updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update event",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (eventId) => deleteEvent(eventId),
    onSuccess: (data) => {
      // Invalidate and refetch events queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events });

      toast({
        title: "Success",
        description: data.message || "Event deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to delete event",
        variant: "destructive",
      });
    },
  });
};

/**
 * Comprehensive hook that combines all event-related functionality
 * for the Events page component
 */
export const useEventsPage = (filters = {}) => {
  // Main queries
  const eventsQuery = useEvents(filters);
  const todayEventsQuery = useTodayEvents();

  // Mutations
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Computed values
  const events = eventsQuery.data || [];
  const todayEvents = todayEventsQuery.data || [];

  // Filter events for calendar view
  const calendarEvents = events.map((event) => ({
    id: event.id || event._id, // Handle both id formats
    title: event.title,
    start: new Date(event.scheduleDate || event.startDate),
    end: event.endDate
      ? new Date(event.endDate)
      : new Date(event.scheduleDate || event.startDate),
    allDay: event.allDay || false,
    resource: event,
  }));

  return {
    // Data
    events,
    todayEvents,
    calendarEvents,

    // Loading states
    isLoading: eventsQuery.isLoading || todayEventsQuery.isLoading,
    isError: eventsQuery.isError || todayEventsQuery.isError,
    error: eventsQuery.error || todayEventsQuery.error,

    // Refetch functions
    refetch: () => {
      eventsQuery.refetch();
      todayEventsQuery.refetch();
    },

    // Mutations
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,

    // Mutation loading states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,

    // Any mutation loading
    isMutating:
      createEventMutation.isPending ||
      updateEventMutation.isPending ||
      deleteEventMutation.isPending,
  };
};
