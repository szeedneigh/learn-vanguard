import logger from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";
import { getCalendarAnnouncements } from "@/lib/api/announcementApi";

/**
 * Query keys for announcements
 */
const queryKeys = {
  announcements: ["announcements"],
  calendar: ["announcements", "calendar"],
};
 * Hook for fetching calendar announcements with access control
 * @param {Object} filters - Optional filters (startDate, endDate)
 * @param {Object} options - React Query options
export const useCalendarAnnouncements = (filters = {}, options = {}) => {
  // Create a stable query key that includes filters
  const enhancedFilters = {
    ...filters,
    // Ensure dates are in consistent format for caching
    startDate: filters.startDate
      ? new Date(filters.startDate).toISOString().split("T")[0]
      : undefined,
    endDate: filters.endDate
      ? new Date(filters.endDate).toISOString().split("T")[0]
  };
  return useQuery({
    queryKey: queryKeys.calendar.concat([enhancedFilters]),
    queryFn: async () => {
      const response = await getCalendarAnnouncements(enhancedFilters);
      logger.log("useCalendarAnnouncements - raw response:", response);
      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch calendar announcements"
        );
      }
      return response;
    },
    select: (response) => {
      // The API returns { success: true, data: [...] }
      const announcements = response?.data || [];
      logger.log(
        `Selected ${announcements.length} announcements from response`
      );
      return announcements;
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
 * Hook for fetching announcements for the events page
 * This combines the calendar announcements with proper data normalization
export const useEventsPageAnnouncements = (filters = {}, options = {}) => {
    queryKey: queryKeys.calendar.concat(["events-page", filters]),
      const response = await getCalendarAnnouncements(filters);
      // Normalize announcements for calendar display
      return announcements.map((announcement) => ({
        ...announcement,
        id: announcement._id || announcement.id,
        type: "announcement", // Mark as announcement type for calendar
        title: announcement.title,
        content: announcement.content,
        date: announcement.dueDate
          ? new Date(announcement.dueDate).toISOString().split("T")[0]
          : null,
        scheduleDate: announcement.dueDate || announcement.createdAt,
        priority: announcement.priority || "medium",
        status: "upcoming", // Default status for announcements
        // Include subject information for display
        subject: announcement.subjectId?.name || "Unknown Subject",
        subjectInfo: announcement.subjectId,
        // Include creator information
        createdBy: announcement.createdBy,
        createdAt: announcement.createdAt,
        // Announcement-specific fields
        announcementType: announcement.type,
        dueDate: announcement.dueDate,
        readBy: announcement.readBy,
        creationSource: announcement.creationSource,
      }));
export default {
  useCalendarAnnouncements,
  useEventsPageAnnouncements,
