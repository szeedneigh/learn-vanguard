import { useState, useCallback, memo, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import {
  ChevronLeft,
  ChevronRight
  // Removed X import since we won't need it anymore
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getNavigationByRole } from "@/lib/navigation";

const NavigationItem = memo(({ item, isCollapsed, isActive }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center rounded-xl group",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "justify-center p-3" : "px-4 py-3",
        "hover:scale-[1.02] hover:shadow-md",
        isActive
          ? "bg-blue-50 text-blue-600 shadow-sm"
          : "text-gray-600 hover:bg-gray-50"
      )}
      title={isCollapsed ? item.name : undefined}
      aria-label={item.description || item.name}
    >
      <Icon
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "h-6 w-6" : "h-5 w-5",
          isActive ? "scale-110" : "",
          "group-hover:rotate-3"
        )}
      />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100 ml-3"
        )}
      >
        <span
          className={cn(
            "font-medium whitespace-nowrap",
            isActive ? "font-semibold" : ""
          )}
        >
          {item.name}
        </span>
      </div>
    </Link>
  );
});

NavigationItem.displayName = "NavigationItem";

NavigationItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string,
  }).isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
};

const ToggleButton = memo(({ isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "absolute -right-3 top-20 bg-white rounded-full shadow-lg",
      "p-1.5 hover:bg-gray-50 hover:scale-110",
      "transition-all duration-150 ease-in-out",
      "hover:shadow-md active:scale-95"
    )}
    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    {isCollapsed ? (
      <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-300" />
    ) : (
      <ChevronLeft className="h-4 w-4 text-gray-600 transition-transform duration-300" />
    )}
  </button>
));

ToggleButton.displayName = "ToggleButton";

ToggleButton.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  // Convert to state variable
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  // Track touch start position for swipe detection
  const [touchStartX, setTouchStartX] = useState(null);

  // Effect to handle resize events
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      if (!newIsMobile) {
        // Reset mobile sidebar state when returning to desktop
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Handle touch start event for swipe detection
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  // Handle touch move event for swipe detection
  const handleTouchMove = useCallback((e) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // If swiping left (diff > 0) and the swipe is significant enough (> 50px)
    if (diff > 50) {
      onClose();
      setTouchStartX(null);
    }
  }, [touchStartX, onClose]);

  // Reset touch tracking when touch ends without a swipe
  const handleTouchEnd = useCallback(() => {
    setTouchStartX(null);
  }, []);

  const filteredNavigation = useMemo(() => {
    return getNavigationByRole(user);
  }, [user]);

  return (
    <>
      {/* Mobile overlay - clicking anywhere on it will close the sidebar */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "flex flex-col min-h-screen bg-white shadow-xl relative z-50",
          "transition-all duration-300 ease-in-out",
          // Mobile styles
          isMobile ? (
            cn(
              "fixed left-0 top-0 h-full",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )
          ) : (
            // Desktop styles
            isCollapsed ? "w-20" : "w-64"
          )
        )}
        // Add touch event handlers for swipe to close
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        {/* Removed the X button for mobile */}
        
        {/* Add a subtle swipe indicator for mobile */}
        {isMobile && (
          <div className="absolute right-0 top-1/2 h-24 w-1 bg-gray-300 rounded-l opacity-30" />
        )}

        {/* Only show toggle button on desktop */}
        {!isMobile && <ToggleButton isCollapsed={isCollapsed} onClick={handleToggle} />}

        {/* Header Section with Gradient Background */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600">
          <div
            className={cn(
              "flex items-center h-[76px]",
              isCollapsed && !isMobile ? "justify-center px-4" : "px-6 space-x-3"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center flex-shrink-0",
                isCollapsed && !isMobile ? "w-12 h-12" : "w-10 h-10"
              )}
            >
              <img
                src="/images/headLogoV2.png"
                alt="logo"
                loading="lazy"
                className={cn(
                  "rounded-xl",
                  isCollapsed && !isMobile ? "w-12 h-12" : "w-10 h-10"
                )}
              />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="w-32">
                <span className="font-semibold text-white text-lg whitespace-nowrap">
                  Student <br /> Resource Hub
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section - remains unchanged */}
        <nav
          className={cn("flex-1", isCollapsed && !isMobile ? "px-2 py-4" : "p-4", "space-y-2")}
        >
          {isLoading ? (
             <div className="flex justify-center items-center h-full text-gray-500">
               Loading Nav...
             </div>
          ) : (
            filteredNavigation.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                isCollapsed={isCollapsed && !isMobile}
                isActive={location.pathname === item.href}
              />
            ))
          )}
        </nav>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};

export default memo(Sidebar);
