import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import Events from "@/app/pages/Events";
import Home from "@/app/pages/Home";
import Resources from "@/app/pages/Resources";
import Tasks from "@/app/pages/Tasks";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Archive from "@/app/pages/Archive";
import Users from "@/app/pages/Users";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/context/PermissionContext";
import { Loader2, AlertCircle } from "lucide-react";
import { dashboardRoutes } from "@/lib/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import PropTypes from "prop-types";
import { normalizeRole, checkApiConnection, API_BASE_URL } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Map route paths to components
const routeComponents = {
  home: Home,
  tasks: Tasks,
  resources: Resources,
  events: Events,
  archive: Archive,
  users: Users,
  students: Users,
};

// OPTIMIZED Layout component with proper CSS Grid and scroll containment
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    isChecking: true,
    isConnected: true,
  });
  const { toast } = useToast();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkApiConnection(API_BASE_URL);
        console.log(
          "API connection check result:",
          isConnected,
          "API_BASE_URL:",
          API_BASE_URL
        );
        setApiStatus({ isChecking: false, isConnected });

        if (!isConnected) {
          console.error("API connection failed - showing toast notification");
          toast({
            title: "API Connection Error",
            description:
              "Unable to connect to the server. Please check your connection.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("API connection check failed:", error);
        setApiStatus({ isChecking: false, isConnected: false });
        toast({
          title: "API Error",
          description:
            "Failed to check API connection. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };
    checkConnection();
  }, [toast]);

  // Initialize WebSocket connection for real-time features
  const { isConnected, connectionStatus } = useWebSocket();

  if (apiStatus.isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg font-medium text-muted-foreground">
          Checking API connection...
        </p>
      </div>
    );
  }

  if (!apiStatus.isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the API. Please check your connection and try
            again.
            <p className="mt-2">API URL: {API_BASE_URL}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    // Fixed viewport container with overflow hidden
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      {/* 
        OPTIMIZED CSS Grid Layout:
        - Sidebar column: auto-width (sizes to content)
        - Main content column: 1fr (takes remaining space)
        - Single row: 1fr (full height)
        - This ensures sidebar stays fixed and main content scrolls independently
      */}
      <div 
        className="grid h-full w-full"
        style={{ 
          gridTemplateColumns: 'auto 1fr',
          gridTemplateRows: '1fr'
        }}
      >
        {/* 
          Sidebar Container - Grid cell with proper constraints
          - relative positioning within grid cell
          - z-index for proper layering
          - overflow handled by Sidebar component internally
        */}
        <div className="relative z-10 h-full">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        </div>
        
        {/* 
          Main Content Container - Grid cell with scroll containment
          - flex column layout for header + scrollable content
          - min-w-0 prevents flex items from overflowing
          - overflow-hidden ensures proper scroll containment
        */}
        <div className="flex flex-col min-w-0 h-full overflow-hidden">
          {/* 
            Topbar - Fixed height header
            - flex-shrink-0 prevents compression
            - relative z-index for proper layering
          */}
          <header className="flex-shrink-0 z-20 relative">
            <Topbar
              onMenuClick={toggleSidebar}
              isWebSocketConnected={isConnected}
              connectionStatus={connectionStatus}
            />
          </header>
          
          {/* 
            Main Content Area - Scrollable container
            - flex-1 takes remaining height after header
            - overflow-y-auto provides vertical scrolling
            - scroll-smooth for better UX
            - proper background for content area
          */}
          <main className="flex-1 overflow-y-auto bg-gray-100 scroll-smooth">
            {/* 
              Content wrapper with consistent padding
              - min-h-full ensures content fills available height
              - proper padding for all screen sizes
            */}
            <div className="p-4 sm:p-6 min-h-full">
              {/* 
                Children container with width constraint
                - w-full ensures full width usage
                - Contains actual page content
              */}
              <div className="w-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* 
        Toast notifications - positioned outside main layout
        - Portal-ed to body to avoid layout interference
        - Proper z-index for visibility
      */}
      <Toaster />
    </div>
  );
};

// Add prop types for DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

const AuthorizedRoute = ({ component: Component, isAuthorized }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthorized) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthorized, toast]);

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
};

AuthorizedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
};

const Dashboard = () => {
  const { user, isLoading: authIsLoading } = useAuth();
  const { hasAllPermissions } = usePermission();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!authIsLoading && user) {
      if (window.location.pathname === "/dashboard") {
        const normalizedUserRole = normalizeRole(user.role);

        switch (normalizedUserRole) {
          case "admin":
            navigate("/dashboard/users", { replace: true });
            break;
          case "pio":
            navigate("/dashboard/students", { replace: true });
            break;
          case "student":
            navigate("/dashboard/home", { replace: true });
            break;
          default:
            toast({
              title: "Invalid Role",
              description:
                "Your user account has an invalid role. Please contact support.",
              variant: "destructive",
            });
            navigate("/unauthorized", { replace: true });
            break;
        }
      }
    } else if (!authIsLoading && !user) {
      if (token) {
        localStorage.removeItem("authToken");
      }
      navigate("/login", { replace: true });
    }
  }, [user, authIsLoading, navigate, toast]);

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg font-medium text-muted-foreground">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="home" />} />

      {dashboardRoutes.map((route) => {
        const RouteComponent = routeComponents[route.path.split("/")[0]];

        const normalizedUserRole = normalizeRole(user.role);
        const normalizedRouteRoles = route.allowedRoles.map((role) =>
          normalizeRole(role)
        );

        const hasRole = normalizedRouteRoles.includes(normalizedUserRole);
        const hasPermissions =
          !(route.requiredPermissions ?? []).length ||
          hasAllPermissions(route.requiredPermissions ?? []);
        const isAuthorized = hasRole && hasPermissions;

        if (!RouteComponent) {
          toast({
            title: "Route Error",
            description: `No component found for route: ${route.path}`,
            variant: "destructive",
          });
          return null;
        }

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AuthorizedRoute
                component={RouteComponent}
                isAuthorized={isAuthorized}
              />
            }
          />
        );
      })}

      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};

export default Dashboard;
