import logger from "@/utils/logger";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import PopoverModal from "@/components/ui/PopoverModal";
import { Loader2, Trash2, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

const NotificationPopup = ({
  notifications = [],
  isOpen,
  onClose,
  triggerRef,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  // Helper function to get icon based on notification type
  const getNotificationTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "task":
        return "border-l-blue-500";
      case "event":
        return "border-l-green-500";
      case "announcement":
        return "border-l-amber-500";
      case "subject":
      case "activity":
        return "border-l-purple-500";
      case "system":
      default:
        return "border-l-gray-500";
    }
  };
  // Handle notification click to navigate to the source
  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.read) {
      notification.onMarkAsRead();
    // Close the notification popup
    onClose();
    try {
      // Navigate based on notification type
      if (notification.type?.toLowerCase() === "task") {
        navigate("/dashboard/tasks");
      } else if (notification.type?.toLowerCase() === "event") {
        navigate("/dashboard/events");
      } else if (
        notification.type?.toLowerCase() === "announcement" ||
        notification.type?.toLowerCase() === "subject" ||
        notification.type?.toLowerCase() === "activity"
      ) {
        // For subject, announcement, or activity notifications
        if (notification.topicId) {
          // Navigate directly to topic without timeouts
          navigate(`/dashboard/resources/topics/${notification.topicId}`);
        } else if (notification.subjectId) {
          // Check if it's a MongoDB ObjectId string or an object with _id
          const subjectId =
            typeof notification.subjectId === "object"
              ? notification.subjectId._id
              : notification.subjectId;
          // Navigate directly to subject without timeouts
          navigate(`/dashboard/resources/${subjectId}`);
        } else {
          // Default to resources page for any other notification type
          navigate("/dashboard/resources");
        }
      } else {
        // Default to resources page for any other notification type
        navigate("/dashboard/resources");
      }
    } catch (error) {
      logger.error("Navigation error:", error);
      // Fallback to dashboard if navigation fails
      navigate("/dashboard");
  return (
    <PopoverModal
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      className="w-80"
      align="end"
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notifications
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">
              Loading notifications...
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.length > 0 ? (
              <ScrollArea className="h-[300px] pr-3 overflow-auto">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 transition-colors cursor-pointer",
                        notification.read ? "bg-gray-50" : "bg-blue-50",
                        getNotificationTypeStyle(notification.type)
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.onMarkAsRead();
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.onDelete();
                            }}
                            className="text-xs text-red-500 hover:text-red-600 flex items-center"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {notification.subjectName && (
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.subjectName}
                        </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">
                          {notification.time}
                        {notification.type && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {notification.type}
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications to display
              </p>
            )}
        )}
      </div>
    </PopoverModal>
  );
};
NotificationPopup.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      time: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
      onMarkAsRead: PropTypes.func.isRequired,
      onDelete: PropTypes.func.isRequired,
      type: PropTypes.string,
      referenceId: PropTypes.string,
      subjectId: PropTypes.string,
      subjectName: PropTypes.string,
      topicId: PropTypes.string,
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  triggerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  isLoading: PropTypes.bool,
export default NotificationPopup;
