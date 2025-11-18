import logger from "@/utils/logger";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/context/PermissionContext";
import { Loader2, AlertCircle } from "lucide-react";
import { dashboardRoutes, hasRoutePermission } from "@/lib/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import PropTypes from "prop-types";
import { ROLES } from "@/lib/constants";
import { normalizeRole, checkApiConnection, API_BASE_URL } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import RouteBreadcrumbs from "@/components/navigation/RouteBreadcrumbs";

// Code splitting - lazy load dashboard pages for better performance
const Events = lazy(() => import("@/app/pages/Events"));
const Home = lazy(() => import("@/app/pages/Home"));
const Resources = lazy(() => import("@/app/pages/Resources"));
const Tasks = lazy(() => import("@/app/pages/Tasks"));
const Archive = lazy(() => import("@/app/pages/Archive"));
const Users = lazy(() => import("@/app/pages/Users"));

// Loading fallback for lazy-loaded components
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-muted-foreground">Loading page...</span>
  </div>
);

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
// Layout component that wraps authorized content
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    isChecking: true,
    isConnected: true,
  });
  const { toast } = useToast();
  logger.log("DashboardLayout rendering:", {
    hasChildren: !!children,
    childrenType: children ? typeof children : "none",
    isSidebarOpen,
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkApiConnection(API_BASE_URL);
        logger.log(
          "API connection check result:",
          isConnected,
          "API_BASE_URL:",
          API_BASE_URL
        );
        setApiStatus({ isChecking: false, isConnected });
        if (!isConnected) {
          logger.error("API connection failed - showing toast notification");
          toast({
            title: "API Connection Error",
            description:
              "Unable to connect to the server. Please check your connection.",
            variant: "destructive",
          });
        }
      } catch (error) {
        logger.error("API connection check failed:", error);
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
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the API. Please check your connection and try
            again.
            <p className="mt-2">API URL: {API_BASE_URL}</p>
          </AlertDescription>
        </Alert>
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onMenuClick={toggleSidebar}
          isWebSocketConnected={isConnected}
          connectionStatus={connectionStatus}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <RouteBreadcrumbs className="mb-6" />
          {children}
          <Toaster />
        </main>
    </div>
  );
// Add prop types for DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
const AuthorizedRoute = ({ component: Component, isAuthorized }) => {
  logger.log("AuthorizedRoute rendering:", {
    component: Component?.displayName || Component?.name || "Unknown",
    isAuthorized,
    if (!isAuthorized) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthorized, toast]);
  if (!isAuthorized) {
    logger.log("Route not authorized, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
    <DashboardLayout>
      <Suspense fallback={<PageLoadingFallback />}>
        <Component />
      </Suspense>
    </DashboardLayout>
AuthorizedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
const Dashboard = () => {
  const { user, isLoading: authIsLoading } = useAuth();
  const { hasAllPermissions } = usePermission();
  const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    logger.log("Dashboard: Component mounted", {
      user,
      authIsLoading,
      currentPath: window.location.pathname,
      hasToken: !!token,
      tokenValue: token ? "exists" : "missing",
    });
    if (!authIsLoading && user) {
      logger.log("Dashboard: User authenticated", {
        role: user.role,
        normalizedRole: normalizeRole(user.role),
        permissions: user.permissions,
        currentPath: window.location.pathname,
        token: token ? "exists" : "missing",
      if (window.location.pathname === "/dashboard") {
        const normalizedUserRole = normalizeRole(user.role);
          "Dashboard: At root path, redirecting based on normalized role:",
          normalizedUserRole
        switch (normalizedUserRole) {
          case "admin":
            logger.log("Dashboard: Redirecting admin to users page");
            navigate("/dashboard/users", { replace: true });
            break;
          case "pio":
            logger.log("Dashboard: Redirecting pio to students page");
            navigate("/dashboard/students", { replace: true });
          case "student":
            logger.log("Dashboard: Redirecting student to home page");
            navigate("/dashboard/home", { replace: true });
          default:
            logger.warn("Dashboard: Unknown user role:", normalizedUserRole);
            toast({
              title: "Invalid Role",
              description:
                "Your user account has an invalid role. Please contact support.",
              variant: "destructive",
            });
            navigate("/unauthorized", { replace: true });
    } else if (!authIsLoading && !user) {
      logger.log(
        "Dashboard: No user found after loading, redirecting to login"
      );
      if (token) {
        logger.warn("Dashboard: Token exists but no user data found");
        localStorage.removeItem("authToken");
      navigate("/login", { replace: true });
  }, [user, authIsLoading, navigate, toast]);
  if (authIsLoading) {
    logger.log("Dashboard: Auth is still loading");
      <div className="flex items-center justify-center h-screen bg-blue-50">
          Loading Dashboard...
  if (!user) {
    logger.log("Dashboard: No user found, rendering redirect");
    return <Navigate to="/login" replace />;
  logger.log("Dashboard: Rendering routes for user:", {
    role: user.role,
    normalizedRole: normalizeRole(user.role),
    pathname: window.location.pathname,
    <Routes>
      <Route path="/" element={<Navigate replace to="home" />} />
      {dashboardRoutes.map((route) => {
        const RouteComponent = routeComponents[route.path.split("/")[0]];
        const normalizedRouteRoles = route.allowedRoles.map((role) =>
          normalizeRole(role)
        const hasRole = normalizedRouteRoles.includes(normalizedUserRole);
        const hasPermissions =
          !(route.requiredPermissions ?? []).length ||
          hasAllPermissions(route.requiredPermissions ?? []);
        const isAuthorized = hasRole && hasPermissions;
        logger.log(`Dashboard: Route ${route.path}`, {
          hasComponent: !!RouteComponent,
          userRole: normalizedUserRole,
          hasRole,
          allowedRoles: normalizedRouteRoles,
          hasPermissions,
          isAuthorized,
          requiredPermissions: route.requiredPermissions,
        if (!RouteComponent) {
          logger.warn(`No component found for route: ${route.path}`);
            title: "Route Error",
            description: `No component found for route: ${route.path}`,
          return null;
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
      })}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
export default Dashboard;
