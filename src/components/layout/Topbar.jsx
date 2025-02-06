import { useState, useCallback, useMemo, memo } from "react";
import { Bell, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileModal from "../modal/ProfileModal";
import NotificationPopup from "../modal/NotificationPopup";

const SearchInput = memo(
  ({ searchValue, isSearchFocused, onSearchChange, onFocus, onBlur }) => (
    <div
      className={cn(
        "relative flex items-center transition-all duration-300",
        isSearchFocused ? "w-96" : "w-64"
      )}
    >
      <Search
        className={cn(
          "absolute left-3 transition-colors duration-200",
          isSearchFocused ? "text-blue-500" : "text-gray-400",
          "h-4 w-4"
        )}
      />
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search anything..."
        className={cn(
          "pl-10 pr-10 py-2.5 w-full",
          "rounded-xl bg-gray-50",
          "text-sm text-gray-900 placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white",
          "hover:bg-gray-100 focus:hover:bg-white"
        )}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {searchValue && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
        >
          <X className="h-3 w-3 text-gray-400" />
        </button>
      )}
    </div>
  )
);

const Topbar = memo(({ onSearch }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned a new high-priority task",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Task Deadline Approaching",
      message: "The task 'Complete project documentation' is due tomorrow",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Task Status Updated",
      message: "Task 'Review pull requests' has been marked as completed",
      time: "2 hours ago",
      read: true,
    },
  ]);

  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);

      const timeoutId = setTimeout(() => {
        if (onSearch) {
          onSearch(value.trim());
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [onSearch]
  );

  const handleMarkAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const enhancedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        onMarkAsRead: () => handleMarkAsRead(notification.id),
      })),
    [notifications, handleMarkAsRead]
  );

  const handleSearchFocus = useCallback(() => setIsSearchFocused(true), []);
  const handleSearchBlur = useCallback(() => setIsSearchFocused(false), []);
  const toggleProfile = useCallback(() => setShowProfile((prev) => !prev), []);
  const toggleNotifications = useCallback(
    () => setShowNotifications((prev) => !prev),
    []
  );
  const closeProfile = useCallback(() => setShowProfile(false), []);
  const closeNotifications = useCallback(() => setShowNotifications(false), []);

  return (
    <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center"></div>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <SearchInput
              searchValue={searchValue}
              isSearchFocused={isSearchFocused}
              onSearchChange={handleSearch}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </div>

          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200",
                "group relative"
              )}
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-medium">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>
            <NotificationPopup
              notifications={enhancedNotifications}
              isOpen={showNotifications}
              onClose={closeNotifications}
            />
          </div>

          <div className="relative">
            <button
              onClick={toggleProfile}
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-semibold">JD</span>
              </div>
            </button>
            <ProfileModal isOpen={showProfile} onClose={closeProfile} />
          </div>
        </div>
      </div>
    </div>
  );
});

SearchInput.displayName = "SearchInput";
Topbar.displayName = "Topbar";

export default Topbar;
