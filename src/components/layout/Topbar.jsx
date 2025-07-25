import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileModal from "../modal/ProfileModal";
import NotificationPopup from "../modal/NotificationPopup";
import { useAuth } from "@/context/AuthContext";
import PropTypes from "prop-types";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { getUserInitials } from "@/utils/userUtils";
import { useToast } from "@/hooks/use-toast";

// Feature flag to temporarily hide notifications
// Set to false to hide notifications, true to show them
const SHOW_NOTIFICATIONS = false;

const Topbar = memo(({ onMenuClick }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const notificationButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const { toast } = useToast();

  console.log("Topbar rendering:", {
    user: user
      ? {
          role: user.role,
          id: user.id,
          name:
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        }
      : "No user",
    isMobile,
    onMenuClick: !!onMenuClick,
  });

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getUserNotifications();
      console.log("Topbar: notifications fetched", result);
      if (result.success && Array.isArray(result.data)) {
        // Transform the notifications to match our UI format
        const formattedNotifications = result.data.map((notification) => {
          // Format the notification title for activity-related announcements
          let title = notification.title;
          let subjectName = notification.subjectName || "";

          // Extract subject info if available
          if (notification.subjectId && notification.subjectId.name) {
            subjectName = notification.subjectId.name;
          }

          // For activity-created announcements, simplify the title
          if (notification.type === "announcement" && title.startsWith("New")) {
            // Keep the simplified title format (e.g., "New assignment: Assignment 2")
            title = title.split("\n")[0]; // Take only the first line
          }

          return {
            id: notification._id,
            title: title,
            message: notification.message,
            time: formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            }),
            read: notification.isRead,
            type: notification.type,
            referenceId: notification.referenceId,
            createdAt: notification.createdAt,
            dueDate: notification.dueDate,
            subjectId: notification.subjectId?._id || notification.subjectId,
            subjectName: subjectName,
            topicId: notification.topicId,
          };
        });
        setNotifications(formattedNotifications);
      } else {
        console.error("Invalid notification data format:", result);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notifications on component mount (only if notifications are enabled)
  useEffect(() => {
    if (SHOW_NOTIFICATIONS) {
      fetchNotifications();

      // Refresh notifications every 2 minutes
      const intervalId = setInterval(fetchNotifications, 2 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        const result = await markNotificationAsRead(notificationId);
        if (result.success) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification
            )
          );
          toast({
            title: "Success",
            description: "Notification marked as read",
          });
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      try {
        const result = await deleteNotification(notificationId);
        if (result.success) {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== notificationId)
          );
          toast({
            title: "Success",
            description: "Notification deleted",
          });
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const enhancedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        onMarkAsRead: () => handleMarkAsRead(notification.id),
        onDelete: () => handleDeleteNotification(notification.id),
      })),
    [notifications, handleMarkAsRead, handleDeleteNotification]
  );

  const toggleProfile = useCallback(() => setShowProfile((prev) => !prev), []);
  const toggleNotifications = useCallback(() => {
    if (SHOW_NOTIFICATIONS) {
      setShowNotifications((prev) => !prev);
      // Fetch fresh notifications when opening the popup
      if (!showNotifications) {
        fetchNotifications();
      }
    }
  }, [fetchNotifications, showNotifications]);
  const closeProfile = useCallback(() => setShowProfile(false), []);
  const closeNotifications = useCallback(() => setShowNotifications(false), []);

  return (
    <div className="bg-white shadow-sm px-4 sm:px-6 py-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        {/* Left side - Menu button on mobile */}
        <div className="flex items-center">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 mr-2 rounded-xl transition-all duration-200 hover:bg-gray-100 active:bg-gray-200"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Right side - Notifications, profile */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Conditionally render notifications based on feature flag */}
          {SHOW_NOTIFICATIONS && (
            <div className="relative">
              <button
                ref={notificationButtonRef}
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
                triggerRef={notificationButtonRef}
                isLoading={isLoading}
              />
            </div>
          )}

          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={toggleProfile}
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User avatar"}
                  className="w-8 h-8 rounded-lg object-cover shadow-sm"
                  key={user.avatarUrl}
                  onError={(e) => {
                    // If avatar fails to load, replace with initials
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    // Create a fallback div with initials
                    const parent = e.target.parentNode;
                    if (!parent.querySelector(".avatar-fallback")) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm avatar-fallback";
                      const span = document.createElement("span");
                      span.className = "text-white text-sm font-semibold";
                      span.textContent = user
                        ? getUserInitials(
                            user.firstName,
                            user.lastName,
                            user.name
                          )
                        : "";
                      fallback.appendChild(span);
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-semibold">
                    {user
                      ? getUserInitials(
                          user.firstName,
                          user.lastName,
                          user.name
                        )
                      : ""}
                  </span>
                </div>
              )}
            </button>
            <ProfileModal
              isOpen={showProfile}
              onClose={closeProfile}
              user={user}
              triggerRef={profileButtonRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

Topbar.displayName = "Topbar";

Topbar.propTypes = {
  onMenuClick: PropTypes.func,
};

export default Topbar;
