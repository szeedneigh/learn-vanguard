import apiClient from "./client";

/**
 * Notification API Service
 * Handles all notification-related API calls to the backend
 */

/**
 * Get user notifications
 * @param {Object} params - Query parameters (limit, page, isRead)
 * @returns {Promise<Object>} Notifications list
 */
export const getUserNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get("/notifications", { params });
    // Ensure we always return an array, even if the API returns null or an object
    const notifications = Array.isArray(response.data) ? response.data : [];
    return {
      data: notifications,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      data: [],
      success: false,
      error: error.response?.data?.message || "Failed to fetch notifications",
    };
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Result
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`
    );
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to mark notification as read",
    };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Result
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch("/notifications/read-all");
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to mark all notifications as read",
    };
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Result
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete notification",
    };
  }
};

export default {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
