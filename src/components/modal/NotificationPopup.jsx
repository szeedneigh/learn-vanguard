import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import PopoverModal from '@/components/ui/PopoverModal';

const NotificationPopup = ({ notifications = [], isOpen, onClose, triggerRef }) => {
  return (
    <PopoverModal
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      className="w-80"
      align="end"
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg transition-colors",
                  notification.read ? "bg-gray-50" : "bg-blue-50"
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
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No notifications to display
            </p>
          )}
        </div>
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
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  triggerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default NotificationPopup;