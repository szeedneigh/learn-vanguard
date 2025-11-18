import logger from "@/utils/logger";
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
  // Add includeTasks parameter to filters by default for calendar views
  const enhancedFilters = {
    ...filters,
    includeTasks:
      filters.includeTasks !== undefined ? filters.includeTasks : "true",
  };
  return useQuery({
    queryKey: queryKeys.events.concat([enhancedFilters]),
    queryFn: () => getEvents(enhancedFilters),
    select: (response) => {
      // The eventApi.getEvents returns the full axios response
      // The backend returns the array directly in response.data
      logger.log("useEvents select - raw response:", response);
      logger.log("useEvents select - response type:", typeof response);
      logger.log(
        "useEvents select - response.data type:",
        typeof response?.data
      );
        "useEvents select - response.data is array:",
        Array.isArray(response?.data)
      // Try multiple ways to extract the data
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
        logger.log("useEvents select - using response.data (array)");
      } else if (Array.isArray(response)) {
        data = response;
        logger.log("useEvents select - using response directly (array)");
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        logger.log("useEvents select - using response.data.data (nested)");
      } else {
        logger.warn("useEvents: Could not find array data in response:", {
          response,
          responseData: response?.data,
          responseType: typeof response,
          responseDataType: typeof response?.data,
        });
        data = [];
      }
      logger.log("useEvents select - final data:", {
        length: data.length,
        firstItem: data[0],
        isArray: Array.isArray(data),
      });
      return data;
    },
    ...options,
  });
};
 * Hook for fetching only events (excluding tasks) - useful for upcoming deadlines
export const useEventsOnly = (filters = {}, options = {}) => {
  // Exclude tasks from the response completely
    includeTasks: "false",
    excludeTasksFromResponse: "true",
    queryFn: async () => {
      const response = await getEvents(enhancedFilters);
      // Log the raw response for debugging
        `Raw API response for ${JSON.stringify(enhancedFilters)}:`,
        response
      return response;
      const events = response?.data || [];
      // Log the selected data
      logger.log(`Selected ${events.length} events/tasks from response`);
      return events;
 * Hook for fetching events by date range
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
export const useEventsByDate = (startDate, endDate, options = {}) => {
    queryKey: queryKeys.eventsByDate(startDate, endDate),
    queryFn: () => getEvents({ startDate, endDate }),
    select: (data) => data?.data || [],
    enabled: !!(startDate && endDate),
 * Hook for fetching today's events
export const useTodayEvents = (options = {}) => {
    queryKey: queryKeys.events.concat(["today"]),
    queryFn: () => getTodayEvents(),
      // The eventApi.getTodayEvents returns { data: [...], success: true }
      logger.log("useTodayEvents select - raw response:", response);
        return response.data;
        return response;
        logger.warn(
          "useTodayEvents: API response.data is not an array:",
          response
        );
        return [];
    staleTime: 1000 * 60 * 5, // 5 minutes
 * Hook for creating a new event
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
    onError: (error) => {
        title: "Error",
        description: error.error || "Failed to create event",
        variant: "destructive",
 * Hook for updating an existing event
export const useUpdateEvent = () => {
    mutationFn: ({ eventId, eventData }) => updateEvent(eventId, eventData),
        description: data.message || "Event updated successfully",
        description: error.error || "Failed to update event",
 * Hook for deleting an event
export const useDeleteEvent = () => {
    mutationFn: (eventId) => deleteEvent(eventId),
        description: data.message || "Event deleted successfully",
        description: error.error || "Failed to delete event",
 * Comprehensive hook that combines all event-related functionality
 * for the Events page component
export const useEventsPage = (filters = {}) => {
  logger.log("useEventsPage called with filters:", filters);
  // Main queries
  const eventsQuery = useEvents(filters);
  const todayEventsQuery = useTodayEvents();
  logger.log("useEventsPage query states:", {
    eventsQuery: {
      isLoading: eventsQuery.isLoading,
      isError: eventsQuery.isError,
      error: eventsQuery.error?.message,
      data: eventsQuery.data,
      dataType: typeof eventsQuery.data,
      dataLength: Array.isArray(eventsQuery.data)
        ? eventsQuery.data.length
        : "N/A",
    todayEventsQuery: {
      isLoading: todayEventsQuery.isLoading,
      isError: todayEventsQuery.isError,
      error: todayEventsQuery.error?.message,
      data: todayEventsQuery.data,
      dataType: typeof todayEventsQuery.data,
      dataLength: Array.isArray(todayEventsQuery.data)
        ? todayEventsQuery.data.length
  // Mutations
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  // Computed values - ensure they are always arrays
  const events = Array.isArray(eventsQuery.data) ? eventsQuery.data : [];
  const todayEvents = Array.isArray(todayEventsQuery.data)
    ? todayEventsQuery.data
    : [];
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
