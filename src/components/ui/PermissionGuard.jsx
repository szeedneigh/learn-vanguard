import PropTypes from 'prop-types';
import { usePermission } from '@/context/PermissionContext';
import { useAuth } from '@/context/AuthContext';

/**
 * PermissionGuard component for conditional rendering based on permissions
 * 
 * Usage:
 * <PermissionGuard
 *   requiredPermissions={[PERMISSIONS.EDIT_RESOURCE]}  // Array of required permissions
 *   requiredRole="ADMIN"                               // Optional role requirement
 *   requireAll={true}                                  // Whether all permissions are required (default: true)
 *   fallback={<p>Not authorized</p>}                   // Optional fallback UI
 * >
 *   <RestrictedComponent />
 * </PermissionGuard>
 */
const PermissionGuard = ({ 
  children,
  requiredPermissions = [],
  requiredRole = null,
  requireAll = true,
  fallback = null
}) => {
  const { hasAllPermissions, hasAnyPermission } = usePermission();
  const { user } = useAuth();
  
  // If no permissions or role requirements, render children
  if (!requiredPermissions.length && !requiredRole) {
    return children;
  }
  
  // Check permissions if required
  let hasPermissions = true;
  if (requiredPermissions.length > 0) {
    if (requireAll) {
      hasPermissions = hasAllPermissions(requiredPermissions);
    } else {
      hasPermissions = hasAnyPermission(requiredPermissions);
    }
  }
  
  // Check role if required
  const hasRole = !requiredRole || (user?.role === requiredRole);
  
  // User must meet both permission and role requirements if both are specified
  if (hasPermissions && hasRole) {
    return children;
  }
  
  // Return fallback content or null
  return fallback;
};

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  requiredRole: PropTypes.string,
  requireAll: PropTypes.bool,
  fallback: PropTypes.node
};

export default PermissionGuard; 