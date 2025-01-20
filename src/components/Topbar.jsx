import { useState, useRef, useEffect } from 'react';
import { Bell, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileModal from './ProfileModal';

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
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
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

const Topbar = ({ onSearch }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned a new high-priority task",
      time: "5 minutes ago",
      read: false
    },
    {
      id: 2,
      title: "Task Deadline Approaching",
      message: "The task 'Complete project documentation' is due tomorrow",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "Task Status Updated",
      message: "Task 'Review pull requests' has been marked as completed",
      time: "2 hours ago",
      read: true
    }
  ]);

  const handleSearch = (value) => {
    setSearchValue(value);

    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(value.trim());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const enhancedNotifications = notifications.map(notification => ({
    ...notification,
    onMarkAsRead: handleMarkAsRead
  }));

  return (
    <>
      <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
          </div>

          {/* Right side - Search and Actions */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <div className={cn(
                "relative flex items-center transition-all duration-300",
                isSearchFocused ? "w-96" : "w-64"
              )}>
                <Search className={cn(
                  "absolute left-3 transition-colors duration-200",
                  isSearchFocused ? "text-blue-500" : "text-gray-400",
                  "h-4 w-4"
                )} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search anything..."
                  className={cn(
                    "pl-10 pr-10 py-2.5 w-full",
                    "rounded-xl bg-gray-50",
                    "text-sm text-gray-900 placeholder:text-gray-400",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white",
                    "hover:bg-gray-100 focus:hover:bg-white"
                  )}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchValue && (
                  <button 
                    onClick={() => handleSearch('')}
                    className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Button */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200",
                "group relative"
                )}
              >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-medium">{unreadCount}</span>
                  </span>
                )}
              </button>
              <NotificationPopup 
                notifications={enhancedNotifications}
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Profile Button */}
            <button 
              onClick={() => setShowProfileModal(true)}
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-semibold">JD</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Topbar;