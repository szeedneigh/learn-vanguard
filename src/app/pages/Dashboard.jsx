import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useCallback } from "react";
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
import { Loader2 } from "lucide-react";
import { dashboardRoutes } from "@/lib/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import PropTypes from "prop-types";

// Map route paths to components
const routeComponents = {
  home: Home,
  tasks: Tasks,
  resources: Resources,
  events: Events,
  archive: Archive,
  users: Users,
  students: Users
};

// Layout component that wraps authorized content
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Initialize WebSocket connection for real-time features
  const { isConnected, connectionStatus } = useWebSocket();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          onMenuClick={toggleSidebar} 
          isWebSocketConnected={isConnected}
          connectionStatus={connectionStatus}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
};

// Add prop types for DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired
};

const AuthorizedRoute = ({ component: Component, isAuthorized }) => {
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authorized, render the component within the dashboard layout
  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
};

AuthorizedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  isAuthorized: PropTypes.bool.isRequired
};

const Dashboard = () => {
  const { user, isLoading: authIsLoading } = useAuth();
  const { hasAllPermissions } = usePermission();

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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
      {/* Default route redirects to home */}
      <Route path="/" element={<Navigate replace to="home" />} />
      
      {/* Map all dashboard routes */}
      {dashboardRoutes.map((route) => {
        const RouteComponent = routeComponents[route.path];
        
        const hasRole = (route.allowedRoles ?? []).includes(user.role);
        
        const hasPermissions =
          !(route.requiredPermissions ?? []).length ||
          hasAllPermissions(route.requiredPermissions ?? []);
        
        const isAuthorized = hasRole && hasPermissions;
        
        if (!RouteComponent) {
          console.warn(`No component found for route: ${route.path}`);
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
      
      {/* Catch-all route redirects to unauthorized */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};

export default Dashboard;