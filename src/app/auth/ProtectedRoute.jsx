import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/context/PermissionContext";
import { useEffect, useState } from "react";

/**
 * Protected route component that enforces authentication and authorization
 * @param {Object} props - Component props
 * @param {Array} [props.allowedRoles] - Array of roles that can access this route
 * @param {Array} [props.requiredPermissions] - Array of permissions required to access this route
 * @param {string} [props.redirectPath] - Path to redirect to if unauthorized, defaults to /unauthorized
 */
const ProtectedRoute = ({
  allowedRoles = null,
  requiredPermissions = null,
  redirectPath = "/unauthorized",
  children,
}) => {
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuth();
  const { hasAllPermissions } = usePermission();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const MAX_VERIFICATION_ATTEMPTS = 3;

  // Handle token verification for edge cases
  useEffect(() => {
    const hasToken = !!localStorage.getItem("authToken");

    if (
      !isAuthenticated &&
      hasToken &&
      !user &&
      !isLoading &&
      !isVerifying &&
      verificationAttempts < MAX_VERIFICATION_ATTEMPTS
    ) {
      console.log(
        "ProtectedRoute: Token exists but not authenticated, trying to refresh auth state"
      );
      setIsVerifying(true);

      // Try to refresh auth state
      refreshAuth().finally(() => {
        setIsVerifying(false);
        setVerificationAttempts((prev) => prev + 1);
      });
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    isVerifying,
    verificationAttempts,
    refreshAuth,
  ]);

  console.log("ProtectedRoute: Checking authentication", {
    user: !!user,
    isAuthenticated,
    isLoading,
    isVerifying,
    verificationAttempts,
    hasToken: !!localStorage.getItem("authToken"),
  });

  // Show loading indicator while authentication state is being determined
  if (isLoading || isVerifying) {
    console.log("ProtectedRoute: Still loading or verifying auth state");
    return <div>Checking authentication...</div>;
  }

  // Authentication check - redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    // Clear any stale token if it exists
    if (localStorage.getItem("authToken")) {
      localStorage.removeItem("authToken");
    }
    return <Navigate to="/login" replace />;
  }

  // Role-based authorization check
  const hasRole =
    !allowedRoles ||
    (Array.isArray(allowedRoles) && allowedRoles.includes(user.role));

  // Permission-based authorization check
  const hasPermissions =
    !requiredPermissions ||
    (Array.isArray(requiredPermissions) &&
      hasAllPermissions(requiredPermissions));

  // User must have both appropriate role AND permissions if both are specified
  if ((allowedRoles && !hasRole) || (requiredPermissions && !hasPermissions)) {
    console.log(
      "ProtectedRoute: User lacks required role or permissions, redirecting",
      {
        hasRole,
        hasPermissions,
        role: user.role,
        allowedRoles,
      }
    );
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and authorized - render children or outlet
  console.log("ProtectedRoute: Access granted", { role: user.role });
  return children || <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
  children: PropTypes.node,
};

export default ProtectedRoute;
