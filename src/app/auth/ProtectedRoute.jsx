import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';

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
  redirectPath = "/unauthorized"
}) => {
  const { user, isLoading } = useAuth();
  const { hasAllPermissions } = usePermission();

  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // Authentication check - redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based authorization check
  const hasRole = !allowedRoles || (Array.isArray(allowedRoles) && allowedRoles.includes(user.role));
  
  // Permission-based authorization check
  const hasPermissions = !requiredPermissions || 
    (Array.isArray(requiredPermissions) && hasAllPermissions(requiredPermissions));

  // User must have both appropriate role AND permissions if both are specified
  if ((allowedRoles && !hasRole) || (requiredPermissions && !hasPermissions)) {
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and authorized - render child routes
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
};

export default ProtectedRoute;