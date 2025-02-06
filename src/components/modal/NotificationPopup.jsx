import { useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationPopup = ({ notifications, isOpen, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={popupRef}
      className={cn(
        "absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50",
        "transition-all duration-300 ease-in-out transform origin-top",
        isOpen 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
      )}
    >
      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={cn(
              "px-4 py-3 hover:bg-gray-50 transition-all duration-300 ease-in-out",
              "transform",
              !notification.read && "bg-blue-50/50",
              isOpen && "translate-x-0 opacity-100",
              !isOpen && "translate-x-4 opacity-0"
            )}
            style={{ 
              transitionDelay: `${index * 75}ms`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full mt-2 transition-colors duration-300",
                notification.read ? "bg-gray-300" : "bg-blue-500"
              )} />
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">{notification.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </div>
              {!notification.read && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.onMarkAsRead(notification.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <Check className="h-4 w-4 text-blue-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPopup;