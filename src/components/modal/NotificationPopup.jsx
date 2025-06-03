import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import PopoverModal from "@/components/ui/PopoverModal";
import { Loader2 } from "lucide-react";

const NotificationPopup = ({
  notifications = [],
  isOpen,
  onClose,
  triggerRef,
  isLoading = false,
}) => {
  // Helper function to get icon based on notification type
  const getNotificationTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "task":
        return "border-l-blue-500";
      case "event":
        return "border-l-green-500";
      case "announcement":
        return "border-l-amber-500";
      case "system":
        return "border-l-purple-500";
      default:
        return "border-l-gray-500";
    }
  };

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
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4 transition-colors",
                    notification.read ? "bg-gray-50" : "bg-blue-50",
                    getNotificationTypeStyle(notification.type)
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <button
                        onClick={notification.onMarkAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">{notification.time}</p>
                    {notification.type && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {notification.type}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications to display
              </p>
            )}
          </div>
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
      message: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
      onMarkAsRead: PropTypes.func.isRequired,
      type: PropTypes.string,
      referenceId: PropTypes.string,
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  triggerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  isLoading: PropTypes.bool,
};

export default NotificationPopup;
